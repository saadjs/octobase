import { ClientError, GraphQLClient } from "graphql-request";
import {
  DashboardAttentionDocument,
  DashboardContributionsDocument,
  DashboardCountsDocument,
  DashboardOwnedDocument,
  DashboardSectionPageDocument,
  ViewerRepositoriesDocument,
  type DashboardAttentionQuery,
  type DashboardContributionsQuery,
  type DashboardCountsQuery,
  type DashboardQuery,
  type DashboardOwnedQuery,
  type DashboardSectionPageQuery,
  type ViewerRepositoriesQuery,
} from "@/gql/graphql";
import { tabCount, type DashboardCounts } from "@/data/dashboard-counts";
import type { DashboardTab } from "@/data/dashboard-preferences";
import { dashboardSectionRule, type DashboardSection } from "@/data/dashboard-sections";

/** GitHub search stops counting here, so a total at the cap is a floor, not a measurement. */
export const MAX_SEARCH_RESULTS = 1_000;

/** `counts` covers the tabs whose items are fetched lazily; absent means never fetched. */
export type DashboardSnapshot = DashboardQuery & { counts?: DashboardCounts };

export function dashboardFromAttention(
  attention: DashboardAttentionQuery,
  counts?: DashboardCounts,
): DashboardSnapshot {
  return {
    ...attention,
    ownedPullRequests: emptyConnection(),
    ownedIssues: emptyConnection(),
    contributedPullRequests: emptyConnection(),
    contributedIssues: emptyConnection(),
    counts,
  };
}

export function mergeDashboardTab(
  dashboard: DashboardSnapshot,
  tab: Exclude<DashboardTab, "attention">,
  data: DashboardOwnedQuery | DashboardContributionsQuery,
): DashboardSnapshot {
  if (tab === "owned" && "ownedPullRequests" in data) {
    return {
      ...dashboard,
      ownedPullRequests: data.ownedPullRequests,
      ownedIssues: data.ownedIssues,
      counts: refreshedCounts(dashboard, {
        ownedPullRequests: data.ownedPullRequests.issueCount,
        ownedIssues: data.ownedIssues.issueCount,
      }),
    };
  }
  if (tab === "contributions" && "contributedPullRequests" in data) {
    return {
      ...dashboard,
      contributedPullRequests: data.contributedPullRequests,
      contributedIssues: data.contributedIssues,
      counts: refreshedCounts(dashboard, {
        contributedPullRequests: data.contributedPullRequests.issueCount,
        contributedIssues: data.contributedIssues.issueCount,
      }),
    };
  }
  throw new Error("Dashboard tab and GraphQL response did not match.");
}

export function mergeRefreshedDashboard(
  cached: DashboardSnapshot,
  fresh: DashboardSnapshot,
  selectedTab: DashboardTab,
): DashboardSnapshot {
  return {
    ...cached,
    ...fresh,
    ownedPullRequests: selectedTab === "owned" ? fresh.ownedPullRequests : cached.ownedPullRequests,
    ownedIssues: selectedTab === "owned" ? fresh.ownedIssues : cached.ownedIssues,
    contributedPullRequests:
      selectedTab === "contributions"
        ? fresh.contributedPullRequests
        : cached.contributedPullRequests,
    contributedIssues:
      selectedTab === "contributions" ? fresh.contributedIssues : cached.contributedIssues,
    // Counts come from their own query on every refresh, so they lead the items they describe.
    counts: fresh.counts ?? cached.counts,
  };
}

/** A tab fetch measures its own two sections exactly, so those totals are kept either way. */
function refreshedCounts(dashboard: DashboardSnapshot, measured: DashboardCounts): DashboardCounts {
  return { ...dashboard.counts, ...measured };
}

function emptyConnection() {
  return {
    issueCount: 0,
    pageInfo: { hasNextPage: false, endCursor: null },
    nodes: [],
  };
}

/** GitHub told us to stop; `retryAt` is its own deadline when it sent one. */
export interface GitHubRateLimitRejection {
  retryAt?: string;
}

export class GitHubApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly rateLimit?: GitHubRateLimitRejection,
  ) {
    super(message);
    this.name = "GitHubApiError";
  }
}

