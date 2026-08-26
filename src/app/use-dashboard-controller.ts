import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DeviceAuthorization, TokenSource } from "@/auth/types";
import {
  dashboardKeys,
  dashboardQueryOptions,
  DashboardRequestError,
  installationStateQueryOptions,
  type DashboardFetchOverrides,
  type DashboardQueryData,
  type MessageSender,
  preferencesQueryOptions,
  repositoryAccessQueryOptions,
  tokenStateQueryOptions,
  type TokenStateQueryData,
  withNewestDashboard,
} from "@/app/dashboard-queries";
import {
  defaultDashboardPreferences,
  type DashboardPreferenceChanges,
  type DashboardPreferences,
  type DashboardTab,
} from "@/data/dashboard-preferences";
import { normalizeGitHubLogin } from "@/data/account";
import {
  addFavoriteRepository,
  moveFavoriteRepository,
  removeFavoriteRepository,
} from "@/app/favorite-repositories";
import { sendOctobaseMessage } from "@/lib/messages";
import type { DashboardSection, OctobasePush } from "@/messages";

export type ConnectionState = "loading" | "disconnected" | "connected";
export type { DisplayDashboard, MessageSender } from "@/app/dashboard-queries";

interface HiddenItemChange {
  itemId: string;
  updatedAt?: string;
}

interface PersonalTokenConnection {
  accessToken: string;
  source: Exclude<TokenSource, "app">;
}

interface PreferencesMutationContext {
  previous: DashboardPreferences | undefined;
}

