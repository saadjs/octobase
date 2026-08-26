import { describe, expect, it, vi } from "vitest";
import { broadcastDashboardUpdate } from "@/lib/dashboard-broadcast";
import { dashboardSnapshot } from "@/data/test-fixtures";
import type { OctobasePush } from "@/messages";

const snapshot = { fetchedAt: "2026-08-23T12:00:00.000Z", data: dashboardSnapshot() };

describe("broadcastDashboardUpdate", () => {
  it("pushes the snapshot to every GitHub tab", async () => {
    const sendToTab = vi.fn<(tabId: number, push: OctobasePush) => Promise<void>>();
    sendToTab.mockResolvedValue();

    await broadcastDashboardUpdate(snapshot, () => Promise.resolve([7, 9]), sendToTab);

    expect(sendToTab.mock.calls.map(([tabId]) => tabId)).toEqual([7, 9]);
    expect(sendToTab.mock.calls[0]?.[1]).toEqual({
      type: "octobase/dashboard-updated",
      accountLogin: "octocat",
      snapshot,
    });
  });

  it("keeps going when a tab has no content script listening", async () => {
    const sendToTab = vi.fn<(tabId: number, push: OctobasePush) => Promise<void>>();
    sendToTab.mockRejectedValueOnce(new Error("Receiving end does not exist"));
    sendToTab.mockResolvedValueOnce();

    await expect(
      broadcastDashboardUpdate(snapshot, () => Promise.resolve([1, 2]), sendToTab),
    ).resolves.toBeUndefined();
    expect(sendToTab).toHaveBeenCalledTimes(2);
  });
});
