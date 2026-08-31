import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import type { PublicTokenState } from "@/auth/types";
import { normalizeGitHubLogin } from "@/data/account";
import type { CachedDashboard } from "@/data/cache";
import type { DashboardPreferences, DashboardTab } from "@/data/dashboard-preferences";
import { dashboardTabFetchedAt, remainingDashboardFreshMs } from "@/data/dashboard-freshness";
import type { DashboardSnapshot } from "@/data/github";
import type { RepositoryAccess } from "@/data/repository-access";
import type { PinnableRepository } from "@/data/viewer-repositories";
import type { DashboardSection, OctobaseRequest, OctobaseResponse } from "@/messages";

export type MessageSender = (request: OctobaseRequest) => Promise<OctobaseResponse>;
export type DisplayDashboard = CachedDashboard<DashboardSnapshot> & { stale: boolean };

export interface DashboardQueryData {
  dashboard?: DisplayDashboard;
  warning?: string;
}

export interface TokenStateQueryData {
  token: PublicTokenState;
}

export interface RepositoryAccessQueryData {
  accountLogin: string;
  access: RepositoryAccess;
}

/** Transient, call-site-only overrides for a dashboard fetch; never part of the cached key. */
export interface DashboardFetchOverrides {
  refresh?: boolean;
  showAll?: readonly DashboardSection[];
}

export class DashboardRequestError extends Error {
  constructor(
    message: string,
    readonly code?: string,
  ) {
    super(message);
    this.name = "DashboardRequestError";
  }
}

export const dashboardKeys = {
  account: (accountLogin: string) =>
    ["github", "accounts", normalizeGitHubLogin(accountLogin)] as const,
  tokenState: (accountLogin: string) =>
    [...dashboardKeys.account(accountLogin), "token-state"] as const,
  dashboardResource: (accountLogin: string) =>
    [...dashboardKeys.account(accountLogin), "dashboard"] as const,
  dashboard: (accountLogin: string, tab: DashboardTab) =>
    [...dashboardKeys.dashboardResource(accountLogin), tab] as const,
  preferences: (accountLogin: string) =>
    [...dashboardKeys.account(accountLogin), "preferences"] as const,
  installationState: (accountLogin: string) =>
    [...dashboardKeys.account(accountLogin), "installation-state"] as const,
  repositoryAccess: (accountLogin: string) =>
    [...dashboardKeys.account(accountLogin), "repository-access"] as const,
  viewerRepositories: (accountLogin: string) =>
    [...dashboardKeys.account(accountLogin), "viewer-repositories"] as const,
};

export function tokenStateQueryOptions(accountLogin: string, sendMessage: MessageSender) {
  return queryOptions({
    queryKey: dashboardKeys.tokenState(accountLogin),
    queryFn: async (): Promise<TokenStateQueryData> => {
      const response = await sendMessage({ type: "octobase/token-state", accountLogin });
      if (response.kind !== "token-state") {
        throw responseError(response, "Could not reach the extension background.");
      }
      return { token: response.token };
    },
    staleTime: Number.POSITIVE_INFINITY,
  });
}

/**
 * Whether the GitHub App is installed on the account itself. This costs a paginated REST round
 * trip, so it is its own query: the dashboard fetch starts from token state alone and never
 * waits behind it, and a remount reads the cached answer instead of asking GitHub again.
 */
export function installationStateQueryOptions(accountLogin: string, sendMessage: MessageSender) {
  return queryOptions({
    queryKey: dashboardKeys.installationState(accountLogin),
    queryFn: async (): Promise<boolean> => {
      const response = await sendMessage({
        type: "octobase/repository-installation-state",
        accountLogin,
      });
      if (response.kind !== "repository-installation-state") {
        throw responseError(response, "Could not check GitHub App installation.");
      }
      return response.hasPersonalInstallation;
    },
    // Installing the app is a deliberate, rare act, and the setup card re-checks on focus.
    staleTime: 5 * 60_000,
  });
}

export function preferencesQueryOptions(accountLogin: string, sendMessage: MessageSender) {
  return queryOptions({
    queryKey: dashboardKeys.preferences(accountLogin),
    queryFn: async (): Promise<DashboardPreferences> => {
      const response = await sendMessage({ type: "octobase/preferences", accountLogin });
      if (response.kind !== "preferences") {
        throw responseError(response, "Could not load dashboard filters.");
      }
      return response.preferences;
    },
    // Durable local state; only the update/hide mutations change it.
    staleTime: Number.POSITIVE_INFINITY,
  });
}

/**
 * A manual refresh or "show all" pass carries its intent through `overrides`, given only to the
 * one-off `queryClient.fetchQuery` call that requests it, never to the standing `useQuery`
 * options (which omit it, so the normal cache-first/focus-refetch behaviour is unaffected). That
 * keeps refresh/show-all as real query fetches against the shared cache entry instead of
 * mutations that write results in by hand. (TanStack's own `meta` would do this too, but typing
 * it requires augmenting `@tanstack/query-core`'s `Register` interface, which isn't a resolvable
 * module here since it's only an indirect dependency of `@tanstack/react-query`.)
 */
