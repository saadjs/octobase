import { expect, test } from "./fixtures/extension";

test.describe("turbo navigation", () => {
  test("unmounts off the dashboard routes and remounts on return", async ({
    context,
    connectAccount,
  }) => {
    await connectAccount();
    const page = await context.newPage();
    await page.goto("https://github.com/");
    await expect(page.getByRole("tab", { name: /Needs your attention/ })).toBeVisible();

    await page.evaluate(() => window.turboNavigate("/octocat/repo"));
    await expect(page.locator("octobase-root")).toHaveCount(0);
    await expect(page.getByTestId("dashboard")).toBeVisible();

    await page.evaluate(() => window.turboNavigate("/"));
    await expect(page.getByRole("tab", { name: /Needs your attention/ })).toBeVisible();
    await expect(page.getByTestId("dashboard")).toBeHidden();
  });

  test("remounts for a different signed-in account", async ({
    context,
    connectAccount,
    github,
  }) => {
    await connectAccount("octocat");
    const page = await context.newPage();
    await page.goto("https://github.com/");
    await expect(page.getByRole("tab", { name: /Needs your attention/ })).toBeVisible();

    github.setLogin("hubot");
    await page.evaluate(() => window.switchAccount("hubot"));

    // hubot has no stored token, so the remount lands on the connect panel.
    await expect(page.getByRole("button", { name: "Install GitHub App" })).toBeVisible();
  });
});
