import { describe, expect, it } from "vitest";
import { DASHBOARD_FRESH_FOR_MS, isDashboardCacheFresh } from "@/data/dashboard-freshness";
import { dashboardSnapshot } from "@/data/test-fixtures";

describe("isDashboardCacheFresh", () => {
  const now = Date.parse("2026-08-23T12:00:00.000Z");

  it("accepts a recent snapshot", () => {
    expect(
      isDashboardCacheFresh(
        {
          data: dashboardSnapshot(),
          fetchedAt: new Date(now - DASHBOARD_FRESH_FOR_MS + 1).toISOString(),
        },
        now,
      ),
    ).toBe(true);
  });

  it("rejects a missing, expired, or invalid snapshot", () => {
    expect(isDashboardCacheFresh(undefined, now)).toBe(false);
    expect(
      isDashboardCacheFresh(
        {
          data: dashboardSnapshot(),
          fetchedAt: new Date(now - DASHBOARD_FRESH_FOR_MS).toISOString(),
        },
        now,
      ),
    ).toBe(false);
    expect(isDashboardCacheFresh({ data: dashboardSnapshot(), fetchedAt: "not-a-date" }, now)).toBe(
      false,
    );
  });
});
