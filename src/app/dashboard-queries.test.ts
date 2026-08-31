import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import {
  dashboardKeys,
  dashboardQueryOptions,
  DashboardRequestError,
  tokenStateQueryOptions,
} from "@/app/dashboard-queries";
import { dashboardSnapshot } from "@/data/test-fixtures";
import type { OctobaseRequest, OctobaseResponse } from "@/messages";

const sendMessage = vi.fn<(request: OctobaseRequest) => Promise<OctobaseResponse>>();

describe("dashboard query definitions", () => {
  it("uses account-scoped, domain-shaped keys", () => {
    expect(dashboardKeys.tokenState("OctoCat")).toEqual([
      "github",
      "accounts",
      "octocat",
      "token-state",
    ]);
    expect(dashboardKeys.dashboard("OctoCat", "attention")).toEqual([
      "github",
      "accounts",
      "octocat",
      "dashboard",
      "attention",
    ]);
    expect(dashboardKeys.preferences("OctoCat")).toEqual([
      "github",
      "accounts",
      "octocat",
      "preferences",
    ]);
    expect(dashboardKeys.repositoryAccess("OctoCat")).toEqual([
      "github",
      "accounts",
      "octocat",
      "repository-access",
    ]);
  });

  it("maps a dashboard response into query-owned server state", async () => {
    const snapshot = {
      data: dashboardSnapshot(),
      fetchedAt: "2026-08-23T12:00:00.000Z",
    };
    sendMessage.mockResolvedValueOnce({
      kind: "dashboard",
      snapshot,
      stale: true,
      warning: "Showing cached work",
    });

    const options = dashboardQueryOptions("OctoCat", "attention", sendMessage);
    expect(options.refetchOnWindowFocus).toBe(true);
    const queryClient = new QueryClient();
    await expect(queryClient.fetchQuery(options)).resolves.toEqual({
      dashboard: { ...snapshot, stale: true },
      warning: "Showing cached work",
    });
    expect(sendMessage).toHaveBeenCalledWith({
      type: "octobase/dashboard",
      accountLogin: "OctoCat",
      refresh: false,
      selectedTab: "attention",
    });
  });

  it("derives staleTime from the selected tab rather than the latest snapshot write", async () => {
    // Attention was just refreshed, but the preserved owned rows are near the end of their own
    // freshness window. The owned query must retain only its remaining ~1 minute.
    const fetchedAt = new Date().toISOString();
    const ownedFetchedAt = new Date(Date.now() - 4 * 60_000).toISOString();
    const snapshot = {
      data: dashboardSnapshot(),
      fetchedAt,
      fetchedAtByTab: { attention: fetchedAt, owned: ownedFetchedAt },
    };
    const isolatedSendMessage = vi.fn<(request: OctobaseRequest) => Promise<OctobaseResponse>>();
    isolatedSendMessage.mockResolvedValue({ kind: "dashboard", snapshot, stale: false });

    const queryClient = new QueryClient();
    const options = () => dashboardQueryOptions("OctoCat", "owned", isolatedSendMessage);
    await queryClient.fetchQuery(options());
    expect(isolatedSendMessage).toHaveBeenCalledTimes(1);

    await queryClient.fetchQuery(options());
    expect(isolatedSendMessage).toHaveBeenCalledTimes(1);

    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 70_000);
    await queryClient.fetchQuery(options());
    expect(isolatedSendMessage).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it("turns typed extension failures into query errors", async () => {
    sendMessage.mockResolvedValueOnce({
      kind: "error",
      code: "account_mismatch",
      message: "Wrong account",
    });

    const queryClient = new QueryClient();
    await expect(
      queryClient.fetchQuery(dashboardQueryOptions("octocat", "attention", sendMessage)),
    ).rejects.toEqual(new DashboardRequestError("Wrong account", "account_mismatch"));
  });

  it("colocates token loading with its account query", async () => {
    sendMessage.mockResolvedValueOnce({
      kind: "token-state",
      token: { connected: true, source: "app" },
    });

    const queryClient = new QueryClient();
    await expect(
      queryClient.fetchQuery(tokenStateQueryOptions("octocat", sendMessage)),
    ).resolves.toEqual({ token: { connected: true, source: "app" } });
  });
});
