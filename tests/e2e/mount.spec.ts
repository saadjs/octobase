import { ASSIGNED_ISSUE_TITLE, REVIEW_PR_TITLE } from "./fixtures/dashboard-data";
import { expect, test } from "./fixtures/extension";

test.describe("dashboard mount", () => {
  test("replaces GitHub's feed while keeping its header", async ({
    context,
    connectAccount,
    github,
  }) => {
    await connectAccount();
    const page = await context.newPage();
    await page.goto("https://github.com/");

    await expect(page.getByRole("tab", { name: /Needs your attention/ })).toBeVisible();
    await expect(page.getByTestId("github-header")).toBeVisible();
    await expect(page.getByTestId("dashboard")).toBeHidden();
    await expect(page.getByText(REVIEW_PR_TITLE)).toBeVisible();
    await expect(page.getByText(ASSIGNED_ISSUE_TITLE)).toBeVisible();
    expect(github.graphqlCalls.length).toBeGreaterThan(0);
  });

  test("shows each tab's total before its items are fetched", async ({
    context,
    connectAccount,
    github,
  }) => {
    await connectAccount();
    const page = await context.newPage();
    await page.goto("https://github.com/");

    // The counts query answered these; neither tab's items have been requested yet.
    await expect(page.getByRole("tab", { name: "Your repositories 4" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Contributions 2" })).toBeVisible();
    expect(github.callsFor("DashboardOwned")).toHaveLength(0);

    await page.getByRole("tab", { name: /Your repositories/ }).click();
    await expect.poll(() => github.callsFor("DashboardOwned").length).toBe(1);
  });

  test("mounts on /dashboard too", async ({ context, connectAccount }) => {
    await connectAccount();
    const page = await context.newPage();
    await page.goto("https://github.com/dashboard");

    await expect(page.getByRole("tab", { name: /Needs your attention/ })).toBeVisible();
    await expect(page.getByTestId("dashboard")).toBeHidden();
  });

  test("never exposes the access token to the page", async ({ context, connectAccount }) => {
    await connectAccount();
    const page = await context.newPage();
    await page.goto("https://github.com/");
    await expect(page.getByRole("tab", { name: /Needs your attention/ })).toBeVisible();

    const html = await page.content();
    expect(html).not.toContain("e2e-access-token");
    const shadowText = await page.locator("octobase-root").innerHTML();
    expect(shadowText).not.toContain("e2e-access-token");
  });

  test("opens GitHub's homepage on install", async ({ github }) => {
    expect(github.installTabUrl).toBe("https://github.com/");
  });

  test("shows the connect panel when the account has no token", async ({ context }) => {
    const page = await context.newPage();
    await page.goto("https://github.com/");

    await expect(page.getByRole("button", { name: "Install GitHub App" })).toBeVisible();
    await expect(page.getByTestId("dashboard")).toBeHidden();
  });
});
