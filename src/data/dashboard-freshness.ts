import type { CachedDashboard } from "@/data/cache";
import type { DashboardSnapshot } from "@/data/github";

/** Avoid a duplicate network refresh when Turbo remounts a just-loaded dashboard. */
export const DASHBOARD_FRESH_FOR_MS = 5 * 60_000;

export function isDashboardCacheFresh(
  snapshot: CachedDashboard<DashboardSnapshot> | undefined,
  now = Date.now(),
): boolean {
  if (!snapshot) return false;
  const fetchedAt = new Date(snapshot.fetchedAt).getTime();
  return Number.isFinite(fetchedAt) && now - fetchedAt < DASHBOARD_FRESH_FOR_MS;
}

/** The client's cache window must be what's left of the background's, not a fresh 5 minutes on top. */
export function remainingDashboardFreshMs(fetchedAt: string | undefined, now = Date.now()): number {
  if (!fetchedAt) return DASHBOARD_FRESH_FOR_MS;
  const fetchedTime = new Date(fetchedAt).getTime();
  if (!Number.isFinite(fetchedTime)) return DASHBOARD_FRESH_FOR_MS;
  return Math.max(DASHBOARD_FRESH_FOR_MS - (now - fetchedTime), 0);
}
