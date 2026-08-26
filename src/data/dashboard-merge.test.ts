import { describe, expect, it } from "vitest";
import type { DashboardCounts } from "@/data/dashboard-counts";
import { dashboardFromAttention, mergeDashboardTab, mergeRefreshedDashboard } from "@/data/github";
import { connection, dashboardSnapshot, pullRequestNode, issueNode } from "@/data/test-fixtures";
import type { DashboardAttentionQuery, DashboardOwnedQuery } from "@/gql/graphql";

const viewer = { login: "octocat", name: "The Octocat", avatarUrl: "https://github.com/o.png" };

function attentionQuery(): DashboardAttentionQuery {
  return {
    rateLimit: null,
    viewer,
    reviewRequests: connection([pullRequestNode({ id: "review" })]),
    assignedIssues: connection([]),
    mentioned: connection([]),
    authoredPullRequests: connection([]),
    changesRequested: connection([]),
    failingChecks: connection([]),
    participating: connection([]),
    incomingPullRequests: connection([]),
  };
}

function counts(overrides: Partial<DashboardCounts> = {}): DashboardCounts {
  return {
    ownedPullRequests: 0,
    ownedIssues: 0,
    contributedPullRequests: 0,
    contributedIssues: 0,
    ...overrides,
  };
}

describe("dashboardFromAttention", () => {
  it("carries counts for the tabs it did not fetch", () => {
    const snapshot = dashboardFromAttention(attentionQuery(), counts({ ownedPullRequests: 12 }));

    expect(snapshot.counts).toEqual(counts({ ownedPullRequests: 12 }));
    expect(snapshot.ownedPullRequests.nodes).toEqual([]);
  });

  it("leaves counts unknown when the counts query did not answer", () => {
    expect(dashboardFromAttention(attentionQuery()).counts).toBeUndefined();
  });
});

describe("mergeRefreshedDashboard", () => {
  const cached = dashboardSnapshot({
    ownedPullRequests: connection([pullRequestNode({ id: "owned-pr" })]),
    counts: counts({ ownedPullRequests: 1 }),
  });

  it("takes fresh counts for tabs whose items it deliberately did not refetch", () => {
    const fresh = dashboardSnapshot({ counts: counts({ ownedPullRequests: 9, ownedIssues: 4 }) });

    const merged = mergeRefreshedDashboard(cached, fresh, "attention");

    expect(merged.counts).toEqual(counts({ ownedPullRequests: 9, ownedIssues: 4 }));
    // The badge moves; the rows the user already had stay put until they open the tab.
    expect(merged.ownedPullRequests.nodes).toHaveLength(1);
  });

  it("keeps the cached counts when the counts query failed", () => {
    const merged = mergeRefreshedDashboard(cached, dashboardSnapshot(), "attention");

    expect(merged.counts).toEqual(counts({ ownedPullRequests: 1 }));
  });
});

describe("mergeDashboardTab", () => {
  it("refreshes the fetched tab's counts from the items it just loaded", () => {
    const owned: DashboardOwnedQuery = {
      rateLimit: null,
      viewer: { login: "octocat" },
      ownedPullRequests: { ...connection([pullRequestNode({ id: "pr" })]), issueCount: 7 },
      ownedIssues: { ...connection([issueNode({ id: "issue" })]), issueCount: 3 },
    };

    const merged = mergeDashboardTab(
      dashboardSnapshot({ counts: counts({ ownedPullRequests: 99, contributedIssues: 5 }) }),
      "owned",
      owned,
    );

    expect(merged.counts).toEqual(
      counts({ ownedPullRequests: 7, ownedIssues: 3, contributedIssues: 5 }),
    );
  });

  it("records what it measured even when the counts query never answered", () => {
    const owned: DashboardOwnedQuery = {
      rateLimit: null,
      viewer: { login: "octocat" },
      ownedPullRequests: { ...connection([]), issueCount: 2 },
      ownedIssues: { ...connection([]), issueCount: 0 },
    };

    expect(mergeDashboardTab(dashboardSnapshot(), "owned", owned).counts).toEqual({
      ownedPullRequests: 2,
      ownedIssues: 0,
    });
  });
});
