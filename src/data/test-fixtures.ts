import type { DashboardSnapshot } from "@/data/github";
import type { IssueCardFragment, PullRequestCardFragment } from "@/gql/graphql";

/** Empty nodes and page info are assignable to every search alias in the query. */
export function emptyConnection() {
  return { issueCount: 0, pageInfo: { hasNextPage: false, endCursor: null }, nodes: [] };
}

/** A fully loaded connection; `nodes` stays generic so it fits each search alias. */
export function connection<T extends readonly unknown[]>(nodes: T) {
  return { issueCount: nodes.length, pageInfo: { hasNextPage: false, endCursor: null }, nodes };
}

export function pullRequestNode(
  overrides: Partial<PullRequestCardFragment> & { id: string },
): PullRequestCardFragment {
  return {
    __typename: "PullRequest",
    number: 1,
    title: `Pull request ${overrides.id}`,
    url: `https://github.com/octo/repo/pull/1`,
    createdAt: "2026-08-20T10:00:00.000Z",
    updatedAt: "2026-08-23T10:00:00.000Z",
    isDraft: false,
    mergeable: "MERGEABLE",
    mergeStateStatus: "CLEAN",
    reviewDecision: null,
    author: { login: "hubot" },
    repository: { nameWithOwner: "octo/repo", url: "https://github.com/octo/repo" },
    comments: { totalCount: 0, nodes: [] },
    reviews: { nodes: [] },
    statusCheckRollup: { state: "SUCCESS" },
    reactionGroups: [],
    changesRequestedReviews: { nodes: [] },
    reviewRequestedEvents: { nodes: [] },
    ...overrides,
  };
}

export function issueNode(
  overrides: Partial<IssueCardFragment> & { id: string },
): IssueCardFragment {
  return {
    __typename: "Issue",
    number: 1,
    title: `Issue ${overrides.id}`,
    url: `https://github.com/octo/repo/issues/1`,
    createdAt: "2026-08-20T10:00:00.000Z",
    updatedAt: "2026-08-23T10:00:00.000Z",
    author: { login: "hubot" },
    repository: { nameWithOwner: "octo/repo", url: "https://github.com/octo/repo" },
    comments: { totalCount: 0, nodes: [] },
    labels: { nodes: [] },
    reactionGroups: [],
    assignedEvents: { nodes: [] },
    ...overrides,
  };
}

export function dashboardSnapshot(overrides: Partial<DashboardSnapshot> = {}): DashboardSnapshot {
  return {
    rateLimit: null,
    viewer: {
      login: "octocat",
      name: "The Octocat",
      avatarUrl: "https://github.com/images/error/octocat_happy.gif",
    },
    reviewRequests: emptyConnection(),
    assignedIssues: emptyConnection(),
    ownedPullRequests: emptyConnection(),
    ownedIssues: emptyConnection(),
    contributedPullRequests: emptyConnection(),
    contributedIssues: emptyConnection(),
    mentioned: emptyConnection(),
    changesRequested: emptyConnection(),
    failingChecks: emptyConnection(),
    authoredPullRequests: emptyConnection(),
    participating: emptyConnection(),
    incomingPullRequests: emptyConnection(),
    ...overrides,
  };
}
