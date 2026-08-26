import type { CachedDashboard } from "@/data/cache";
import type { DashboardSnapshot } from "@/data/github";
import type { OctobasePush } from "@/messages";

export type QueryGitHubTabIds = () => Promise<number[]>;
export type SendPushToTab = (tabId: number, push: OctobasePush) => Promise<void>;

export async function broadcastDashboardUpdate(
  snapshot: CachedDashboard<DashboardSnapshot>,
  queryTabIds: QueryGitHubTabIds,
  sendToTab: SendPushToTab,
): Promise<void> {
  const push: OctobasePush = {
    type: "octobase/dashboard-updated",
    accountLogin: snapshot.data.viewer.login,
    snapshot,
  };
  const tabIds = await queryTabIds();
  // A github.com tab without our content script rejects; one dead tab must not stop the rest.
  await Promise.all(tabIds.map((tabId) => sendToTab(tabId, push).catch(() => undefined)));
}
