import { normalizeGitHubLogin } from "@/data/account";
import type { DashboardSnapshot } from "@/data/github";
import type { IssueCardFragment, PullRequestCardFragment } from "@/gql/graphql";

/** Ordered by how likely each reason is to be blocking someone; the first entry wins. */
export const ATTENTION_REASONS = [
  "review-requested",
  "changes-requested",
  "merge-conflict",
  "ci-failing",
  "mentioned",
  "reply",
  "assigned",
  // Nobody asked the viewer for these, so an explicit request always outranks them.
  "incoming-review",
  // Under branch protection every unapproved pull request is BLOCKED, so it ranks last.
  "blocked",
] as const;

export type AttentionReason = (typeof ATTENTION_REASONS)[number];

export type AttentionItem =
  | {
      key: string;
      reasons: AttentionReason[];
      rank: number;
      updatedAt: string;
      /** When the item started waiting on the viewer, for the strongest reason it carries. */
      waitingSince: string;
      kind: "pull-request";
      pullRequest: PullRequestCardFragment;
    }
  | {
      key: string;
      reasons: AttentionReason[];
      rank: number;
      updatedAt: string;
      waitingSince: string;
      kind: "issue";
      issue: IssueCardFragment;
    };

export const ATTENTION_REASON_LABELS = {
  "review-requested": "Review requested",
  "changes-requested": "Changes requested",
  "merge-conflict": "Merge conflict",
  "ci-failing": "CI failing",
  blocked: "Blocked from merging",
  mentioned: "Mentioned",
  reply: "New reply",
  assigned: "Assigned to you",
  "incoming-review": "On your repositories",
} satisfies Record<AttentionReason, string>;

export const ATTENTION_REASON_VARIANTS = {
  "review-requested": "attention",
  "changes-requested": "destructive",
  "merge-conflict": "destructive",
  "ci-failing": "destructive",
  blocked: "attention",
  mentioned: "default",
  reply: "default",
  assigned: "secondary",
  "incoming-review": "default",
} satisfies Record<AttentionReason, "attention" | "default" | "destructive" | "secondary">;

function reasonRank(reason: AttentionReason): number {
  return ATTENTION_REASONS.indexOf(reason);
}

type Node = PullRequestCardFragment | IssueCardFragment;
/** Search aliases share one node union: the two card fragments, plus unmatched empties. */
type SearchNode = Node | Record<PropertyKey, never> | null;
type Draft = { reasons: Set<AttentionReason>; node: Node };
type WithCreatedAt = { createdAt: string };
type ReviewRequestedEvent = NonNullable<
  NonNullable<PullRequestCardFragment["reviewRequestedEvents"]["nodes"]>[number]
>;
type AssignedEvent = NonNullable<NonNullable<IssueCardFragment["assignedEvents"]["nodes"]>[number]>;
type TimelineEvent = ReviewRequestedEvent | AssignedEvent;
type TimelineActor =
  | Extract<ReviewRequestedEvent, WithCreatedAt>["requestedReviewer"]
  | Extract<AssignedEvent, WithCreatedAt>["assignee"];
const GRAPHQL_TYPE_NAME = "__typename";

export function buildAttentionQueue(snapshot: DashboardSnapshot): AttentionItem[] {
  const viewer = normalizeGitHubLogin(snapshot.viewer.login);
  const drafts = new Map<string, Draft>();

  const add = (node: Node | null | undefined, reason: AttentionReason) => {
    if (!node) return;
    const existing = drafts.get(node.id);
    if (existing) {
      existing.reasons.add(reason);
      // Prefer the most recently updated copy; searches can disagree between pages.
      if (node.updatedAt > existing.node.updatedAt) existing.node = node;
      return;
    }
    drafts.set(node.id, { reasons: new Set([reason]), node });
  };

  for (const node of pullRequests(snapshot.reviewRequests.nodes)) add(node, "review-requested");
  for (const node of issues(snapshot.assignedIssues.nodes)) add(node, "assigned");
  for (const node of cards(snapshot.mentioned.nodes)) add(node, "mentioned");
  for (const node of pullRequests(snapshot.changesRequested.nodes)) add(node, "changes-requested");
  for (const node of pullRequests(snapshot.failingChecks.nodes)) add(node, "ci-failing");
  for (const node of pullRequests(snapshot.incomingPullRequests.nodes))
    add(node, "incoming-review");

  for (const node of cards(snapshot.participating.nodes)) {
    if (hasReplyFromSomeoneElse(node, viewer)) add(node, "reply");
  }

  // GitHub has no search qualifier for merge state, so this scans the authored page.
  for (const node of pullRequests(snapshot.authoredPullRequests.nodes)) {
    if (node.mergeStateStatus === "DIRTY" || node.mergeable === "CONFLICTING") {
      add(node, "merge-conflict");
    } else if (node.mergeStateStatus === "BLOCKED") {
      add(node, "blocked");
    }
  }

  return [...drafts.values()].map((draft) => toItem(draft, viewer)).toSorted(compareItems);
}

