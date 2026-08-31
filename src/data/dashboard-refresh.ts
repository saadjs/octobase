import type { StoredToken, TokenMetadata } from "@/auth/types";
import { isDashboardForAccount, normalizeGitHubLogin } from "@/data/account";
import type { CachedDashboard } from "@/data/cache";
import { dashboardCounts, type DashboardCounts } from "@/data/dashboard-counts";
import { fetchAllDashboardSections } from "@/data/dashboard-pagination";
import type { DashboardTab } from "@/data/dashboard-preferences";
import { dashboardTabForSection, type DashboardSection } from "@/data/dashboard-sections";
import {
  dashboardFromAttention,
  GitHubApiError,
  mergeDashboardTab,
  mergeRefreshedDashboard,
  type DashboardSnapshot,
} from "@/data/github";
import { RateLimitedError, type RateLimitDecision, type RateLimitField } from "@/data/rate-limit";
import type {
  DashboardAttentionQuery,
  DashboardContributionsQuery,
  DashboardCountsQuery,
  DashboardOwnedQuery,
  DashboardSectionPageQuery,
} from "@/gql/graphql";
import { KeyedSerialQueue } from "@/lib/keyed-serial-queue";

export interface DashboardRefreshSelection {
  token: StoredToken;
  legacy: boolean;
}

export interface DashboardRefreshRequest {
  selected?: DashboardRefreshSelection;
  selectedTab?: DashboardTab;
  showAll?: readonly DashboardSection[];
  /** A snapshot the caller already read, so the refresh does not read the same row again. */
  cached?: CachedDashboard<DashboardSnapshot>;
}

export interface DashboardRefreshTokens {
  get(accountLogin: string): Promise<StoredToken | undefined>;
  getLegacy(): Promise<StoredToken | undefined>;
  set(accountLogin: string, accessToken: string, metadata: TokenMetadata): Promise<void>;
  clearLegacy(): Promise<void>;
  invalidate(accountLogin: string): Promise<void>;
}

export interface DashboardRefreshSource {
  fetchAttention(accessToken: string): Promise<DashboardAttentionQuery>;
  fetchCounts(accessToken: string): Promise<DashboardCountsQuery | undefined>;
  fetchOwned(accessToken: string): Promise<DashboardOwnedQuery>;
  fetchContributions(accessToken: string): Promise<DashboardContributionsQuery>;
  fetchSection(
    accessToken: string,
    section: DashboardSection,
    cursor: string,
  ): Promise<DashboardSectionPageQuery>;
}

export interface DashboardRefreshSnapshots {
  read(accountLogin: string): Promise<CachedDashboard<DashboardSnapshot> | undefined>;
  write(
    data: DashboardSnapshot,
    refreshedTabs?: readonly DashboardTab[],
  ): Promise<CachedDashboard<DashboardSnapshot>>;
  clear(accountLogin: string): Promise<void>;
}

export interface DashboardRefreshBudget {
  check(accountLogin: string): Promise<RateLimitDecision>;
  recordSuccess(accountLogin: string, rateLimit: RateLimitField): Promise<void>;
  recordRejection(accountLogin: string, retryAt?: string): Promise<void>;
  clear(accountLogin: string): Promise<void>;
}

export interface DashboardRefreshPublisher {
  publish(snapshot: CachedDashboard<DashboardSnapshot>): Promise<void>;
}

interface DashboardFetch {
  data: DashboardSnapshot;
  counting: Promise<DashboardCountsQuery | undefined>;
}

export class DashboardRefresh {
  private readonly accountOperations = new KeyedSerialQueue();
  private readonly inFlight = new Map<
    string,
    Promise<CachedDashboard<DashboardSnapshot> | undefined>
  >();

  constructor(
    private readonly tokens: DashboardRefreshTokens,
    private readonly source: DashboardRefreshSource,
    private readonly snapshots: DashboardRefreshSnapshots,
    private readonly budget: DashboardRefreshBudget,
    private readonly publisher: DashboardRefreshPublisher,
  ) {}