export function useDashboardController(
  accountLogin: string,
  sendMessage: MessageSender = sendOctobaseMessage,
) {
  const queryClient = useQueryClient();
  const [authorization, setAuthorization] = useState<DeviceAuthorization>();
  const [deviceFlowError, setDeviceFlowError] = useState<string>();
  const [copiedCode, setCopiedCode] = useState(false);
  const [clipboardError, setClipboardError] = useState<string>();
  const [isConfirmingDisconnect, setIsConfirmingDisconnect] = useState(false);
  const [isAwaitingRepositoryInstallation, setIsAwaitingRepositoryInstallation] = useState(false);
  const [loadingSection, setLoadingSection] = useState<DashboardSection>();

  const tokenQuery = useQuery(tokenStateQueryOptions(accountLogin, sendMessage));
  const token = tokenQuery.data?.token ?? { connected: false };
  // Preferences are local account state and do not depend on authentication. Loading them beside
  // token state avoids first requesting the default tab and then correcting to the saved tab.
  const preferencesQuery = useQuery(preferencesQueryOptions(accountLogin, sendMessage));
  const preferences = preferencesQuery.data ?? defaultDashboardPreferences();
  const dashboardQuery = useQuery({
    ...dashboardQueryOptions(accountLogin, preferences.selectedTab, sendMessage),
    enabled: token.connected && !preferencesQuery.isPending,
  });
  const repositoryAccessQuery = useQuery(repositoryAccessQueryOptions(accountLogin, sendMessage));
  // Only an App connection can have an installation, and this costs a REST round trip, so it
  // runs beside the dashboard rather than in front of it.
  const installationQuery = useQuery({
    ...installationStateQueryOptions(accountLogin, sendMessage),
    enabled: token.connected && token.source === "app",
  });

  const fetchDashboard = useCallback(
    (overrides: DashboardFetchOverrides) =>
      queryClient.fetchQuery({
        ...dashboardQueryOptions(accountLogin, preferences.selectedTab, sendMessage, overrides),
        // A refresh or show-all is an explicit ask, so it must fetch even while the cache is fresh.
        staleTime: 0,
      }),
    [accountLogin, preferences.selectedTab, queryClient, sendMessage],
  );

  const startAuthorization = useMutation({
    mutationFn: async () => {
      const response = await sendMessage({ type: "octobase/start-device-flow" });
      if (response.kind !== "device-authorization") {
        throw responseError(response, "Could not start GitHub authorization.");
      }
      return response.authorization;
    },
    onSuccess: (nextAuthorization) => {
      setAuthorization(nextAuthorization);
      setCopiedCode(false);
      setDeviceFlowError(undefined);
    },
    onError: (error) => setDeviceFlowError(errorMessage(error)),
  });

  const connectPersonalToken = useMutation({
    mutationFn: async ({ accessToken, source }: PersonalTokenConnection) => {
      const response = await sendMessage({
        type: "octobase/set-token",
        accountLogin,
        accessToken,
        metadata: { source },
      });
      if (response.kind !== "ok") throw responseError(response, "Could not connect this token.");
      return { token: { connected: true, source } } satisfies TokenStateQueryData;
    },
    onSuccess: async (data) => {
      queryClient.setQueryData(dashboardKeys.tokenState(accountLogin), data);
      await queryClient.invalidateQueries({
        queryKey: dashboardKeys.dashboardResource(accountLogin),
      });
    },
  });

  const updateDashboardPreferences = useMutation({
    mutationFn: async (changes: DashboardPreferenceChanges) => {
      const response = await sendMessage({
        type: "octobase/update-preferences",
        accountLogin,
        changes,
      });
      if (response.kind !== "preferences") {
        throw responseError(response, "Could not save dashboard filters.");
      }
      return response.preferences;
    },
    onMutate: (changes): PreferencesMutationContext => {
      const key = dashboardKeys.preferences(accountLogin);
      const previous = queryClient.getQueryData<DashboardPreferences>(key);
      queryClient.setQueryData<DashboardPreferences>(key, (current) => ({
        ...(current ?? defaultDashboardPreferences()),
        ...changes,
      }));
      return { previous };
    },
    onError: (_error, _changes, context) => {
      if (!context) return;
      queryClient.setQueryData(dashboardKeys.preferences(accountLogin), context.previous);
    },
    onSuccess: (nextPreferences) => {
      queryClient.setQueryData(dashboardKeys.preferences(accountLogin), nextPreferences);
    },
  });

  const setHiddenItem = useMutation({
    mutationFn: async ({ itemId, updatedAt }: HiddenItemChange) => {
      const response = await sendMessage({
        type: "octobase/set-hidden-item",
        accountLogin,
        itemId,
        updatedAt,
      });
      if (response.kind !== "preferences") {
        throw responseError(response, "Could not update the hidden item.");
      }
      return response.preferences;
    },
    onMutate: ({ itemId, updatedAt }): PreferencesMutationContext => {
      const key = dashboardKeys.preferences(accountLogin);
      const previous = queryClient.getQueryData<DashboardPreferences>(key);
      queryClient.setQueryData<DashboardPreferences>(key, (current) => {
        const base = current ?? defaultDashboardPreferences();
        const hiddenItems = { ...base.hiddenItems };
        if (updatedAt) hiddenItems[itemId] = updatedAt;
        else delete hiddenItems[itemId];
        return { ...base, hiddenItems };
      });
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (!context) return;
      queryClient.setQueryData(dashboardKeys.preferences(accountLogin), context.previous);
    },
    onSuccess: (nextPreferences) => {
      queryClient.setQueryData(dashboardKeys.preferences(accountLogin), nextPreferences);
    },
  });

  const checkInstallation = useMutation({
    mutationFn: async () => {
      const response = await sendMessage({
        type: "octobase/repository-installation-state",
        accountLogin,
      });
      if (response.kind !== "repository-installation-state") {
        throw responseError(response, "Could not check GitHub App installation.");
      }
      return response.hasPersonalInstallation;
    },
    onSuccess: async (hasPersonalInstallation) => {
      queryClient.setQueryData(
        dashboardKeys.installationState(accountLogin),
        hasPersonalInstallation,
      );
      if (!hasPersonalInstallation) return;
      setIsAwaitingRepositoryInstallation(false);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: dashboardKeys.dashboardResource(accountLogin),
          refetchType: "none",
        }),
        queryClient.invalidateQueries({
          queryKey: dashboardKeys.repositoryAccess(accountLogin),
          refetchType: "none",
        }),
      ]);
      await Promise.all([
        settleMutation(fetchDashboard({ refresh: true })),
        // If the sheet has never loaded, leave its expensive repository listing lazy. When it has
        // loaded, refresh it now so an installation change cannot leave visible stale details.
        repositoryAccessQuery.data ? repositoryAccessQuery.refetch() : Promise.resolve(),
      ]);
    },
  });

  const openInstallation = useMutation({
    mutationFn: async () => {
      const response = await sendMessage({
        type: "octobase/open-repository-installation",
        accountLogin,
      });
      if (response.kind !== "ok") {
        throw responseError(response, "Could not open GitHub App installation.");
      }
    },
    onSuccess: () => setIsAwaitingRepositoryInstallation(true),
  });

  const disconnectAccount = useMutation({
    mutationFn: async () => {
      const response = await sendMessage({ type: "octobase/disconnect", accountLogin });
      if (response.kind !== "ok") throw responseError(response, "Could not disconnect GitHub.");
    },
    onSuccess: async () => {
      // Preferences are local UI state and remain valid while disconnected. Keep that query and
      // clear only resources whose contents depend on the removed credential.
      queryClient.removeQueries({ queryKey: dashboardKeys.dashboardResource(accountLogin) });
      queryClient.removeQueries({ queryKey: dashboardKeys.repositoryAccess(accountLogin) });
      queryClient.removeQueries({ queryKey: dashboardKeys.viewerRepositories(accountLogin) });
      queryClient.removeQueries({ queryKey: dashboardKeys.installationState(accountLogin) });
      queryClient.setQueryData<TokenStateQueryData>(dashboardKeys.tokenState(accountLogin), {
        token: { connected: false },
      });
      setIsAwaitingRepositoryInstallation(false);
      setIsConfirmingDisconnect(false);
    },
  });

  const cancelAuthorization = useCallback((): void => {
    setAuthorization(undefined);
    setDeviceFlowError(undefined);
    setCopiedCode(false);
    setClipboardError(undefined);
  }, []);

  const copyAuthorizationCode = useCallback(async (): Promise<void> => {
    if (!authorization) return;
    try {
      await navigator.clipboard.writeText(authorization.userCode);
      setCopiedCode(true);
      setClipboardError(undefined);
    } catch {
      setClipboardError("Could not copy the authorization code. Please copy it manually.");
    }
  }, [authorization]);

  const requestInstallationCheck = checkInstallation.mutate;
  useEffect(() => {
    if (!isAwaitingRepositoryInstallation) return undefined;
    const check = () => {
      if (document.visibilityState === "visible") requestInstallationCheck();
    };
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", check);
    return () => {
      window.removeEventListener("focus", check);
      document.removeEventListener("visibilitychange", check);
    };
  }, [isAwaitingRepositoryInstallation, requestInstallationCheck]);

  // A stale-while-revalidate background fetch publishes the durable snapshot into every cached
  // tab's query entry; the callback reads current cache state itself, so it needs no dependency
  // on the dashboard query's data and never re-subscribes the listener.
  useEffect(() => {
    const receive = (message: OctobasePush) => {
      if (message.type !== "octobase/dashboard-updated") return;
      if (normalizeGitHubLogin(message.accountLogin) !== normalizeGitHubLogin(accountLogin)) return;
      queryClient.setQueriesData<DashboardQueryData>(
        { queryKey: dashboardKeys.dashboardResource(accountLogin) },
        (current) =>
          withNewestDashboard(current, { dashboard: { ...message.snapshot, stale: false } }),
      );
    };
    browser.runtime.onMessage.addListener(receive);
    return () => browser.runtime.onMessage.removeListener(receive);
  }, [accountLogin, queryClient]);

  useEffect(() => {
    if (!authorization) return undefined;
    let cancelled = false;
    let intervalSeconds = authorization.interval;
    let timeout: number | undefined;
    const schedule = () => {
      timeout = window.setTimeout(() => void completeAuthorization(), intervalSeconds * 1000);
    };
    const completeAuthorization = async () => {
      const response = await sendMessage({
        type: "octobase/complete-device-flow",
        accountLogin,
        deviceCode: authorization.deviceCode,
      });
      if (cancelled) return;
      if (response.kind === "token-state") {
        queryClient.setQueryData<TokenStateQueryData>(dashboardKeys.tokenState(accountLogin), {
          token: response.token,
        });
        setAuthorization(undefined);
        setDeviceFlowError(undefined);
        await queryClient.invalidateQueries({
          queryKey: dashboardKeys.dashboardResource(accountLogin),
        });
        return;
      }
      if (response.kind === "error" && response.code === "authorization_pending") {
        schedule();
        return;
      }
      if (response.kind === "error" && response.code === "slow_down") {
        intervalSeconds += 5;
        schedule();
        return;
      }
      setDeviceFlowError(
        response.kind === "error" ? response.message : "GitHub did not complete authorization.",
      );
      setAuthorization(undefined);
    };
    schedule();
    return () => {
      cancelled = true;
      if (timeout !== undefined) window.clearTimeout(timeout);
    };
  }, [accountLogin, authorization, queryClient, sendMessage]);

  const dashboardError = dashboardQuery.error;
  const accountMismatch =
    dashboardError instanceof DashboardRequestError && dashboardError.code === "account_mismatch";
  const invalidToken =
    dashboardError instanceof DashboardRequestError && dashboardError.code === "invalid_token";
  useEffect(() => {
    if (!invalidToken) return;
    queryClient.setQueryData<TokenStateQueryData>(dashboardKeys.tokenState(accountLogin), {
      token: { connected: false },
    });
  }, [accountLogin, invalidToken, queryClient]);
  const connection: ConnectionState = tokenQuery.isPending
    ? "loading"
    : token.connected && !accountMismatch && !invalidToken
      ? "connected"
      : "disconnected";
  const mutationError = latestMutationError([
    connectPersonalToken,
    updateDashboardPreferences,
    setHiddenItem,
    checkInstallation,
    openInstallation,
    disconnectAccount,
    {
      error: dashboardQuery.error,
      submittedAt: Math.max(dashboardQuery.dataUpdatedAt, dashboardQuery.errorUpdatedAt),
    },
  ]);

  const runShowAll = async (sections: readonly DashboardSection[]): Promise<void> => {
    if (sections.length === 0) return;
    setLoadingSection(sections[0]);
    try {
      await fetchDashboard({ showAll: sections });
    } catch {
      // The dashboard query's own error state already surfaces this failure.
    } finally {
      setLoadingSection(undefined);
    }
  };

  return {
    authorization,
    connection,
    copiedCode,
    dashboard: dashboardQuery.data?.dashboard,
    deviceFlowError,
    error:
      clipboardError ?? errorMessage(tokenQuery.error ?? preferencesQuery.error ?? mutationError),
    hasPersonalInstallation: installationQuery.data,
    isAwaitingRepositoryInstallation,
    isConfirmingDisconnect,
    isCheckingRepositoryInstallation: checkInstallation.isPending,
    isOpeningRepositoryInstallation: openInstallation.isPending,
    isConnectingPersonalAccessToken: connectPersonalToken.isPending,
    isRefreshing: dashboardQuery.isFetching && dashboardQuery.data?.dashboard !== undefined,
    isStarting: startAuthorization.isPending,
    isLoadingRepositoryAccess: repositoryAccessQuery.isFetching,
    isDashboardLoading: dashboardQuery.isPending,
    loadingSection,
    loadingTab: dashboardQuery.isFetching ? preferences.selectedTab : undefined,
    preferences,
    repositoryAccess: repositoryAccessQuery.data?.access,
    repositoryAccessError: errorMessage(repositoryAccessQuery.error),
    token,
    warning: dashboardQuery.data?.warning,
    cancelAuthorization,
    checkRepositoryInstallation: () => settleMutation(checkInstallation.mutateAsync()),
    connect: () => settleMutation(startAuthorization.mutateAsync()),
    connectPersonalAccessToken: async (
      accessToken: string,
      source: Exclude<TokenSource, "app">,
    ): Promise<void> => {
      await settleMutation(connectPersonalToken.mutateAsync({ accessToken, source }));
    },
    copyAuthorizationCode,
    disconnect: () => settleMutation(disconnectAccount.mutateAsync()),
    // One request pages every pending section at once; the background merges them into a single
    // snapshot, so this costs one round trip instead of one per section.
    loadAllAttention: (sections: readonly DashboardSection[]) => runShowAll(sections),
    loadRepositoryAccess: repositoryAccessQuery.refetch,
    openRepositoryInstallation: () => settleMutation(openInstallation.mutateAsync()),
    refresh: () => settleMutation(fetchDashboard({ refresh: true })),
    selectTab: (tab: DashboardTab) =>
      preferences.selectedTab === tab
        ? Promise.resolve()
        : settleMutation(updateDashboardPreferences.mutateAsync({ selectedTab: tab })),
    setIsConfirmingDisconnect,
    setItemHidden: (itemId: string, updatedAt?: string) =>
      settleMutation(setHiddenItem.mutateAsync({ itemId, updatedAt })),
    pinRepository: (nameWithOwner: string) =>
      settleMutation(
        updateDashboardPreferences.mutateAsync({
          favoriteRepositories: addFavoriteRepository(
            preferences.favoriteRepositories,
            nameWithOwner,
          ),
        }),
      ),
    unpinRepository: (nameWithOwner: string) =>
      settleMutation(
        updateDashboardPreferences.mutateAsync({
          favoriteRepositories: removeFavoriteRepository(
            preferences.favoriteRepositories,
            nameWithOwner,
          ),
        }),
      ),
    movePinnedRepository: (nameWithOwner: string, offset: number) =>
      settleMutation(
        updateDashboardPreferences.mutateAsync({
          favoriteRepositories: moveFavoriteRepository(
            preferences.favoriteRepositories,
            nameWithOwner,
            offset,
          ),
        }),
      ),
    showAll: (section: DashboardSection) => void runShowAll([section]),
    updatePreferences: (changes: DashboardPreferenceChanges) =>
      settleMutation(updateDashboardPreferences.mutateAsync(changes)),
  };
}

interface MutationOutcome {
  error: Error | null;
  submittedAt: number;
}

/** Only the most recent action owns the banner, so a later action clears an earlier failure. */
function latestMutationError(mutations: readonly MutationOutcome[]): Error | undefined {
  const latest = mutations.reduce((newest, mutation) =>
    mutation.submittedAt > newest.submittedAt ? mutation : newest,
  );
  return latest.error ?? undefined;
}

async function settleMutation<T>(mutation: Promise<T>): Promise<void> {
  await mutation.catch(() => undefined);
}

function responseError(response: Awaited<ReturnType<MessageSender>>, fallback: string): Error {
  return response.kind === "error"
    ? new DashboardRequestError(response.message, response.code)
    : new DashboardRequestError(fallback);
}

function errorMessage(error: Error | null | undefined): string | undefined {
  return error?.message;
}
