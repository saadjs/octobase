import {
  ASSIGNED_ISSUE_TITLE,
  e2eSectionPage,
  NEXT_PAGE_PR_TITLE,
  REVIEW_PR_TITLE,
} from "./fixtures/dashboard-data";
import { expect, test } from "./fixtures/extension";

test.describe("loading more from GitHub", () => {
  test("pages one section without re-running the other searches", async ({
    context,
    connectAccount,
    github,
  }) => {
    await connectAccount();
    const page = await context.newPage();
    await page.goto("https://github.com/");
    await page.getByText(REVIEW_PR_TITLE).waitFor();
    expect(github.callsFor("DashboardAttention")).toHaveLength(1);
    expect(github.callsFor("DashboardSectionPage")).toHaveLength(0);

    await page.getByRole("button", { name: "Fetch more from GitHub" }).click();
    await expect(page.getByText(NEXT_PAGE_PR_TITLE)).toBeVisible();

    // The cursor request must use the one-section operation, not the whole dashboard again.
    expect(github.callsFor("DashboardAttention")).toHaveLength(1);
    expect(github.callsFor("DashboardSectionPage")).toHaveLength(1);
    // Merging the page must not drop the sections the cursor query never asked for.
    await expect(page.getByText(REVIEW_PR_TITLE)).toBeVisible();
    await expect(page.getByText(ASSIGNED_ISSUE_TITLE)).toBeVisible();
  });

  test("refuses a cursor page that belongs to another account", async ({
    context,
    connectAccount,
    github,
  }) => {
    await connectAccount();
    const page = await context.newPage();
    await page.goto("https://github.com/");
    await page.getByText(REVIEW_PR_TITLE).waitFor();

    github.setSectionPage(e2eSectionPage("someone-else"));
    await page.getByRole("button", { name: "Fetch more from GitHub" }).click();

    // The foreign page is dropped and the account's own cached queue stays on screen. Note the
    // mismatch surfaces as the generic stale-refresh warning here, not the disconnect the
    // full-dashboard path performs.
    await expect(page.getByText(/Showing data from the last successful refresh/i)).toBeVisible();
    await expect(page.getByText(NEXT_PAGE_PR_TITLE)).toHaveCount(0);
    await expect(page.getByText(REVIEW_PR_TITLE)).toBeVisible();
    await expect(page.getByText(ASSIGNED_ISSUE_TITLE)).toBeVisible();
  });

  test("stops paging when GitHub reports no further pages", async ({
    context,
    connectAccount,
    github,
  }) => {
    await connectAccount();
    const page = await context.newPage();
    await page.goto("https://github.com/");
    await page.getByText(REVIEW_PR_TITLE).waitFor();

    await page.getByRole("button", { name: "Fetch more from GitHub" }).click();
    await expect(page.getByText(NEXT_PAGE_PR_TITLE)).toBeVisible();

    await expect(page.getByRole("button", { name: "Fetch more from GitHub" })).toHaveCount(0);
    expect(github.callsFor("DashboardSectionPage")).toHaveLength(1);
  });
});
