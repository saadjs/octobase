import {
  test as base,
  chromium,
  type BrowserContext,
  type Page,
  type Route,
  type Worker,
} from "@playwright/test";
import { fileURLToPath } from "node:url";
import type { DashboardSnapshot } from "../../../src/data/github";
import type {
  DashboardCountsQuery,
  DashboardSectionPageQuery,
  ViewerRepositoriesQuery,
} from "../../../src/gql/graphql";
import {
  e2eCounts,
  e2eDashboard,
  e2eViewerRepositories,
  e2eSectionPage,
  E2E_LOGIN,
} from "./dashboard-data";
import { githubPageHtml } from "./github-page";

const EXTENSION_PATH = fileURLToPath(new URL("../../../.output/chrome-mv3", import.meta.url));

export interface GraphQLCall {
  operationName: string;
  at: number;
}

export interface RestCall {
  path: string;
  at: number;
}

/** How many installations the REST stub serves, and how many repositories each one has. */
export interface InstallationInventory {
  installations: number;
  repositoriesPer: number;
}

export interface GraphQLFailure {
  status: number;
  body: string;
  headers?: Record<string, string>;
}

/** Stands in for github.com and api.github.com so e2e never needs a real account. */
export class GitHubStub {
  readonly graphqlCalls: GraphQLCall[] = [];
  readonly restCalls: RestCall[] = [];
  /** Where the extension sent the user on install, recorded before that tab is closed. */
  installTabUrl: string | undefined;
  private login = E2E_LOGIN;
  private snapshot: DashboardSnapshot = e2eDashboard();
  private sectionPage: DashboardSectionPageQuery = e2eSectionPage();
  private counts: DashboardCountsQuery = e2eCounts();
  private viewerRepositories: ViewerRepositoriesQuery = e2eViewerRepositories();
  private failure: GraphQLFailure | undefined;
  private delayMs = 0;
  private restDelayMs = 0;
  private installationInventory: InstallationInventory | undefined;

  setLogin(login: string): void {
    this.login = login;
  }

  setSnapshot(snapshot: DashboardSnapshot): void {
    this.snapshot = snapshot;
  }

  setSectionPage(page: DashboardSectionPageQuery): void {
    this.sectionPage = page;
  }

  setCounts(counts: DashboardCountsQuery): void {
    this.counts = counts;
  }

  setViewerRepositories(search: ViewerRepositoriesQuery): void {
    this.viewerRepositories = search;
  }

  callsFor(operationName: string): GraphQLCall[] {
    return this.graphqlCalls.filter((call) => call.operationName === operationName);
  }

  failWith(failure: GraphQLFailure | undefined): void {
    this.failure = failure;
  }

  setDelay(ms: number): void {
    this.delayMs = ms;
  }

  /** Latency for every REST round trip, so a paginated loop's cost is visible in wall time. */
  setRestDelay(ms: number): void {
    this.restDelayMs = ms;
  }

  /** Opt in to a working /user/installations; unset, the stub 404s exactly as before. */
  setInstallations(inventory: InstallationInventory | undefined): void {
    this.installationInventory = inventory;
  }

  restCallsFor(prefix: string): RestCall[] {
    return this.restCalls.filter((call) => call.path.startsWith(prefix));
  }

  pageHtml(): string {
    return githubPageHtml(this.login);
  }

  async handleGitHubPage(route: Route): Promise<void> {
    if (route.request().resourceType() !== "document") {
      await route.fulfill({ status: 204, body: "" });
      return;
    }
    await route.fulfill({ status: 200, contentType: "text/html", body: this.pageHtml() });
  }

  async handleGraphQL(route: Route): Promise<void> {
    // SAFETY: graphql-request always posts a JSON body of {query, variables, operationName}.
    const body = route.request().postDataJSON() as { operationName?: string } | null;
    this.graphqlCalls.push({ operationName: body?.operationName ?? "unknown", at: Date.now() });

    if (this.delayMs > 0) await new Promise((resolve) => setTimeout(resolve, this.delayMs));

    const failure = this.failure;
    if (failure) {
      await route.fulfill({
        status: failure.status,
        contentType: "application/json",
        headers: failure.headers,
        body: failure.body,
      });
      return;
    }

    const data = this.responseFor(body?.operationName);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data }),
    });
  }

  async handleRest(route: Route): Promise<void> {
    const url = new URL(route.request().url());
    this.restCalls.push({ path: url.pathname, at: Date.now() });
    if (this.restDelayMs > 0) await new Promise((resolve) => setTimeout(resolve, this.restDelayMs));

    const body = this.restBodyFor(url);
    if (!body) {
      await route.fulfill({ status: 404, contentType: "application/json", body: "{}" });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  }

  private restBodyFor(url: URL) {
    if (url.pathname === "/user") return { id: 1, login: this.login };

    const inventory = this.installationInventory;
    if (!inventory) return undefined;
    const page = Number(url.searchParams.get("page") ?? "1");
    const perPage = Number(url.searchParams.get("per_page") ?? "100");

    if (url.pathname === "/user/installations") {
      return {
        total_count: inventory.installations,
        installations: pageSlice(inventory.installations, page, perPage).map((index) => ({
          id: index + 1,
          account: {
            login: index === 0 ? this.login : `org-${index}`,
            type: index === 0 ? "User" : "Organization",
            avatar_url: "https://avatars.githubusercontent.com/u/1",
          },
          repository_selection: "selected",
          html_url: `https://github.com/settings/installations/${index + 1}`,
        })),
      };
    }

    if (/^\/user\/installations\/\d+\/repositories$/.test(url.pathname)) {
      return {
        total_count: inventory.repositoriesPer,
        repositories: pageSlice(inventory.repositoriesPer, page, perPage).map((index) => ({
          id: index + 1,
          full_name: `octo/repo-${index}`,
          private: false,
          html_url: `https://github.com/octo/repo-${index}`,
        })),
      };
    }
    return undefined;
  }

  private responseFor(operationName: string | undefined) {
    if (operationName === "DashboardSectionPage") return this.sectionPage;
    if (operationName === "DashboardCounts") return this.counts;
    if (operationName === "ViewerRepositories") return this.viewerRepositories;
    return this.snapshot;
  }
}

