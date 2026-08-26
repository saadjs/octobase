import { describe, expect, it } from "vitest";
import { COUNT_SECTIONS, dashboardCounts, tabCount } from "@/data/dashboard-counts";
import type { DashboardCountsQuery } from "@/gql/graphql";

function countsQuery(overrides: Partial<Record<string, number>> = {}): DashboardCountsQuery {
  return {
    rateLimit: null,
    viewer: { login: "octocat" },
    ownedPullRequests: { issueCount: overrides.ownedPullRequests ?? 0 },
    ownedIssues: { issueCount: overrides.ownedIssues ?? 0 },
    contributedPullRequests: { issueCount: overrides.contributedPullRequests ?? 0 },
    contributedIssues: { issueCount: overrides.contributedIssues ?? 0 },
  };
}

describe("dashboardCounts", () => {
  it("reads every lazily fetched section's total", () => {
    expect(
      dashboardCounts(
        countsQuery({
          ownedPullRequests: 3,
          ownedIssues: 4,
          contributedPullRequests: 5,
          contributedIssues: 6,
        }),
      ),
    ).toEqual({
      ownedPullRequests: 3,
      ownedIssues: 4,
      contributedPullRequests: 5,
      contributedIssues: 6,
    });
  });

  it("covers exactly the sections the dashboard fetches lazily", () => {
    expect([...COUNT_SECTIONS]).toEqual([
      "ownedPullRequests",
      "ownedIssues",
      "contributedPullRequests",
      "contributedIssues",
    ]);
  });
});

describe("tabCount", () => {
  const counts = dashboardCounts(
    countsQuery({
      ownedPullRequests: 3,
      ownedIssues: 4,
      contributedPullRequests: 5,
      contributedIssues: 6,
    }),
  );

  it("sums both sections behind a work tab", () => {
    expect(tabCount("owned", counts)).toBe(7);
    expect(tabCount("contributions", counts)).toBe(11);
  });

  it("reports unknown rather than zero when counts were never fetched", () => {
    expect(tabCount("owned", undefined)).toBeUndefined();
    expect(tabCount("contributions", undefined)).toBeUndefined();
  });

  it("leaves the attention tab to the loaded queue it already has", () => {
    expect(tabCount("attention", counts)).toBeUndefined();
  });

  it("reports a half-measured tab as unknown rather than a partial sum", () => {
    expect(tabCount("owned", { ownedPullRequests: 3 })).toBeUndefined();
    expect(tabCount("owned", { ownedPullRequests: 3, ownedIssues: 0 })).toBe(3);
  });
});
