import { print } from "graphql";
import { describe, expect, it } from "vitest";
import { COUNT_SECTIONS } from "@/data/dashboard-counts";
import { DashboardCountsDocument, DashboardDocument } from "@/gql/graphql";

/** `alias: search(query: "…"` pairs from a printed operation. */
function searches(document: string): Map<string, string> {
  const found = new Map<string, string>();
  for (const match of document.matchAll(/(\w+): search\(\s*query: "([^"]+)"/g)) {
    const [, alias, query] = match;
    if (alias && query) found.set(alias, query);
  }
  return found;
}

describe("DashboardCounts operation", () => {
  const counts = print(DashboardCountsDocument);

  it("counts every section the dashboard fetches lazily, and nothing else", () => {
    expect([...searches(counts).keys()]).toEqual([...COUNT_SECTIONS]);
  });

  it("asks GitHub the same searches the dashboard itself uses", () => {
    const dashboard = searches(print(DashboardDocument));
    for (const section of COUNT_SECTIONS) {
      expect(searches(counts).get(section)).toBe(dashboard.get(section));
    }
  });

  // GitHub bills a query by the nodes its `first` arguments ask for, so counting stays 1 point.
  it("requests no card nodes", () => {
    expect(counts).not.toContain("nodes");
    expect(counts).not.toContain("PullRequestCard");
    expect(counts).not.toContain("IssueCard");
    expect([...counts.matchAll(/first: (\d+)/g)].map(([, size]) => size)).toEqual(
      COUNT_SECTIONS.map(() => "1"),
    );
  });
});
