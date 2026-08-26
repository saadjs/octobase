import * as v from "valibot";
import type { TokenSource } from "@/auth/types";
import { GitHubApiError } from "@/data/github";

const API_ROOT = "https://api.github.com";
const PAGE_SIZE = 100;
/** A hard ceiling so a wrong `total_count` can never fan out into thousands of requests. */
const MAX_INSTALLATION_PAGES = 20;

const permissionLevelSchema = v.union([v.literal("read"), v.literal("write"), v.literal("admin")]);
const repositoryCountResponseSchema = v.object({ total_count: v.number() });
const repositoryMarkerPageSchema = v.array(v.object({ id: v.number() }));
const installationSchema = v.object({
  id: v.number(),
  account: v.object({
    login: v.string(),
    type: v.string(),
    avatar_url: v.string(),
  }),
  permissions: v.optional(v.record(v.string(), permissionLevelSchema)),
  repository_selection: v.union([v.literal("all"), v.literal("selected")]),
  html_url: v.string(),
});
const installationsResponseSchema = v.object({
  total_count: v.number(),
  installations: v.array(installationSchema),
});
const viewerResponseSchema = v.object({
  id: v.number(),
  login: v.string(),
});

export interface AccessPermission {
  name: string;
  level: "read" | "write" | "admin";
}

export interface RepositoryInstallationAccess {
  id: number;
  accountLogin: string;
  accountType: string;
  avatarUrl: string;
  repositorySelection: "all" | "selected";
  manageUrl: string;
  permissions: AccessPermission[];
  repositoryCount: number;
}

export interface GitHubAppRepositoryAccess {
  kind: "app";
  repositoryCount: number;
  installations: RepositoryInstallationAccess[];
  fetchedAt: string;
}

export interface PersonalTokenRepositoryAccess {
  kind: "personal-token";
  source: Exclude<TokenSource, "app">;
  repositoryCount: number;
  scopes: string[];
  fetchedAt: string;
}

export type RepositoryAccess = GitHubAppRepositoryAccess | PersonalTokenRepositoryAccess;

export interface GitHubViewerIdentity {
  id: number;
  login: string;
}

export async function fetchPersonalInstallationState(
  accessToken: string,
  accountLogin: string,
): Promise<boolean> {
  const installations = await fetchAllInstallations(accessToken);
  return installations.some(
    (installation) =>
      installation.account.type === "User" &&
      installation.account.login.toLowerCase() === accountLogin.toLowerCase(),
  );
}

export async function fetchGitHubViewerIdentity(
  accessToken: string,
): Promise<GitHubViewerIdentity> {
  const response = await requestGitHub("/user", accessToken);
  const result = v.safeParse(viewerResponseSchema, await response.json());
  if (!result.success) throw new GitHubApiError("GitHub returned invalid viewer identity data.");
  return result.output;
}

export async function fetchRepositoryAccess(
  accessToken: string,
): Promise<GitHubAppRepositoryAccess> {
  const installations = await fetchAllInstallations(accessToken);
  const access = await Promise.all(
    installations.map(async (installation): Promise<RepositoryInstallationAccess> => ({
      id: installation.id,
      accountLogin: installation.account.login,
      accountType: installation.account.type,
      avatarUrl: installation.account.avatar_url,
      repositorySelection: installation.repository_selection,
      manageUrl: installation.html_url,
      permissions: Object.entries(installation.permissions ?? {})
        .map(([name, level]) => ({ name, level }))
        .toSorted((left, right) => left.name.localeCompare(right.name)),
      repositoryCount: await fetchInstallationRepositoryCount(accessToken, installation.id),
    })),
  );

  return {
    kind: "app",
    repositoryCount: access.reduce(
      (total, installation) => total + installation.repositoryCount,
      0,
    ),
    installations: access.toSorted((left, right) =>
      left.accountLogin.localeCompare(right.accountLogin),
    ),
    fetchedAt: new Date().toISOString(),
  };
}

export async function fetchPersonalTokenRepositoryAccess(
  accessToken: string,
  source: Exclude<TokenSource, "app">,
): Promise<PersonalTokenRepositoryAccess> {
  // One item makes the last-page number in GitHub's Link header equal the exact repository count.
  const response = await requestGitHub(
    "/user/repos?visibility=all&affiliation=owner,collaborator,organization_member&sort=full_name&direction=asc&per_page=1&page=1",
    accessToken,
  );
  const result = v.safeParse(repositoryMarkerPageSchema, await response.json());
  if (!result.success) {
    throw new GitHubApiError("GitHub returned invalid repository access data.");
  }
  const scopes =
    source === "classic"
      ? (response.headers
          .get("X-OAuth-Scopes")
          ?.split(",")
          .map((scope) => scope.trim())
          .filter(Boolean) ?? [])
      : [];

  return {
    kind: "personal-token",
    source,
    repositoryCount: repositoryCountFromPagination(
      response.headers.get("Link"),
      result.output.length,
    ),
    scopes,
    fetchedAt: new Date().toISOString(),
  };
}

async function fetchAllInstallations(
  accessToken: string,
): Promise<v.InferOutput<typeof installationSchema>[]> {
  const first = await fetchInstallationPage(accessToken, 1);
  const rest = await Promise.all(
    remainingPages(first.total_count, first.installations.length).map((page) =>
      fetchInstallationPage(accessToken, page),
    ),
  );
  return [first, ...rest].flatMap((response) => response.installations);
}

async function fetchInstallationPage(
  accessToken: string,
  page: number,
): Promise<v.InferOutput<typeof installationsResponseSchema>> {
  const response = await requestGitHub(
    `/user/installations?per_page=${PAGE_SIZE}&page=${page}`,
    accessToken,
  );
  const result = v.safeParse(installationsResponseSchema, await response.json());
  if (!result.success)
    throw new GitHubApiError("GitHub returned invalid installation access data.");
  return result.output;
}

async function fetchInstallationRepositoryCount(
  accessToken: string,
  installationId: number,
): Promise<number> {
  const response = await requestGitHub(
    `/user/installations/${installationId}/repositories?per_page=1&page=1`,
    accessToken,
  );
  const result = v.safeParse(repositoryCountResponseSchema, await response.json());
  if (!result.success) throw new GitHubApiError("GitHub returned invalid repository access data.");
  return result.output.total_count;
}

/** Offset pagination can fan out from the first response's exact total. */
function remainingPages(totalCount: number, firstPageSize: number): number[] {
  if (firstPageSize === 0 || totalCount <= PAGE_SIZE) return [];
  const pages = Math.ceil(Math.min(totalCount, MAX_INSTALLATION_PAGES * PAGE_SIZE) / PAGE_SIZE);
  return Array.from({ length: pages - 1 }, (_, index) => index + 2);
}

function repositoryCountFromPagination(link: string | null, firstPageSize: number): number {
  if (firstPageSize === 0) return 0;
  const lastPage = link?.match(/[?&]page=(\d+)[^>]*>;\s*rel="last"/)?.[1];
  if (!lastPage) return firstPageSize;
  const count = Number.parseInt(lastPage, 10);
  return Number.isSafeInteger(count) && count > 0 ? count : firstPageSize;
}

async function requestGitHub(path: string, accessToken: string): Promise<Response> {
  const response = await fetch(`${API_ROOT}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!response.ok) throw new GitHubApiError("Could not load repository access.", response.status);
  return response;
}
