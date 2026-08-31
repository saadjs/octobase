/* eslint-disable react-perf/jsx-no-new-function-as-prop -- Root callbacks adapt async controller actions to UI events. */
import { useState } from "react";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { BrandMark } from "@/app/components/brand-mark";
import { ConnectPanel } from "@/app/components/connect-panel";
import { DashboardLoadingSkeleton } from "@/app/components/dashboard-loading-skeleton";
import { DashboardPanels } from "@/app/components/dashboard-panels";
import { PinnedRepositories } from "@/app/components/pinned-repositories";
import { RepositoryAccessSheet } from "@/app/components/repository-access-sheet";
import { RepositorySetupCard } from "@/app/components/repository-setup-card";
import { createDashboardQueryClient } from "@/app/query-client";
import { type MessageSender, useDashboardController } from "@/app/use-dashboard-controller";
import { usePinnedRepositoryShortcuts } from "@/app/use-pinned-shortcuts";
import {
  connectionCoverage,
  connectionMechanism,
  formatExactTime,
  formatRelativeTime,
} from "@/app/presentation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardTabFetchedAt } from "@/data/dashboard-freshness";
import type { DashboardTab } from "@/data/dashboard-preferences";

interface AppProps {
  accountLogin: string;
  sendMessage?: MessageSender;
  /**
   * The content script owns one client for the tab's lifetime, so navigating away from the
   * dashboard and back reuses the cache instead of re-asking the background for everything.
   * Left unset, each mount gets its own client.
   */
  queryClient?: QueryClient;
}

export function App({ queryClient, ...props }: AppProps) {
  const [ownClient] = useState(createDashboardQueryClient);
  return (
    <QueryClientProvider client={queryClient ?? ownClient}>
      <DashboardApp {...props} />
    </QueryClientProvider>
  );
}

function DashboardApp({ accountLogin, sendMessage }: AppProps) {
  const controller = useDashboardController(accountLogin, sendMessage);
  const {
    authorization,
    connection,
    copiedCode,
    dashboard,
    deviceFlowError,
    error,
    hasPersonalInstallation,
    isAwaitingRepositoryInstallation,
    isConfirmingDisconnect,
    isCheckingRepositoryInstallation,
    isOpeningRepositoryInstallation,
    isConnectingPersonalAccessToken,
    isDashboardLoading,
    isLoadingRepositoryAccess,
    isRefreshing,
    isStarting,
    loadingSection,
    loadingTab,
    preferences,
    repositoryAccess,
    repositoryAccessError,
    token,
    warning,
  } = controller;
  usePinnedRepositoryShortcuts(preferences.favoriteRepositories);

  return (
    <main className="mt-16 min-h-[calc(100vh-4rem)] w-full bg-background">
      <div className="mx-auto w-full max-w-[110rem] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 2xl:px-12">
        <header className="flex min-h-10 items-center justify-between gap-3">
          <DashboardHeading dashboard={dashboard} selectedTab={preferences.selectedTab} />
          {connection === "connected" ? (
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              {isConfirmingDisconnect ? (
                <>
                  <Button
                    onClick={() => controller.setIsConfirmingDisconnect(false)}
                    type="button"
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => void controller.disconnect()}
                    type="button"
                    variant="destructive"
                  >
                    Confirm disconnect
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => controller.setIsConfirmingDisconnect(true)}
                  type="button"
                  variant="ghost"
                >
                  Disconnect
                </Button>
              )}
              <Button
                disabled={isRefreshing}
                onClick={controller.refresh}
                type="button"
                variant="outline"
              >
                {isRefreshing ? "Refreshing…" : "Refresh"}
              </Button>
            </div>
          ) : null}
        </header>

        {connection === "connected" && token.connected ? (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">Connected via {connectionMechanism(token)}</Badge>
            <p>{connectionCoverage(token)}</p>
            <RepositoryAccessSheet
              access={repositoryAccess}
              error={repositoryAccessError}
              isLoading={isLoadingRepositoryAccess}
              onLoad={() => void controller.loadRepositoryAccess()}
              source={token.source}
            />
          </div>
        ) : null}
        {connection === "connected" &&
        token.connected &&
        token.source === "app" &&
        hasPersonalInstallation === false ? (
          <RepositorySetupCard
            isChecking={isCheckingRepositoryInstallation}
            isOpening={isOpeningRepositoryInstallation}
            isWaiting={isAwaitingRepositoryInstallation}
            onCheck={() => void controller.checkRepositoryInstallation()}
            onInstall={() => void controller.openRepositoryInstallation()}
          />
        ) : null}
        {connection === "loading" ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
        ) : null}
        {connection === "disconnected" && !authorization && !deviceFlowError ? (
          <ConnectPanel
            isConnectingPersonalAccessToken={isConnectingPersonalAccessToken}
            isStartingGitHubApp={isStarting}
            onConnectGitHubApp={() => void controller.connect()}
            onConnectPersonalAccessToken={controller.connectPersonalAccessToken}
          />
        ) : null}
        {authorization ? (
          <AuthorizationCard
            authorization={authorization}
            copiedCode={copiedCode}
            onCancel={controller.cancelAuthorization}
            onCopy={() => void controller.copyAuthorizationCode()}
          />
        ) : null}
        {deviceFlowError ? (
          <AuthorizationFailureCard
            isRetrying={isStarting}
            message={deviceFlowError}
            onCancel={controller.cancelAuthorization}
            onRetry={() => void controller.connect()}
          />
        ) : null}
        {connection === "connected" && token.connected ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] 2xl:gap-8 2xl:grid-cols-[18rem_minmax(0,1fr)]">
            <PinnedRepositories
              accountLogin={accountLogin}
              dashboard={dashboard?.data}
              onAdd={(nameWithOwner) => void controller.pinRepository(nameWithOwner)}
              onMove={(nameWithOwner, offset) =>
                void controller.movePinnedRepository(nameWithOwner, offset)
              }
              onRemove={(nameWithOwner) => void controller.unpinRepository(nameWithOwner)}
              pinned={preferences.favoriteRepositories}
              sendMessage={sendMessage}
            />
            {dashboard ? (
              <DashboardPanels
                dashboard={dashboard.data}
                loadingSection={loadingSection}
                loadingTab={loadingTab}
                onLoadAllAttention={(sections) => void controller.loadAllAttention(sections)}
                onSelectTab={(tab) => void controller.selectTab(tab)}
                onSetItemHidden={(itemId, updatedAt) =>
                  void controller.setItemHidden(itemId, updatedAt)
                }
                onShowAll={controller.showAll}
                onUpdatePreferences={(changes) => void controller.updatePreferences(changes)}
                preferences={preferences}
              />
            ) : isDashboardLoading ? (
              <DashboardLoadingSkeleton />
            ) : (
              <p className="text-sm text-muted-foreground">No dashboard data is available.</p>
            )}
          </div>
        ) : null}
        {warning ? (
          <p
            className="mt-4 rounded-(--borderRadius-medium) border border-(--borderColor-attention-emphasis) bg-(--bgColor-attention-muted) px-3 py-2 text-sm text-foreground"
            role="status"
          >
            {warning}
          </p>
        ) : null}
        {error ? (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </main>
  );
}

