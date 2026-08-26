import type { CSSProperties } from "react";
import type { PublicTokenState } from "@/auth/types";
import { MAX_SEARCH_RESULTS } from "@/data/github";
import type { PullRequestCardFragment } from "@/gql/graphql";

export type Activity = {
  author?: { login: string } | null;
  createdAt: string;
  kind: "comment" | "review";
};

export function latestPullRequestActivity(
  pullRequest: PullRequestCardFragment,
): Activity | undefined {
  const comment = pullRequest.comments.nodes?.find((entry) => entry !== null);
  const review = pullRequest.reviews?.nodes?.find((entry) => entry !== null);
  const activities: Activity[] = [];
  if (comment) activities.push({ ...comment, kind: "comment" });
  if (review) activities.push({ ...review, kind: "review" });
  return activities.toSorted((left, right) => right.createdAt.localeCompare(left.createdAt))[0];
}

/** A total at GitHub's search ceiling is a floor, so it is shown as one. */
export function formatCount(count: number): string {
  return count >= MAX_SEARCH_RESULTS
    ? `${MAX_SEARCH_RESULTS.toLocaleString("en-US")}+`
    : count.toLocaleString("en-US");
}

export function commentCount(count: number): string {
  return `${count} ${count === 1 ? "comment" : "comments"}`;
}

export function connectionMechanism(token: Extract<PublicTokenState, { connected: true }>): string {
  const names = {
    app: "GitHub App",
    "fine-grained": "Fine-grained token",
    classic: "Token (classic)",
  } as const;
  return names[token.source];
}

export function connectionCoverage(token: Extract<PublicTokenState, { connected: true }>): string {
  const descriptions = {
    app: "Read-only access through the Octobase GitHub App",
    "fine-grained": "Showing repositories you selected for this token",
    classic: "Showing repositories this token's scopes allow",
  } as const;
  return descriptions[token.source];
}

export function reviewLabel(
  decision: NonNullable<PullRequestCardFragment["reviewDecision"]>,
): string {
  const label = decision.replaceAll("_", " ").toLowerCase();
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function issueLabelStyle(color: string): CSSProperties {
  const hex = /^[\da-f]{6}$/i.test(color) ? color : "6e7781";
  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);
  const luminance =
    0.2126 * linearChannel(red) + 0.7152 * linearChannel(green) + 0.0722 * linearChannel(blue);

  return {
    backgroundColor: `#${hex}`,
    borderColor: `#${hex}`,
    color: luminance > 0.45 ? "#0d1117" : "#ffffff",
  };
}

function linearChannel(channel: number): number {
  const value = channel / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

export function formatExactTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "long",
  }).format(new Date(value));
}

export function formatRelativeTime(value: string): string {
  const elapsedSeconds = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1000));
  if (elapsedSeconds < 60) return "just now";
  if (elapsedSeconds < 3600) return `${Math.floor(elapsedSeconds / 60)}m ago`;
  if (elapsedSeconds < 86_400) return `${Math.floor(elapsedSeconds / 3600)}h ago`;
  return `${Math.floor(elapsedSeconds / 86_400)}d ago`;
}

/** Duration since the ball landed in the viewer's court, in the queue's compact vocabulary. */
export function formatWaitingDuration(value: string): string {
  const elapsedSeconds = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1000));
  if (elapsedSeconds < 3600) return "under an hour";
  if (elapsedSeconds < 86_400) return `${Math.floor(elapsedSeconds / 3600)}h`;
  return `${Math.floor(elapsedSeconds / 86_400)}d`;
}
