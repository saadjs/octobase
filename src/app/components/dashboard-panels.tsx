/* eslint-disable react-perf/jsx-no-new-function-as-prop, react-perf/jsx-no-new-array-as-prop -- Dashboard values are derived locally and do not cross memoized boundaries. */
import { useMemo } from "react";
import { AttentionQueue } from "@/app/components/attention-queue";
import { DashboardFilters } from "@/app/components/dashboard-filters";
import { DashboardTabContent, SeparatedRows, WorkPanel } from "@/app/components/dashboard-layout";
import { IssueRow, PullRequestRow } from "@/app/components/item-rows";
import {
  countCurrentlyHiddenItems,
  issueCards,
  matchesDashboardPreferences,
  pullRequestCards,
} from "@/app/dashboard-items";
import { formatCount } from "@/app/presentation";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildAttentionQueue } from "@/data/attention";
import { tabCount } from "@/data/dashboard-counts";
import { ATTENTION_SECTIONS, type DashboardSection } from "@/data/dashboard-sections";
import {
  isDashboardItemHidden,
  type DashboardPreferenceChanges,
  type DashboardPreferences,
  type DashboardTab,
} from "@/data/dashboard-preferences";
import type { DashboardSnapshot } from "@/data/github";
import type { IssueCardFragment, PullRequestCardFragment } from "@/gql/graphql";

export function DashboardPanels({
  dashboard,
  loadingSection,
  loadingTab,
  onLoadAllAttention,
  onSelectTab,
  onSetItemHidden,
  onShowAll,
  onUpdatePreferences,
  preferences,
}: {
  dashboard: DashboardSnapshot;
  loadingSection?: DashboardSection;
  loadingTab?: DashboardTab;
  onLoadAllAttention: (sections: readonly DashboardSection[]) => void;
  onSelectTab: (tab: DashboardTab) => void;
  onSetItemHidden: (itemId: string, updatedAt?: string) => void;
  onShowAll: (section: DashboardSection) => void;
  onUpdatePreferences: (changes: DashboardPreferenceChanges) => void;
  preferences: DashboardPreferences;
}) {
  const attention = useMemo(
    () =>
      buildAttentionQueue(dashboard).filter((item) =>
        matchesDashboardPreferences(
          item.kind,
          item.kind === "pull-request" ? item.pullRequest : item.issue,
          preferences,
        ),
      ),
    [dashboard, preferences],
  );
  const pendingAttention = ATTENTION_SECTIONS.filter(
    (section) => dashboard[section].pageInfo.hasNextPage,
  );
  const filtersActive =
    preferences.repositoryQuery.trim() !== "" ||
    preferences.itemType !== "all" ||
    !preferences.showDrafts ||
    preferences.showHidden;

  return (
    <Tabs
      className="min-w-0"
      onValueChange={(value) => {
        if (isDashboardTab(value) && value !== preferences.selectedTab) onSelectTab(value);
      }}
      value={preferences.selectedTab}
    >
      <TabsList className="grid w-full grid-cols-3 group-data-[orientation=horizontal]/tabs:h-auto">
        <DashboardTabTrigger
          count={attention.length}
          label="Needs your attention"
          value="attention"
        />
        <DashboardTabTrigger
          count={tabCount("owned", dashboard.counts)}
          label="Your repositories"
          value="owned"
        />
        <DashboardTabTrigger
          count={tabCount("contributions", dashboard.counts)}
          label="Contributions"
          value="contributions"
        />
      </TabsList>
      <DashboardFilters
        hiddenCount={countCurrentlyHiddenItems(dashboard, preferences)}
        onUpdate={onUpdatePreferences}
        preferences={preferences}
      />
      <TabsContent value="attention">
        <p className="mt-2 text-sm text-muted-foreground">
          One queue across connected repositories, ordered by what is most likely blocking someone.
        </p>
        <AttentionQueue
          filtersActive={filtersActive}
          isLoadingMore={ATTENTION_SECTIONS.some((section) => section === loadingSection)}
          items={attention}
          onLoadAll={() => onLoadAllAttention(pendingAttention)}
          onSetItemHidden={onSetItemHidden}
          pendingSections={pendingAttention.length}
          preferences={preferences}
        />
      </TabsContent>
      <DashboardWorkTab
        description="Open work in repositories owned by your account."
        issueConnection={dashboard.ownedIssues}
        issueEmpty="You have no open issues in your repositories."
        isLoading={loadingTab === "owned"}
        issueSection="ownedIssues"
        loadingSection={loadingSection}
        onSetItemHidden={onSetItemHidden}
        onShowAll={onShowAll}
        preferences={preferences}
        pullRequestConnection={dashboard.ownedPullRequests}
        pullRequestEmpty="You have no open pull requests in your repositories."
        pullRequestSection="ownedPullRequests"
        value="owned"
      />
      <DashboardWorkTab
        description="Open issues and pull requests in repositories you do not own, including OSS contributions."
        issueConnection={dashboard.contributedIssues}
        issueEmpty="You have no open issue contributions."
        isLoading={loadingTab === "contributions"}
        issueSection="contributedIssues"
        loadingSection={loadingSection}
        onSetItemHidden={onSetItemHidden}
        onShowAll={onShowAll}
        preferences={preferences}
        pullRequestConnection={dashboard.contributedPullRequests}
        pullRequestEmpty="You have no open pull request contributions."
        pullRequestSection="contributedPullRequests"
        value="contributions"
      />
    </Tabs>
  );
}

function isDashboardTab(value: string): value is DashboardTab {
  return value === "attention" || value === "owned" || value === "contributions";
}