function DashboardHeading({
  dashboard,
  selectedTab,
}: {
  dashboard: ReturnType<typeof useDashboardController>["dashboard"];
  selectedTab: DashboardTab;
}) {
  const updatedAt = dashboard
    ? (dashboardTabFetchedAt(dashboard, selectedTab) ?? dashboard.fetchedAt)
    : undefined;
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <BrandMark className="size-7 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        {/* The mark carries the identity now, so the landmark heading is for screen readers. */}
        <h1 className="sr-only">Your work</h1>
        {dashboard && updatedAt ? (
          <p className="truncate text-xs text-muted-foreground sm:text-sm">
            <a
              className="hover:text-(--fgColor-accent) hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-(--focus-outlineColor)"
              href={`https://github.com/${dashboard.data.viewer.login}`}
              rel="noreferrer"
              target="_blank"
            >
              @{dashboard.data.viewer.login}
            </a>
            {dashboard.data.viewer.name ? ` (${dashboard.data.viewer.name})` : ""} · Updated{" "}
            <time
              className="cursor-help underline decoration-dotted underline-offset-2"
              dateTime={updatedAt}
              title={`${dashboard.stale ? "Refreshing" : "Last refreshed"}: ${formatExactTime(updatedAt)}`}
            >
              {formatRelativeTime(updatedAt)}
            </time>
          </p>
        ) : (
          <p className="text-xs text-muted-foreground sm:text-sm">
            Review requests and open work from connected repositories
          </p>
        )}
      </div>
    </div>
  );
}

function AuthorizationCard({
  authorization,
  copiedCode,
  onCancel,
  onCopy,
}: {
  authorization: NonNullable<ReturnType<typeof useDashboardController>["authorization"]>;
  copiedCode: boolean;
  onCancel: () => void;
  onCopy: () => void;
}) {
  return (
    <Card className="mt-6 max-w-md">
      <CardHeader>
        <CardTitle>Finish in GitHub</CardTitle>
        <CardDescription>
          Enter this one-time code in the GitHub tab that just opened.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2 min-[380px]:flex-row min-[380px]:items-center">
          <p className="flex h-10 min-w-0 flex-1 items-center justify-center rounded-(--borderRadius-medium) bg-muted px-3 text-center font-mono text-lg tracking-wider sm:text-xl">
            {authorization.userCode}
          </p>
          <Button onClick={onCopy} size="lg" type="button" variant="outline">
            {copiedCode ? "Copied" : "Copy code"}
          </Button>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">Waiting for authorization…</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button asChild variant="link">
            <a href={authorization.verificationUri} rel="noreferrer" target="_blank">
              Open GitHub authorization
            </a>
          </Button>
          <Button onClick={onCancel} type="button" variant="destructive">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AuthorizationFailureCard({
  isRetrying,
  message,
  onCancel,
  onRetry,
}: {
  isRetrying: boolean;
  message: string;
  onCancel: () => void;
  onRetry: () => void;
}) {
  return (
    <Card className="mt-6 max-w-md">
      <CardHeader>
        <CardTitle>GitHub authorization stopped</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button disabled={isRetrying} onClick={onRetry} type="button">
          {isRetrying ? "Retrying…" : "Retry"}
        </Button>
        <Button disabled={isRetrying} onClick={onCancel} type="button" variant="destructive">
          Cancel
        </Button>
      </CardContent>
    </Card>
  );
}
