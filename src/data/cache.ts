import { openDB, type DBSchema } from "idb";
import { normalizeGitHubLogin } from "@/data/account";
import type { DashboardTab } from "@/data/dashboard-preferences";
import type { DashboardSnapshot } from "@/data/github";

export interface CachedDashboard<T> {
  data: T;
  /** Revision time used to order cache writes and pushes. */
  fetchedAt: string;
  /** Network freshness is independent because work tabs are fetched lazily. */
  fetchedAtByTab?: Partial<Record<DashboardTab, string>>;
}

interface OctobaseDatabase extends DBSchema {
  dashboard: {
    key: string;
    value: CachedDashboard<DashboardSnapshot>;
  };
}

const database = openDB<OctobaseDatabase>("octobase", 6, {
  upgrade(db, oldVersion, _newVersion, transaction) {
    if (oldVersion === 0) {
      db.createObjectStore("dashboard");
      return;
    }

    // Dashboard snapshots are disposable API caches. Clear older shapes on upgrades: v1 used one
    // global entry, v4 added reaction groups, v5 added incoming pull requests, and v6 tracks
    // freshness per lazy tab instead of allowing one tab to make preserved rows look fresh.
    void transaction.objectStore("dashboard").clear();
  },
});

export async function readDashboardCache(
  accountLogin: string,
): Promise<CachedDashboard<DashboardSnapshot> | undefined> {
  return (await database).get("dashboard", normalizeGitHubLogin(accountLogin));
}

export async function writeDashboardCache(
  data: DashboardSnapshot,
  refreshedTabs: readonly DashboardTab[] = [],
): Promise<CachedDashboard<DashboardSnapshot>> {
  const db = await database;
  const key = normalizeGitHubLogin(data.viewer.login);
  const previous = await db.get("dashboard", key);
  const fetchedAt = new Date().toISOString();
  const fetchedAtByTab = { ...previous?.fetchedAtByTab };
  for (const tab of refreshedTabs) fetchedAtByTab[tab] = fetchedAt;
  const snapshot: CachedDashboard<DashboardSnapshot> = { data, fetchedAt, fetchedAtByTab };
  await db.put("dashboard", snapshot, key);
  return snapshot;
}

export async function clearDashboardCache(accountLogin?: string): Promise<void> {
  const db = await database;
  if (accountLogin) {
    await db.delete("dashboard", normalizeGitHubLogin(accountLogin));
    return;
  }
  await db.clear("dashboard");
}
