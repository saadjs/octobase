import { MAX_SEARCH_RESULTS, type DashboardSnapshot } from "@/data/github";
import { mergeDashboardSection, type DashboardSection } from "@/data/dashboard-sections";
import type { DashboardSectionPageQuery } from "@/gql/graphql";

/**
 * Pages several sections at once. Each section is an independent GitHub search, so only the
 * final merge into the shared snapshot has to be ordered; fetching them one after another cost
 * one round trip per section for no reason.
 */
export async function fetchAllDashboardSections(
  initial: DashboardSnapshot,
  sections: readonly DashboardSection[],
  fetchPage: (section: DashboardSection, cursor: string) => Promise<DashboardSectionPageQuery>,
  assertAccount: (dashboard: DashboardSectionPageQuery) => void,
  canFetchPage: () => Promise<boolean> = async () => true,
): Promise<DashboardSnapshot> {
  const collected = await Promise.all(
    sections.map((section) =>
      collectSectionPages(
        initial,
        section,
        (cursor) => fetchPage(section, cursor),
        assertAccount,
        canFetchPage,
      ),
    ),
  );

  let dashboard = initial;
  for (const [index, section] of sections.entries()) {
    for (const page of collected[index] ?? []) {
      dashboard = mergeDashboardSection(dashboard, page, section);
    }
  }
  return dashboard;
}

export function fetchAllDashboardSection(
  initial: DashboardSnapshot,
  section: DashboardSection,
  fetchPage: (cursor: string) => Promise<DashboardSectionPageQuery>,
  assertAccount: (dashboard: DashboardSectionPageQuery) => void,
  canFetchPage: () => Promise<boolean> = async () => true,
): Promise<DashboardSnapshot> {
  return fetchAllDashboardSections(
    initial,
    [section],
    (_section, cursor) => fetchPage(cursor),
    assertAccount,
    canFetchPage,
  );
}

/** Walks one section's cursors, returning the pages rather than a merged snapshot. */
async function collectSectionPages(
  initial: DashboardSnapshot,
  section: DashboardSection,
  fetchPage: (cursor: string) => Promise<DashboardSectionPageQuery>,
  assertAccount: (dashboard: DashboardSectionPageQuery) => void,
  canFetchPage: () => Promise<boolean>,
): Promise<DashboardSectionPageQuery[]> {
  const pages: DashboardSectionPageQuery[] = [];
  let dashboard = initial;
  const seenCursors = new Set<string>();

  while (dashboard[section].pageInfo.hasNextPage) {
    const cursor = dashboard[section].pageInfo.endCursor;
    const loadedCount = dashboard[section].nodes?.length ?? 0;
    if (!cursor || seenCursors.has(cursor) || loadedCount >= MAX_SEARCH_RESULTS) break;
    seenCursors.add(cursor);

    // Each page costs rate-limit points, so stop paging once the budget is low.
    // eslint-disable-next-line no-await-in-loop -- The budget must be rechecked before every page.
    if (!(await canFetchPage())) break;

    // eslint-disable-next-line no-await-in-loop -- Forward pagination requires the previous page's cursor.
    const page = await fetchPage(cursor);
    assertAccount(page);
    pages.push(page);
    dashboard = mergeDashboardSection(dashboard, page, section);
  }

  return pages;
}
