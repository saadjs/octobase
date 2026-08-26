import { appendFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Worker } from "@playwright/test";
import { connection, dashboardSnapshot, pullRequestNode } from "../../src/data/test-fixtures";
import { E2E_LOGIN, REVIEW_PR_TITLE } from "./fixtures/dashboard-data";
import { expect, test } from "./fixtures/extension";

/**
 * Data-fetching benchmarks. Each case pins one waterfall from the audit, with GitHub given a
 * fixed latency so a serialized round trip shows up as wall time rather than machine noise.
 * Results land in `.bench/waterfall.jsonl` so repeated labeled runs can be compared.
 */
const RESULTS = fileURLToPath(new URL("../../.bench/waterfall.jsonl", import.meta.url));
const LABEL = process.env["BENCH_LABEL"] ?? "unlabelled";
const GRAPHQL_MS = 120;
const REST_MS = 120;

/** Attention sections given a cursor, so "Fetch more from GitHub" pages all of them. */
const PENDING_SECTIONS = [
  "reviewRequests",
  "mentioned",
  "authoredPullRequests",
  "changesRequested",
  "failingChecks",
] as const;

test.describe.configure({ mode: "serial" });

function record(name: string, metrics: Record<string, number>): void {
  mkdirSync(fileURLToPath(new URL("../../.bench", import.meta.url)), { recursive: true });
  appendFileSync(RESULTS, `${JSON.stringify({ label: LABEL, name, ...metrics })}\n`);
  console.log(`[bench] ${name} ${JSON.stringify(metrics)}`);
}

/** Rewinds the cached snapshot's timestamp so the next read takes the stale-revalidate path. */
async function ageCachedSnapshot(serviceWorker: Worker, ageMs: number): Promise<void> {
  // SAFETY: the benchmark login and numeric age exactly match the evaluated tuple contract.
  await serviceWorker.evaluate(
    async ([login, age]: [string, number]) => {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open("octobase", 5);
        request.addEventListener("success", () => resolve(request.result));
        request.addEventListener("error", () => reject(request.error));
      });
      const transaction = db.transaction("dashboard", "readwrite");
      const store = transaction.objectStore("dashboard");
      const current = await new Promise<{ fetchedAt: string } | undefined>((resolve) => {
        const request = store.get(login);
        request.onsuccess = () => resolve(request.result);
      });
      if (current) {
        current.fetchedAt = new Date(Date.now() - age).toISOString();
        store.put(current, login);
      }
      await new Promise((resolve) => {
        transaction.oncomplete = () => resolve(null);
      });
    },
    [E2E_LOGIN, ageMs] as [string, number],
  );
}

function pendingConnection(id: string) {
  return {
    ...connection([pullRequestNode({ id, title: id === "pr-review-1" ? REVIEW_PR_TITLE : id })]),
    issueCount: 40,
    pageInfo: { hasNextPage: true, endCursor: `${id}-cursor` },
  };
}

function pendingSnapshot() {
  return dashboardSnapshot({
    rateLimit: {
      cost: 10,
      nodeCount: 3900,
      remaining: 4800,
      resetAt: new Date(Date.now() + 60 * 60_000).toISOString(),
    },
    viewer: {
      login: E2E_LOGIN,
      name: "The Octocat",
      avatarUrl: "https://github.com/images/error/octocat_happy.gif",
    },
    reviewRequests: pendingConnection("pr-review-1"),
    mentioned: pendingConnection("pr-mentioned-1"),
    authoredPullRequests: pendingConnection("pr-authored-1"),
    changesRequested: pendingConnection("pr-changes-1"),
    failingChecks: pendingConnection("pr-failing-1"),
  });
}