  /**
   * Identical concurrent refreshes share one GitHub round trip. The serial queue alone would run
   * them back to back, so a burst of remounts or focus events used to cost a fetch each.
   */
  run(
    accountLogin: string,
    request: DashboardRefreshRequest,
  ): Promise<CachedDashboard<DashboardSnapshot> | undefined> {
    const account = normalizeGitHubLogin(accountLogin);
    // A caller-supplied token targets one specific credential, so it never shares a result.
    if (request.selected) return this.queue(account, accountLogin, request);

    const key = `${account}|${request.selectedTab ?? ""}|${(request.showAll ?? []).join(",")}`;
    const existing = this.inFlight.get(key);
    if (existing) return existing;

    const started: Promise<CachedDashboard<DashboardSnapshot> | undefined> = this.queue(
      account,
      accountLogin,
      request,
    ).finally(() => {
      if (this.inFlight.get(key) === started) this.inFlight.delete(key);
    });
    this.inFlight.set(key, started);
    return started;
  }

  private queue(
    account: string,
    accountLogin: string,
    request: DashboardRefreshRequest,
  ): Promise<CachedDashboard<DashboardSnapshot> | undefined> {
    return this.accountOperations.run(account, () => this.runNow(accountLogin, request));
  }

  connect(accountLogin: string, accessToken: string, metadata: TokenMetadata): Promise<void> {
    return this.accountOperations.run(normalizeGitHubLogin(accountLogin), async () => {
      const fetched = await this.fetchDashboard(accountLogin, accessToken);
      this.assertAccount(fetched.data, accountLogin);
      await this.tokens.set(fetched.data.viewer.login, accessToken, metadata);
      const snapshot = await this.snapshots.write(fetched.data, ["attention"]);
      this.finishCounts(accountLogin, "attention", fetched.counting, snapshot);
    });
  }

  disconnect(accountLogin: string): Promise<void> {
    return this.accountOperations.run(normalizeGitHubLogin(accountLogin), async () => {
      await Promise.all([
        this.tokens.invalidate(accountLogin),
        this.snapshots.clear(accountLogin),
        this.budget.clear(accountLogin),
      ]);
    });
  }

  private async runNow(
    accountLogin: string,
    request: DashboardRefreshRequest,
  ): Promise<CachedDashboard<DashboardSnapshot> | undefined> {
    const showAll = request.showAll?.length ? request.showAll : undefined;
    // Token, budget and cache are three independent stores; reading them in series delayed
    // every fetch by the sum of three round trips instead of the slowest one.
    const [selected, decision, readCached] = await Promise.all([
      request.selected ?? this.selectToken(accountLogin),
      this.budget.check(accountLogin),
      request.cached ? Promise.resolve(request.cached) : this.readAccountSnapshot(accountLogin),
    ]);
    const selection = selected;
    if (!selection) return undefined;
    if (!decision.allowed) throw new RateLimitedError(decision.retryAt);

    try {
      const cached = readCached;
      const selectedTab = request.selectedTab ?? sectionsTab(showAll);
      const fetched =
        cached && showAll
          ? undefined
          : await this.fetchDashboard(accountLogin, selection.token.accessToken, selectedTab);
      let data = cached && showAll ? cached.data : fetched?.data;
      if (!data) return undefined;
      if (!showAll && cached) data = mergeRefreshedDashboard(cached.data, data, selectedTab);

      const currentToken = selection.legacy
        ? await this.tokens.getLegacy()
        : await this.tokens.get(accountLogin);
      if (currentToken?.accessToken !== selection.token.accessToken) return undefined;

      if (selection.legacy) {
        await this.tokens.set(data.viewer.login, selection.token.accessToken, selection.token);
        await this.tokens.clearLegacy();
      }

      this.assertAccount(data, accountLogin);
      if (showAll) {
        data = await fetchAllDashboardSections(
          data,
          showAll,
          (section, cursor) =>
            this.fetchSection(accountLogin, selection.token.accessToken, section, cursor),
          (page) => this.assertAccount(page, accountLogin),
          async () => (await this.budget.check(accountLogin)).allowed,
        );
        const connectedToken = await this.tokens.get(accountLogin);
        if (connectedToken?.accessToken !== selection.token.accessToken) return undefined;
      }

      const refreshedTabs = fetched
        ? selectedTab === "attention"
          ? (["attention"] as const)
          : (["attention", selectedTab] as const)
        : undefined;
      const snapshot = await this.snapshots.write(data, refreshedTabs);
      await this.publisher.publish(snapshot);
      if (fetched) this.finishCounts(accountLogin, selectedTab, fetched.counting, snapshot);
      return snapshot;
    } catch (error) {
      if (error instanceof GitHubApiError && error.status === 401) {
        const clearToken = selection.legacy
          ? this.tokens.clearLegacy()
          : this.tokens.invalidate(accountLogin);
        await Promise.all([
          clearToken,
          this.snapshots.clear(accountLogin),
          this.budget.clear(accountLogin),
        ]);
      }
      throw error;
    }
  }

