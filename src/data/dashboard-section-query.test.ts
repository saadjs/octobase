import { print } from "graphql";
import { describe, expect, it, vi } from "vitest";
import { fetchDashboardSection } from "@/data/github";
import { DashboardDocument } from "@/gql/graphql";
import type { DashboardSection } from "@/messages";

/** Every `alias: search(query: "…")` in the monolithic dashboard operation. */
function dashboardSearches(): Map<string, string> {
  const searches = new Map<string, string>();
  for (const match of print(DashboardDocument).matchAll(/(\w+): search\(\s*query: "([^"]+)"/g)) {
    const [, alias, query] = match;
    if (alias && query) searches.set(alias, query);
  }
  return searches;
}

async function requestedSearchQuery(section: DashboardSection): Promise<string> {
  const fetchMock = vi
    .fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>()
    .mockResolvedValue(
      new Response(JSON.stringify({ data: { rateLimit: null, viewer: { login: "octocat" } } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
  vi.stubGlobal("fetch", fetchMock);

  await fetchDashboardSection("token", section, "cursor-1");
  const body = fetchMock.mock.calls[0]?.[1]?.body;
  // SAFETY: graphql-request always posts a JSON string body.
  const sent = JSON.parse(body as string) as { variables: { query: string; cursor: string } };
  vi.unstubAllGlobals();
  return sent.variables.query;
}

describe("fetchDashboardSection", () => {
  const searches = dashboardSearches();

  it("covers every search in the dashboard operation", () => {
    expect(searches.size).toBe(12);
  });

  for (const [alias, query] of searches) {
    it(`asks GitHub for the same ${alias} search the dashboard uses`, async () => {
      // SAFETY: every alias in the dashboard operation is a DashboardSection by construction.
      expect(await requestedSearchQuery(alias as DashboardSection)).toBe(query);
    });
  }
});
