import { DeviceFlowError, exchangeDeviceCode, startDeviceAuthorization } from "@/auth/device-flow";
import { TokenProvider } from "@/auth/token-provider";
import { isDashboardForAccount, normalizeGitHubLogin } from "@/data/account";
import { clearDashboardCache, readDashboardCache, writeDashboardCache } from "@/data/cache";
import { isDashboardCacheFresh } from "@/data/dashboard-freshness";
import {
  DashboardRefresh,
  DashboardRefreshAccountMismatchError,
  type DashboardRefreshSelection,
} from "@/data/dashboard-refresh";
import {
  readDashboardPreferences,
  setHiddenDashboardItem,
  updateDashboardPreferences,
} from "@/data/dashboard-preferences";
import {
  fetchDashboardAttention,
  fetchDashboardContributions,
  fetchDashboardCounts,
  fetchDashboardOwned,
  fetchDashboardSection,
  fetchViewerRepositories,
  GitHubApiError,
  isDashboardTabLoaded,
} from "@/data/github";
import {
  checkRateLimit,
  clearRateLimitState,
  RateLimitedError,
  recordRateLimitRejection,
  recordRateLimitSuccess,
} from "@/data/rate-limit";
import {
  fetchGitHubViewerIdentity,
  fetchPersonalInstallationState,
  fetchPersonalTokenRepositoryAccess,
  fetchRepositoryAccess,
} from "@/data/repository-access";
import { VIEWER_REPOSITORY_PAGE_SIZE, viewerRepositories } from "@/data/viewer-repositories";
import type { Theme } from "@/content/theme";
import { actionIconPaths } from "@/lib/action-icon";
import { broadcastDashboardUpdate } from "@/lib/dashboard-broadcast";
import { refreshWithCachedDashboard, STALE_DASHBOARD_WARNING } from "@/data/dashboard-response";
import { runBackgroundTask } from "@/lib/background-task";
import type { OctobasePush, OctobaseRequest, OctobaseResponse } from "@/messages";
import type { ViewerRepositoriesQuery } from "@/gql/graphql";

const tokenProvider = new TokenProvider();
const THEME_KEY = "octobase:toolbar-theme";
const GITHUB_HOME_URL = "https://github.com/";
// Must track the content script's `matches`: only these routes ever mount a dashboard.
const DASHBOARD_TAB_PATTERNS = [
  "https://github.com/",
  "https://github.com/dashboard",
  "https://github.com/dashboard/*",
];
const clientId = import.meta.env.WXT_GITHUB_CLIENT_ID;
const appSlug = import.meta.env.WXT_GITHUB_APP_SLUG;

export default defineBackground(() => {
  const dashboardRefresh = createDashboardRefresh();

  browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
      void runBackgroundTask("opening GitHub after installation", async () => {
        await browser.tabs.create({ url: GITHUB_HOME_URL });
      });
    }
  });
  // The worker restarts without its icon, so replay the last theme a tab reported.
  void runBackgroundTask("restoring the toolbar icon", restoreActionIcon);
  // No popup: the dashboard lives on github.com, so the toolbar icon just goes there.
  browser.action.onClicked.addListener(() => {
    void runBackgroundTask("opening GitHub", async () => {
      await browser.tabs.create({ url: GITHUB_HOME_URL });
    });
  });
  browser.runtime.onMessage.addListener((message: OctobaseRequest, _sender, sendResponse) => {
    void respondToMessage(message, sendResponse, dashboardRefresh);
    return true;
  });
});

async function respondToMessage(
  message: OctobaseRequest,
  sendResponse: (response: OctobaseResponse) => void,
  dashboardRefresh: DashboardRefresh,
): Promise<void> {
  sendResponse(await handleMessage(message, dashboardRefresh));
}

async function applyActionIcon(theme: Theme): Promise<void> {
  await browser.action.setIcon({ path: actionIconPaths(theme) });
  await browser.storage.local.set({ [THEME_KEY]: theme });
}

async function restoreActionIcon(): Promise<void> {
  const stored = await browser.storage.local.get(THEME_KEY);
  const theme = stored[THEME_KEY];
  if (theme === "dark" || theme === "light") {
    await browser.action.setIcon({ path: actionIconPaths(theme) });
  }
}

// Filtering by url needs no `tabs` permission; the github.com host permission covers it.
async function dashboardTabIds(): Promise<number[]> {
  const tabs = await browser.tabs.query({ url: DASHBOARD_TAB_PATTERNS });
  return tabs.map((tab) => tab.id).filter((id) => id !== undefined);
}

