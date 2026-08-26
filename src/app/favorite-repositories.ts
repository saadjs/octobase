import { buildAttentionQueue } from "@/data/attention";
import { issueCards, pullRequestCards } from "@/app/dashboard-items";
import type { DashboardSnapshot } from "@/data/github";
import type { PinnableRepository } from "@/data/viewer-repositories";

/** Pins are addressed by the digit keys, so nine is the whole keyboard row. */
export const MAX_FAVORITE_REPOSITORIES = 9;

const REPOSITORY_PATH = /^([\w.-]+)\/([\w.-]+)$/u;

export interface RepositoryOption {
  nameWithOwner: string;
  isPrivate?: boolean;
}

export interface FavoriteRepository {
  nameWithOwner: string;
  owner: string;
  name: string;
  url: string;
}

/** Accepts `owner/name` or a pasted github.com URL; returns undefined for anything else. */
export function parseRepositoryName(input: string): FavoriteRepository | undefined {
  const path = input
    .trim()
    .replace(/^(https?:\/\/)?(www\.)?github\.com\//iu, "")
    .replace(/\.git$/iu, "")
    .replace(/^\/+|\/+$/gu, "");
  if (!REPOSITORY_PATH.test(path)) return undefined;
  const [owner, name] = path.split("/");
  if (!owner || !name || name === "." || name === "..") return undefined;
  return toFavorite(`${owner}/${name}`);
}

export function favoriteRepositories(names: readonly string[]): FavoriteRepository[] {
  return names.slice(0, MAX_FAVORITE_REPOSITORIES).map(toFavorite);
}

export function isFavoriteRepository(names: readonly string[], nameWithOwner: string): boolean {
  return indexOfFavorite(names, nameWithOwner) !== -1;
}

export function addFavoriteRepository(names: readonly string[], nameWithOwner: string): string[] {
  if (isFavoriteRepository(names, nameWithOwner)) return [...names];
  return [...names, nameWithOwner].slice(0, MAX_FAVORITE_REPOSITORIES);
}

export function removeFavoriteRepository(
  names: readonly string[],
  nameWithOwner: string,
): string[] {
  const index = indexOfFavorite(names, nameWithOwner);
  if (index === -1) return [...names];
  return names.filter((_, position) => position !== index);
}

export function toggleFavoriteRepository(
  names: readonly string[],
  nameWithOwner: string,
): string[] {
  return isFavoriteRepository(names, nameWithOwner)
    ? removeFavoriteRepository(names, nameWithOwner)
    : addFavoriteRepository(names, nameWithOwner);
}

export function moveFavoriteRepository(
  names: readonly string[],
  nameWithOwner: string,
  offset: number,
): string[] {
  const index = indexOfFavorite(names, nameWithOwner);
  const target = index + offset;
  if (index === -1 || target < 0 || target >= names.length) return [...names];
  const moved = names[index];
  if (moved === undefined) return [...names];
  const next = names.filter((_, position) => position !== index);
  next.splice(target, 0, moved);
  return next;
}

/** Repositories already visible in the snapshot, so pinning never needs an extra request. */
export function repositorySuggestions(
  dashboard: DashboardSnapshot | undefined,
  pinned: readonly string[],
  query: string,
): string[] {
  if (!dashboard) return [];
  const seen = new Set(pinned.map(normalizeRepositoryName));
  const matches: string[] = [];
  const search = query.trim().toLowerCase();
  for (const nameWithOwner of snapshotRepositoryNames(dashboard)) {
    const key = normalizeRepositoryName(nameWithOwner);
    if (seen.has(key)) continue;
    if (search && !key.includes(search)) continue;
    seen.add(key);
    matches.push(nameWithOwner);
  }
  return matches.toSorted((left, right) => left.localeCompare(right));
}

/**
 * The pin type-ahead's list: repositories from open work first, then the account's own and
 * contributed-to repositories, most recently pushed first. An empty query shows the top of both.
 */
export function repositoryOptions(
  dashboard: DashboardSnapshot | undefined,
  available: readonly PinnableRepository[],
  pinned: readonly string[],
  query: string,
  limit: number,
): RepositoryOption[] {
  const search = normalizeRepositoryName(query).replace(
    /^(https?:\/\/)?(www\.)?github\.com\//u,
    "",
  );
  const seen = new Set(pinned.map(normalizeRepositoryName));
  const options: RepositoryOption[] = [];
  const known = new Map(
    available.map((repository) => [normalizeRepositoryName(repository.nameWithOwner), repository]),
  );
  const candidates = [
    ...repositorySuggestions(dashboard, pinned, query),
    ...available.map((repository) => repository.nameWithOwner),
  ];
  for (const nameWithOwner of candidates) {
    if (options.length >= limit) break;
    const key = normalizeRepositoryName(nameWithOwner);
    if (seen.has(key)) continue;
    if (search && !key.includes(search)) continue;
    seen.add(key);
    options.push({ nameWithOwner, isPrivate: known.get(key)?.isPrivate });
  }
  return options;
}

function snapshotRepositoryNames(dashboard: DashboardSnapshot): string[] {
  const names: string[] = [];
  for (const item of buildAttentionQueue(dashboard)) {
    names.push(
      item.kind === "pull-request"
        ? item.pullRequest.repository.nameWithOwner
        : item.issue.repository.nameWithOwner,
    );
  }
  for (const item of pullRequestCards(dashboard.ownedPullRequests.nodes)) {
    names.push(item.repository.nameWithOwner);
  }
  for (const item of issueCards(dashboard.ownedIssues.nodes)) {
    names.push(item.repository.nameWithOwner);
  }
  for (const item of pullRequestCards(dashboard.contributedPullRequests.nodes)) {
    names.push(item.repository.nameWithOwner);
  }
  for (const item of issueCards(dashboard.contributedIssues.nodes)) {
    names.push(item.repository.nameWithOwner);
  }
  return names;
}

function toFavorite(nameWithOwner: string): FavoriteRepository {
  const separator = nameWithOwner.indexOf("/");
  return {
    nameWithOwner,
    owner: nameWithOwner.slice(0, separator),
    name: nameWithOwner.slice(separator + 1),
    url: `https://github.com/${nameWithOwner}`,
  };
}

function indexOfFavorite(names: readonly string[], nameWithOwner: string): number {
  const key = normalizeRepositoryName(nameWithOwner);
  return names.findIndex((entry) => normalizeRepositoryName(entry) === key);
}

function normalizeRepositoryName(nameWithOwner: string): string {
  return nameWithOwner.trim().toLowerCase();
}
