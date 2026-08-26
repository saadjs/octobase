/* eslint-disable react-perf/jsx-no-new-function-as-prop, react-perf/jsx-no-new-object-as-prop -- Row actions and activity values do not cross memoized boundaries. */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  IssueCardFragment,
  PullRequestCardFragment,
  ReactionContent,
  StatusState,
} from "@/gql/graphql";
import {
  commentCount,
  formatExactTime,
  formatRelativeTime,
  formatWaitingDuration,
  issueLabelStyle,
  latestPullRequestActivity,
  reviewLabel,
  type Activity,
} from "@/app/presentation";

export function PullRequestRow({
  isHidden,
  onSetHidden,
  pullRequest,
  showChecks = false,
  waitingSince,
}: {
  isHidden: boolean;
  onSetHidden: (itemId: string, updatedAt?: string) => void;
  pullRequest: PullRequestCardFragment;
  showChecks?: boolean;
  waitingSince?: string;
}) {
  const activity = latestPullRequestActivity(pullRequest);
  return (
    <article className="px-4 py-3.5">
      <ItemLink href={pullRequest.url}>{pullRequest.title}</ItemLink>
      <ItemMetadata
        commentTotal={pullRequest.comments.totalCount}
        number={pullRequest.number}
        repository={pullRequest.repository}
        updatedAt={pullRequest.updatedAt}
        waitingSince={waitingSince}
      />
      {activity ? <ActivityLine activity={activity} /> : null}
      <ReactionSummary reactionGroups={pullRequest.reactionGroups} />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {pullRequest.isDraft ? <Badge variant="secondary">Draft</Badge> : null}
        {pullRequest.reviewDecision ? <ReviewBadge decision={pullRequest.reviewDecision} /> : null}
        {showChecks ? <CheckBadge state={pullRequest.statusCheckRollup?.state} /> : null}
        <HideItemButton
          className="sm:ml-auto"
          isHidden={isHidden}
          itemId={pullRequest.id}
          onSetHidden={onSetHidden}
          updatedAt={pullRequest.updatedAt}
        />
      </div>
    </article>
  );
}

export function IssueRow({
  isHidden,
  issue,
  onSetHidden,
  waitingSince,
}: {
  isHidden: boolean;
  issue: IssueCardFragment;
  onSetHidden: (itemId: string, updatedAt?: string) => void;
  waitingSince?: string;
}) {
  const comment = issue.comments.nodes?.find((entry) => entry !== null);
  const activity: Activity | undefined = comment ? { ...comment, kind: "comment" } : undefined;
  return (
    <article className="px-4 py-3.5">
      <ItemLink href={issue.url}>{issue.title}</ItemLink>
      <ItemMetadata
        commentTotal={issue.comments.totalCount}
        number={issue.number}
        repository={issue.repository}
        updatedAt={issue.updatedAt}
        waitingSince={waitingSince}
      />
      {activity ? <ActivityLine activity={activity} /> : null}
      <ReactionSummary reactionGroups={issue.reactionGroups} />
      <div className="mt-2 flex flex-wrap items-center gap-1">
        {issue.labels?.nodes?.filter(isLabel).map((label) => (
          <Badge key={label.name} style={issueLabelStyle(label.color)}>
            {label.name}
          </Badge>
        ))}
        <HideItemButton
          className="sm:ml-auto"
          isHidden={isHidden}
          itemId={issue.id}
          onSetHidden={onSetHidden}
          updatedAt={issue.updatedAt}
        />
      </div>
    </article>
  );
}

function ItemLink({ children, href }: { children: string; href: string }) {
  return (
    <a
      className="font-medium break-words text-foreground hover:text-(--fgColor-accent) hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-(--focus-outlineColor)"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      {children}
    </a>
  );
}

function ItemMetadata({
  commentTotal,
  number,
  repository,
  updatedAt,
  waitingSince,
}: {
  commentTotal: number;
  number: number;
  repository: { nameWithOwner: string; url: string };
  updatedAt: string;
  waitingSince?: string;
}) {
  return (
    <p className="text-muted-foreground mt-1 text-xs">
      <a
        className="hover:text-(--fgColor-accent) hover:underline"
        href={repository.url}
        rel="noreferrer"
        target="_blank"
      >
        {repository.nameWithOwner}
      </a>{" "}
      #{number} ·{" "}
      {waitingSince ? (
        <>
          <span className="font-medium text-foreground" title={formatExactTime(waitingSince)}>
            Waiting {formatWaitingDuration(waitingSince)}
          </span>{" "}
          ·{" "}
        </>
      ) : null}
      Updated {formatRelativeTime(updatedAt)} · {commentCount(commentTotal)}
    </p>
  );
}

