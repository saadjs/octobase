import { describe, expect, it } from "vitest";
import {
  countCurrentlyHiddenItems,
  issueCards,
  matchesDashboardPreferences,
  pullRequestCards,
} from "@/app/dashboard-items";
import { dashboardSnapshot, issueNode, pullRequestNode } from "@/data/test-fixtures";
import type { DashboardPreferences } from "@/data/dashboard-preferences";

function preferences(overrides: Partial<DashboardPreferences> = {}): DashboardPreferences {
  return {
    selectedTab: "attention",
    repositoryQuery: "",
    itemType: "all",
    showDrafts: true,
    showHidden: false,
    hiddenItems: {},
    favoriteRepositories: [],
    ...overrides,
  };
}

describe("dashboard item selectors", () => {
  it("filters by kind, repository, drafts, and current hidden marker", () => {
    const draft = pullRequestNode({
      id: "draft",
      isDraft: true,
      updatedAt: "2026-08-23T10:00:00.000Z",
      repository: { nameWithOwner: "Acme/App", url: "https://github.com/Acme/App" },
    });
    const issue = issueNode({ id: "issue" });

    expect(
      matchesDashboardPreferences("pull-request", draft, preferences({ repositoryQuery: "acme" })),
    ).toBe(true);
    expect(
      matchesDashboardPreferences("pull-request", draft, preferences({ showDrafts: false })),
    ).toBe(false);
    expect(
      matchesDashboardPreferences("issue", issue, preferences({ itemType: "pull-request" })),
    ).toBe(false);
    expect(
      matchesDashboardPreferences(
        "pull-request",
        draft,
        preferences({ hiddenItems: { draft: draft.updatedAt } }),
      ),
    ).toBe(false);
    expect(
      matchesDashboardPreferences(
        "pull-request",
        draft,
        preferences({ hiddenItems: { draft: draft.updatedAt }, showHidden: true }),
      ),
    ).toBe(true);
  });

  it("narrows mixed GraphQL search nodes to cards", () => {
    const pullRequest = pullRequestNode({ id: "pr" });
    const issue = issueNode({ id: "issue" });

    expect(pullRequestCards([null, issue, pullRequest])).toEqual([pullRequest]);
    expect(issueCards([pullRequest, null, issue])).toEqual([issue]);
  });

  it("counts each currently hidden item once across overlapping sections", () => {
    const hidden = issueNode({ id: "same", updatedAt: "2026-08-23T10:00:00.000Z" });
    const changed = pullRequestNode({ id: "changed", updatedAt: "2026-08-23T11:00:00.000Z" });
    const dashboard = dashboardSnapshot({
      assignedIssues: {
        issueCount: 1,
        nodes: [hidden],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
      ownedIssues: {
        issueCount: 1,
        nodes: [hidden],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
      ownedPullRequests: {
        issueCount: 1,
        nodes: [changed],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    });

    expect(
      countCurrentlyHiddenItems(
        dashboard,
        preferences({ hiddenItems: { same: hidden.updatedAt, changed: "older" } }),
      ),
    ).toBe(1);
  });
});
