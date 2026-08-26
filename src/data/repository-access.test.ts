import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchGitHubViewerIdentity,
  fetchPersonalInstallationState,
  fetchPersonalTokenRepositoryAccess,
  fetchRepositoryAccess,
} from "@/data/repository-access";

describe("repository access", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("identifies a personal installation separately from organization installations", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>()
        .mockResolvedValue(
          jsonResponse(
            JSON.stringify({
              total_count: 2,
              installations: [
                {
                  id: 1,
                  account: {
                    login: "acme",
                    type: "Organization",
                    avatar_url: "https://github.com/acme.png",
                  },
                  repository_selection: "all",
                  html_url: "https://github.com/organizations/acme/settings/installations/1",
                },
                {
                  id: 2,
                  account: {
                    login: "OctoCat",
                    type: "User",
                    avatar_url: "https://github.com/octocat.png",
                  },
                  repository_selection: "all",
                  html_url: "https://github.com/settings/installations/2",
                },
              ],
            }),
          ),
        ),
    );

    await expect(fetchPersonalInstallationState("app-token", "octocat")).resolves.toBe(true);
  });

  it("loads the numeric viewer ID used to bind an installation target", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>()
        .mockResolvedValue(jsonResponse(JSON.stringify({ id: 123, login: "octocat" }))),
    );

    await expect(fetchGitHubViewerIdentity("app-token")).resolves.toEqual({
      id: 123,
      login: "octocat",
    });
  });

  it("lists and counts repositories across every accessible App installation", async () => {
    const fetchMock = vi
      .fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>()
      .mockImplementation(async (input) => {
        const url = new Request(input).url;
        if (url.includes("/user/installations?")) {
          return jsonResponse(
            JSON.stringify({
              total_count: 2,
              installations: [
                {
                  id: 2,
                  account: {
                    login: "octocat",
                    type: "User",
                    avatar_url: "https://github.com/octocat.png",
                  },
                  repository_selection: "all",
                  html_url: "https://github.com/settings/installations/2",
                },
                {
                  id: 1,
                  account: {
                    login: "acme",
                    type: "Organization",
                    avatar_url: "https://github.com/acme.png",
                  },
                  repository_selection: "selected",
                  html_url: "https://github.com/organizations/acme/settings/installations/1",
                },
              ],
            }),
          );
        }
        if (url.includes("/installations/1/repositories")) {
          return jsonResponse(
            JSON.stringify({
              total_count: 1,
              repositories: [repository(1, "acme/api", true)],
            }),
          );
        }
        return jsonResponse(
          JSON.stringify({
            total_count: 2,
            repositories: [
              repository(2, "octocat/hello-world", false),
              repository(3, "octocat/private", true),
            ],
          }),
        );
      });
    vi.stubGlobal("fetch", fetchMock);

    const access = await fetchRepositoryAccess("app-token");

    expect(access.kind).toBe("app");
    expect(access.repositoryCount).toBe(3);
    expect(access.installations.map((installation) => installation.accountLogin)).toEqual([
      "acme",
      "octocat",
    ]);
    expect(access.installations[0]).toMatchObject({
      repositorySelection: "selected",
      repositoryCount: 1,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/user/installations/1/repositories?per_page=1&page=1"),
      expect.anything(),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/user/installations?per_page=100&page=1"),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer app-token" }),
      }),
    );
  });

  it("lists repositories and granted scopes for a classic token", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>()
        .mockResolvedValue(
          jsonResponse(JSON.stringify([{ id: 1 }]), {
            Link: '<https://api.github.com/user/repos?per_page=1&page=2>; rel="next", <https://api.github.com/user/repos?per_page=1&page=42>; rel="last"',
            "X-OAuth-Scopes": "repo, read:org",
          }),
        ),
    );

    await expect(fetchPersonalTokenRepositoryAccess("classic-token", "classic")).resolves.toEqual({
      kind: "personal-token",
      source: "classic",
      repositoryCount: 42,
      scopes: ["repo", "read:org"],
      fetchedAt: expect.any(String),
    });
  });
});

function repository(id: number, fullName: string, isPrivate: boolean) {
  return {
    id,
    full_name: fullName,
    private: isPrivate,
    html_url: `https://github.com/${fullName}`,
  };
}

function jsonResponse(body: string, headers?: Record<string, string>): Response {
  return new Response(body, {
    headers: { "Content-Type": "application/json", ...headers },
  });
}
