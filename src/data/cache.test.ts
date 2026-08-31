import { describe, expect, it } from "vitest";
import { DASHBOARD_FRESH_FOR_MS, isDashboardCacheFresh } from "@/data/dashboard-freshness";
import { dashboardSnapshot } from "@/data/test-fixtures";

describe("isDashboardCacheFresh", () => {
  const now = Date.parse("2026-08-23T12:00:00.000Z");
  const recent = new Date(now - DASHBOARD_FRESH_FOR_MS + 1).toISOString();
  const expired = new Date(now - DASHBOARD_FRESH_FOR_MS).toISOString();

  it("checks freshness for the requested tab rather than the latest snapshot write", () => {
    const snapshot = {
      data: dashboardSnapshot(),
      fetchedAt: recent,
      fetchedAtByTab: { attention: recent, owned: expired },
    };

    expect(isDashboardCacheFresh(snapshot, "attention", now)).toBe(true);
    expect(isDashboardCacheFresh(snapshot, "owned", now)).toBe(false);
  });

  it("rejects a missing, expired, or invalid tab timestamp", () => {
    expect(isDashboardCacheFresh(undefined, "attention", now)).toBe(false);
    expect(
      isDashboardCacheFresh(
        {
          data: dashboardSnapshot(),
          fetchedAt: recent,
          fetchedAtByTab: { attention: expired },
        },
        "attention",
        now,
      ),
    ).toBe(false);
    expect(
      isDashboardCacheFresh(
        {
          data: dashboardSnapshot(),
          fetchedAt: recent,
          fetchedAtByTab: { attention: "not-a-date" },
        },
        "attention",
        now,
      ),
    ).toBe(false);
    expect(
      isDashboardCacheFresh(
        { data: dashboardSnapshot(), fetchedAt: recent, fetchedAtByTab: {} },
        "contributions",
        now,
      ),
    ).toBe(false);
  });
});