function HideItemButton({
  className,
  isHidden,
  itemId,
  onSetHidden,
  updatedAt,
}: {
  className?: string;
  isHidden: boolean;
  itemId: string;
  onSetHidden: (itemId: string, updatedAt?: string) => void;
  updatedAt: string;
}) {
  return (
    <Button
      className={className}
      onClick={() => onSetHidden(itemId, isHidden ? undefined : updatedAt)}
      size="sm"
      type="button"
      variant="ghost"
    >
      {isHidden ? "Unhide" : "Hide until activity changes"}
    </Button>
  );
}

function ActivityLine({ activity }: { activity: Activity }) {
  return (
    <p className="mt-1 text-xs text-(--fgColor-accent)">
      Latest {activity.kind} by @{activity.author?.login ?? "ghost"} ·{" "}
      {formatRelativeTime(activity.createdAt)}
    </p>
  );
}

type ReactionGroup = NonNullable<IssueCardFragment["reactionGroups"]>[number];

const REACTIONS = {
  CONFUSED: { emoji: "😕", label: "confused" },
  EYES: { emoji: "👀", label: "eyes" },
  HEART: { emoji: "❤️", label: "heart" },
  HOORAY: { emoji: "🎉", label: "hooray" },
  LAUGH: { emoji: "😄", label: "laugh" },
  ROCKET: { emoji: "🚀", label: "rocket" },
  THUMBS_DOWN: { emoji: "👎", label: "thumbs down" },
  THUMBS_UP: { emoji: "👍", label: "thumbs up" },
} as const satisfies Record<ReactionContent, { emoji: string; label: string }>;

function ReactionSummary({ reactionGroups }: { reactionGroups: ReactionGroup[] | null }) {
  const visibleGroups = (reactionGroups ?? []).filter((group) => group.reactors.totalCount > 0);
  if (visibleGroups.length === 0) return null;

  const total = visibleGroups.reduce((sum, group) => sum + group.reactors.totalCount, 0);
  return (
    <div
      aria-label={`${total.toLocaleString("en-US")} ${total === 1 ? "reaction" : "reactions"}`}
      className="mt-2 flex flex-wrap items-center gap-1.5"
    >
      {visibleGroups.map((group) => {
        const reaction = REACTIONS[group.content];
        const count = group.reactors.totalCount;
        const label = `${count.toLocaleString("en-US")} ${reaction.label} ${count === 1 ? "reaction" : "reactions"}${group.viewerHasReacted ? "; you reacted" : ""}`;
        return (
          <Badge
            aria-label={label}
            className="gap-1 px-2 text-muted-foreground"
            key={group.content}
            title={label}
            variant={group.viewerHasReacted ? "secondary" : "outline"}
          >
            <span aria-hidden>{reaction.emoji}</span>
            {count.toLocaleString("en-US")}
          </Badge>
        );
      })}
    </div>
  );
}

function ReviewBadge({
  decision,
}: {
  decision: NonNullable<PullRequestCardFragment["reviewDecision"]>;
}) {
  const variants = {
    APPROVED: "success",
    CHANGES_REQUESTED: "destructive",
    REVIEW_REQUIRED: "attention",
  } as const;
  return <Badge variant={variants[decision]}>{reviewLabel(decision)}</Badge>;
}

function CheckBadge({ state }: { state: StatusState | undefined }) {
  if (!state) return <Badge variant="outline">CI unavailable</Badge>;
  const statuses = {
    ERROR: { label: "CI error", variant: "destructive" },
    EXPECTED: { label: "CI expected", variant: "attention" },
    FAILURE: { label: "CI failing", variant: "destructive" },
    PENDING: { label: "CI pending", variant: "attention" },
    SUCCESS: { label: "CI passing", variant: "success" },
  } as const satisfies Record<StatusState, { label: string; variant: BadgeStatusVariant }>;
  return <Badge variant={statuses[state].variant}>{statuses[state].label}</Badge>;
}

type BadgeStatusVariant = "attention" | "destructive" | "success";

function isLabel(
  value: { name: string; color: string } | null,
): value is { name: string; color: string } {
  return value !== null;
}