export function fetchDashboardAttention(accessToken: string): Promise<DashboardAttentionQuery> {
  return requestGitHubGraphQL(accessToken, (client) => client.request(DashboardAttentionDocument));
}

export function fetchDashboardCounts(accessToken: string): Promise<DashboardCountsQuery> {
  return requestGitHubGraphQL(accessToken, (client) => client.request(DashboardCountsDocument));
}

export function fetchDashboardOwned(accessToken: string): Promise<DashboardOwnedQuery> {
  return requestGitHubGraphQL(accessToken, (client) => client.request(DashboardOwnedDocument));
}

export function fetchDashboardContributions(
  accessToken: string,
): Promise<DashboardContributionsQuery> {
  return requestGitHubGraphQL(accessToken, (client) =>
    client.request(DashboardContributionsDocument),
  );
}

/** Fetches one cursor page without re-running the other ten dashboard searches. */
export function fetchDashboardSection(
  accessToken: string,
  section: DashboardSection,
  cursor: string,
): Promise<DashboardSectionPageQuery> {
  return requestGitHubGraphQL(accessToken, (client) =>
    client.request(DashboardSectionPageDocument, {
      query: dashboardSectionRule(section).searchQuery,
      cursor,
    }),
  );
}

/** The pin type-ahead's whole candidate list, fetched once and filtered locally. */
export function fetchViewerRepositories(
  accessToken: string,
  first: number,
): Promise<ViewerRepositoriesQuery> {
  return requestGitHubGraphQL(accessToken, (client) =>
    client.request(ViewerRepositoriesDocument, { first }),
  );
}

async function requestGitHubGraphQL<T>(
  accessToken: string,
  request: (client: GraphQLClient) => Promise<T>,
): Promise<T> {
  try {
    return await request(githubClient(accessToken));
  } catch (cause) {
    throw asGitHubApiError(cause);
  }
}

function asGitHubApiError(cause: unknown): Error {
  if (cause instanceof ClientError) {
    return new GitHubApiError(
      cause.message,
      cause.response.status,
      rateLimitRejection(cause.response),
    );
  }
  // SAFETY: JavaScript permits any value to be thrown; Error preserves the original failure text.
  return cause instanceof Error ? cause : new Error(String(cause));
}

function githubClient(accessToken: string): GraphQLClient {
  return new GraphQLClient("https://api.github.com/graphql", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
}

type ClientErrorResponse = ClientError["response"];

/** Primary limits answer 403/429 with reset headers; GraphQL limits answer 200 with an error. */
function rateLimitRejection(response: ClientErrorResponse): GitHubRateLimitRejection | undefined {
  const headers = response.headers;
  const exhausted = headers?.get("x-ratelimit-remaining") === "0";
  const limited =
    response.status === 429 ||
    (response.status === 403 && (exhausted || headers?.get("retry-after") !== null)) ||
    (response.errors?.some((error) => /rate limit/i.test(error.message)) ?? false);

  return limited ? { retryAt: retryAt(headers, exhausted) } : undefined;
}

function retryAt(headers: Headers | undefined, exhausted: boolean): string | undefined {
  const retryAfter = Number(headers?.get("retry-after"));
  if (Number.isFinite(retryAfter) && retryAfter > 0) {
    return new Date(Date.now() + retryAfter * 1_000).toISOString();
  }
  const reset = Number(headers?.get("x-ratelimit-reset"));
  if (exhausted && Number.isFinite(reset) && reset > 0)
    return new Date(reset * 1_000).toISOString();
  return undefined;
}

/** A cached snapshot only holds tabs already fetched, so an empty tab with work left is unloaded. */
export function isDashboardTabLoaded(dashboard: DashboardSnapshot, tab: DashboardTab): boolean {
  if (tab === "attention") return true;
  const total = tabCount(tab, dashboard.counts);
  if (total === undefined) return false;
  if (total === 0) return true;
  const loaded =
    tab === "owned"
      ? (dashboard.ownedPullRequests.nodes?.length ?? 0) +
        (dashboard.ownedIssues.nodes?.length ?? 0)
      : (dashboard.contributedPullRequests.nodes?.length ?? 0) +
        (dashboard.contributedIssues.nodes?.length ?? 0);
  return loaded > 0;
}
