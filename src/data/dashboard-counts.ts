import type { DashboardTab } from "@/data/dashboard-preferences";
import {
  COUNT_SECTIONS,
  dashboardTabForSection,
  type DashboardCountSection,
} from "@/data/dashboard-sections";
import type { DashboardCountsQuery } from "@/gql/graphql";

export { COUNT_SECTIONS } from "@/data/dashboard-sections";
export type { DashboardCountSection } from "@/data/dashboard-sections";

/** Per section, because a tab fetch measures two of them without answering for the rest. */
export type DashboardCounts = Partial<Record<DashboardCountSection, number>>;

export function dashboardCounts(query: DashboardCountsQuery) {
  return {
    ownedPullRequests: query.ownedPullRequests.issueCount,
    ownedIssues: query.ownedIssues.issueCount,
    contributedPullRequests: query.contributedPullRequests.issueCount,
    contributedIssues: query.contributedIssues.issueCount,
  } satisfies DashboardCounts;
}

/** Undefined means "never fetched", which a badge must not render as zero. */
export function tabCount(tab: DashboardTab, counts?: DashboardCounts): number | undefined {
  if (tab === "attention" || !counts) return undefined;
  const sections = COUNT_SECTIONS.filter((section) => dashboardTabForSection(section) === tab).map(
    (section) => counts[section],
  );
  if (sections.some((count) => count === undefined)) return undefined;
  return sections.reduce((total = 0, count = 0) => total + count, 0);
}
