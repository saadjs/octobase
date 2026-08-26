import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchDashboardAttention, GitHubApiError, isDashboardTabLoaded } from "@/data/github";
import { dashboardSnapshot, pullRequestNode } from "@/data/test-fixtures";

describe("GitHub GraphQL rate-limit rejections", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("reads GitHub's reset header from a spent primary limit", async () => {
    stubFetch(
      new Response(JSON.stringify({ message: "API rate limit exceeded" }), {
        status: 403,
        headers: {
          "content-type": "application/json",
          "x-ratelimit-remaining": "0",
          "x-ratelimit-reset": "4102444800",
        },
      }),
    );

    await expect(fetchDashboardAttention("token")).rejects.toMatchObject({
      status: 403,
      rateLimit: { retryAt: "2100-01-01T00:00:00.000Z" },
    });
  });

  it("uses retry-after when a secondary limit answers 429", async () => {
    stubFetch(
      new Response(JSON.stringify({ message: "You have exceeded a secondary rate limit" }), {
        status: 429,
        headers: { "content-type": "application/json", "retry-after": "60" },
      }),
    );

    const error = await fetchDashboardAttention("token").catch((cause: unknown) => cause);

    // SAFETY: The request above always rejects with the error this branch reports.
    const retryAt = (error as GitHubApiError).rateLimit?.retryAt;
    expect(retryAt).toBeDefined();
    expect(new Date(retryAt ?? "").getTime()).toBeGreaterThan(Date.now());
  });

  it("recognizes a GraphQL rate-limit error returned with HTTP 200", async () => {
    stubFetch(
      new Response(JSON.stringify({ errors: [{ message: "API rate limit exceeded for user" }] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    await expect(fetchDashboardAttention("token")).rejects.toMatchObject({ rateLimit: {} });
  });

  it("leaves ordinary failures unmarked", async () => {
    stubFetch(
      new Response(JSON.stringify({ message: "Bad credentials" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      }),
    );

    const error = await fetchDashboardAttention("token").catch((cause: unknown) => cause);

    expect(error).toBeInstanceOf(GitHubApiError);
    // SAFETY: The assertion above proves the rejection is a GitHubApiError.
    expect((error as GitHubApiError).rateLimit).toBeUndefined();
  });
});

function stubFetch(response: Response): void {
  vi.stubGlobal(
    "fetch",
    vi
      .fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>()
      .mockResolvedValue(response),
  );
}

describe("dashboard tab loading", () => {
  it("treats attention as always present in a snapshot", () => {
    expect(isDashboardTabLoaded(dashboardSnapshot(), "attention")).toBe(true);
  });

  it("reports an unfetched tab as unloaded when its count promises work", () => {
    const snapshot = dashboardSnapshot({ counts: { ownedPullRequests: 3, ownedIssues: 0 } });

    expect(isDashboardTabLoaded(snapshot, "owned")).toBe(false);
  });

  it("reports a genuinely empty tab as loaded so it never refetches", () => {
    const snapshot = dashboardSnapshot({ counts: { ownedPullRequests: 0, ownedIssues: 0 } });

    expect(isDashboardTabLoaded(snapshot, "owned")).toBe(true);
  });

  it("reports a tab holding items as loaded", () => {
    const base = dashboardSnapshot({ counts: { ownedPullRequests: 1, ownedIssues: 0 } });
    const snapshot = {
      ...base,
      ownedPullRequests: {
        ...base.ownedPullRequests,
        issueCount: 1,
        nodes: [pullRequestNode({ id: "owned-1" })],
      },
    };

    expect(isDashboardTabLoaded(snapshot, "owned")).toBe(true);
  });

  it("refetches a tab whose totals were never measured", () => {
    expect(isDashboardTabLoaded(dashboardSnapshot(), "contributions")).toBe(false);
  });
});
