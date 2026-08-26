import { afterEach, describe, expect, it, vi } from "vitest";
import {
  commentCount,
  connectionCoverage,
  connectionMechanism,
  formatCount,
  formatExactTime,
  formatRelativeTime,
  formatWaitingDuration,
  issueLabelStyle,
  latestPullRequestActivity,
  reviewLabel,
} from "@/app/presentation";
import { pullRequestNode } from "@/data/test-fixtures";

afterEach(() => vi.useRealTimers());

describe("dashboard presentation helpers", () => {
  // GitHub search stops counting at 1,000, so a bare "1000" would claim a total it never measured.
  it("marks counts that hit GitHub's search ceiling as a floor", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(999)).toBe("999");
    expect(formatCount(1000)).toBe("1,000+");
    expect(formatCount(4321)).toBe("1,000+");
  });

  it("formats relative ages around each display boundary", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-23T12:00:00.000Z"));

    expect(formatRelativeTime("2026-08-23T11:59:40.000Z")).toBe("just now");
    expect(formatRelativeTime("2026-08-23T11:58:00.000Z")).toBe("2m ago");
    expect(formatRelativeTime("2026-08-23T10:00:00.000Z")).toBe("2h ago");
    expect(formatRelativeTime("2026-08-21T12:00:00.000Z")).toBe("2d ago");
  });

  it("formats exact timestamps with seconds and a time zone", () => {
    const value = "2026-08-23T12:34:56.000Z";
    const parts = new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "long",
    }).formatToParts(new Date(value));
    const formatted = formatExactTime(value);

    expect(formatted).toContain(parts.find((part) => part.type === "second")?.value);
    expect(formatted).toContain(parts.find((part) => part.type === "timeZoneName")?.value);
  });

  it("selects the newest pull request comment or review", () => {
    const activity = latestPullRequestActivity(
      pullRequestNode({
        id: "pr",
        comments: {
          totalCount: 1,
          nodes: [{ author: { login: "commenter" }, createdAt: "2026-08-23T10:00:00.000Z" }],
        },
        reviews: {
          nodes: [{ author: { login: "reviewer" }, createdAt: "2026-08-23T11:00:00.000Z" }],
        },
      }),
    );

    expect(activity).toEqual({
      author: { login: "reviewer" },
      createdAt: "2026-08-23T11:00:00.000Z",
      kind: "review",
    });
  });

  it("keeps labels and connection descriptions consistent", () => {
    expect(commentCount(1)).toBe("1 comment");
    expect(commentCount(2)).toBe("2 comments");
    expect(reviewLabel("CHANGES_REQUESTED")).toBe("Changes requested");
    expect(connectionMechanism({ connected: true, source: "fine-grained" })).toBe(
      "Fine-grained token",
    );
    expect(connectionCoverage({ connected: true, source: "fine-grained" })).toContain(
      "repositories you selected",
    );
  });

  it("uses contrast-safe issue label colors and rejects malformed colors", () => {
    expect(issueLabelStyle("ffffff")).toEqual({
      backgroundColor: "#ffffff",
      borderColor: "#ffffff",
      color: "#0d1117",
    });
    expect(issueLabelStyle("not-a-color")).toMatchObject({
      backgroundColor: "#6e7781",
      borderColor: "#6e7781",
    });
  });
});

describe("formatWaitingDuration", () => {
  it("keeps sub-hour waits vague and longer ones compact", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-23T12:00:00.000Z"));
    expect(formatWaitingDuration("2026-08-23T11:40:00.000Z")).toBe("under an hour");
    expect(formatWaitingDuration("2026-08-23T07:00:00.000Z")).toBe("5h");
    expect(formatWaitingDuration("2026-08-09T12:00:00.000Z")).toBe("14d");
  });
});
