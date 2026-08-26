import type { PinnableRepositoryFragment, ViewerRepositoriesQuery } from "@/gql/graphql";

/** One page of each connection covers far more than nine pins ever need. */
export const VIEWER_REPOSITORY_PAGE_SIZE = 100;

export interface PinnableRepository {
  id: string;
  nameWithOwner: string;
  url: string;
  isPrivate: boolean;
}

/**
 * Owned, collaborated, and organization repositories first, then the ones this account has only
 * contributed to. Both arrive most-recently-pushed first, which is the order worth keeping.
 */
export function viewerRepositories(data: ViewerRepositoriesQuery): PinnableRepository[] {
  const seen = new Set<string>();
  const repositories: PinnableRepository[] = [];
  for (const node of [
    ...(data.viewer.repositories.nodes ?? []),
    ...(data.viewer.repositoriesContributedTo.nodes ?? []),
  ]) {
    if (!isRepository(node)) continue;
    const key = node.nameWithOwner.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    repositories.push(node);
  }
  return repositories;
}

function isRepository(node: PinnableRepositoryFragment | null): node is PinnableRepositoryFragment {
  return node !== null;
}
