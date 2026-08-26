import { describe, expect, it, vi } from "vitest";
import type { StoredToken } from "@/auth/types";
import type { CachedDashboard } from "@/data/cache";
import {
  DashboardRefresh,
  type DashboardRefreshBudget,
  type DashboardRefreshPublisher,
  type DashboardRefreshSnapshots,
  type DashboardRefreshSource,
  type DashboardRefreshTokens,
} from "@/data/dashboard-refresh";
import { GitHubApiError, type DashboardSnapshot } from "@/data/github";
import type { DashboardCountsQuery } from "@/gql/graphql";
import { connection, dashboardSnapshot, issueNode, pullRequestNode } from "@/data/test-fixtures";

const token: StoredToken = { accessToken: "secret", source: "app" };

describe("DashboardRefresh", () => {
  it("preserves unrequested tabs when refreshing the selected tab", async () => {
    const cached = dashboardSnapshot({
      ownedIssues: connection([issueNode({ id: "stale-owned" })]),
      contributedPullRequests: connection([pullRequestNode({ id: "preserved-contribution" })]),
    });
    const attention = dashboardSnapshot();
    const owned = dashboardSnapshot({
      ownedIssues: connection([issueNode({ id: "fresh-owned" })]),
    });
    let written: DashboardSnapshot | undefined;
    const tokens: DashboardRefreshTokens = {
      get: vi.fn<DashboardRefreshTokens["get"]>(async () => token),
      getLegacy: vi.fn<DashboardRefreshTokens["getLegacy"]>(async () => undefined),
      set: vi.fn<DashboardRefreshTokens["set"]>(async () => undefined),
      clearLegacy: vi.fn<DashboardRefreshTokens["clearLegacy"]>(async () => undefined),
      invalidate: vi.fn<DashboardRefreshTokens["invalidate"]>(async () => undefined),
    };
    const source: DashboardRefreshSource = {
      fetchAttention: vi.fn<DashboardRefreshSource["fetchAttention"]>(async () => attention),
      fetchCounts: vi.fn<DashboardRefreshSource["fetchCounts"]>(async () => undefined),
      fetchOwned: vi.fn<DashboardRefreshSource["fetchOwned"]>(async () => owned),
      fetchContributions: vi.fn<DashboardRefreshSource["fetchContributions"]>(async () =>
        dashboardSnapshot(),
      ),
      fetchSection: vi.fn<DashboardRefreshSource["fetchSection"]>(),
    };
    const snapshots: DashboardRefreshSnapshots = {
      read: vi.fn<DashboardRefreshSnapshots["read"]>(async () => cachedSnapshot(cached)),
      write: vi.fn<DashboardRefreshSnapshots["write"]>(async (data) => {
        written = data;
        return cachedSnapshot(data);
      }),
      clear: vi.fn<DashboardRefreshSnapshots["clear"]>(async () => undefined),
    };
    const budget: DashboardRefreshBudget = {
      check: vi.fn<DashboardRefreshBudget["check"]>(async () => ({ allowed: true })),
      recordSuccess: vi.fn<DashboardRefreshBudget["recordSuccess"]>(async () => undefined),
      recordRejection: vi.fn<DashboardRefreshBudget["recordRejection"]>(async () => undefined),
      clear: vi.fn<DashboardRefreshBudget["clear"]>(async () => undefined),
    };
    const publish = vi.fn<DashboardRefreshPublisher["publish"]>(async () => undefined);
    const publisher: DashboardRefreshPublisher = { publish };
    const refresh = new DashboardRefresh(tokens, source, snapshots, budget, publisher);

    const result = await refresh.run("OctoCat", { selectedTab: "owned" });

    expect(written?.ownedIssues.nodes?.[0]?.id).toBe("fresh-owned");
    expect(written?.contributedPullRequests.nodes?.[0]?.id).toBe("preserved-contribution");
    expect(result?.data).toBe(written);
    expect(publish).toHaveBeenCalledWith(result);
  });

  it("fetches attention, counts, and the selected work tab in parallel", async () => {
    const attention = dashboardSnapshot();
    const attentionRequest =
      Promise.withResolvers<Awaited<ReturnType<DashboardRefreshSource["fetchAttention"]>>>();
    const fetchCounts = vi.fn<DashboardRefreshSource["fetchCounts"]>(async () => undefined);
    const fetchOwned = vi.fn<DashboardRefreshSource["fetchOwned"]>(async () => dashboardSnapshot());
    const tokens: DashboardRefreshTokens = {
      get: vi.fn<DashboardRefreshTokens["get"]>(async () => token),
      getLegacy: vi.fn<DashboardRefreshTokens["getLegacy"]>(async () => undefined),
      set: vi.fn<DashboardRefreshTokens["set"]>(async () => undefined),
      clearLegacy: vi.fn<DashboardRefreshTokens["clearLegacy"]>(async () => undefined),
      invalidate: vi.fn<DashboardRefreshTokens["invalidate"]>(async () => undefined),
    };
    const source: DashboardRefreshSource = {
      fetchAttention: vi.fn<DashboardRefreshSource["fetchAttention"]>(
        async () => attentionRequest.promise,
      ),
      fetchCounts,
      fetchOwned,
      fetchContributions: vi.fn<DashboardRefreshSource["fetchContributions"]>(),
      fetchSection: vi.fn<DashboardRefreshSource["fetchSection"]>(),
    };
    const snapshots: DashboardRefreshSnapshots = {
      read: vi.fn<DashboardRefreshSnapshots["read"]>(async () => undefined),
      write: vi.fn<DashboardRefreshSnapshots["write"]>(async (data) => cachedSnapshot(data)),
      clear: vi.fn<DashboardRefreshSnapshots["clear"]>(async () => undefined),
    };
    const budget: DashboardRefreshBudget = {
      check: vi.fn<DashboardRefreshBudget["check"]>(async () => ({ allowed: true })),
      recordSuccess: vi.fn<DashboardRefreshBudget["recordSuccess"]>(async () => undefined),
      recordRejection: vi.fn<DashboardRefreshBudget["recordRejection"]>(async () => undefined),
      clear: vi.fn<DashboardRefreshBudget["clear"]>(async () => undefined),
    };
    const publisher: DashboardRefreshPublisher = {
      publish: vi.fn<DashboardRefreshPublisher["publish"]>(async () => undefined),
    };
    const refresh = new DashboardRefresh(tokens, source, snapshots, budget, publisher);

    const refreshing = refresh.run("octocat", { selectedTab: "owned" });

    await vi.waitFor(() => {
      expect(fetchCounts).toHaveBeenCalledOnce();
      expect(fetchOwned).toHaveBeenCalledOnce();
    });
    attentionRequest.resolve(attention);
    await refreshing;
  });

  it("returns attention before slower badge counts and publishes them afterward", async () => {
    const counting = Promise.withResolvers<DashboardCountsQuery | undefined>();
    const writes: DashboardSnapshot[] = [];
    const tokens: DashboardRefreshTokens = {
      get: vi.fn<DashboardRefreshTokens["get"]>(async () => token),
      getLegacy: vi.fn<DashboardRefreshTokens["getLegacy"]>(async () => undefined),
      set: vi.fn<DashboardRefreshTokens["set"]>(async () => undefined),
      clearLegacy: vi.fn<DashboardRefreshTokens["clearLegacy"]>(async () => undefined),
      invalidate: vi.fn<DashboardRefreshTokens["invalidate"]>(async () => undefined),
    };
    const source: DashboardRefreshSource = {
      fetchAttention: vi.fn<DashboardRefreshSource["fetchAttention"]>(async () =>
        dashboardSnapshot(),
      ),
      fetchCounts: vi.fn<DashboardRefreshSource["fetchCounts"]>(async () => counting.promise),
      fetchOwned: vi.fn<DashboardRefreshSource["fetchOwned"]>(),
      fetchContributions: vi.fn<DashboardRefreshSource["fetchContributions"]>(),
      fetchSection: vi.fn<DashboardRefreshSource["fetchSection"]>(),
    };
    const snapshots: DashboardRefreshSnapshots = {
      read: vi.fn<DashboardRefreshSnapshots["read"]>(async () =>
        writes.length > 0 ? cachedSnapshot(writes.at(-1) ?? dashboardSnapshot()) : undefined,
      ),
      write: vi.fn<DashboardRefreshSnapshots["write"]>(async (data) => {
        writes.push(data);
        return cachedSnapshot(data);
      }),
      clear: vi.fn<DashboardRefreshSnapshots["clear"]>(async () => undefined),
    };
    const budget: DashboardRefreshBudget = {
      check: vi.fn<DashboardRefreshBudget["check"]>(async () => ({ allowed: true })),
      recordSuccess: vi.fn<DashboardRefreshBudget["recordSuccess"]>(async () => undefined),
      recordRejection: vi.fn<DashboardRefreshBudget["recordRejection"]>(async () => undefined),
      clear: vi.fn<DashboardRefreshBudget["clear"]>(async () => undefined),
    };
    const publish = vi.fn<DashboardRefreshPublisher["publish"]>(async () => undefined);
    const refresh = new DashboardRefresh(tokens, source, snapshots, budget, { publish });

    const initial = await refresh.run("octocat", { selectedTab: "attention" });
    expect(initial?.data.counts).toBeUndefined();
    expect(writes).toHaveLength(1);

    counting.resolve({
      rateLimit: null,
      viewer: { login: "octocat" },
      ownedPullRequests: { issueCount: 3 },
      ownedIssues: { issueCount: 2 },
      contributedPullRequests: { issueCount: 1 },
      contributedIssues: { issueCount: 0 },
    });

    await vi.waitFor(() => expect(writes).toHaveLength(2));
    expect(writes[1]?.counts).toEqual({
      ownedPullRequests: 3,
      ownedIssues: 2,
      contributedPullRequests: 1,
      contributedIssues: 0,
    });
    expect(publish).toHaveBeenCalledTimes(2);
  });

  it("coalesces concurrent refreshes for the same account and tab", async () => {
    const attention = Promise.withResolvers<DashboardSnapshot>();
    const fetchAttention = vi.fn<DashboardRefreshSource["fetchAttention"]>(
      async () => attention.promise,
    );
    const tokens: DashboardRefreshTokens = {
      get: vi.fn<DashboardRefreshTokens["get"]>(async () => token),
      getLegacy: vi.fn<DashboardRefreshTokens["getLegacy"]>(async () => undefined),
      set: vi.fn<DashboardRefreshTokens["set"]>(async () => undefined),
      clearLegacy: vi.fn<DashboardRefreshTokens["clearLegacy"]>(async () => undefined),
      invalidate: vi.fn<DashboardRefreshTokens["invalidate"]>(async () => undefined),
    };
    const source: DashboardRefreshSource = {
      fetchAttention,
      fetchCounts: vi.fn<DashboardRefreshSource["fetchCounts"]>(async () => undefined),
      fetchOwned: vi.fn<DashboardRefreshSource["fetchOwned"]>(),
      fetchContributions: vi.fn<DashboardRefreshSource["fetchContributions"]>(),
      fetchSection: vi.fn<DashboardRefreshSource["fetchSection"]>(),
    };
    const snapshots: DashboardRefreshSnapshots = {
      read: vi.fn<DashboardRefreshSnapshots["read"]>(async () => undefined),
      write: vi.fn<DashboardRefreshSnapshots["write"]>(async (data) => cachedSnapshot(data)),
      clear: vi.fn<DashboardRefreshSnapshots["clear"]>(async () => undefined),
    };
    const budget: DashboardRefreshBudget = {
      check: vi.fn<DashboardRefreshBudget["check"]>(async () => ({ allowed: true })),
      recordSuccess: vi.fn<DashboardRefreshBudget["recordSuccess"]>(async () => undefined),
      recordRejection: vi.fn<DashboardRefreshBudget["recordRejection"]>(async () => undefined),
      clear: vi.fn<DashboardRefreshBudget["clear"]>(async () => undefined),
    };
    const refresh = new DashboardRefresh(tokens, source, snapshots, budget, {
      publish: vi.fn<DashboardRefreshPublisher["publish"]>(async () => undefined),
    });

    const first = refresh.run("OctoCat", { selectedTab: "attention" });
    const second = refresh.run("octocat", { selectedTab: "attention" });
    await vi.waitFor(() => expect(fetchAttention).toHaveBeenCalledOnce());
    attention.resolve(dashboardSnapshot());

    const [firstResult, secondResult] = await Promise.all([first, second]);
    expect(firstResult).toBe(secondResult);
    expect(fetchAttention).toHaveBeenCalledOnce();
  });

  it("clears a rejected legacy token and its account state after a 401", async () => {
    const clearLegacy = vi.fn<DashboardRefreshTokens["clearLegacy"]>(async () => undefined);
    const invalidate = vi.fn<DashboardRefreshTokens["invalidate"]>(async () => undefined);
    const clearSnapshot = vi.fn<DashboardRefreshSnapshots["clear"]>(async () => undefined);
    const clearBudget = vi.fn<DashboardRefreshBudget["clear"]>(async () => undefined);
    const tokens: DashboardRefreshTokens = {
      get: vi.fn<DashboardRefreshTokens["get"]>(async () => undefined),
      getLegacy: vi.fn<DashboardRefreshTokens["getLegacy"]>(async () => token),
      set: vi.fn<DashboardRefreshTokens["set"]>(async () => undefined),
      clearLegacy,
      invalidate,
    };
    const source: DashboardRefreshSource = {
      fetchAttention: vi.fn<DashboardRefreshSource["fetchAttention"]>(async () => {
        throw new GitHubApiError("Bad credentials", 401);
      }),
      fetchCounts: vi.fn<DashboardRefreshSource["fetchCounts"]>(async () => undefined),
      fetchOwned: vi.fn<DashboardRefreshSource["fetchOwned"]>(),
      fetchContributions: vi.fn<DashboardRefreshSource["fetchContributions"]>(),
      fetchSection: vi.fn<DashboardRefreshSource["fetchSection"]>(),
    };
    const snapshots: DashboardRefreshSnapshots = {
      read: vi.fn<DashboardRefreshSnapshots["read"]>(async () => undefined),
      write: vi.fn<DashboardRefreshSnapshots["write"]>(),
      clear: clearSnapshot,
    };
    const budget: DashboardRefreshBudget = {
      check: vi.fn<DashboardRefreshBudget["check"]>(async () => ({ allowed: true })),
      recordSuccess: vi.fn<DashboardRefreshBudget["recordSuccess"]>(async () => undefined),
      recordRejection: vi.fn<DashboardRefreshBudget["recordRejection"]>(async () => undefined),
      clear: clearBudget,
    };
    const publisher: DashboardRefreshPublisher = {
      publish: vi.fn<DashboardRefreshPublisher["publish"]>(async () => undefined),
    };
    const refresh = new DashboardRefresh(tokens, source, snapshots, budget, publisher);

    await expect(refresh.run("octocat", {})).rejects.toMatchObject({
      status: 401,
    });

    expect(clearLegacy).toHaveBeenCalledOnce();
    expect(invalidate).not.toHaveBeenCalled();
    expect(clearSnapshot).toHaveBeenCalledWith("octocat");
    expect(clearBudget).toHaveBeenCalledWith("octocat");
  });
});

function cachedSnapshot(data: DashboardSnapshot): CachedDashboard<DashboardSnapshot> {
  return { data, fetchedAt: "2026-08-24T00:00:00.000Z" };
}
