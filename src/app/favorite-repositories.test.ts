import { describe, expect, it } from "vitest";
import {
  addFavoriteRepository,
  favoriteRepositories,
  isFavoriteRepository,
  repositoryOptions,
  MAX_FAVORITE_REPOSITORIES,
  moveFavoriteRepository,
  parseRepositoryName,
  removeFavoriteRepository,
  repositorySuggestions,
  toggleFavoriteRepository,
} from "@/app/favorite-repositories";
import { connection, dashboardSnapshot, issueNode, pullRequestNode } from "@/data/test-fixtures";

describe("parseRepositoryName", () => {
  it("splits owner and name", () => {
    expect(parseRepositoryName("saadjs/octobase")).toEqual({
      nameWithOwner: "saadjs/octobase",
      owner: "saadjs",
      name: "octobase",
      url: "https://github.com/saadjs/octobase",
    });
  });

  it("accepts a pasted repository URL", () => {
    expect(parseRepositoryName("https://github.com/saadjs/neo.git")?.nameWithOwner).toBe(
      "saadjs/neo",
    );
    expect(parseRepositoryName("  github.com/saadjs/neo/  ")?.nameWithOwner).toBe("saadjs/neo");
  });

  it("rejects anything that is not owner/name", () => {
    expect(parseRepositoryName("saadjs")).toBeUndefined();
    expect(parseRepositoryName("saadjs/octobase/pulls")).toBeUndefined();
    expect(parseRepositoryName("saadjs/")).toBeUndefined();
    expect(parseRepositoryName("saadjs/..")).toBeUndefined();
    expect(parseRepositoryName("")).toBeUndefined();
  });
});

describe("favoriteRepositories", () => {
  it("caps the list at the number of digit shortcuts", () => {
    const names = Array.from({ length: 12 }, (_, index) => `octo/repo-${index}`);
    expect(favoriteRepositories(names)).toHaveLength(MAX_FAVORITE_REPOSITORIES);
  });
});

describe("adding and removing", () => {
  it("appends without duplicating an existing pin", () => {
    expect(addFavoriteRepository(["octo/one"], "octo/two")).toEqual(["octo/one", "octo/two"]);
    expect(addFavoriteRepository(["octo/one"], "OCTO/One")).toEqual(["octo/one"]);
  });

  it("stops at the maximum", () => {
    const full = Array.from({ length: MAX_FAVORITE_REPOSITORIES }, (_, i) => `octo/repo-${i}`);
    expect(addFavoriteRepository(full, "octo/extra")).toEqual(full);
  });

  it("removes case-insensitively and leaves other pins alone", () => {
    expect(removeFavoriteRepository(["octo/one", "octo/two"], "OCTO/TWO")).toEqual(["octo/one"]);
    expect(removeFavoriteRepository(["octo/one"], "octo/absent")).toEqual(["octo/one"]);
  });

  it("toggles both ways", () => {
    expect(toggleFavoriteRepository([], "octo/one")).toEqual(["octo/one"]);
    expect(toggleFavoriteRepository(["octo/one"], "octo/one")).toEqual([]);
    expect(isFavoriteRepository(["octo/one"], "Octo/One")).toBe(true);
  });
});

describe("moveFavoriteRepository", () => {
  const pins = ["a/one", "a/two", "a/three"];

  it("moves a pin earlier and later", () => {
    expect(moveFavoriteRepository(pins, "a/two", -1)).toEqual(["a/two", "a/one", "a/three"]);
    expect(moveFavoriteRepository(pins, "a/two", 1)).toEqual(["a/one", "a/three", "a/two"]);
  });

  it("holds at the ends and ignores unknown pins", () => {
    expect(moveFavoriteRepository(pins, "a/one", -1)).toEqual(pins);
    expect(moveFavoriteRepository(pins, "a/three", 1)).toEqual(pins);
    expect(moveFavoriteRepository(pins, "a/absent", 1)).toEqual(pins);
  });
});

const dashboard = dashboardSnapshot({
  reviewRequests: connection([
    pullRequestNode({
      id: "pr-1",
      repository: { nameWithOwner: "saadjs/neo", url: "https://github.com/saadjs/neo" },
    }),
  ]),
  ownedIssues: connection([
    issueNode({
      id: "issue-1",
      repository: { nameWithOwner: "saadjs/octobase", url: "https://github.com/saadjs/octobase" },
    }),
  ]),
  contributedPullRequests: connection([
    pullRequestNode({
      id: "pr-2",
      repository: { nameWithOwner: "vercel/next.js", url: "https://github.com/vercel/next.js" },
    }),
  ]),
});

describe("repositorySuggestions", () => {
  it("lists snapshot repositories alphabetically without duplicates", () => {
    expect(repositorySuggestions(dashboard, [], "")).toEqual([
      "saadjs/neo",
      "saadjs/octobase",
      "vercel/next.js",
    ]);
  });

  it("omits repositories that are already pinned", () => {
    expect(repositorySuggestions(dashboard, ["SAADJS/NEO"], "")).toEqual([
      "saadjs/octobase",
      "vercel/next.js",
    ]);
  });

  it("filters on the typed query", () => {
    expect(repositorySuggestions(dashboard, [], "verc")).toEqual(["vercel/next.js"]);
    expect(repositorySuggestions(dashboard, [], "nothing")).toEqual([]);
  });
});

describe("repositoryOptions", () => {
  const available = [
    {
      id: "1",
      nameWithOwner: "saadjs/secret",
      url: "https://github.com/saadjs/secret",
      isPrivate: true,
    },
    {
      id: "2",
      nameWithOwner: "vercel/next.js",
      url: "https://github.com/vercel/next.js",
      isPrivate: false,
    },
  ];

  it("shows open work first, then the account's own repositories", () => {
    expect(repositoryOptions(dashboard, available, [], "", 8)).toEqual([
      { nameWithOwner: "saadjs/neo" },
      { nameWithOwner: "saadjs/octobase" },
      { nameWithOwner: "vercel/next.js", isPrivate: false },
      { nameWithOwner: "saadjs/secret", isPrivate: true },
    ]);
  });

  it("filters both sources on the typed text", () => {
    expect(repositoryOptions(dashboard, available, [], "secret", 8)).toEqual([
      { nameWithOwner: "saadjs/secret", isPrivate: true },
    ]);
    expect(repositoryOptions(dashboard, available, [], "saadjs/", 8)).toEqual([
      { nameWithOwner: "saadjs/neo" },
      { nameWithOwner: "saadjs/octobase" },
      { nameWithOwner: "saadjs/secret", isPrivate: true },
    ]);
  });

  it("matches a pasted URL against the same names", () => {
    expect(
      repositoryOptions(dashboard, available, [], "https://github.com/vercel/next", 8),
    ).toEqual([{ nameWithOwner: "vercel/next.js", isPrivate: false }]);
  });

  it("omits pins and stops at the limit", () => {
    expect(repositoryOptions(dashboard, available, ["SAADJS/NEO"], "", 2)).toEqual([
      { nameWithOwner: "saadjs/octobase" },
      { nameWithOwner: "vercel/next.js", isPrivate: false },
    ]);
  });
});
