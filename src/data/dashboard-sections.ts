import type { DashboardTab } from "@/data/dashboard-preferences";
import type { DashboardSnapshot } from "@/data/github";
import type {
  DashboardSectionPageQuery,
  IssueCardFragment,
  PullRequestCardFragment,
} from "@/gql/graphql";

export const DASHBOARD_SECTIONS = [
  "reviewRequests",
  "assignedIssues",
  "ownedPullRequests",
  "ownedIssues",
  "contributedPullRequests",
  "contributedIssues",
  "mentioned",
  "authoredPullRequests",
  "changesRequested",
  "failingChecks",
  "participating",
  "incomingPullRequests",
] as const;

export type DashboardSection = (typeof DASHBOARD_SECTIONS)[number];
export type DashboardSectionItemKind = "pull-request" | "issue" | "mixed";

interface DashboardSectionFacts {
  tab: DashboardTab;
  itemKind: DashboardSectionItemKind;
  counted: boolean;
  searchQuery: string;
}

interface DashboardSectionRule extends DashboardSectionFacts {
  merge(dashboard: DashboardSnapshot, page: DashboardSectionPageQuery): DashboardSnapshot;
}

const DASHBOARD_SECTION_RULES = {
  reviewRequests: {
    tab: "attention",
    itemKind: "pull-request",
    counted: false,
    searchQuery: "is:open is:pr review-requested:@me sort:updated-desc",
    merge: (dashboard, page) => ({
      ...dashboard,
      reviewRequests: mergePullRequests(dashboard.reviewRequests, page.page),
    }),
  },
  assignedIssues: {
    tab: "attention",
    itemKind: "issue",
    counted: false,
    searchQuery: "is:open is:issue assignee:@me sort:updated-desc",
    merge: (dashboard, page) => ({
      ...dashboard,
      assignedIssues: mergeIssues(dashboard.assignedIssues, page.page),
    }),
  },
  ownedPullRequests: {
    tab: "owned",
    itemKind: "pull-request",
    counted: true,
    searchQuery: "is:open is:pr author:@me user:@me sort:updated-desc",
    merge: (dashboard, page) => ({
      ...dashboard,
      ownedPullRequests: mergePullRequests(dashboard.ownedPullRequests, page.page),
    }),
  },
  ownedIssues: {
    tab: "owned",
    itemKind: "issue",
    counted: true,
    searchQuery: "is:open is:issue author:@me user:@me sort:updated-desc",
    merge: (dashboard, page) => ({
      ...dashboard,
      ownedIssues: mergeIssues(dashboard.ownedIssues, page.page),
    }),
  },
  contributedPullRequests: {
    tab: "contributions",
    itemKind: "pull-request",
    counted: true,
    searchQuery: "is:open is:pr author:@me -user:@me sort:updated-desc",
    merge: (dashboard, page) => ({
      ...dashboard,
      contributedPullRequests: mergePullRequests(dashboard.contributedPullRequests, page.page),
    }),
  },
  contributedIssues: {
    tab: "contributions",
    itemKind: "issue",
    counted: true,
    searchQuery: "is:open is:issue author:@me -user:@me sort:updated-desc",
    merge: (dashboard, page) => ({
      ...dashboard,
      contributedIssues: mergeIssues(dashboard.contributedIssues, page.page),
    }),
  },
  mentioned: {
    tab: "attention",
    itemKind: "mixed",
    counted: false,
    searchQuery: "is:open mentions:@me sort:updated-desc",
    merge: (dashboard, page) => ({
      ...dashboard,
      mentioned: mergeMixed(dashboard.mentioned, page.page),
    }),
  },
  authoredPullRequests: {
    tab: "attention",
    itemKind: "pull-request",
    counted: false,
    searchQuery: "is:open is:pr author:@me sort:updated-desc",
    merge: (dashboard, page) => ({
      ...dashboard,
      authoredPullRequests: mergePullRequests(dashboard.authoredPullRequests, page.page),
    }),
  },
  changesRequested: {
    tab: "attention",
    itemKind: "pull-request",
    counted: false,
    searchQuery: "is:open is:pr author:@me review:changes_requested sort:updated-desc",
    merge: (dashboard, page) => ({
      ...dashboard,
      changesRequested: mergePullRequests(dashboard.changesRequested, page.page),
    }),
  },
  failingChecks: {
    tab: "attention",
    itemKind: "pull-request",
    counted: false,
    searchQuery: "is:open is:pr author:@me status:failure sort:updated-desc",
    merge: (dashboard, page) => ({
      ...dashboard,
      failingChecks: mergePullRequests(dashboard.failingChecks, page.page),
    }),
  },
  participating: {
    tab: "attention",
    itemKind: "mixed",
    counted: false,
    searchQuery: "is:open commenter:@me sort:updated-desc",
    merge: (dashboard, page) => ({
      ...dashboard,
      participating: mergeMixed(dashboard.participating, page.page),
    }),
  },
  incomingPullRequests: {
    tab: "attention",
    itemKind: "pull-request",
    counted: false,
    searchQuery: "is:open is:pr -author:@me user:@me sort:updated-desc",
    merge: (dashboard, page) => ({
      ...dashboard,
      incomingPullRequests: mergePullRequests(dashboard.incomingPullRequests, page.page),
    }),
  },
} as const satisfies Record<DashboardSection, DashboardSectionRule>;

