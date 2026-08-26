import { describe, expect, it, vi } from "vitest";
import { fetchAllDashboardSection, fetchAllDashboardSections } from "@/data/dashboard-pagination";
import type { DashboardSection } from "@/data/dashboard-sections";
import { connection, dashboardSnapshot, issueNode } from "@/data/test-fixtures";
import type { DashboardSectionPageQuery } from "@/gql/graphql";

function sectionPage(
  nodes: DashboardSectionPageQuery["page"]["nodes"],
  hasNextPage = false,
  endCursor: string | null = null,
): DashboardSectionPageQuery {
  return {
    rateLimit: null,
    viewer: { login: "octocat" },
    page: { issueCount: nodes?.length ?? 0, pageInfo: { hasNextPage, endCursor }, nodes },
  };
}

describe("fetchAllDashboardSection", () => {
  it("follows cursors using a one-section query and preserves other expanded sections", async () => {
    const firstNodes = Array.from({ length: 20 }, (_, index) =>
      issueNode({ id: `first-${index}` }),
    );
    const secondNodes = Array.from({ length: 20 }, (_, index) =>
      issueNode({ id: `second-${index}` }),
    );
    const existingMention = issueNode({ id: "mention" });
    const initial = dashboardSnapshot({
      ownedIssues: {
        ...connection(firstNodes),
        issueCount: 40,
        pageInfo: { hasNextPage: true, endCursor: "owned-page-1" },
      },
      mentioned: connection([existingMention]),
    });
    const fetchPage = vi.fn<(cursor: string) => Promise<DashboardSectionPageQuery>>(async () =>
      sectionPage(secondNodes),
    );
    const assertAccount = vi.fn<(dashboard: DashboardSectionPageQuery) => void>();

    const result = await fetchAllDashboardSection(initial, "ownedIssues", fetchPage, assertAccount);

    expect(fetchPage).toHaveBeenCalledWith("owned-page-1");
    expect(assertAccount).toHaveBeenCalledOnce();
    expect(result.ownedIssues.nodes).toHaveLength(40);
    expect(result.mentioned.nodes).toEqual([existingMention]);
  });

  it("starts independent sections in parallel", async () => {
    const initial = dashboardSnapshot({
      reviewRequests: {
        ...connection([]),
        issueCount: 1,
        pageInfo: { hasNextPage: true, endCursor: "review-page-1" },
      },
      assignedIssues: {
        ...connection([]),
        issueCount: 1,
        pageInfo: { hasNextPage: true, endCursor: "issue-page-1" },
      },
    });
    const pages = {
      reviewRequests: Promise.withResolvers<DashboardSectionPageQuery>(),
      assignedIssues: Promise.withResolvers<DashboardSectionPageQuery>(),
    };
    const fetchPage = vi.fn<
      (section: DashboardSection, cursor: string) => Promise<DashboardSectionPageQuery>
    >(async (section) =>
      section === "reviewRequests" ? pages.reviewRequests.promise : pages.assignedIssues.promise,
    );

    const fetching = fetchAllDashboardSections(
      initial,
      ["reviewRequests", "assignedIssues"],
      fetchPage,
      () => undefined,
    );

    await vi.waitFor(() => expect(fetchPage).toHaveBeenCalledTimes(2));
    pages.reviewRequests.resolve(sectionPage([]));
    pages.assignedIssues.resolve(sectionPage([]));
    await fetching;
  });

  it("stops if GitHub repeats a cursor", async () => {
    const initial = dashboardSnapshot({
      reviewRequests: {
        ...connection([]),
        issueCount: 40,
        pageInfo: { hasNextPage: true, endCursor: "repeated" },
      },
    });
    const fetchPage = vi.fn<(cursor: string) => Promise<DashboardSectionPageQuery>>(async () =>
      sectionPage([], true, "repeated"),
    );

    await fetchAllDashboardSection(initial, "reviewRequests", fetchPage, () => undefined);

    expect(fetchPage).toHaveBeenCalledOnce();
  });

  it("stops paging when the rate-limit budget runs out", async () => {
    const initial = dashboardSnapshot({
      ownedIssues: {
        ...connection([issueNode({ id: "first" })]),
        issueCount: 40,
        pageInfo: { hasNextPage: true, endCursor: "owned-page-1" },
      },
    });
    const fetchPage = vi.fn<(cursor: string) => Promise<DashboardSectionPageQuery>>();

    const result = await fetchAllDashboardSection(
      initial,
      "ownedIssues",
      fetchPage,
      () => undefined,
      async () => false,
    );

    expect(fetchPage).not.toHaveBeenCalled();
    expect(result.ownedIssues.nodes).toHaveLength(1);
  });
});