async function sendPushToTab(tabId: number, push: OctobasePush): Promise<void> {
  await browser.tabs.sendMessage(tabId, push);
}

async function selectToken(accountLogin: string): Promise<DashboardRefreshSelection | undefined> {
  const accountToken = await tokenProvider.get(accountLogin);
  if (accountToken) return { token: accountToken, legacy: false };
  const legacyToken = await tokenProvider.getLegacy();
  return legacyToken ? { token: legacyToken, legacy: true } : undefined;
}

async function tokenStateResponse(accountLogin: string): Promise<OctobaseResponse> {
  return { kind: "token-state", token: await tokenProvider.state(accountLogin) };
}

/** Keeps this list's budget accounting identical to the dashboard's own fetches. */
async function listRepositoriesForAccount(
  accountLogin: string,
  accessToken: string,
): Promise<ViewerRepositoriesQuery> {
  try {
    const found = await fetchViewerRepositories(accessToken, VIEWER_REPOSITORY_PAGE_SIZE);
    if (normalizeGitHubLogin(found.viewer.login) !== normalizeGitHubLogin(accountLogin)) {
      throw new DashboardRefreshAccountMismatchError();
    }
    await recordRateLimitSuccess(accountLogin, found.rateLimit);
    return found;
  } catch (cause) {
    if (cause instanceof GitHubApiError && cause.rateLimit) {
      await recordRateLimitRejection(accountLogin, cause.rateLimit.retryAt);
    }
    throw cause;
  }
}

