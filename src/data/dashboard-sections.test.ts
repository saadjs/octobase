import { print } from "graphql";
import { describe, expect, it } from "vitest";
import {
  ATTENTION_SECTIONS,
  COUNT_SECTIONS,
  DASHBOARD_SECTIONS,
  dashboardSectionRule,
  dashboardTabForSection,
  mergeDashboardSection,
} from "@/data/dashboard-sections";
import { connection, dashboardSnapshot, issueNode, pullRequestNode } from "@/data/test-fixtures";
import { DashboardDocument, type DashboardSectionPageQuery } from "@/gql/graphql";

function dashboardSearches(): Map<string, string> {
  const searches = new Map<string, string>();
  for (const match of print(DashboardDocument).matchAll(/(\w+): search\(\s*query: "([^"]+)"/g)) {
    const [, alias, query] = match;
    if (alias && query) searches.set(alias, query);
  }
  return searches;
}

describe("Dashboard section rules", () => {
  it("classifies every Dashboard section by tab and count behavior", () => {
    expect(DASHBOARD_SECTIONS).toHaveLength(12);
    expect(ATTENTION_SECTIONS).toEqual(
      DASHBOARD_SECTIONS.filter((section) => dashboardTabForSection(section) === "attention"),
    );
    expect(COUNT_SECTIONS).toEqual(
      DASHBOARD_SECTIONS.filter((section) => dashboardSectionRule(section).counted),
    );
  });

  it("keeps each cursor search aligned with the monolithic Dashboard query", () => {
    const searches = dashboardSearches();

    expect([...searches.keys()]).toEqual(DASHBOARD_SECTIONS);
    for (const section of DASHBOARD_SECTIONS) {
      expect(dashboardSectionRule(section).searchQuery).toBe(searches.get(section));
    }
  });

  it("routes every page into its requested Dashboard section", () => {
    for (const section of DASHBOARD_SECTIONS) {
      const page: DashboardSectionPageQuery = {
        rateLimit: null,
        viewer: { login: "octocat" },
        page: {
          issueCount: 2,
          pageInfo: { hasNextPage: false, endCursor: null },
          nodes: [issueNode({ id: `${section}-issue` }), pullRequestNode({ id: `${section}-pr` })],
        },
      };

      const merged = mergeDashboardSection(dashboardSnapshot(), page, section);
      const expectedIds =
        dashboardSectionRule(section).itemKind === "issue"
          ? [`${section}-issue`]
          : dashboardSectionRule(section).itemKind === "pull-request"
            ? [`${section}-pr`]
            : [`${section}-issue`, `${section}-pr`];
      expect(merged[section].nodes?.map((node) => node?.id)).toEqual(expectedIds);
    }
  });

  it("appends only the item kind accepted by a section and preserves other sections", () => {
    const existingIssue = issueNode({ id: "existing" });
    const preservedMention = issueNode({ id: "mention" });
    const dashboard = dashboardSnapshot({
      ownedIssues: {
        ...connection([existingIssue]),
        issueCount: 3,
        pageInfo: { hasNextPage: true, endCursor: "page-1" },
      },
      mentioned: connection([preservedMention]),
    });
    const page: DashboardSectionPageQuery = {
      rateLimit: null,
      viewer: { login: "octocat" },
      page: {
        issueCount: 3,
        pageInfo: { hasNextPage: false, endCursor: null },
        nodes: [issueNode({ id: "next" }), pullRequestNode({ id: "wrong-kind" })],
      },
    };

    const merged = mergeDashboardSection(dashboard, page, "ownedIssues");

    expect(merged.ownedIssues.nodes?.map((node) => node?.id)).toEqual(["existing", "next"]);
    expect(merged.mentioned.nodes).toEqual([preservedMention]);
  });
});
