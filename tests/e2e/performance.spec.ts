import type { Page } from "@playwright/test";
import { REVIEW_PR_TITLE } from "./fixtures/dashboard-data";
import { expect, test } from "./fixtures/extension";

/** Budgets are deliberately loose: they catch regressions, not machine-to-machine variance. */
const MOUNT_BUDGET_MS = 3_000;
const HYDRATED_BUDGET_MS = 5_000;
const BLOCKING_BUDGET_MS = 600;

test.describe.configure({ mode: "serial" });

test.describe("performance", () => {
  test("hides GitHub's feed before it can paint", async ({ context, connectAccount }) => {
    await connectAccount();
    const page = await context.newPage();
    await page.goto("https://github.com/", { waitUntil: "commit" });

    // document_start injection means the feed is already display:none on the first paintable frame.
    const first = await feedDisplay(page);
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve(null))));
    const displays = [first, await feedDisplay(page)];

    expect(displays).not.toContain("block");
  });

  test("mounts and hydrates within budget", async ({ context, connectAccount }) => {
    await connectAccount();
    const page = await context.newPage();

    const start = Date.now();
    await page.goto("https://github.com/");
    await page.locator("octobase-root").waitFor({ state: "attached" });
    const mounted = Date.now() - start;

    await page.getByRole("tab", { name: /Needs your attention/ }).waitFor();
    const hydrated = Date.now() - start;

    expect(mounted).toBeLessThan(MOUNT_BUDGET_MS);
    expect(hydrated).toBeLessThan(HYDRATED_BUDGET_MS);
  });

  test("keeps main-thread blocking under budget while mounting", async ({
    context,
    connectAccount,
  }) => {
    await connectAccount();
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.octobaseLongTasks = [];
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) window.octobaseLongTasks.push(entry.duration);
      }).observe({ type: "longtask", buffered: true });
    });

    await page.goto("https://github.com/");
    await page.getByRole("tab", { name: /Needs your attention/ }).waitFor();

    const longTasks = await page.evaluate(() => window.octobaseLongTasks);
    // Total Blocking Time: the part of each long task beyond the 50ms interactivity threshold.
    const blocking = longTasks.reduce((total, duration) => total + Math.max(0, duration - 50), 0);
    expect(blocking).toBeLessThan(BLOCKING_BUDGET_MS);
  });

  test("fetches once, then serves remounts from a fresh cache", async ({
    context,
    connectAccount,
    github,
  }) => {
    await connectAccount();
    const page = await context.newPage();
    await page.goto("https://github.com/");
    await page.getByRole("tab", { name: /Needs your attention/ }).waitFor();
    expect(github.callsFor("DashboardAttention")).toHaveLength(1);

    await page.evaluate(() => window.turboNavigate("/octocat/repo"));
    await expect(page.locator("octobase-root")).toHaveCount(0);
    await page.evaluate(() => window.turboNavigate("/"));
    await page.getByRole("tab", { name: /Needs your attention/ }).waitFor();
    expect(github.callsFor("DashboardAttention")).toHaveLength(1);

    await page.getByRole("button", { name: "Refresh" }).click();
    await expect.poll(() => github.callsFor("DashboardAttention").length).toBe(2);
    // Tab totals ride along with every refresh, and never more than once per refresh.
    expect(github.callsFor("DashboardCounts")).toHaveLength(2);
  });

  test("renders a remount from cache before GitHub answers", async ({
    context,
    connectAccount,
    github,
  }) => {
    await connectAccount();
    const page = await context.newPage();
    await page.goto("https://github.com/");
    await page.getByText(REVIEW_PR_TITLE).waitFor();

    github.setDelay(4_000);
    await page.evaluate(() => window.turboNavigate("/octocat/repo"));
    await expect(page.locator("octobase-root")).toHaveCount(0);

    const start = Date.now();
    await page.evaluate(() => window.turboNavigate("/"));
    await page.getByText(REVIEW_PR_TITLE).waitFor();
    expect(Date.now() - start).toBeLessThan(2_000);
  });
});

function feedDisplay(page: Page): Promise<string> {
  return page.evaluate(() => {
    const feed = document.querySelector("#dashboard");
    return feed ? getComputedStyle(feed).display : "absent";
  });
}
