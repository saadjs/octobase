import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DashboardLoadingSkeleton } from "@/app/components/dashboard-loading-skeleton";

describe("DashboardLoadingSkeleton", () => {
  it("reserves the dashboard panel layout", () => {
    render(<DashboardLoadingSkeleton />);

    const loading = screen.getByRole("status", { name: "Loading your dashboard" });
    expect(loading.tagName).toBe("SECTION");
    expect(loading.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(20);
  });
});