test.describe("data-fetching benchmarks", () => {
  test("cold load with a personal access token", async ({ context, connectAccount, github }) => {
    await connectAccount(E2E_LOGIN, "fine-grained");
    github.setDelay(GRAPHQL_MS);
    const page = await context.newPage();

    const start = Date.now();
    await page.goto("https://github.com/");
    await page.getByText(REVIEW_PR_TITLE).waitFor();
    const elapsed = Date.now() - start;

    record("cold-load-pat", { ms: elapsed, graphql: github.graphqlCalls.length });
    expect(elapsed).toBeGreaterThan(0);
  });

  test("cold load with a GitHub App connection", async ({ context, connectAccount, github }) => {
    await connectAccount(E2E_LOGIN, "app");
    github.setInstallations({ installations: 3, repositoriesPer: 5 });
    github.setDelay(GRAPHQL_MS);
    github.setRestDelay(REST_MS);
    const page = await context.newPage();

    const start = Date.now();
    await page.goto("https://github.com/");
    await page.getByText(REVIEW_PR_TITLE).waitFor();
    const elapsed = Date.now() - start;
    const firstRest = github.restCallsFor("/user/installations")[0];
    const firstGraphql = github.graphqlCalls[0];

    // A Turbo round trip remounts the dashboard; installation state must not be re-fetched.
    await page.evaluate(() => window.turboNavigate("/octocat/repo"));
    await expect(page.locator("octobase-root")).toHaveCount(0);
    await page.evaluate(() => window.turboNavigate("/"));
    await page.getByText(REVIEW_PR_TITLE).waitFor();
    await page.waitForTimeout(500);

    record("cold-load-app", {
      ms: elapsed,
      graphql: github.graphqlCalls.length,
      installationCalls: github.restCallsFor("/user/installations").length,
      firstRestAt: firstRest ? firstRest.at - start : -1,
      firstGraphqlAt: firstGraphql ? firstGraphql.at - start : -1,
    });
    expect(elapsed).toBeGreaterThan(0);
  });

  test("repeated remounts while the cached snapshot is stale", async ({
    context,
    connectAccount,
    github,
    serviceWorker,
  }) => {
    await connectAccount();
    const page = await context.newPage();
    await page.goto("https://github.com/");
    await page.getByText(REVIEW_PR_TITLE).waitFor();

    github.setDelay(GRAPHQL_MS);
    const before = github.callsFor("DashboardAttention").length;
    await ageCachedSnapshot(serviceWorker, 10 * 60_000);

    const start = Date.now();
    for (let remount = 0; remount < 3; remount += 1) {
      // oxlint-disable-next-line no-await-in-loop -- Remount N starts only after remount N-1 completes.
      await page.evaluate(() => window.turboNavigate("/octocat/repo"));
      // oxlint-disable-next-line no-await-in-loop -- This assertion gates the next navigation.
      await expect(page.locator("octobase-root")).toHaveCount(0);
      // oxlint-disable-next-line no-await-in-loop -- Navigation must follow confirmed unmount.
      await page.evaluate(() => window.turboNavigate("/"));
      // oxlint-disable-next-line no-await-in-loop -- Hydration must finish before the next remount.
      await page.getByText(REVIEW_PR_TITLE).waitFor();
    }
    const elapsed = Date.now() - start;
    // Let any refresh the last remount queued reach the stub before counting.
    await page.waitForTimeout(1_500);

    record("stale-remounts", {
      ms: elapsed,
      refreshFetches: github.callsFor("DashboardAttention").length - before,
    });
    expect(elapsed).toBeGreaterThan(0);
  });

  test("fetching every pending attention section", async ({ context, connectAccount, github }) => {
    await connectAccount();
    github.setSnapshot(pendingSnapshot());
    const page = await context.newPage();
    await page.goto("https://github.com/");
    await page.getByText(REVIEW_PR_TITLE).waitFor();

    github.setDelay(GRAPHQL_MS);
    const start = Date.now();
    await page.getByRole("button", { name: "Fetch more from GitHub" }).first().click();
    await expect
      .poll(() => github.callsFor("DashboardSectionPage").length, { timeout: 20_000 })
      .toBe(PENDING_SECTIONS.length);
    await expect(page.getByRole("button", { name: "Loading from GitHub…" }).first()).toHaveCount(0);
    const elapsed = Date.now() - start;

    record("load-all-attention", {
      ms: elapsed,
      sectionPages: github.callsFor("DashboardSectionPage").length,
    });
    expect(elapsed).toBeGreaterThan(0);
  });

  test("opening the repository access sheet", async ({ context, connectAccount, github }) => {
    await connectAccount(E2E_LOGIN, "app");
    github.setInstallations({ installations: 4, repositoriesPer: 250 });
    const page = await context.newPage();
    await page.goto("https://github.com/");
    await page.getByText(REVIEW_PR_TITLE).waitFor();

    github.setRestDelay(REST_MS);
    const before = github.restCalls.length;
    const start = Date.now();
    await page.getByRole("button", { name: "Access details" }).click();
    await page.getByText(/repositor(y|ies) visible/i).waitFor({ timeout: 20_000 });
    const elapsed = Date.now() - start;

    const accessCalls = github.restCalls.slice(before);
    record("repository-access-sheet", {
      ms: elapsed,
      restCalls: accessCalls.length,
      restSpan: (accessCalls.at(-1)?.at ?? start) - (accessCalls[0]?.at ?? start),
    });
    expect(elapsed).toBeGreaterThan(0);
  });
});
