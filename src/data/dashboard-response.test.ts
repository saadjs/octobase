import { describe, expect, it, vi } from "vitest";
import type { CachedDashboard } from "@/data/cache";
import type { DashboardSnapshot } from "@/data/github";
import { refreshWithCachedDashboard, STALE_DASHBOARD_WARNING } from "@/data/dashboard-response";

function snapshot(login = "octocat"): CachedDashboard<DashboardSnapshot> {
  // SAFETY: The helper only reads viewer.login; the fixture intentionally omits unused fields.
  return {
    fetchedAt: "2026-08-23T12:00:00.000Z",
    data: { viewer: { login } } as DashboardSnapshot,
  };
}

describe("refreshWithCachedDashboard", () => {
  it("returns fresh data without consulting the cache", async () => {
    const fresh = snapshot();
    const readCache = vi.fn<() => Promise<CachedDashboard<DashboardSnapshot> | undefined>>();

    await expect(
      refreshWithCachedDashboard(
        async () => fresh,
        readCache,
        (data) => data.viewer.login === "octocat",
      ),
    ).resolves.toEqual({ kind: "dashboard", snapshot: fresh, stale: false });
    expect(readCache).not.toHaveBeenCalled();
  });

  it("returns an account-matching cache with a warning after a transient failure", async () => {
    const cached = snapshot();

    await expect(
      refreshWithCachedDashboard(
        async () => {
          throw new Error("offline");
        },
        async () => cached,
        (data) => data.viewer.login === "octocat",
      ),
    ).resolves.toEqual({
      kind: "dashboard",
      snapshot: cached,
      stale: true,
      warning: STALE_DASHBOARD_WARNING,
    });
  });

  it("does not serve a cache for another account", async () => {
    const cached = snapshot("hubot");
    const failure = new Error("unauthorized");

    await expect(
      refreshWithCachedDashboard(
        async () => {
          throw failure;
        },
        async () => cached,
        (data) => data.viewer.login === "octocat",
      ),
    ).rejects.toBe(failure);
  });

  it("does not serve a cache cleared during the refresh attempt", async () => {
    const readCache = vi
      .fn<() => Promise<CachedDashboard<DashboardSnapshot> | undefined>>()
      .mockResolvedValue(undefined);
    const failure = new Error("unauthorized");

    await expect(
      refreshWithCachedDashboard(
        async () => {
          throw failure;
        },
        readCache,
        () => true,
      ),
    ).rejects.toBe(failure);
    expect(readCache).toHaveBeenCalledOnce();
  });
  it("describes the failure when the caller supplies its own warning", async () => {
    const cached = snapshot();

    await expect(
      refreshWithCachedDashboard(
        async () => {
          throw new Error("rate limited");
        },
        async () => cached,
        () => true,
        (error) => `Paused: ${error.message}`,
      ),
    ).resolves.toMatchObject({ stale: true, warning: "Paused: rate limited" });
  });
});