export function dashboardQueryOptions(
  accountLogin: string,
  tab: DashboardTab,
  sendMessage: MessageSender,
  overrides?: DashboardFetchOverrides,
) {
  return queryOptions({
    queryKey: dashboardKeys.dashboard(accountLogin, tab),
    queryFn: async ({ client }): Promise<DashboardQueryData> => {
      const fetched = await requestDashboard(
        accountLogin,
        tab,
        sendMessage,
        overrides?.refresh === true,
        overrides?.showAll,
      );
      return withNewestDashboard(
        client.getQueryData<DashboardQueryData>(dashboardKeys.dashboard(accountLogin, tab)),
        fetched,
      );
    },
    staleTime: (query) => {
      const dashboard = query.state.data?.dashboard;
      const fetchedAt = dashboard && dashboardTabFetchedAt(dashboard, tab);
      return dashboard && !fetchedAt ? 0 : remainingDashboardFreshMs(fetchedAt);
    },
    refetchOnWindowFocus: true,
    // Switching to a never-before-selected tab keeps showing whatever was on screen (the
    // background always returns the whole merged snapshot, so an older tab's data is still a
    // reasonable placeholder) instead of blanking the panel while its own key's fetch resolves.
    placeholderData: keepPreviousData,
  });
}

export function repositoryAccessQueryOptions(accountLogin: string, sendMessage: MessageSender) {
  return queryOptions({
    queryKey: dashboardKeys.repositoryAccess(accountLogin),
    queryFn: async (): Promise<RepositoryAccessQueryData> => {
      const response = await sendMessage({ type: "octobase/repository-access", accountLogin });
      if (response.kind !== "repository-access") {
        throw responseError(response, "Could not load repository access.");
      }
      if (normalizeGitHubLogin(response.accountLogin) !== normalizeGitHubLogin(accountLogin)) {
        throw new DashboardRequestError("GitHub returned repository access for another account.");
      }
      return { accountLogin: response.accountLogin, access: response.access };
    },
    // `refetch()` on this lazy, `enabled: false` query ignores staleTime, so setting one is inert.
    enabled: false,
  });
}

export function viewerRepositoriesQueryOptions(accountLogin: string, sendMessage: MessageSender) {
  return queryOptions({
    queryKey: dashboardKeys.viewerRepositories(accountLogin),
    queryFn: async (): Promise<PinnableRepository[]> => {
      const response = await sendMessage({ type: "octobase/viewer-repositories", accountLogin });
      if (response.kind !== "viewer-repositories") {
        throw responseError(response, "Could not load your GitHub repositories.");
      }
      if (normalizeGitHubLogin(response.accountLogin) !== normalizeGitHubLogin(accountLogin)) {
        throw new DashboardRequestError("GitHub listed repositories for another account.");
      }
      return response.repositories;
    },
    // One fetch feeds every keystroke; repository lists barely move within a session.
    staleTime: 10 * 60_000,
  });
}

/** A slower answer must not replace a snapshot fetched or pushed while it was in flight. */
export function withNewestDashboard(
  current: DashboardQueryData | undefined,
  next: DashboardQueryData,
): DashboardQueryData {
  const currentDashboard = current?.dashboard;
  if (!currentDashboard || !next.dashboard) return next;
  return fetchedTime(next.dashboard) >= fetchedTime(currentDashboard)
    ? next
    : { ...next, dashboard: currentDashboard };
}

function fetchedTime(dashboard: DisplayDashboard): number {
  const time = new Date(dashboard.fetchedAt).getTime();
  return Number.isNaN(time) ? 0 : time;
}

export async function requestDashboard(
  accountLogin: string,
  tab: DashboardTab,
  sendMessage: MessageSender,
  refresh: boolean,
  showAll?: readonly DashboardSection[],
): Promise<DashboardQueryData> {
  const request: Extract<OctobaseRequest, { type: "octobase/dashboard" }> = {
    type: "octobase/dashboard",
    accountLogin,
    refresh: refresh && !showAll?.length,
    selectedTab: tab,
  };
  if (showAll?.length) request.showAll = [...showAll];
  const response = await sendMessage(request);
  if (response.kind !== "dashboard") {
    throw responseError(response, "Could not load your GitHub dashboard.");
  }
  if (
    response.snapshot &&
    normalizeGitHubLogin(response.snapshot.data.viewer.login) !== normalizeGitHubLogin(accountLogin)
  ) {
    throw new DashboardRequestError(
      "The cached dashboard belongs to another GitHub account. Please reconnect.",
      "account_mismatch",
    );
  }
  return {
    dashboard: response.snapshot ? { ...response.snapshot, stale: response.stale } : undefined,
    warning: response.warning,
  };
}

function responseError(response: OctobaseResponse, fallback: string): DashboardRequestError {
  return response.kind === "error"
    ? new DashboardRequestError(response.message, response.code)
    : new DashboardRequestError(fallback);
}