function toItem({ node, reasons }: Draft, viewer: string): AttentionItem {
  const ordered = [...reasons].toSorted((left, right) => reasonRank(left) - reasonRank(right));
  const strongest = ordered[0] ?? "assigned";
  const shared = {
    key: node.id,
    reasons: ordered,
    rank: reasonRank(strongest),
    updatedAt: node.updatedAt,
    waitingSince: waitingSince(node, strongest, viewer),
  };
  return isPullRequest(node)
    ? { ...shared, kind: "pull-request", pullRequest: node }
    : { ...shared, kind: "issue", issue: node };
}

/** Within a reason, whatever has been waiting longest comes first — that is the whole premise. */
function compareItems(left: AttentionItem, right: AttentionItem): number {
  if (left.rank !== right.rank) return left.rank - right.rank;
  if (left.waitingSince !== right.waitingSince) {
    return left.waitingSince.localeCompare(right.waitingSince);
  }
  return left.key.localeCompare(right.key);
}

function hasReplyFromSomeoneElse(node: Node, viewer: string): boolean {
  return latestExternalActivity(node, viewer) !== undefined;
}

/**
 * `comments` and `reviews` both come back oldest-first, and on a pull request the newest
 * review is often newer than the newest comment, so both have to be compared.
 */
function latestExternalActivity(node: Node, viewer: string): string | undefined {
  const latest = [
    node.comments.nodes?.findLast((entry) => entry !== null),
    node[GRAPHQL_TYPE_NAME] === "PullRequest"
      ? node.reviews?.nodes?.findLast((entry) => entry !== null)
      : undefined,
  ]
    .filter((entry) => entry !== null && entry !== undefined)
    .toSorted((left, right) => right.createdAt.localeCompare(left.createdAt))[0];

  if (!latest?.author) return undefined;
  return normalizeGitHubLogin(latest.author.login) === viewer ? undefined : latest.createdAt;
}

/**
 * `updatedAt` is the wrong clock — the viewer's own comment refreshes it. Where GitHub records
 * the moment the ball landed in the viewer's court, use that instead.
 *
 * Merge conflicts, blocked merges, failing CI and mentions have no such event: GitHub exposes no
 * "became conflicted at" and no timestamp on the mention itself. Those fall back to the newest
 * activity by someone else, then to when the item was opened.
 */
function waitingSince(node: Node, reason: AttentionReason, viewer: string): string {
  const measured = measuredWait(node, reason, viewer);
  return measured ?? latestExternalActivity(node, viewer) ?? node.createdAt;
}

function measuredWait(node: Node, reason: AttentionReason, viewer: string): string | undefined {
  if (!isPullRequest(node)) {
    return reason === "assigned" ? assignedAt(node, viewer) : undefined;
  }
  if (reason === "review-requested") return reviewRequestedAt(node, viewer);
  if (reason === "changes-requested") {
    return node.changesRequestedReviews?.nodes?.findLast((entry) => entry !== null)?.createdAt;
  }
  return undefined;
}

/** A request can be addressed to a team rather than the viewer, so fall back to any request. */
function reviewRequestedAt(node: PullRequestCardFragment, viewer: string): string | undefined {
  const events = (node.reviewRequestedEvents.nodes ?? []).filter(hasCreatedAt);
  const mine = events.filter((event) => matchesViewer(event.requestedReviewer, viewer));
  return newest(mine.length > 0 ? mine : events);
}

function assignedAt(node: IssueCardFragment, viewer: string): string | undefined {
  const events = (node.assignedEvents.nodes ?? []).filter(hasCreatedAt);
  const mine = events.filter((event) => matchesViewer(event.assignee, viewer));
  return newest(mine.length > 0 ? mine : events);
}

function newest(events: readonly { createdAt: string }[]): string | undefined {
  return events.toSorted((left, right) => right.createdAt.localeCompare(left.createdAt))[0]
    ?.createdAt;
}

/** Teams, bots and mannequins select no `login`, so they can never be the viewer. */
function matchesViewer(actor: TimelineActor, viewer: string): boolean {
  return actor !== null && "login" in actor && normalizeGitHubLogin(actor.login) === viewer;
}

function hasCreatedAt<T extends TimelineEvent>(
  entry: T | null,
): entry is Extract<T, WithCreatedAt> {
  return entry !== null && "createdAt" in entry;
}

function cards(nodes: readonly SearchNode[] | null | undefined): Node[] {
  return (nodes ?? []).filter(isCard);
}

function pullRequests(nodes: readonly SearchNode[] | null | undefined): PullRequestCardFragment[] {
  return cards(nodes).filter(isPullRequest);
}

function issues(nodes: readonly SearchNode[] | null | undefined): IssueCardFragment[] {
  return cards(nodes).filter(isIssue);
}

function isCard(entry: SearchNode): entry is Node {
  return entry !== null && (isPullRequest(entry) || isIssue(entry));
}

function isPullRequest(node: Node | Exclude<SearchNode, null>): node is PullRequestCardFragment {
  return node[GRAPHQL_TYPE_NAME] === "PullRequest";
}

function isIssue(node: Node | Exclude<SearchNode, null>): node is IssueCardFragment {
  return node[GRAPHQL_TYPE_NAME] === "Issue";
}