async function handleMessage(
  message: OctobaseRequest,
  dashboardRefresh: DashboardRefresh,
): Promise<OctobaseResponse> {
  try {
    switch (message.type) {
      case "octobase/token-state":
        return tokenStateResponse(message.accountLogin);
      case "octobase/set-token":
        await dashboardRefresh.connect(message.accountLogin, message.accessToken, message.metadata);
        return { kind: "ok" };
      case "octobase/disconnect":
        await dashboardRefresh.disconnect(message.accountLogin);
        return { kind: "ok" };
      case "octobase/repository-access": {
        const selection = await selectToken(message.accountLogin);
        if (!selection) {
          return { kind: "error", message: "Connect GitHub before checking repository access." };
        }
        return {
          kind: "repository-access",
          accountLogin: message.accountLogin,
          access:
            selection.token.source === "app"
              ? await fetchRepositoryAccess(selection.token.accessToken)
              : await fetchPersonalTokenRepositoryAccess(
                  selection.token.accessToken,
                  selection.token.source,
                ),
        };
      }
      case "octobase/viewer-repositories": {
        const selection = await selectToken(message.accountLogin);
        if (!selection) {
          return { kind: "error", message: "Connect GitHub before listing repositories." };
        }
        // The list shares the account's budget, so a cooldown holds it back too.
        const decision = await checkRateLimit(message.accountLogin);
        if (!decision.allowed) throw new RateLimitedError(decision.retryAt);
        const found = await listRepositoriesForAccount(
          message.accountLogin,
          selection.token.accessToken,
        );
        return {
          kind: "viewer-repositories",
          accountLogin: message.accountLogin,
          repositories: viewerRepositories(found),
        };
      }
      case "octobase/repository-installation-state": {
        const selection = await selectToken(message.accountLogin);
        if (!selection || selection.token.source !== "app") {
          return {
            kind: "error",
            message: "Connect through the GitHub App before checking installation status.",
          };
        }
        return {
          kind: "repository-installation-state",
          hasPersonalInstallation: await fetchPersonalInstallationState(
            selection.token.accessToken,
            message.accountLogin,
          ),
        };
      }
      case "octobase/open-repository-installation": {
        if (!appSlug) {
          return {
            kind: "error",
            message: "Set WXT_GITHUB_APP_SLUG before opening repository installation.",
            code: "missing_app_slug",
          };
        }
        const selection = await selectToken(message.accountLogin);
        if (!selection || selection.token.source !== "app") {
          return {
            kind: "error",
            message: "Connect through the GitHub App before adding repository access.",
          };
        }
        const viewer = await fetchGitHubViewerIdentity(selection.token.accessToken);
        if (normalizeGitHubLogin(viewer.login) !== normalizeGitHubLogin(message.accountLogin)) {
          throw new DashboardRefreshAccountMismatchError();
        }
        const installationUrl = new URL(`https://github.com/apps/${appSlug}/installations/new`);
        installationUrl.searchParams.set("suggested_target_id", String(viewer.id));
        await browser.tabs.create({ url: installationUrl.toString() });
        return { kind: "ok" };
      }
      case "octobase/update-preferences": {
        // The content script requests the newly selected tab itself, so it can show progress.
        const preferences = await updateDashboardPreferences(message.accountLogin, message.changes);
        return { kind: "preferences", preferences };
      }
      case "octobase/preferences":
        return {
          kind: "preferences",
          preferences: await readDashboardPreferences(message.accountLogin),
        };
      case "octobase/set-hidden-item":
        return {
          kind: "preferences",
          preferences: await setHiddenDashboardItem(
            message.accountLogin,
            message.itemId,
            message.updatedAt,
          ),
        };
      case "octobase/set-theme":
        await applyActionIcon(message.theme);
        return { kind: "ok" };
      case "octobase/start-device-flow": {
        if (!clientId) return configurationError();
        const authorization = await startDeviceAuthorization(clientId);
        await browser.tabs.create({
          url: authorization.verificationUriComplete ?? authorization.verificationUri,
        });
        return { kind: "device-authorization", authorization };
      }
      case "octobase/complete-device-flow": {
        if (!clientId) return configurationError();
        const token = await exchangeDeviceCode(clientId, message.deviceCode);
        await dashboardRefresh.connect(message.accountLogin, token.accessToken, token);
        return tokenStateResponse(message.accountLogin);
      }
      case "octobase/dashboard": {
        const cacheFirst =
          !message.refresh && !message.showAll?.length
            ? await readAccountDashboardCache(message.accountLogin)
            : undefined;
        if (
          cacheFirst &&
          isDashboardForAccount(cacheFirst.data, message.accountLogin) &&
          isDashboardTabLoaded(cacheFirst.data, message.selectedTab)
        ) {
          const stale = !isDashboardCacheFresh(cacheFirst);
          if (stale) {
            void runBackgroundTask("refreshing the stale dashboard", async () => {
              await dashboardRefresh.run(message.accountLogin, {
                selectedTab: message.selectedTab,
              });
            });
          }
          return { kind: "dashboard", snapshot: cacheFirst, stale };
        }
        return await refreshWithCachedDashboard(
          () =>
            dashboardRefresh.run(message.accountLogin, {
              selectedTab: message.selectedTab,
              showAll: message.showAll,
              // The cache-first branch above already read this row; don't read it twice.
              cached: cacheFirst,
            }),
          () => readAccountDashboardCache(message.accountLogin),
          (data) => isDashboardForAccount(data, message.accountLogin),
          (error) => (error instanceof RateLimitedError ? error.message : STALE_DASHBOARD_WARNING),
        );
      }
    }
    return { kind: "error", message: "Unsupported octobase message." };
  } catch (error) {
    const invalidToken = error instanceof GitHubApiError && error.status === 401;
    const known =
      error instanceof DeviceFlowError ||
      error instanceof DashboardRefreshAccountMismatchError ||
      error instanceof RateLimitedError;
    return {
      kind: "error",
      message: errorMessage(error),
      code: invalidToken ? "invalid_token" : known ? error.code : undefined,
    };
  }
}

function createDashboardRefresh(): DashboardRefresh {
  return new DashboardRefresh(
    tokenProvider,
    {
      fetchAttention: fetchDashboardAttention,
      fetchCounts: fetchDashboardCounts,
      fetchOwned: fetchDashboardOwned,
      fetchContributions: fetchDashboardContributions,
      fetchSection: fetchDashboardSection,
    },
    {
      read: readDashboardCache,
      write: writeDashboardCache,
      clear: clearDashboardCache,
    },
    {
      check: checkRateLimit,
      recordSuccess: recordRateLimitSuccess,
      recordRejection: recordRateLimitRejection,
      clear: clearRateLimitState,
    },
    {
      publish: (snapshot) => broadcastDashboardUpdate(snapshot, dashboardTabIds, sendPushToTab),
    },
  );
}

async function readAccountDashboardCache(accountLogin: string) {
  const cached = await readDashboardCache(accountLogin);
  return cached && isDashboardForAccount(cached.data, accountLogin) ? cached : undefined;
}

function configurationError(): OctobaseResponse {
  return {
    kind: "error",
    message: "Set WXT_GITHUB_CLIENT_ID from a GitHub App before connecting.",
    code: "missing_client_id",
  };
}

function errorMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : "Unexpected GitHub integration error.";
}
