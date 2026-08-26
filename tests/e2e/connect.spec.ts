import { e2eDashboard, REVIEW_PR_TITLE } from "./fixtures/dashboard-data";
import { expect, test } from "./fixtures/extension";

test.describe("connecting an account", () => {
  test("connects a personal access token and loads the dashboard", async ({ context, github }) => {
    const page = await context.newPage();
    await page.goto("https://github.com/");

    await page.getByLabel("Personal access token").fill("github_pat_e2e");
    await page.getByRole("button", { name: "Connect token" }).click();

    await expect(page.getByRole("tab", { name: /Needs your attention/ })).toBeVisible();
    await expect(page.getByText(REVIEW_PR_TITLE)).toBeVisible();
    expect(github.graphqlCalls.length).toBeGreaterThan(0);
  });

  test("rejects a token belonging to a different GitHub account", async ({ context, github }) => {
    github.setSnapshot(dashboardForOtherViewer());
    const page = await context.newPage();
    await page.goto("https://github.com/");

    await page.getByLabel("Personal access token").fill("github_pat_wrong_account");
    await page.getByRole("button", { name: "Connect token" }).click();

    await expect(page.getByText(REVIEW_PR_TITLE)).toBeHidden();
    await expect(page.getByRole("button", { name: "Connect token" })).toBeVisible();
  });

  test("disconnects back to the connect panel", async ({ context, connectAccount }) => {
    await connectAccount();
    const page = await context.newPage();
    await page.goto("https://github.com/");
    await expect(page.getByRole("tab", { name: /Needs your attention/ })).toBeVisible();

    await page.getByRole("button", { name: "Disconnect" }).click();
    await page.getByRole("button", { name: "Confirm disconnect" }).click();

    await expect(page.getByRole("button", { name: "Install GitHub App" })).toBeVisible();
  });
});

function dashboardForOtherViewer() {
  const snapshot = e2eDashboard();
  return { ...snapshot, viewer: { ...snapshot.viewer, login: "someone-else" } };
}
