import { openDB, type DBSchema } from "idb";
import { normalizeGitHubLogin } from "@/data/account";
import type { DashboardSnapshot } from "@/data/github";

export interface CachedDashboard<T> {
  data: T;
  fetchedAt: string;
}

interface OctobaseDatabase extends DBSchema {
  dashboard: {
    key: string;
    value: CachedDashboard<DashboardSnapshot>;
  };
}

const database = openDB<OctobaseDatabase>("octobase", 5, {
  upgrade(db, oldVersion, _newVersion, transaction) {
    if (oldVersion === 0) {
      db.createObjectStore("dashboard");
      return;
    }

    // Dashboard snapshots are disposable API caches. Clear older shapes on upgrades: v1 used one
    // global entry, v4 added reaction groups to every card, and v5 adds incoming pull requests.
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
): Promise<CachedDashboard<DashboardSnapshot>> {
  const snapshot: CachedDashboard<DashboardSnapshot> = {
    data,
    fetchedAt: new Date().toISOString(),
  };
  await (await database).put("dashboard", snapshot, normalizeGitHubLogin(data.viewer.login));
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
