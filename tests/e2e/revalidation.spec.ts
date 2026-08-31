import type { Worker } from "@playwright/test";
import { DASHBOARD_FRESH_FOR_MS } from "../../src/data/dashboard-freshness";
import { E2E_LOGIN } from "./fixtures/dashboard-data";
import { expect, test } from "./fixtures/extension";

/** Rewrites the background's attention timestamps so a stale cache never needs a real wait. */
async function ageDashboardCache(
  serviceWorker: Worker,
  login: string,
  fetchedAt: string,
): Promise<void> {
  await serviceWorker.evaluate(
    async ({
      login: seededLogin,
      fetchedAt: seededFetchedAt,
    }: {
      login: string;
      fetchedAt: string;
    }) => {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open("octobase");
        request.addEventListener("success", () => resolve(request.result));
        request.addEventListener("error", () => reject(request.error));
      });
      const existing = await new Promise<
        | {
            data: unknown;
            fetchedAt: string;
            fetchedAtByTab?: { attention?: string };
          }
        | undefined
      >((resolve, reject) => {
        const getRequest = db
          .transaction("dashboard", "readonly")
          .objectStore("dashboard")
          .get(seededLogin);
        getRequest.addEventListener("success", () => resolve(getRequest.result));
        getRequest.addEventListener("error", () => reject(getRequest.error));
      });
      if (!existing) throw new Error(`No cached dashboard for ${seededLogin} to age.`);
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction("dashboard", "readwrite");
        tx.objectStore("dashboard").put(
          {
            ...existing,
            fetchedAt: seededFetchedAt,
            fetchedAtByTab: { ...existing.fetchedAtByTab, attention: seededFetchedAt },
          },
          seededLogin,
        );
        tx.addEventListener("complete", () => resolve());
        tx.addEventListener("error", () => reject(tx.error));
      });
      db.close();
    },
    { login, fetchedAt },
  );
}

test.describe("dashboard focus revalidation", () => {
  test("revalidates a stale dashboard once the tab regains focus", async ({
    context,
    connectAccount,
    github,
    serviceWorker,
  }) => {
    await connectAccount();
    const page = await context.newPage();
    await page.goto("https://github.com/");
    await page.getByRole("tab", { name: /Needs your attention/ }).waitFor();
    expect(github.callsFor("DashboardAttention")).toHaveLength(1);

    // Age both clocks the dashboard's staleness depends on: the background's cached fetchedAt
    // (real wall time), and the page's own Date (virtual time, since the content script runs in
    // an isolated world that a page.clock/addInitScript override in the main world can't reach).
    await ageDashboardCache(
      serviceWorker,
      E2E_LOGIN,
      new Date(Date.now() - DASHBOARD_FRESH_FOR_MS - 1_000).toISOString(),
    );
    const cdpSession = await context.newCDPSession(page);
    await cdpSession.send("Emulation.setVirtualTimePolicy", {
      policy: "advance",
      budget: DASHBOARD_FRESH_FOR_MS + 1_000,
    });
    await page.waitForTimeout(1_500);

    // bringToFront() didn't reproduce a real visibilitychange in this headless persistent
    // context, so dispatch the event TanStack's focus manager listens for directly.
    await page.evaluate(() => window.dispatchEvent(new Event("visibilitychange")));

    await expect.poll(() => github.callsFor("DashboardAttention").length).toBe(2);
  });

  test("does not refetch on refocus while the dashboard is still fresh", async ({
    context,
    connectAccount,
    github,
  }) => {
    await connectAccount();
    const page = await context.newPage();
    await page.goto("https://github.com/");
    await page.getByRole("tab", { name: /Needs your attention/ }).waitFor();
    expect(github.callsFor("DashboardAttention")).toHaveLength(1);

    await page.evaluate(() => window.dispatchEvent(new Event("visibilitychange")));

    // Give a stray refetch a moment to happen before asserting it never did.
    await page.waitForTimeout(1_000);
    expect(github.callsFor("DashboardAttention")).toHaveLength(1);
  });
});