function DashboardTabTrigger({
  count,
  label,
  value,
}: {
  count?: number;
  label: string;
  value: string;
}) {
  return (
    <TabsTrigger className="h-auto py-1.5 text-center whitespace-normal" value={value}>
      {label}
      {/* An unfetched total is unknown, and a badge reading 0 would claim there is nothing here. */}
      {count === undefined ? (
        <Skeleton className="h-5 w-6 rounded-full" aria-hidden />
      ) : (
        <Badge className="min-w-5 px-1.5" variant="secondary">
          {formatCount(count)}
        </Badge>
      )}
    </TabsTrigger>
  );
}

type PullRequestConnection = DashboardSnapshot["ownedPullRequests"];
type IssueConnection = DashboardSnapshot["ownedIssues"];

function DashboardWorkTab({
  description,
  isLoading,
  issueConnection,
  issueEmpty,
  issueSection,
  loadingSection,
  onSetItemHidden,
  onShowAll,
  preferences,
  pullRequestConnection,
  pullRequestEmpty,
  pullRequestSection,
  value,
}: {
  description: string;
  isLoading: boolean;
  issueConnection: IssueConnection;
  issueEmpty: string;
  issueSection: DashboardSection;
  loadingSection?: DashboardSection;
  onSetItemHidden: (itemId: string, updatedAt?: string) => void;
  onShowAll: (section: DashboardSection) => void;
  preferences: DashboardPreferences;
  pullRequestConnection: PullRequestConnection;
  pullRequestEmpty: string;
  pullRequestSection: DashboardSection;
  value: string;
}) {
  const allPullRequests = pullRequestCards(pullRequestConnection.nodes);
  const allIssues = issueCards(issueConnection.nodes);
  const pullRequests = allPullRequests.filter((item) =>
    matchesDashboardPreferences("pull-request", item, preferences),
  );
  const issues = allIssues.filter((item) =>
    matchesDashboardPreferences("issue", item, preferences),
  );
  const filtersActive =
    preferences.repositoryQuery.trim() !== "" ||
    preferences.itemType !== "all" ||
    !preferences.showDrafts ||
    preferences.showHidden;

  return (
    <DashboardTabContent description={description} value={value}>
      <PullRequestPanel
        allItems={allPullRequests}
        connection={pullRequestConnection}
        empty={pullRequestEmpty}
        filtersActive={filtersActive}
        items={pullRequests}
        isLoading={isLoading}
        isLoadingAll={loadingSection === pullRequestSection}
        onSetItemHidden={onSetItemHidden}
        onShowAll={() => onShowAll(pullRequestSection)}
        preferences={preferences}
      />
      <IssuePanel
        allItems={allIssues}
        connection={issueConnection}
        empty={issueEmpty}
        filtersActive={filtersActive}
        items={issues}
        isLoading={isLoading}
        isLoadingAll={loadingSection === issueSection}
        onSetItemHidden={onSetItemHidden}
        onShowAll={() => onShowAll(issueSection)}
        preferences={preferences}
      />
    </DashboardTabContent>
  );
}

function PullRequestPanel({
  allItems,
  connection,
  empty,
  filtersActive,
  items,
  isLoading,
  isLoadingAll,
  onSetItemHidden,
  onShowAll,
  preferences,
}: {
  allItems: PullRequestCardFragment[];
  connection: PullRequestConnection;
  empty: string;
  filtersActive: boolean;
  items: PullRequestCardFragment[];
  isLoading: boolean;
  isLoadingAll: boolean;
  onSetItemHidden: (itemId: string, updatedAt?: string) => void;
  onShowAll: () => void;
  preferences: DashboardPreferences;
}) {
  return (
    <WorkPanel
      count={connection.issueCount}
      displayedCount={allItems.length}
      empty={empty}
      filteredCount={items.length}
      filtersActive={filtersActive}
      hasNextPage={connection.pageInfo.hasNextPage}
      isLoading={isLoading}
      isLoadingAll={isLoadingAll}
      onShowAll={onShowAll}
      title="Pull requests"
    >
      <SeparatedRows>
        {items.map((item) => (
          <PullRequestRow
            isHidden={isDashboardItemHidden(preferences, item.id, item.updatedAt)}
            key={item.id}
            onSetHidden={onSetItemHidden}
            pullRequest={item}
            showChecks
          />
        ))}
      </SeparatedRows>
    </WorkPanel>
  );
}

function IssuePanel({
  allItems,
  connection,
  empty,
  filtersActive,
  items,
  isLoading,
  isLoadingAll,
  onSetItemHidden,
  onShowAll,
  preferences,
}: {
  allItems: IssueCardFragment[];
  connection: IssueConnection;
  empty: string;
  filtersActive: boolean;
  items: IssueCardFragment[];
  isLoading: boolean;
  isLoadingAll: boolean;
  onSetItemHidden: (itemId: string, updatedAt?: string) => void;
  onShowAll: () => void;
  preferences: DashboardPreferences;
}) {
  return (
    <WorkPanel
      count={connection.issueCount}
      displayedCount={allItems.length}
      empty={empty}
      filteredCount={items.length}
      filtersActive={filtersActive}
      hasNextPage={connection.pageInfo.hasNextPage}
      isLoading={isLoading}
      isLoadingAll={isLoadingAll}
      onShowAll={onShowAll}
      title="Issues"
    >
      <SeparatedRows>
        {items.map((item) => (
          <IssueRow
            isHidden={isDashboardItemHidden(preferences, item.id, item.updatedAt)}
            issue={item}
            key={item.id}
            onSetHidden={onSetItemHidden}
          />
        ))}
      </SeparatedRows>
    </WorkPanel>
  );
}