  private async fetchDashboard(
    accountLogin: string,
    accessToken: string,
    selectedTab: DashboardTab = "attention",
  ): Promise<DashboardFetch> {
    try {
      // These operations are independent. Starting all of them before awaiting removes the
      // attention -> selected-tab network waterfall while retaining a smaller lazy tab payload.
      const counting = this.source.fetchCounts(accessToken).catch(() => undefined);
      const working =
        selectedTab === "attention"
          ? Promise.resolve(undefined)
          : selectedTab === "owned"
            ? this.source.fetchOwned(accessToken)
            : this.source.fetchContributions(accessToken);
      const [attention, work] = await Promise.all([
        this.source.fetchAttention(accessToken),
        working,
      ]);
      this.assertViewerLogin(attention.viewer.login, accountLogin);
      if (work) this.assertViewerLogin(work.viewer.login, accountLogin);
      // One write records the responses needed for the first paint. Counts finish separately so
      // tab badges never hold the attention queue behind a slower request.
      await this.budget.recordSuccess(
        accountLogin,
        tightestRateLimit([attention.rateLimit, work?.rateLimit]),
      );
      const dashboard = dashboardFromAttention(attention);
      return {
        data:
          !work || selectedTab === "attention"
            ? dashboard
            : mergeDashboardTab(dashboard, selectedTab, work),
        counting,
      };
    } catch (cause) {
      await this.recordRateLimitRejection(accountLogin, cause);
      throw cause;
    }
  }

  private finishCounts(
    accountLogin: string,
    selectedTab: DashboardTab,
    counting: Promise<DashboardCountsQuery | undefined>,
    initial: CachedDashboard<DashboardSnapshot>,
  ): void {
    // Keep the follow-up cache write ordered with refresh/disconnect operations. It remains off
    // the response path, but can no longer race a 401 cleanup and resurrect cleared account data.
    void this.accountOperations
      .run(normalizeGitHubLogin(accountLogin), () =>
        this.completeCounts(accountLogin, selectedTab, counting, initial),
      )
      .catch(() => undefined);
  }

  private async completeCounts(
    accountLogin: string,
    selectedTab: DashboardTab,
    counting: Promise<DashboardCountsQuery | undefined>,
    initial: CachedDashboard<DashboardSnapshot>,
  ): Promise<void> {
    const counted = await counting;
    const counts = accountCounts(counted, initial.data.viewer.login);
    if (!counted || !counts) return;

    await this.budget.recordSuccess(accountLogin, counted.rateLimit);
    const latest = await this.readAccountSnapshot(accountLogin);
    // A newer refresh owns the cache now; late badges from this request must not overwrite it.
    if (!latest || latest.fetchedAt !== initial.fetchedAt) return;

    const snapshot = await this.snapshots.write({
      ...latest.data,
      counts: mergeMeasuredTabCounts(latest.data, counts, selectedTab),
    });
    await this.publisher.publish(snapshot);
  }

