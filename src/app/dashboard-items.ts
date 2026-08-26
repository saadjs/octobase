import { buildAttentionQueue } from "@/data/attention";
import { isDashboardItemHidden, type DashboardPreferences } from "@/data/dashboard-preferences";
import type { DashboardSnapshot } from "@/data/github";
import type { IssueCardFragment, PullRequestCardFragment } from "@/gql/graphql";

type DashboardItem = PullRequestCardFragment | IssueCardFragment;
type ItemKind = "pull-request" | "issue";
type Candidate = DashboardItem | Record<PropertyKey, never> | null;
const GRAPHQL_TYPE_NAME = "__typename";

export function matchesDashboardPreferences(
  kind: ItemKind,
  item: DashboardItem,
  preferences: DashboardPreferences,
): boolean {
  if (preferences.itemType !== "all" && preferences.itemType !== kind) return false;
  if (kind === "pull-request" && "isDraft" in item && item.isDraft && !preferences.showDrafts) {
    return false;
  }

  const query = preferences.repositoryQuery.trim().toLowerCase();
  if (query && !item.repository.nameWithOwner.toLowerCase().includes(query)) return false;

  const hidden = isDashboardItemHidden(preferences, item.id, item.updatedAt);
  return !hidden || preferences.showHidden;
}

export function countCurrentlyHiddenItems(
  dashboard: DashboardSnapshot,
  preferences: DashboardPreferences,
): number {
  const items = new Map<string, DashboardItem>();
  for (const attention of buildAttentionQueue(dashboard)) {
    const item = attention.kind === "pull-request" ? attention.pullRequest : attention.issue;
    items.set(item.id, item);
  }
  for (const item of pullRequestCards(dashboard.ownedPullRequests.nodes)) items.set(item.id, item);
  for (const item of issueCards(dashboard.ownedIssues.nodes)) items.set(item.id, item);
  for (const item of pullRequestCards(dashboard.contributedPullRequests.nodes)) {
    items.set(item.id, item);
  }
  for (const item of issueCards(dashboard.contributedIssues.nodes)) items.set(item.id, item);
  return [...items.values()].filter((item) =>
    isDashboardItemHidden(preferences, item.id, item.updatedAt),
  ).length;
}

export function pullRequestCards(
  nodes: readonly Candidate[] | null | undefined,
): PullRequestCardFragment[] {
  return (nodes ?? []).filter(isPullRequestCard);
}

export function issueCards(nodes: readonly Candidate[] | null | undefined): IssueCardFragment[] {
  return (nodes ?? []).filter(isIssueCard);
}

function isPullRequestCard(entry: Candidate): entry is PullRequestCardFragment {
  return entry !== null && entry[GRAPHQL_TYPE_NAME] === "PullRequest";
}

function isIssueCard(entry: Candidate): entry is IssueCardFragment {
  return entry !== null && entry[GRAPHQL_TYPE_NAME] === "Issue";
}
