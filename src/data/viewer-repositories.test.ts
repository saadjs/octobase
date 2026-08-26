import { describe, expect, it } from "vitest";
import { viewerRepositories } from "@/data/viewer-repositories";

function repository(nameWithOwner: string, isPrivate = false) {
  return {
    id: nameWithOwner,
    nameWithOwner,
    url: `https://github.com/${nameWithOwner}`,
    isPrivate,
  };
}

describe("viewerRepositories", () => {
  it("keeps owned repositories ahead of contributed ones, without duplicates", () => {
    expect(
      viewerRepositories({
        rateLimit: null,
        viewer: {
          login: "octocat",
          repositories: { nodes: [repository("octo/one", true), repository("octo/two")] },
          repositoriesContributedTo: {
            nodes: [repository("OCTO/TWO"), repository("vercel/next.js")],
          },
        },
      }).map((found) => found.nameWithOwner),
    ).toEqual(["octo/one", "octo/two", "vercel/next.js"]);
  });

  it("survives empty connections", () => {
    expect(
      viewerRepositories({
        rateLimit: null,
        viewer: {
          login: "octocat",
          repositories: { nodes: null },
          repositoriesContributedTo: { nodes: [null] },
        },
      }),
    ).toEqual([]);
  });
});