  private async fetchSection(
    accountLogin: string,
    accessToken: string,
    section: DashboardSection,
    cursor: string,
  ): Promise<DashboardSectionPageQuery> {
    try {
      const data = await this.source.fetchSection(accessToken, section, cursor);
      await this.budget.recordSuccess(accountLogin, data.rateLimit);
      return data;
    } catch (cause) {
      await this.recordRateLimitRejection(accountLogin, cause);
      throw cause;
    }
  }

  private async selectToken(accountLogin: string): Promise<DashboardRefreshSelection | undefined> {
    const accountToken = await this.tokens.get(accountLogin);
    if (accountToken) return { token: accountToken, legacy: false };
    const legacyToken = await this.tokens.getLegacy();
    return legacyToken ? { token: legacyToken, legacy: true } : undefined;
  }

  private async readAccountSnapshot(
    accountLogin: string,
  ): Promise<CachedDashboard<DashboardSnapshot> | undefined> {
    const cached = await this.snapshots.read(accountLogin);
    return cached && isDashboardForAccount(cached.data, accountLogin) ? cached : undefined;
  }

  private assertAccount(
    data: DashboardSnapshot | DashboardSectionPageQuery,
    accountLogin: string,
  ): void {
    this.assertViewerLogin(data.viewer.login, accountLogin);
  }

  private assertViewerLogin(viewerLogin: string, accountLogin: string): void {
    if (normalizeGitHubLogin(viewerLogin) !== normalizeGitHubLogin(accountLogin)) {
      throw new DashboardRefreshAccountMismatchError();
    }
  }

  private async recordRateLimitRejection(accountLogin: string, cause: unknown): Promise<void> {
    if (cause instanceof GitHubApiError && cause.rateLimit) {
      await this.budget.recordRejection(accountLogin, cause.rateLimit.retryAt);
    }
  }
}

/** Every "show all" request comes from one tab's panels, so the first section names that tab. */
function sectionsTab(showAll: readonly DashboardSection[] | undefined): DashboardTab {
  const first = showAll?.[0];
  return first ? dashboardTabForSection(first) : "attention";
}

/** Counts are only trustworthy when GitHub answered for the same viewer the items came from. */
function accountCounts(
  counts: DashboardCountsQuery | undefined,
  viewerLogin: string,
): DashboardCounts | undefined {
  if (!counts) return undefined;
  return normalizeGitHubLogin(counts.viewer.login) === normalizeGitHubLogin(viewerLogin)
    ? dashboardCounts(counts)
    : undefined;
}

/** A loaded work tab measured its own sections exactly; generic badge counts must not replace it. */
function mergeMeasuredTabCounts(
  dashboard: DashboardSnapshot,
  counts: DashboardCounts,
  selectedTab: DashboardTab,
): DashboardCounts {
  if (selectedTab === "owned") {
    return {
      ...counts,
      ownedPullRequests: dashboard.ownedPullRequests.issueCount,
      ownedIssues: dashboard.ownedIssues.issueCount,
    };
  }
  if (selectedTab === "contributions") {
    return {
      ...counts,
      contributedPullRequests: dashboard.contributedPullRequests.issueCount,
      contributedIssues: dashboard.contributedIssues.issueCount,
    };
  }
  return counts;
}

/** The response that saw the least budget left is the one worth remembering. */
function tightestRateLimit(fields: readonly (RateLimitField | undefined)[]): RateLimitField {
  let tightest: RateLimitField = null;
  for (const field of fields) {
    if (!field) continue;
    if (!tightest || field.remaining < tightest.remaining) tightest = field;
  }
  return tightest;
}

export class DashboardRefreshAccountMismatchError extends Error {
  readonly code = "account_mismatch";

  constructor() {
    super(
      "The authorization completed for a different GitHub account. Switch to that account or connect the current one.",
    );
    this.name = "DashboardRefreshAccountMismatchError";
  }
}
