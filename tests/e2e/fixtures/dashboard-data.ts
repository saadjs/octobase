import type { DashboardSnapshot } from "../../../src/data/github";
import type {
  DashboardCountsQuery,
  DashboardSectionPageQuery,
  ViewerRepositoriesQuery,
} from "../../../src/gql/graphql";
import {
  connection,
  dashboardSnapshot,
  issueNode,
  pullRequestNode,
} from "../../../src/data/test-fixtures";

export const E2E_LOGIN = "octocat";
export const REVIEW_PR_TITLE = "Fix the flaky poller";
export const ASSIGNED_ISSUE_TITLE = "Document the rate-limit reserves";
export const NEXT_PAGE_PR_TITLE = "Retire the legacy poller";

/** A budget GitHub would report on a healthy account, so no reserve gate trips mid-test. */
function healthyRateLimit() {
  return {
    cost: 10,
    nodeCount: 3900,
    remaining: 4800,
    resetAt: new Date(Date.now() + 60 * 60_000).toISOString(),
  };
}

export function e2eDashboard(login: string = E2E_LOGIN): DashboardSnapshot {
  return dashboardSnapshot({
    rateLimit: healthyRateLimit(),
    viewer: {
      login,
      name: "The Octocat",
      avatarUrl: "https://github.com/images/error/octocat_happy.gif",
    },
    reviewRequests: {
      ...connection([
        pullRequestNode({
          id: "pr-review-1",
          number: 42,
          title: REVIEW_PR_TITLE,
          url: "https://github.com/octo/repo/pull/42",
        }),
      ]),
      issueCount: 2,
      pageInfo: { hasNextPage: true, endCursor: "review-cursor-1" },
    },
    assignedIssues: connection([
      issueNode({
        id: "issue-assigned-1",
        number: 7,
        title: ASSIGNED_ISSUE_TITLE,
        url: "https://github.com/octo/repo/issues/7",
      }),
    ]),
  });
}

/** Tab totals GitHub returns for `DashboardCounts`, all larger than the items ever loaded. */
export function e2eCounts(login: string = E2E_LOGIN): DashboardCountsQuery {
  return {
    rateLimit: healthyRateLimit(),
    viewer: { login },
    ownedPullRequests: { issueCount: 3 },
    ownedIssues: { issueCount: 1 },
    contributedPullRequests: { issueCount: 2 },
    contributedIssues: { issueCount: 0 },
  };
}

/** The one-section cursor response GitHub returns for `DashboardSectionPage`. */
export function e2eSectionPage(login: string = E2E_LOGIN): DashboardSectionPageQuery {
  return {
    rateLimit: healthyRateLimit(),
    viewer: { login },
    page: {
      issueCount: 2,
      pageInfo: { hasNextPage: false, endCursor: null },
      nodes: [
        pullRequestNode({
          id: "pr-review-2",
          number: 43,
          title: NEXT_PAGE_PR_TITLE,
          url: "https://github.com/octo/repo/pull/43",
        }),
      ],
    },
  };
}

/** Repositories GitHub returns for the pin type-ahead, none of which the snapshot mentions. */
export function e2eViewerRepositories(login: string = E2E_LOGIN): ViewerRepositoriesQuery {
  return {
    rateLimit: healthyRateLimit(),
    viewer: {
      login,
      repositories: {
        nodes: [
          {
            id: "repo-1",
            nameWithOwner: "octo/secret-plans",
            url: "https://github.com/octo/secret-plans",
            isPrivate: true,
          },
        ],
      },
      repositoriesContributedTo: {
        nodes: [
          {
            id: "repo-2",
            nameWithOwner: "vercel/next.js",
            url: "https://github.com/vercel/next.js",
            isPrivate: false,
          },
        ],
      },
    },
  };
}