export interface OctobaseFixtures {
  context: BrowserContext;
  serviceWorker: Worker;
  extensionId: string;
  github: GitHubStub;
  connectAccount: (login?: string, source?: "app" | "fine-grained" | "classic") => Promise<void>;
}

const stubs = new WeakMap<BrowserContext, GitHubStub>();

async function registerRoutes(context: BrowserContext, stub: GitHubStub): Promise<void> {
  // Playwright matches the most recently registered route first, so the catch-all goes first.
  await context.route("https://api.github.com/**", (route) =>
    route.fulfill({ status: 404, contentType: "application/json", body: "{}" }),
  );
  await context.route("https://api.github.com/user", (route) => stub.handleRest(route));
  await context.route("https://api.github.com/user/installations**", (route) =>
    stub.handleRest(route),
  );
  await context.route("https://api.github.com/graphql", (route) => stub.handleGraphQL(route));
  await context.route("https://github.com/**", (route) => stub.handleGitHubPage(route));
  // Avatars are the only other network the dashboard reaches for.
  await context.route("https://*.githubusercontent.com/**", (route) =>
    route.fulfill({ status: 204, body: "" }),
  );
}

function isGitHubPage(page: Page): boolean {
  return page.url().startsWith("https://github.com/");
}

/** A fresh install opens github.com itself; specs start from a known tab set without it. */
async function closeInstallTab(context: BrowserContext, stub: GitHubStub): Promise<void> {
  const opened =
    context.pages().find((page) => isGitHubPage(page)) ??
    (await context
      .waitForEvent("page", { predicate: isGitHubPage, timeout: 10_000 })
      .catch(() => undefined));
  if (!opened) return;
  stub.installTabUrl = opened.url();
  await opened.close();
}

export const test = base.extend<OctobaseFixtures>({
  // oxlint-disable-next-line no-empty-pattern -- Playwright requires a destructuring pattern.
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext("", {
      channel: "chromium",
      args: [`--disable-extensions-except=${EXTENSION_PATH}`, `--load-extension=${EXTENSION_PATH}`],
    });
    // Surface content-script crashes; a silent one just looks like a missing element.
    context.on("page", (page) => {
      page.on("pageerror", (error) => console.error("[page error]", error.message));
    });

    const stub = new GitHubStub();
    stubs.set(context, stub);
    await registerRoutes(context, stub);
    await closeInstallTab(context, stub);

    await use(context);
    await context.close();
  },

  github: async ({ context }, use) => {
    const stub = stubs.get(context);
    if (!stub) throw new Error("The GitHub stub is created with the browser context.");
    await use(stub);
  },

  serviceWorker: async ({ context }, use) => {
    const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent("serviceworker"));
    await use(worker);
  },

  extensionId: async ({ serviceWorker }, use) => {
    await use(new URL(serviceWorker.url()).host);
  },

  connectAccount: async ({ serviceWorker }, use) => {
    await use(
      async (
        login: string = E2E_LOGIN,
        source: "app" | "fine-grained" | "classic" = "fine-grained",
      ) => {
        await serviceWorker.evaluate(
          async ([key, tokenSource]: [string, string]) => {
            await chrome.storage.local.set({
              [key]: { accessToken: "e2e-access-token", source: tokenSource },
            });
          },
          // SAFETY: both tuple members are strings assembled immediately above this call.
          [`github-token:${login.toLowerCase()}`, source] as [string, string],
        );
      },
    );
  },
});

export { expect } from "@playwright/test";
export { E2E_LOGIN };

/** The 0-based indexes REST page `page` covers, given `total` items at `perPage` each. */
function pageSlice(total: number, page: number, perPage: number): number[] {
  const start = (page - 1) * perPage;
  return Array.from({ length: Math.max(0, Math.min(perPage, total - start)) }, (_, i) => start + i);
}
