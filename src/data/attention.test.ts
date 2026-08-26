import { describe, expect, it } from "vitest";
import { buildAttentionQueue } from "@/data/attention";
import { connection, dashboardSnapshot, issueNode, pullRequestNode } from "@/data/test-fixtures";

describe("buildAttentionQueue", () => {
  it("orders reasons by how likely they are to block someone", () => {
    const queue = buildAttentionQueue(
      dashboardSnapshot({
        assignedIssues: connection([issueNode({ id: "assigned" })]),
        reviewRequests: connection([pullRequestNode({ id: "review" })]),
        mentioned: connection([issueNode({ id: "mention" })]),
        changesRequested: connection([pullRequestNode({ id: "changes" })]),
        failingChecks: connection([pullRequestNode({ id: "ci" })]),
        authoredPullRequests: connection([
          pullRequestNode({ id: "conflict", mergeStateStatus: "DIRTY" }),
          pullRequestNode({ id: "blocked", mergeStateStatus: "BLOCKED" }),
        ]),
        incomingPullRequests: connection([pullRequestNode({ id: "incoming" })]),
      }),
    );

    expect(queue.map((item) => item.key)).toEqual([
      "review",
      "changes",
      "conflict",
      "ci",
      "mention",
      "assigned",
      "incoming",
      "blocked",
    ]);
  });

  it("surfaces pull requests other people opened on the viewer's repositories", () => {
    const queue = buildAttentionQueue(
      dashboardSnapshot({
        incomingPullRequests: connection([
          pullRequestNode({ id: "incoming", createdAt: "2026-08-11T09:00:00.000Z" }),
        ]),
      }),
    );

    expect(queue[0]?.reasons).toEqual(["incoming-review"]);
    expect(queue[0]?.waitingSince).toBe("2026-08-11T09:00:00.000Z");
  });

  it("ranks an incoming pull request by the request when the viewer was also asked to review", () => {
    const incoming = pullRequestNode({
      id: "pr",
      reviewRequestedEvents: {
        nodes: [{ createdAt: "2026-08-06T09:00:00.000Z", requestedReviewer: { login: "octocat" } }],
      },
    });
    const queue = buildAttentionQueue(
      dashboardSnapshot({
        reviewRequests: connection([incoming]),
        incomingPullRequests: connection([incoming]),
      }),
    );

    expect(queue).toHaveLength(1);
    expect(queue[0]?.reasons).toEqual(["review-requested", "incoming-review"]);
    expect(queue[0]?.waitingSince).toBe("2026-08-06T09:00:00.000Z");
  });

  it("puts the longest-waiting review request first, not the most recently updated", () => {
    const queue = buildAttentionQueue(
      dashboardSnapshot({
        reviewRequests: connection([
          reviewRequestedNode("fresh", "2026-08-23T09:00:00.000Z", "2026-08-23T12:00:00.000Z"),
          reviewRequestedNode("stale", "2026-08-09T09:00:00.000Z", "2026-08-10T09:00:00.000Z"),
        ]),
      }),
    );

    expect(queue.map((item) => item.key)).toEqual(["stale", "fresh"]);
    expect(queue[0]?.waitingSince).toBe("2026-08-09T09:00:00.000Z");
  });

  it("ignores review requests addressed to other people", () => {
    const queue = buildAttentionQueue(
      dashboardSnapshot({
        reviewRequests: connection([
          pullRequestNode({
            id: "pr",
            reviewRequestedEvents: {
              nodes: [
                { createdAt: "2026-08-01T09:00:00.000Z", requestedReviewer: { login: "octocat" } },
                { createdAt: "2026-08-22T09:00:00.000Z", requestedReviewer: { login: "hubot" } },
              ],
            },
          }),
        ]),
      }),
    );

    expect(queue[0]?.waitingSince).toBe("2026-08-01T09:00:00.000Z");
  });

  it("falls back to any request when the reviewer is a team rather than the viewer", () => {
    const queue = buildAttentionQueue(
      dashboardSnapshot({
        reviewRequests: connection([
          pullRequestNode({
            id: "pr",
            reviewRequestedEvents: {
              nodes: [{ createdAt: "2026-08-05T09:00:00.000Z", requestedReviewer: {} }],
            },
          }),
        ]),
      }),
    );

    expect(queue[0]?.waitingSince).toBe("2026-08-05T09:00:00.000Z");
  });

  it("measures assignment from the assigned event, not the last update", () => {
    const queue = buildAttentionQueue(
      dashboardSnapshot({
        assignedIssues: connection([
          issueNode({
            id: "issue",
            updatedAt: "2026-08-23T09:00:00.000Z",
            assignedEvents: {
              nodes: [{ createdAt: "2026-08-02T09:00:00.000Z", assignee: { login: "octocat" } }],
            },
          }),
        ]),
      }),
    );

    expect(queue[0]?.waitingSince).toBe("2026-08-02T09:00:00.000Z");
  });

  it("measures changes requested from the review that asked for them", () => {
    const queue = buildAttentionQueue(
      dashboardSnapshot({
        changesRequested: connection([
          pullRequestNode({
            id: "pr",
            changesRequestedReviews: {
              nodes: [{ createdAt: "2026-08-11T09:00:00.000Z", author: { login: "hubot" } }],
            },
          }),
        ]),
      }),
    );

    expect(queue[0]?.waitingSince).toBe("2026-08-11T09:00:00.000Z");
  });

  it("falls back to the newest activity by someone else when no event records the wait", () => {
    const queue = buildAttentionQueue(
      dashboardSnapshot({
        authoredPullRequests: connection([
          pullRequestNode({
            id: "conflict",
            mergeStateStatus: "DIRTY",
            comments: {
              totalCount: 1,
              nodes: [{ createdAt: "2026-08-15T09:00:00.000Z", author: { login: "hubot" } }],
            },
          }),
        ]),
      }),
    );

    expect(queue[0]?.waitingSince).toBe("2026-08-15T09:00:00.000Z");
  });

  it("falls back to when the item was opened if nobody else has touched it", () => {
    const queue = buildAttentionQueue(
      dashboardSnapshot({
        authoredPullRequests: connection([
          pullRequestNode({
            id: "blocked",
            createdAt: "2026-07-01T09:00:00.000Z",
            mergeStateStatus: "BLOCKED",
          }),
        ]),
      }),
    );

    expect(queue[0]?.waitingSince).toBe("2026-07-01T09:00:00.000Z");
  });

  it("merges every reason for the same pull request and ranks it by the strongest", () => {
    const broken = pullRequestNode({ id: "pr", mergeStateStatus: "DIRTY" });
    const queue = buildAttentionQueue(
      dashboardSnapshot({
        authoredPullRequests: connection([broken]),
        changesRequested: connection([broken]),
        failingChecks: connection([broken]),
        mentioned: connection([broken]),
      }),
    );

    expect(queue).toHaveLength(1);
    expect(queue[0]?.reasons).toEqual([
      "changes-requested",
      "merge-conflict",
      "ci-failing",
      "mentioned",
    ]);
  });

  it("treats CONFLICTING as a conflict even when the merge state is still UNKNOWN", () => {
    // GitHub computes mergeability lazily, so a first read can report UNKNOWN.
    const queue = buildAttentionQueue(
      dashboardSnapshot({
        authoredPullRequests: connection([
          pullRequestNode({ id: "known", mergeable: "CONFLICTING", mergeStateStatus: "UNKNOWN" }),
          pullRequestNode({ id: "pending", mergeable: "UNKNOWN", mergeStateStatus: "UNKNOWN" }),
        ]),
      }),
    );

    expect(queue.map((item) => item.key)).toEqual(["known"]);
    expect(queue[0]?.reasons).toEqual(["merge-conflict"]);
  });

  it("counts a reply only when the newest comment came from someone else", () => {
    const queue = buildAttentionQueue(
      dashboardSnapshot({
        participating: connection([
          issueNode({
            id: "theirs",
            comments: {
              totalCount: 2,
              nodes: [{ author: { login: "Maintainer" }, createdAt: "2026-08-23T10:00:00.000Z" }],
            },
          }),
          issueNode({
            id: "mine",
            comments: {
              totalCount: 2,
              nodes: [{ author: { login: "OctoCat" }, createdAt: "2026-08-23T10:00:00.000Z" }],
            },
          }),
        ]),
      }),
    );

    expect(queue.map((item) => item.key)).toEqual(["theirs"]);
    expect(queue[0]?.reasons).toEqual(["reply"]);
  });

  it("counts a review newer than the newest comment as a reply", () => {
    const queue = buildAttentionQueue(
      dashboardSnapshot({
        participating: connection([
          pullRequestNode({
            id: "reviewed",
            comments: {
              totalCount: 1,
              nodes: [{ author: { login: "octocat" }, createdAt: "2026-08-23T10:00:00.000Z" }],
            },
            reviews: {
              nodes: [{ author: { login: "maintainer" }, createdAt: "2026-08-23T11:00:00.000Z" }],
            },
          }),
        ]),
      }),
    );

    expect(queue.map((item) => item.key)).toEqual(["reviewed"]);
    expect(queue[0]?.reasons).toEqual(["reply"]);
  });

  it("leaves healthy authored pull requests out of the queue", () => {
    const queue = buildAttentionQueue(
      dashboardSnapshot({
        authoredPullRequests: connection([
          pullRequestNode({ id: "healthy", mergeStateStatus: "CLEAN" }),
          pullRequestNode({ id: "unstable", mergeStateStatus: "UNSTABLE" }),
        ]),
      }),
    );

    expect(queue).toEqual([]);
  });

  it("sorts equally ranked items by most recently updated", () => {
    const queue = buildAttentionQueue(
      dashboardSnapshot({
        reviewRequests: connection([
          pullRequestNode({ id: "older", updatedAt: "2026-08-22T10:00:00.000Z" }),
          pullRequestNode({ id: "newer", updatedAt: "2026-08-23T10:00:00.000Z" }),
        ]),
      }),
    );

    expect(queue.map((item) => item.key)).toEqual(["newer", "older"]);
  });
});

function reviewRequestedNode(id: string, requestedAt: string, updatedAt: string) {
  return pullRequestNode({
    id,
    updatedAt,
    reviewRequestedEvents: {
      nodes: [{ createdAt: requestedAt, requestedReviewer: { login: "octocat" } }],
    },
  });
}
