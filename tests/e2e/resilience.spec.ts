import type { BrowserContext } from "@playwright/test";
import { REVIEW_PR_TITLE } from "./fixtures/dashboard-data";
import { expect, test } from "./fixtures/extension";

async function openDashboard(context: BrowserContext) {
  const page = await context.newPage();
  await page.goto("https://github.com/");
  await page.getByText(REVIEW_PR_TITLE).waitFor();
  return page;
}

test.describe("failure handling", () => {
  test("keeps the cached dashboard when GitHub rate-limits a refresh", async ({
    context,
    connectAccount,
    github,
  }) => {
    await connectAccount();
    const page = await openDashboard(context);

    github.failWith({
      status: 403,
      body: JSON.stringify({ message: "API rate limit exceeded" }),
      headers: {
        "x-ratelimit-remaining": "0",
        "x-ratelimit-reset": String(Math.floor(Date.now() / 1000) + 3600),
      },
    });
    await page.getByRole("button", { name: "Refresh" }).click();
    await expect(page.getByText(/Showing data from the last successful refresh/i)).toBeVisible();
    await expect(page.getByText(REVIEW_PR_TITLE)).toBeVisible();

    // The rejection starts a cooldown, so the next refresh never reaches GitHub.
    const spent = github.graphqlCalls.length;
    await page.getByRole("button", { name: "Refresh" }).click();
    await expect(page.getByText(/rate limit is spent/i)).toBeVisible();
    expect(github.graphqlCalls).toHaveLength(spent);
  });

  test("keeps the cached dashboard when GitHub is unreachable", async ({
    context,
    connectAccount,
    github,
  }) => {
    await connectAccount();
    const page = await openDashboard(context);

    github.failWith({ status: 500, body: JSON.stringify({ message: "boom" }) });
    await page.getByRole("button", { name: "Refresh" }).click();

    await expect(page.getByText(/Showing data from the last successful refresh/i)).toBeVisible();
    await expect(page.getByText(REVIEW_PR_TITLE)).toBeVisible();
  });

  test("drops an invalidated token back to the connect panel", async ({
    context,
    connectAccount,
    github,
  }) => {
    await connectAccount();
    const page = await openDashboard(context);

    github.failWith({ status: 401, body: JSON.stringify({ message: "Bad credentials" }) });
    await page.getByRole("button", { name: "Refresh" }).click();
    await expect(page.getByRole("alert")).toBeVisible();

    // The token and its cache are gone, so the next mount starts over at the connect panel.
    await page.evaluate(() => window.turboNavigate("/octocat/repo"));
    await expect(page.locator("octobase-root")).toHaveCount(0);
    await page.evaluate(() => window.turboNavigate("/"));
    await expect(page.getByRole("button", { name: "Install GitHub App" })).toBeVisible();
  });
});
