import { expect, test } from "./fixtures/extension";

test.describe("keyboard isolation", () => {
  test("typing in a dashboard field never triggers GitHub's shortcuts", async ({
    context,
    connectAccount,
  }) => {
    await connectAccount();
    const page = await context.newPage();
    await page.goto("https://github.com/");

    const filter = page.getByRole("searchbox", { name: /repository or organization/i });
    await filter.click();
    await filter.pressSequentially("saadjs");

    await expect(filter).toHaveValue("saadjs");
    await expect(page.getByTestId("github-search")).not.toBeFocused();
  });

  test("keeps every character typed at speed into the filter", async ({
    context,
    connectAccount,
  }) => {
    await connectAccount();
    const page = await context.newPage();
    await page.goto("https://github.com/");

    const filter = page.getByRole("searchbox", { name: /repository or organization/i });
    await filter.click();
    // No per-key delay: saving a filter is an async round trip, and the field must not
    // re-render back to whatever the background last confirmed.
    await filter.pressSequentially("octo/repository");

    await expect(filter).toHaveValue("octo/repository");
  });

  test("leaves GitHub's shortcuts working outside dashboard fields", async ({
    context,
    connectAccount,
  }) => {
    await connectAccount();
    const page = await context.newPage();
    await page.goto("https://github.com/");
    await expect(page.getByRole("tab", { name: /Needs your attention/ })).toBeVisible();

    // Nothing in the dashboard has focus, so the key belongs to GitHub.
    await page.keyboard.press("s");

    await expect(page.getByTestId("github-search")).toBeFocused();
  });
});
