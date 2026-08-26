import type { CachedDashboard } from "@/data/cache";
import type { DashboardSnapshot } from "@/data/github";

export const STALE_DASHBOARD_WARNING =
  "Couldn't refresh GitHub. Showing data from the last successful refresh.";

export type DashboardResponse = {
  kind: "dashboard";
  snapshot?: CachedDashboard<DashboardSnapshot>;
  stale: boolean;
  warning?: string;
};

/**
 * Keep a successful snapshot visible when a refresh fails, but read the cache
 * after the refresh attempt so token invalidation can remove it first.
 */
export async function refreshWithCachedDashboard(
  refresh: () => Promise<CachedDashboard<DashboardSnapshot> | undefined>,
  readCache: () => Promise<CachedDashboard<DashboardSnapshot> | undefined>,
  isForAccount: (data: DashboardSnapshot) => boolean,
  describeFailure: (error: Error) => string = () => STALE_DASHBOARD_WARNING,
): Promise<DashboardResponse> {
  try {
    return { kind: "dashboard", snapshot: await refresh(), stale: false };
  } catch (error) {
    const fallback = await readCache();
    if (fallback && isForAccount(fallback.data)) {
      return {
        kind: "dashboard",
        snapshot: fallback,
        stale: true,
        warning: error instanceof Error ? describeFailure(error) : STALE_DASHBOARD_WARNING,
      };
    }
    throw error;
  }
}
