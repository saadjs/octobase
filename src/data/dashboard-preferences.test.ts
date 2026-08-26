import { describe, expect, it } from "vitest";
import {
  defaultDashboardPreferences,
  isDashboardItemHidden,
  readDashboardPreferences,
  updateDashboardPreferences,
} from "@/data/dashboard-preferences";

describe("dashboard preferences", () => {
  it("serializes rapid updates instead of losing an earlier change", async () => {
    await Promise.all([
      updateDashboardPreferences("OctoCat", { repositoryQuery: "acme" }),
      updateDashboardPreferences("octocat", { itemType: "issue" }),
    ]);

    await expect(readDashboardPreferences("OCTOCAT")).resolves.toMatchObject({
      repositoryQuery: "acme",
      itemType: "issue",
    });
  });

  it("ignores malformed extension storage", async () => {
    await storage.setItem("local:dashboardPreferences:octocat", {
      ...defaultDashboardPreferences(),
      hiddenItems: null,
    });

    await expect(readDashboardPreferences("octocat")).resolves.toEqual(
      defaultDashboardPreferences(),
    );
  });

  it("resurfaces a hidden item when its activity timestamp changes", () => {
    const preferences = {
      ...defaultDashboardPreferences(),
      hiddenItems: { "item-1": "2026-08-23T10:00:00.000Z" },
    };

    expect(isDashboardItemHidden(preferences, "item-1", "2026-08-23T10:00:00.000Z")).toBe(true);
    expect(isDashboardItemHidden(preferences, "item-1", "2026-08-23T10:01:00.000Z")).toBe(false);
  });
});