export type DashboardCountSection =
  | "ownedPullRequests"
  | "ownedIssues"
  | "contributedPullRequests"
  | "contributedIssues";

export const ATTENTION_SECTIONS = DASHBOARD_SECTIONS.filter(isAttentionSection);
export const COUNT_SECTIONS = DASHBOARD_SECTIONS.filter(isCountedSection);

export function dashboardSectionRule(section: DashboardSection): DashboardSectionFacts {
  return DASHBOARD_SECTION_RULES[section];
}

export function dashboardTabForSection(section: DashboardSection): DashboardTab {
  return dashboardSectionRule(section).tab;
}

function isAttentionSection(section: DashboardSection): boolean {
  return dashboardTabForSection(section) === "attention";
}

function isCountedSection(section: DashboardSection): section is DashboardCountSection {
  return dashboardSectionRule(section).counted;
}

export function mergeDashboardSection(
  dashboard: DashboardSnapshot,
  page: DashboardSectionPageQuery,
  section: DashboardSection,
): DashboardSnapshot {
  return DASHBOARD_SECTION_RULES[section].merge(dashboard, page);
}

type PullRequestConnection = DashboardSnapshot["reviewRequests"];
type IssueConnection = DashboardSnapshot["assignedIssues"];
type MixedConnection = DashboardSnapshot["mentioned"];
type PageConnection = DashboardSectionPageQuery["page"];
const GRAPHQL_TYPE_NAME = "__typename";

function mergePullRequests(
  current: PullRequestConnection,
  page: PageConnection,
): PullRequestConnection {
  return { ...page, nodes: [...(current.nodes ?? []), ...pullRequests(page.nodes)] };
}

function mergeIssues(current: IssueConnection, page: PageConnection): IssueConnection {
  return { ...page, nodes: [...(current.nodes ?? []), ...issues(page.nodes)] };
}

function mergeMixed(current: MixedConnection, page: PageConnection): MixedConnection {
  return { ...page, nodes: [...(current.nodes ?? []), ...(page.nodes ?? [])] };
}

function pullRequests(nodes: PageConnection["nodes"]): PullRequestCardFragment[] {
  return (nodes ?? []).filter(
    (node): node is PullRequestCardFragment => node?.[GRAPHQL_TYPE_NAME] === "PullRequest",
  );
}

function issues(nodes: PageConnection["nodes"]): IssueCardFragment[] {
  return (nodes ?? []).filter(
    (node): node is IssueCardFragment => node?.[GRAPHQL_TYPE_NAME] === "Issue",
  );
}
