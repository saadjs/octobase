import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { App } from "@/app/App";
import type { CachedDashboard } from "@/data/cache";
import {
  defaultDashboardPreferences,
  type DashboardPreferences,
} from "@/data/dashboard-preferences";
import type { DashboardSnapshot } from "@/data/github";
import { connection, dashboardSnapshot, issueNode, pullRequestNode } from "@/data/test-fixtures";
import type { OctobasePush, OctobaseRequest, OctobaseResponse } from "@/messages";
import { fakeBrowser } from "wxt/testing/fake-browser";

const sendMessage = vi.fn<(request: OctobaseRequest) => Promise<OctobaseResponse>>();

const writeClipboardText = vi.fn<(text: string) => Promise<void>>();

/** The common "connected account, one dashboard snapshot, default preferences" fixture. */
function mockConnectedDashboard(
  mock: Mock<(request: OctobaseRequest) => Promise<OctobaseResponse>>,
  snapshot: CachedDashboard<DashboardSnapshot>,
): void {
  mock.mockImplementation(async (request) => {
    if (request.type === "octobase/token-state") {
      return { kind: "token-state", token: { connected: true, source: "app" } };
    }
    if (request.type === "octobase/preferences") {
      return { kind: "preferences", preferences: defaultDashboardPreferences() };
    }
    if (request.type === "octobase/dashboard") return { kind: "dashboard", stale: false, snapshot };
    return { kind: "ok" };
  });
}

describe("App", () => {
  beforeEach(() => {
    sendMessage.mockReset();
    writeClipboardText.mockReset();
    writeClipboardText.mockResolvedValue();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: writeClipboardText },
    });
  });

  it("starts device authorization from the connect state", async () => {
    sendMessage.mockImplementation(async (request) => {
      if (request.type === "octobase/token-state") {
        return { kind: "token-state", token: { connected: false } };
      }
      if (request.type === "octobase/preferences") {
        return { kind: "preferences", preferences: defaultDashboardPreferences() };
      }
      if (request.type === "octobase/start-device-flow") {
        return {
          kind: "device-authorization",
          authorization: {
            deviceCode: "secret-device-code",
            userCode: "ABCD-EFGH",
            verificationUri: "https://github.com/login/device",
            expiresIn: 900,
            interval: 60,
          },
        };
      }
      return { kind: "ok" };
    });

    render(<App accountLogin="octocat" sendMessage={sendMessage} />);
    await userEvent.click(await screen.findByRole("button", { name: "Install GitHub App" }));

    expect(await screen.findByText("ABCD-EFGH")).toBeInTheDocument();
    expect(sendMessage).toHaveBeenLastCalledWith({ type: "octobase/start-device-flow" });
    expect(screen.queryByText("secret-device-code")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open GitHub authorization" })).toHaveAttribute(
      "target",
      "_blank",
    );

    await userEvent.click(screen.getByRole("button", { name: "Copy code" }));
    expect(writeClipboardText).toHaveBeenCalledWith("ABCD-EFGH");
    expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument();
  });

  it("connects a pasted personal access token when Enter is pressed", async () => {
    sendMessage.mockImplementation(async (request) => {
      if (request.type === "octobase/token-state") {
        return { kind: "token-state", token: { connected: false } };
      }
      if (request.type === "octobase/preferences") {
        return { kind: "preferences", preferences: defaultDashboardPreferences() };
      }
      if (request.type === "octobase/dashboard") return { kind: "dashboard", stale: false };
      return { kind: "ok" };
    });

    render(<App accountLogin="octocat" sendMessage={sendMessage} />);
    expect(
      (
        await screen.findByRole("link", { name: "Create a fine-grained token on GitHub" })
      ).getAttribute("href"),
    ).toContain("issues=read");
    const tokenInput = screen.getByLabelText("Personal access token");
    fireEvent.input(tokenInput, { target: { value: "github_pat_example" } });
    await userEvent.type(tokenInput, "{Enter}");

    expect(sendMessage).toHaveBeenCalledWith({
      type: "octobase/set-token",
      accountLogin: "octocat",
      accessToken: "github_pat_example",
      metadata: { source: "fine-grained" },
    });
  });

  it("explains token handling from the header info button", async () => {
    sendMessage.mockResolvedValueOnce({ kind: "token-state", token: { connected: false } });

    render(<App accountLogin="octocat" sendMessage={sendMessage} />);
    await userEvent.click(
      await screen.findByRole("button", { name: "How Octobase handles your GitHub access" }),
    );

    expect(await screen.findByText("Your token stays on this device")).toBeVisible();
  });

  it("cancels a pending device authorization", async () => {
    sendMessage.mockResolvedValueOnce({ kind: "token-state", token: { connected: false } });
    sendMessage.mockResolvedValueOnce({
      kind: "device-authorization",
      authorization: {
        deviceCode: "device-code",
        userCode: "ABCD-EFGH",
        verificationUri: "https://github.com/login/device",
        expiresIn: 900,
        interval: 60,
      },
    });

    render(<App accountLogin="octocat" sendMessage={sendMessage} />);
    await userEvent.click(await screen.findByRole("button", { name: "Install GitHub App" }));
    await userEvent.click(await screen.findByRole("button", { name: "Cancel" }));

    expect(screen.queryByText("ABCD-EFGH")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Install GitHub App" })).toBeInTheDocument();
  });

  it("offers a retry when device authorization fails", async () => {
    sendMessage.mockResolvedValueOnce({ kind: "token-state", token: { connected: false } });
    sendMessage.mockResolvedValueOnce({
      kind: "device-authorization",
      authorization: {
        deviceCode: "expired-device-code",
        userCode: "ABCD-EFGH",
        verificationUri: "https://github.com/login/device",
        expiresIn: 900,
        interval: 0,
      },
    });
    sendMessage.mockResolvedValueOnce({
      kind: "error",
      code: "expired_token",
      message: "The device code expired.",
    });
    sendMessage.mockResolvedValueOnce({
      kind: "device-authorization",
      authorization: {
        deviceCode: "replacement-device-code",
        userCode: "WXYZ-1234",
        verificationUri: "https://github.com/login/device",
        expiresIn: 900,
        interval: 60,
      },
    });

    render(<App accountLogin="octocat" sendMessage={sendMessage} />);
    await userEvent.click(await screen.findByRole("button", { name: "Install GitHub App" }));

    expect(await screen.findByText("The device code expired.")).toBeInTheDocument();
    expect(screen.getByText("GitHub authorization stopped")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByText("WXYZ-1234")).toBeInTheDocument();
    expect(sendMessage).toHaveBeenLastCalledWith({ type: "octobase/start-device-flow" });
  });

  it("loads token and preferences together before requesting the saved dashboard tab", async () => {
    const preferences: DashboardPreferences = {
      ...defaultDashboardPreferences(),
      favoriteRepositories: ["octo/repo"],
      selectedTab: "owned",
    };
    const deferredPreferences = Promise.withResolvers<OctobaseResponse>();
    const deferredDashboard = Promise.withResolvers<OctobaseResponse>();
    sendMessage.mockImplementation(async (request) => {
      if (request.type === "octobase/token-state") {
        return { kind: "token-state", token: { connected: true, source: "app" } };
      }
      if (request.type === "octobase/preferences") return deferredPreferences.promise;
      if (request.type === "octobase/dashboard") return deferredDashboard.promise;
      return { kind: "ok" };
    });

    render(<App accountLogin="octocat" sendMessage={sendMessage} />);

    await waitFor(() =>
      expect(sendMessage).toHaveBeenCalledWith({
        type: "octobase/preferences",
        accountLogin: "octocat",
      }),
    );
    expect(sendMessage.mock.calls.some(([request]) => request.type === "octobase/dashboard")).toBe(
      false,
    );

    deferredPreferences.resolve({ kind: "preferences", preferences });

    await waitFor(() =>
      expect(sendMessage).toHaveBeenCalledWith({
        type: "octobase/dashboard",
        accountLogin: "octocat",
        refresh: false,
        selectedTab: "owned",
      }),
    );
    expect(
      sendMessage.mock.calls.filter(([request]) => request.type === "octobase/dashboard"),
    ).toHaveLength(1);
    expect(screen.getByRole("link", { name: "repo" })).toBeVisible();
    expect(screen.getByRole("status", { name: "Loading your dashboard" })).toBeVisible();
  });

  it("shows an empty state when a connected account has no dashboard snapshot", async () => {
    sendMessage.mockImplementation(async (request) => {
      if (request.type === "octobase/token-state") {
        return { kind: "token-state", token: { connected: true, source: "app" } };
      }
      if (request.type === "octobase/preferences") {
        return { kind: "preferences", preferences: defaultDashboardPreferences() };
      }
      if (request.type === "octobase/dashboard") return { kind: "dashboard", stale: false };
      return { kind: "ok" };
    });

    render(<App accountLogin="octocat" sendMessage={sendMessage} />);

    expect(await screen.findByText("No dashboard data is available.")).toBeVisible();
  });

  it("disconnects without rendering data when the extension token belongs to another account", async () => {
    sendMessage.mockImplementation(async (request) => {
      if (request.type === "octobase/token-state") {
        return { kind: "token-state", token: { connected: true, source: "app" } };
      }
      if (request.type === "octobase/preferences") {
        return { kind: "preferences", preferences: defaultDashboardPreferences() };
      }
      if (request.type === "octobase/dashboard") {
        return {
          kind: "error",
          code: "account_mismatch",
          message:
            "Octobase is connected to a different GitHub account. Connect this account, or switch back to the connected account.",
        };
      }
      return { kind: "ok" };
    });

    render(<App accountLogin="new-user" sendMessage={sendMessage} />);

    expect(await screen.findByRole("button", { name: "Install GitHub App" })).toBeInTheDocument();
    expect(screen.getByText(/connected to a different GitHub account/)).toBeInTheDocument();
    expect(sendMessage).toHaveBeenCalledWith({
      type: "octobase/dashboard",
      accountLogin: "new-user",
      refresh: false,
      selectedTab: "attention",
    });
  });

  it("separates owned work from contributions and shows recent activity", async () => {
    const data = dashboardSnapshot({
      assignedIssues: connection([
        issueNode({
          id: "issue",
          number: 10,
          title: "Investigate this issue",
          url: "https://github.com/octo/repo/issues/10",
          updatedAt: "2026-08-23T09:00:00.000Z",
          comments: { totalCount: 1, nodes: [] },
          labels: { nodes: [{ name: "bug", color: "d73a4a" }] },
          reactionGroups: [
            {
              content: "THUMBS_UP",
              reactors: { totalCount: 1 },
              viewerHasReacted: true,
            },
            { content: "ROCKET", reactors: { totalCount: 1 }, viewerHasReacted: false },
          ],
        }),
      ]),
      ownedPullRequests: connection([
        pullRequestNode({
          id: "own-pr",
          number: 12,
          title: "Fix the dashboard",
          url: "https://github.com/octocat/repo/pull/12",
          updatedAt: "2026-08-23T11:00:00.000Z",
          reviewDecision: "REVIEW_REQUIRED",
          author: { login: "octocat" },
          repository: {
            nameWithOwner: "octocat/repo",
            url: "https://github.com/octocat/repo",
          },
          comments: { totalCount: 2, nodes: [] },
          statusCheckRollup: { state: "FAILURE" },
        }),
      ]),
      contributedIssues: connection([
        issueNode({
          id: "oss-issue",
          number: 99,
          title: "Improve upstream docs",
          url: "https://github.com/upstream/project/issues/99",
          updatedAt: "2026-08-23T11:30:00.000Z",
          author: { login: "octocat" },
          repository: {
            nameWithOwner: "upstream/project",
            url: "https://github.com/upstream/project",
          },
          comments: {
            totalCount: 2,
            nodes: [{ author: { login: "maintainer" }, createdAt: "2026-08-23T11:30:00.000Z" }],
          },
        }),
      ]),
    });
    let preferences = defaultDashboardPreferences();
    sendMessage.mockImplementation(async (request) => {
      if (request.type === "octobase/token-state") {
        return { kind: "token-state", token: { connected: true, source: "app" } };
      }
      if (request.type === "octobase/update-preferences") {
        preferences = { ...preferences, ...request.changes };
        return { kind: "preferences", preferences };
      }
      if (request.type === "octobase/dashboard") {
        return {
          kind: "dashboard",
          stale: false,
          preferences,
          snapshot: { fetchedAt: "2026-08-23T12:00:00.000Z", data },
        };
      }
      return { kind: "ok" };
    });

    render(<App accountLogin="octocat" sendMessage={sendMessage} />);

    const profileLink = await screen.findByRole("link", { name: "@octocat" });
    expect(profileLink).toHaveAttribute("href", "https://github.com/octocat");
    expect(profileLink.parentElement).toHaveTextContent("@octocat (The Octocat) · Updated");
    const refreshedAt = profileLink.parentElement?.querySelector("time");
    expect(refreshedAt).toHaveAttribute("datetime", "2026-08-23T12:00:00.000Z");
    expect(refreshedAt).toHaveAttribute("title", expect.stringMatching(/^Last refreshed: .+2026/));
    expect(await screen.findByRole("tab", { name: /Needs your attention/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("Investigate this issue")).toBeVisible();
    expect(screen.getByText("bug")).toHaveStyle({
      backgroundColor: "#d73a4a",
      borderColor: "#d73a4a",
      color: "#ffffff",
    });
    expect(screen.getByLabelText("2 reactions")).toBeVisible();
    expect(screen.getByLabelText("1 thumbs up reaction; you reacted")).toHaveAttribute(
      "data-variant",
      "secondary",
    );
    expect(screen.getByLabelText("1 rocket reaction")).toHaveTextContent("🚀1");

    await userEvent.click(screen.getByRole("tab", { name: /Your repositories/ }));
    expect(screen.getByText("CI failing")).toHaveAttribute("data-variant", "destructive");
    expect(screen.getByText("Review required")).toHaveAttribute("data-variant", "attention");

    await userEvent.click(screen.getByRole("tab", { name: /Contributions/ }));
    expect(screen.getByText("Improve upstream docs")).toBeVisible();
    expect(screen.getByText(/Latest comment by @maintainer/)).toBeVisible();
  });

  it("preserves the selected tab and filters across remounts", async () => {
    let preferences: DashboardPreferences = {
      selectedTab: "attention",
      repositoryQuery: "",
      itemType: "all",
      showDrafts: true,
      showHidden: false,
      hiddenItems: {},
      favoriteRepositories: [],
    };
    const data = dashboardSnapshot();

    sendMessage.mockImplementation(async (request) => {
      if (request.type === "octobase/token-state") {
        return { kind: "token-state", token: { connected: true, source: "app" } };
      }
      if (request.type === "octobase/preferences") {
        return { kind: "preferences", preferences };
      }
      if (request.type === "octobase/dashboard") {
        return {
          kind: "dashboard",
          stale: false,
          preferences,
          snapshot: { fetchedAt: "2026-08-23T12:00:00.000Z", data },
        };
      }
      if (request.type === "octobase/update-preferences") {
        preferences = { ...preferences, ...request.changes };
        return { kind: "preferences", preferences };
      }
      return { kind: "ok" };
    });

    const firstMount = render(<App accountLogin="octocat" sendMessage={sendMessage} />);
    await userEvent.click(await screen.findByRole("tab", { name: /Your repositories/ }));
    fireEvent.change(screen.getByRole("searchbox", { name: /repository or organization/i }), {
      target: { value: "acme" },
    });
    await userEvent.click(screen.getByRole("button", { name: "Issues" }));
    await waitFor(() => {
      expect(preferences).toMatchObject({
        selectedTab: "owned",
        repositoryQuery: "acme",
        itemType: "issue",
      });
    });

    firstMount.unmount();
    render(<App accountLogin="octocat" sendMessage={sendMessage} />);

    expect(await screen.findByRole("tab", { name: /Your repositories/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("searchbox", { name: /repository or organization/i })).toHaveValue(
      "acme",
    );
    expect(screen.getByRole("button", { name: "Issues" })).toHaveAttribute("aria-pressed", "true");
  });

  it("merges every attention source into one prioritized queue", async () => {
    sendMessage.mockImplementation(async (request) => {
      if (request.type === "octobase/token-state") {
        return { kind: "token-state", token: { connected: true, source: "app" } };
      }
      if (request.type === "octobase/preferences") {
        return { kind: "preferences", preferences: defaultDashboardPreferences() };
      }
      if (request.type !== "octobase/dashboard") return { kind: "ok" };
      return {
        kind: "dashboard",
        stale: false,
        snapshot: {
          fetchedAt: "2026-08-23T12:00:00.000Z",
          data: dashboardSnapshot({
            reviewRequests: connection([
              pullRequestNode({ id: "review", title: "Please review me" }),
            ]),
            assignedIssues: connection([issueNode({ id: "assigned", title: "Assigned bug" })]),
            mentioned: connection([issueNode({ id: "mention", title: "You were mentioned" })]),
            authoredPullRequests: connection([
              pullRequestNode({
                id: "broken",
                title: "My broken pull request",
                author: { login: "octocat" },
                mergeable: "CONFLICTING",
                reviewDecision: "CHANGES_REQUESTED",
                statusCheckRollup: { state: "FAILURE" },
              }),
            ]),
          }),
        },
      };
    });

    render(<App accountLogin="octocat" sendMessage={sendMessage} />);

    const queue = await screen.findByText("Please review me");
    const titles = [
      ...(queue.closest("[data-slot=card-content]")?.querySelectorAll("article a") ?? []),
    ]
      .map((link) => link.textContent)
      .filter((title) => title !== "octo/repo");
    expect(titles).toEqual([
      "Please review me",
      "My broken pull request",
      "You were mentioned",
      "Assigned bug",
    ]);

    const brokenRow = screen.getByText("My broken pull request").closest("article");
    if (!brokenRow) throw new Error("Expected the pull request row");
    expect(within(brokenRow).queryByText("Merge conflict")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Merge conflict/ }));
    expect(screen.getByText("My broken pull request")).toBeVisible();
    expect(screen.queryByText("Assigned bug")).not.toBeInTheDocument();
  });

  it("queues pull requests other people opened on the viewer's repositories", async () => {
    sendMessage.mockImplementation(async (request) => {
      if (request.type === "octobase/token-state") {
        return { kind: "token-state", token: { connected: true, source: "app" } };
      }
      if (request.type === "octobase/preferences") {
        return { kind: "preferences", preferences: defaultDashboardPreferences() };
      }
      if (request.type !== "octobase/dashboard") return { kind: "ok" };
      return {
        kind: "dashboard",
        stale: false,
        snapshot: {
          fetchedAt: "2026-08-23T12:00:00.000Z",
          data: dashboardSnapshot({
            assignedIssues: connection([issueNode({ id: "assigned", title: "Assigned bug" })]),
            incomingPullRequests: connection([
              pullRequestNode({
                id: "incoming",
                title: "A contributor's pull request",
                author: { login: "hubot" },
              }),
            ]),
          }),
        },
      };
    });

    render(<App accountLogin="octocat" sendMessage={sendMessage} />);

    expect(await screen.findByText("A contributor's pull request")).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: /On your repositories/ }));
    expect(screen.getByText("A contributor's pull request")).toBeVisible();
    expect(screen.queryByText("Assigned bug")).not.toBeInTheDocument();
  });

  it("loads remaining attention pages from GitHub when a search has more results", async () => {
    const withMore = dashboardSnapshot({
      reviewRequests: {
        ...connection([pullRequestNode({ id: "review", title: "Please review me" })]),
        pageInfo: { hasNextPage: true, endCursor: "cursor-1" },
      },
    });
    let dashboardRequests = 0;
    sendMessage.mockImplementation(async (request) => {
      if (request.type === "octobase/token-state") {
        return { kind: "token-state", token: { connected: true, source: "app" } };
      }
      if (request.type === "octobase/preferences") {
        return { kind: "preferences", preferences: defaultDashboardPreferences() };
      }
      if (request.type !== "octobase/dashboard") return { kind: "ok" };
      dashboardRequests += 1;
      if (dashboardRequests === 1) {
        return {
          kind: "dashboard",
          stale: false,
          snapshot: { fetchedAt: "2026-08-23T12:00:00.000Z", data: withMore },
        };
      }
      return {
        kind: "dashboard",
        stale: false,
        snapshot: {
          fetchedAt: "2026-08-23T12:01:00.000Z",
          data: dashboardSnapshot({
            reviewRequests: connection([
              pullRequestNode({ id: "review", title: "Please review me" }),
              pullRequestNode({ id: "review-2", title: "And this one" }),
            ]),
          }),
        },
      };
    });

    render(<App accountLogin="octocat" sendMessage={sendMessage} />);

    await userEvent.click(await screen.findByRole("button", { name: "Fetch more from GitHub" }));

    expect(sendMessage).toHaveBeenCalledWith({
      type: "octobase/dashboard",
      accountLogin: "octocat",
      refresh: false,
      showAll: ["reviewRequests"],
      selectedTab: "attention",
    });
    expect(await screen.findByText("And this one")).toBeVisible();
  });

  it("shows 20 of the total and loads every remaining panel result", async () => {
    const firstTwenty = Array.from({ length: 20 }, (_, index) =>
      issueNode({ id: `issue-${index}`, number: index + 1 }),
    );
    const allForty = Array.from({ length: 40 }, (_, index) =>
      issueNode({ id: `issue-${index}`, number: index + 1 }),
    );
    const firstPage = dashboardSnapshot({
      ownedIssues: {
        ...connection(firstTwenty),
        issueCount: 40,
        pageInfo: { hasNextPage: true, endCursor: "page-1" },
      },
    });
    const complete = dashboardSnapshot({
      ownedIssues: connection(allForty),
    });

    let preferences = defaultDashboardPreferences();
    sendMessage.mockImplementation(async (request) => {
      if (request.type === "octobase/token-state") {
        return { kind: "token-state", token: { connected: true, source: "app" } };
      }
      if (request.type === "octobase/preferences") {
        return { kind: "preferences", preferences };
      }
      if (request.type === "octobase/update-preferences") {
        preferences = { ...preferences, ...request.changes };
        return { kind: "preferences", preferences };
      }
      if (request.type !== "octobase/dashboard") return { kind: "ok" };
      // Opening the tab fetches its items; the first page is all GitHub returns at once.
      if (request.showAll?.includes("ownedIssues")) {
        return {
          kind: "dashboard",
          stale: false,
          snapshot: { fetchedAt: "2026-08-23T12:02:00.000Z", data: complete },
        };
      }
      return {
        kind: "dashboard",
        stale: false,
        snapshot: { fetchedAt: "2026-08-23T12:00:00.000Z", data: firstPage },
      };
    });

    render(<App accountLogin="octocat" sendMessage={sendMessage} />);
    await userEvent.click(await screen.findByRole("tab", { name: /Your repositories/ }));

    expect(await screen.findByText("20 of 40")).toBeVisible();
    expect(screen.getByText(/Read-only access through the Octobase GitHub App/)).toBeVisible();
    for (const link of screen.getAllByRole("link")) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noreferrer");
    }

    await userEvent.click(screen.getByRole("button", { name: "Show all 40" }));
    expect(sendMessage).toHaveBeenLastCalledWith({
      type: "octobase/dashboard",
      accountLogin: "octocat",
      refresh: false,
      showAll: ["ownedIssues"],
      selectedTab: "owned",
    });
    expect(screen.queryByText("20 of 40")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Show all 40" })).not.toBeInTheDocument();
  });

  it("guides an authorized account into GitHub App repository installation", async () => {
    sendMessage.mockImplementation(async (request) => {
      if (request.type === "octobase/token-state") {
        return { kind: "token-state", token: { connected: true, source: "app" } };
      }
      if (request.type === "octobase/repository-installation-state") {
        return { kind: "repository-installation-state", hasPersonalInstallation: false };
      }
      if (request.type === "octobase/dashboard") {
        return {
          kind: "dashboard",
          stale: false,
          snapshot: {
            fetchedAt: "2026-08-23T12:00:00.000Z",
            data: dashboardSnapshot(),
          },
        };
      }
      return { kind: "ok" };
    });

    render(<App accountLogin="octocat" sendMessage={sendMessage} />);
    await userEvent.click(await screen.findByRole("button", { name: "Enable repository access" }));

    expect(sendMessage).toHaveBeenCalledWith({
      type: "octobase/open-repository-installation",
      accountLogin: "octocat",
    });
    expect(screen.getByText(/Finish installation in GitHub/)).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: "Check access" }));
    expect(sendMessage).toHaveBeenLastCalledWith({
      type: "octobase/repository-installation-state",
      accountLogin: "octocat",
    });
  });

  it("shows repository counts and permissions for each GitHub App installation", async () => {
    sendMessage.mockImplementation(async (request) => {
      if (request.type === "octobase/token-state") {
        return { kind: "token-state", token: { connected: true, source: "app" } };
      }
      if (request.type === "octobase/dashboard") {
        return {
          kind: "dashboard",
          stale: false,
          snapshot: {
            fetchedAt: "2026-08-23T12:00:00.000Z",
            data: dashboardSnapshot(),
          },
        };
      }
      if (request.type === "octobase/repository-access") {
        return {
          kind: "repository-access",
          accountLogin: "octocat",
          access: {
            kind: "app",
            repositoryCount: 2,
            fetchedAt: "2026-08-23T12:00:00.000Z",
            installations: [
              {
                id: 1,
                accountLogin: "acme",
                accountType: "Organization",
                avatarUrl: "https://github.com/acme.png",
                repositorySelection: "selected",
                manageUrl: "https://github.com/organizations/acme/settings/installations/1",
                permissions: [
                  { name: "contents", level: "read" },
                  { name: "pull_requests", level: "read" },
                ],
                repositoryCount: 2,
              },
            ],
          },
        };
      }
      return { kind: "ok" };
    });

    render(<App accountLogin="octocat" sendMessage={sendMessage} />);
    await userEvent.click(await screen.findByRole("button", { name: "Access details" }));

    expect(await screen.findByText("GitHub App connected")).toBeVisible();
    expect(screen.getByLabelText("2 repositories")).toBeVisible();
    expect(screen.getByRole("link", { name: "@acme" })).toHaveAttribute(
      "href",
      "https://github.com/acme",
    );
    expect(screen.getByRole("link", { name: "@acme" })).toHaveAttribute("target", "_blank");
    expect(screen.getByText("Selected repositories only")).toBeVisible();
    expect(screen.getByText("contents")).toBeVisible();
    expect(screen.getByText("pull requests")).toBeVisible();
    expect(sendMessage).toHaveBeenCalledWith({
      type: "octobase/repository-access",
      accountLogin: "octocat",
    });
  });

  it("shows scopes and a repository count for a classic token", async () => {
    sendMessage.mockImplementation(async (request) => {
      if (request.type === "octobase/token-state") {
        return { kind: "token-state", token: { connected: true, source: "classic" } };
      }
      if (request.type === "octobase/dashboard") {
        return {
          kind: "dashboard",
          stale: false,
          snapshot: {
            fetchedAt: "2026-08-23T12:00:00.000Z",
            data: dashboardSnapshot(),
          },
        };
      }
      if (request.type === "octobase/repository-access") {
        return {
          kind: "repository-access",
          accountLogin: "octocat",
          access: {
            kind: "personal-token",
            source: "classic",
            repositoryCount: 42,
            scopes: ["repo", "read:org"],
            fetchedAt: "2026-08-23T12:00:00.000Z",
          },
        };
      }
      return { kind: "ok" };
    });

    render(<App accountLogin="octocat" sendMessage={sendMessage} />);
    await userEvent.click(await screen.findByRole("button", { name: "Access details" }));

    expect(await screen.findByText("Token (classic) connected")).toBeVisible();
    expect(screen.getByText("repo")).toBeVisible();
    expect(screen.getByText("read:org")).toBeVisible();
    expect(screen.getByLabelText("42 repositories")).toBeVisible();
  });

  it("does not describe zero installations as zero readable repositories", async () => {
    sendMessage.mockImplementation(async (request) => {
      if (request.type === "octobase/token-state") {
        return { kind: "token-state", token: { connected: true, source: "app" } };
      }
      if (request.type === "octobase/dashboard") {
        return {
          kind: "dashboard",
          stale: false,
          snapshot: {
            fetchedAt: "2026-08-23T12:00:00.000Z",
            data: dashboardSnapshot(),
          },
        };
      }
      if (request.type === "octobase/repository-access") {
        return {
          kind: "repository-access",
          accountLogin: "octocat",
          access: {
            kind: "app",
            repositoryCount: 0,
            fetchedAt: "2026-08-23T12:00:00.000Z",
            installations: [],
          },
        };
      }
      return { kind: "ok" };
    });

    render(<App accountLogin="octocat" sendMessage={sendMessage} />);
    await userEvent.click(await screen.findByRole("button", { name: "Access details" }));

    expect(await screen.findByText("GitHub App connected")).toBeVisible();
    expect(screen.getByLabelText("0 repositories")).toBeVisible();
    expect(screen.getByText(/Public work still reaches the dashboard/)).toBeVisible();
    expect(screen.queryByText(/App can read 0 repositories/)).not.toBeInTheDocument();
  });

  it("filters work and hides items until their activity changes", async () => {
    let preferences: DashboardPreferences = {
      selectedTab: "attention",
      repositoryQuery: "",
      itemType: "all",
      showDrafts: true,
      showHidden: false,
      hiddenItems: {},
      favoriteRepositories: [],
    };
    const data = dashboardSnapshot({
      reviewRequests: connection([
        pullRequestNode({
          id: "draft",
          title: "Draft from acme",
          isDraft: true,
          repository: {
            nameWithOwner: "acme/app",
            url: "https://github.com/acme/app",
          },
        }),
        pullRequestNode({
          id: "other",
          title: "Review from elsewhere",
          repository: {
            nameWithOwner: "elsewhere/tool",
            url: "https://github.com/elsewhere/tool",
          },
        }),
      ]),
      assignedIssues: connection([
        issueNode({
          id: "issue",
          title: "Acme assigned issue",
          repository: {
            nameWithOwner: "acme/bugs",
            url: "https://github.com/acme/bugs",
          },
        }),
      ]),
    });

    sendMessage.mockImplementation(async (request) => {
      if (request.type === "octobase/token-state") {
        return { kind: "token-state", token: { connected: true, source: "app" } };
      }
      if (request.type === "octobase/dashboard") {
        return {
          kind: "dashboard",
          stale: false,
          preferences,
          snapshot: { fetchedAt: "2026-08-23T12:00:00.000Z", data },
        };
      }
      if (request.type === "octobase/update-preferences") {
        preferences = { ...preferences, ...request.changes };
        return { kind: "preferences", preferences };
      }
      if (request.type === "octobase/set-hidden-item") {
        const hiddenItems = { ...preferences.hiddenItems };
        if (request.updatedAt) hiddenItems[request.itemId] = request.updatedAt;
        else delete hiddenItems[request.itemId];
        preferences = { ...preferences, hiddenItems };
        return { kind: "preferences", preferences };
      }
      return { kind: "ok" };
    });

    render(<App accountLogin="octocat" sendMessage={sendMessage} />);
    expect(await screen.findByText("Draft from acme")).toBeVisible();

    fireEvent.change(screen.getByRole("searchbox", { name: /repository or organization/i }), {
      target: { value: "acme" },
    });
    await waitFor(() =>
      expect(screen.queryByText("Review from elsewhere")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Acme assigned issue")).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: "Issues" }));
    expect(screen.queryByText("Draft from acme")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    await userEvent.click(screen.getByRole("button", { name: "Hide drafts" }));
    expect(screen.queryByText("Draft from acme")).not.toBeInTheDocument();

    const issueRow = screen.getByText("Acme assigned issue").closest("article");
    if (!issueRow) throw new Error("Issue row not found");
    await userEvent.click(within(issueRow).getByRole("button", { name: /Hide until/ }));
    expect(screen.queryByText("Acme assigned issue")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Show hidden (1)" }));
    const restoredRow = screen.getByText("Acme assigned issue").closest("article");
    if (!restoredRow) throw new Error("Restored issue row not found");
    expect(within(restoredRow).getByRole("button", { name: "Unhide" })).toBeVisible();
  });

  it("keeps cached work visible with a warning and supports disconnect", async () => {
    sendMessage.mockImplementation(async (request) => {
      if (request.type === "octobase/token-state") {
        return { kind: "token-state", token: { connected: true, source: "app" } };
      }
      if (request.type === "octobase/preferences") {
        return { kind: "preferences", preferences: defaultDashboardPreferences() };
      }
      if (request.type === "octobase/dashboard") {
        return {
          kind: "dashboard",
          stale: true,
          warning: "Couldn't refresh GitHub. Showing data from the last successful refresh.",
          snapshot: {
            fetchedAt: "2026-08-23T12:00:00.000Z",
            data: dashboardSnapshot({
              assignedIssues: connection([issueNode({ id: "cached", title: "Cached issue" })]),
            }),
          },
        };
      }
      return { kind: "ok" };
    });

    render(<App accountLogin="octocat" sendMessage={sendMessage} />);

    expect(await screen.findByText("Cached issue")).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("Showing data from the last successful");
    await userEvent.click(screen.getByRole("button", { name: "Disconnect" }));
    await userEvent.click(screen.getByRole("button", { name: "Confirm disconnect" }));
    expect(sendMessage).toHaveBeenLastCalledWith({
      type: "octobase/disconnect",
      accountLogin: "octocat",
    });
    expect(await screen.findByRole("button", { name: "Install GitHub App" })).toBeVisible();
  });
  it("shows data background revalidation refreshed without waiting for a manual refresh", async () => {
    mockConnectedDashboard(sendMessage, {
      fetchedAt: "2026-08-23T12:00:00.000Z",
      data: dashboardSnapshot({
        assignedIssues: connection([issueNode({ id: "old", title: "Already seen issue" })]),
      }),
    });

    render(<App accountLogin="octocat" sendMessage={sendMessage} />);
    expect(await screen.findByText("Already seen issue")).toBeVisible();

    const push: OctobasePush = {
      type: "octobase/dashboard-updated",
      accountLogin: "octocat",
      snapshot: {
        fetchedAt: "2026-08-23T12:05:00.000Z",
        data: dashboardSnapshot({
          assignedIssues: connection([issueNode({ id: "new", title: "Revalidated issue" })]),
        }),
      },
    };
    await act(async () => {
      void (await fakeBrowser.runtime.onMessage.trigger(push, {}, () => undefined));
    });

    expect(await screen.findByText("Revalidated issue")).toBeVisible();
    expect(screen.queryByText("Already seen issue")).not.toBeInTheDocument();
  });

  it("revalidates a stale dashboard on window focus, the entire replacement for the deleted polling loop", async () => {
    // Fetched well past the freshness window, so the cached snapshot is already stale.
    mockConnectedDashboard(sendMessage, {
      fetchedAt: new Date(Date.now() - 6 * 60_000).toISOString(),
      data: dashboardSnapshot({
        assignedIssues: connection([issueNode({ id: "old", title: "Already seen issue" })]),
      }),
    });

    render(<App accountLogin="octocat" sendMessage={sendMessage} />);
    expect(await screen.findByText("Already seen issue")).toBeVisible();

    mockConnectedDashboard(sendMessage, {
      fetchedAt: new Date().toISOString(),
      data: dashboardSnapshot({
        assignedIssues: connection([issueNode({ id: "new", title: "Refreshed on focus" })]),
      }),
    });

    await act(async () => {
      window.dispatchEvent(new Event("visibilitychange"));
    });

    expect(await screen.findByText("Refreshed on focus")).toBeVisible();
    expect(screen.queryByText("Already seen issue")).not.toBeInTheDocument();
  });

  it("ignores a pushed snapshot belonging to another GitHub account", async () => {
    mockConnectedDashboard(sendMessage, {
      fetchedAt: "2026-08-23T12:00:00.000Z",
      data: dashboardSnapshot({
        assignedIssues: connection([issueNode({ id: "mine", title: "My issue" })]),
      }),
    });

    render(<App accountLogin="octocat" sendMessage={sendMessage} />);
    expect(await screen.findByText("My issue")).toBeVisible();

    const push: OctobasePush = {
      type: "octobase/dashboard-updated",
      accountLogin: "someone-else",
      snapshot: {
        fetchedAt: "2026-08-23T12:05:00.000Z",
        data: dashboardSnapshot({
          viewer: {
            login: "someone-else",
            name: "Someone Else",
            avatarUrl: "https://github.com/images/error/octocat_happy.gif",
          },
          assignedIssues: connection([issueNode({ id: "theirs", title: "Their issue" })]),
        }),
      },
    };
    await act(async () => {
      void (await fakeBrowser.runtime.onMessage.trigger(push, {}, () => undefined));
    });

    expect(screen.getByText("My issue")).toBeVisible();
    expect(screen.queryByText("Their issue")).not.toBeInTheDocument();
  });
  it("shows a tab's total before any of its items are fetched", async () => {
    mockConnectedDashboard(sendMessage, {
      fetchedAt: "2026-08-23T12:00:00.000Z",
      data: dashboardSnapshot({
        counts: {
          ownedPullRequests: 12,
          ownedIssues: 3,
          contributedPullRequests: 0,
          contributedIssues: 0,
        },
      }),
    });

    render(<App accountLogin="octocat" sendMessage={sendMessage} />);

    expect(await screen.findByRole("tab", { name: /Your repositories/ })).toHaveAccessibleName(
      "Your repositories 15",
    );
    expect(screen.getByRole("tab", { name: /Contributions/ })).toHaveAccessibleName(
      "Contributions 0",
    );
  });

  it("does not claim a tab is empty while its total is still unknown", async () => {
    mockConnectedDashboard(sendMessage, {
      fetchedAt: "2026-08-23T12:00:00.000Z",
      data: dashboardSnapshot(),
    });

    render(<App accountLogin="octocat" sendMessage={sendMessage} />);

    expect(await screen.findByRole("tab", { name: /Your repositories/ })).toHaveAccessibleName(
      "Your repositories",
    );
    expect(screen.getByRole("tab", { name: /Contributions/ })).toHaveAccessibleName(
      "Contributions",
    );
  });

  it("fetches a tab's items when it is opened and says so while they load", async () => {
    let releaseTabFetch: (() => void) | undefined;
    const counts = {
      ownedPullRequests: 1,
      ownedIssues: 0,
      contributedPullRequests: 0,
      contributedIssues: 0,
    };
    let dashboardRequests = 0;
    sendMessage.mockImplementation(async (request) => {
      if (request.type === "octobase/token-state") {
        return { kind: "token-state", token: { connected: true, source: "app" } };
      }
      if (request.type === "octobase/preferences") {
        return { kind: "preferences", preferences: defaultDashboardPreferences() };
      }
      if (request.type === "octobase/update-preferences") {
        return {
          kind: "preferences",
          preferences: { ...defaultDashboardPreferences(), selectedTab: "owned" },
        };
      }
      if (request.type === "octobase/dashboard") {
        dashboardRequests += 1;
        if (dashboardRequests === 1) {
          return {
            kind: "dashboard",
            stale: false,
            snapshot: {
              fetchedAt: "2026-08-23T12:00:00.000Z",
              data: dashboardSnapshot({ counts }),
            },
          };
        }
        await new Promise<void>((resolve) => {
          releaseTabFetch = resolve;
        });
        return {
          kind: "dashboard",
          stale: false,
          snapshot: {
            fetchedAt: "2026-08-23T12:01:00.000Z",
            data: dashboardSnapshot({
              counts,
              ownedPullRequests: connection([
                pullRequestNode({ id: "owned", title: "My own pull request" }),
              ]),
            }),
          },
        };
      }
      return { kind: "ok" };
    });

    render(<App accountLogin="octocat" sendMessage={sendMessage} />);
    await userEvent.click(await screen.findByRole("tab", { name: /Your repositories/ }));

    expect(await screen.findByText("Loading Pull requests…")).toBeInTheDocument();
    expect(screen.queryByText("You have no open pull requests in your repositories.")).toBeNull();
    // Selecting an unvisited tab reads it through the query cache, not a forced network refresh.
    expect(sendMessage).toHaveBeenCalledWith({
      type: "octobase/dashboard",
      accountLogin: "octocat",
      refresh: false,
      selectedTab: "owned",
    });

    await act(async () => {
      if (!releaseTabFetch) throw new Error("Expected the tab fetch to still be pending");
      releaseTabFetch();
    });
    expect(await screen.findByText("My own pull request")).toBeVisible();
    expect(screen.queryByText("Loading Pull requests…")).toBeNull();
  });

  it("keeps a tab's loaded items on screen while it refetches them", async () => {
    let releaseTabFetch: (() => void) | undefined;
    const data = dashboardSnapshot({
      counts: {
        ownedPullRequests: 1,
        ownedIssues: 0,
        contributedPullRequests: 0,
        contributedIssues: 0,
      },
      ownedPullRequests: connection([
        pullRequestNode({ id: "owned", title: "Already loaded pull request" }),
      ]),
    });
    let dashboardRequests = 0;
    sendMessage.mockImplementation(async (request) => {
      if (request.type === "octobase/token-state") {
        return { kind: "token-state", token: { connected: true, source: "app" } };
      }
      if (request.type === "octobase/preferences") {
        return { kind: "preferences", preferences: defaultDashboardPreferences() };
      }
      if (request.type === "octobase/update-preferences") {
        return {
          kind: "preferences",
          preferences: { ...defaultDashboardPreferences(), selectedTab: "owned" },
        };
      }
      if (request.type === "octobase/dashboard") {
        dashboardRequests += 1;
        if (dashboardRequests > 1) {
          await new Promise<void>((resolve) => {
            releaseTabFetch = resolve;
          });
        }
        return {
          kind: "dashboard",
          stale: false,
          snapshot: { fetchedAt: "2026-08-23T12:00:00.000Z", data },
        };
      }
      return { kind: "ok" };
    });

    render(<App accountLogin="octocat" sendMessage={sendMessage} />);
    await userEvent.click(await screen.findByRole("tab", { name: /Your repositories/ }));

    expect(screen.getByText("Already loaded pull request")).toBeVisible();
    expect(screen.queryByText("Loading Pull requests…")).toBeNull();
    await act(async () => {
      if (!releaseTabFetch) throw new Error("Expected the tab fetch to still be pending");
      releaseTabFetch();
    });
    expect(screen.getByText("Already loaded pull request")).toBeVisible();
  });
  it("keeps a pushed snapshot when a slower dashboard fetch answers with older work", async () => {
    let releaseDashboard: (() => void) | undefined;
    sendMessage.mockImplementation(async (request) => {
      if (request.type === "octobase/token-state") {
        return { kind: "token-state", token: { connected: true, source: "app" } };
      }
      if (request.type === "octobase/dashboard") {
        await new Promise<void>((resolve) => {
          releaseDashboard = resolve;
        });
        return {
          kind: "dashboard",
          stale: true,
          snapshot: {
            fetchedAt: "2026-08-23T12:00:00.000Z",
            data: dashboardSnapshot({
              assignedIssues: connection([issueNode({ id: "old", title: "Stale issue" })]),
            }),
          },
        };
      }
      return { kind: "ok" };
    });

    render(<App accountLogin="octocat" sendMessage={sendMessage} />);
    await waitFor(() => expect(releaseDashboard).toBeDefined());

    const push: OctobasePush = {
      type: "octobase/dashboard-updated",
      accountLogin: "octocat",
      snapshot: {
        fetchedAt: "2026-08-23T12:05:00.000Z",
        data: dashboardSnapshot({
          assignedIssues: connection([issueNode({ id: "new", title: "Revalidated issue" })]),
        }),
      },
    };
    await act(async () => {
      void (await fakeBrowser.runtime.onMessage.trigger(push, {}, () => undefined));
    });
    await act(async () => {
      releaseDashboard?.();
    });

    expect(await screen.findByText("Revalidated issue")).toBeVisible();
    expect(screen.queryByText("Stale issue")).not.toBeInTheDocument();
  });

  it("clears a failed action's message once a later action succeeds", async () => {
    const data = dashboardSnapshot({
      assignedIssues: connection([issueNode({ id: "issue", title: "Assigned issue" })]),
    });
    sendMessage.mockImplementation(async (request) => {
      if (request.type === "octobase/token-state") {
        return { kind: "token-state", token: { connected: true, source: "app" } };
      }
      if (request.type === "octobase/dashboard") {
        return {
          kind: "dashboard",
          stale: false,
          snapshot: { fetchedAt: "2026-08-23T12:00:00.000Z", data },
        };
      }
      if (request.type === "octobase/set-hidden-item") {
        return { kind: "error", message: "Could not update the hidden item." };
      }
      return { kind: "ok" };
    });

    render(<App accountLogin="octocat" sendMessage={sendMessage} />);
    const issueRow = (await screen.findByText("Assigned issue")).closest("article");
    if (!issueRow) throw new Error("Issue row not found");
    await userEvent.click(within(issueRow).getByRole("button", { name: /Hide until/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not update the hidden item.");

    await userEvent.click(screen.getByRole("button", { name: "Refresh" }));

    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
  });

  it("keeps a pushed snapshot when a failed preference change rolls back", async () => {
    let rejectPreferences: (() => void) | undefined;
    sendMessage.mockImplementation(async (request) => {
      if (request.type === "octobase/token-state") {
        return { kind: "token-state", token: { connected: true, source: "app" } };
      }
      if (request.type === "octobase/preferences") {
        return { kind: "preferences", preferences: defaultDashboardPreferences() };
      }
      if (request.type === "octobase/dashboard") {
        return {
          kind: "dashboard",
          stale: false,
          snapshot: {
            fetchedAt: "2026-08-23T12:00:00.000Z",
            data: dashboardSnapshot({
              assignedIssues: connection([issueNode({ id: "old", title: "Already seen issue" })]),
            }),
          },
        };
      }
      if (request.type === "octobase/update-preferences") {
        await new Promise<void>((_resolve, reject) => {
          rejectPreferences = () => reject(new Error("Could not save dashboard filters."));
        });
      }
      return { kind: "ok" };
    });

    render(<App accountLogin="octocat" sendMessage={sendMessage} />);
    expect(await screen.findByText("Already seen issue")).toBeVisible();

    fireEvent.change(screen.getByRole("searchbox", { name: /repository or organization/i }), {
      target: { value: "acme" },
    });
    await waitFor(() => expect(rejectPreferences).toBeDefined());

    const push: OctobasePush = {
      type: "octobase/dashboard-updated",
      accountLogin: "octocat",
      snapshot: {
        fetchedAt: "2026-08-23T12:05:00.000Z",
        data: dashboardSnapshot({
          assignedIssues: connection([issueNode({ id: "new", title: "Revalidated issue" })]),
        }),
      },
    };
    await act(async () => {
      void (await fakeBrowser.runtime.onMessage.trigger(push, {}, () => undefined));
    });
    await act(async () => {
      rejectPreferences?.();
    });

    expect(await screen.findByText("Revalidated issue")).toBeVisible();
    expect(screen.queryByText("Already seen issue")).not.toBeInTheDocument();
  });

  it("pins a repository from open work and jumps to it with its digit key", async () => {
    let preferences: DashboardPreferences = defaultDashboardPreferences();
    sendMessage.mockImplementation(async (request) => {
      if (request.type === "octobase/token-state") {
        return { kind: "token-state", token: { connected: true, source: "app" } };
      }
      if (request.type === "octobase/preferences") return { kind: "preferences", preferences };
      if (request.type === "octobase/update-preferences") {
        preferences = { ...preferences, ...request.changes };
        return { kind: "preferences", preferences };
      }
      if (request.type === "octobase/dashboard") {
        return {
          kind: "dashboard",
          stale: false,
          snapshot: {
            fetchedAt: "2026-08-23T12:00:00.000Z",
            data: dashboardSnapshot({
              assignedIssues: connection([
                issueNode({
                  id: "issue-1",
                  repository: {
                    nameWithOwner: "saadjs/octobase",
                    url: "https://github.com/saadjs/octobase",
                  },
                }),
              ]),
            }),
          },
        };
      }
      return { kind: "ok" };
    });
    // spyOn returns the existing spy when one is already installed, so clear its history.
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    open.mockClear();

    render(<App accountLogin="octocat" sendMessage={sendMessage} />);
    await userEvent.click(await screen.findByRole("button", { name: "Pin a repository" }));
    await userEvent.click(await screen.findByRole("button", { name: "saadjs/octobase" }));

    const pinned = within(await screen.findByRole("complementary", { name: "Pinned" }));
    expect(pinned.getByRole("link", { name: "octobase" })).toHaveAttribute(
      "href",
      "https://github.com/saadjs/octobase",
    );
    expect(pinned.getByRole("link", { name: "Pull requests" })).toHaveAttribute(
      "href",
      "https://github.com/saadjs/octobase/pulls",
    );
    expect(pinned.getByRole("link", { name: "octobase" })).toHaveAttribute("target", "_blank");
    expect(preferences.favoriteRepositories).toEqual(["saadjs/octobase"]);

    fireEvent.keyDown(document.body, { key: "1" });
    expect(open).toHaveBeenCalledWith(
      "https://github.com/saadjs/octobase",
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("ignores a digit key while the reader is typing in a filter", async () => {
    const preferences: DashboardPreferences = {
      ...defaultDashboardPreferences(),
      favoriteRepositories: ["saadjs/octobase"],
    };
    sendMessage.mockImplementation(async (request) => {
      if (request.type === "octobase/token-state") {
        return { kind: "token-state", token: { connected: true, source: "app" } };
      }
      if (request.type === "octobase/preferences") return { kind: "preferences", preferences };
      if (request.type === "octobase/dashboard") {
        return {
          kind: "dashboard",
          stale: false,
          snapshot: { fetchedAt: "2026-08-23T12:00:00.000Z", data: dashboardSnapshot() },
        };
      }
      return { kind: "ok" };
    });
    // spyOn returns the existing spy when one is already installed, so clear its history.
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    open.mockClear();

    render(<App accountLogin="octocat" sendMessage={sendMessage} />);
    const filter = await screen.findByRole("searchbox", { name: /repository or organization/i });
    fireEvent.keyDown(filter, { key: "1" });

    expect(open).not.toHaveBeenCalled();
  });

  it("reorders and unpins from edit mode", async () => {
    let preferences: DashboardPreferences = {
      ...defaultDashboardPreferences(),
      favoriteRepositories: ["saadjs/octobase", "saadjs/neo"],
    };
    sendMessage.mockImplementation(async (request) => {
      if (request.type === "octobase/token-state") {
        return { kind: "token-state", token: { connected: true, source: "app" } };
      }
      if (request.type === "octobase/preferences") return { kind: "preferences", preferences };
      if (request.type === "octobase/update-preferences") {
        preferences = { ...preferences, ...request.changes };
        return { kind: "preferences", preferences };
      }
      if (request.type === "octobase/dashboard") {
        return {
          kind: "dashboard",
          stale: false,
          snapshot: { fetchedAt: "2026-08-23T12:00:00.000Z", data: dashboardSnapshot() },
        };
      }
      return { kind: "ok" };
    });

    render(<App accountLogin="octocat" sendMessage={sendMessage} />);
    await userEvent.click(await screen.findByRole("button", { name: "Edit pins" }));
    await userEvent.click(screen.getByRole("button", { name: "Move saadjs/neo earlier" }));
    await waitFor(() =>
      expect(preferences.favoriteRepositories).toEqual(["saadjs/neo", "saadjs/octobase"]),
    );

    const cards = screen.getAllByRole("listitem");
    await userEvent.click(within(cards[0]!).getByRole("button", { name: "Unpin" }));
    await waitFor(() => expect(preferences.favoriteRepositories).toEqual(["saadjs/octobase"]));
  });

  it("offers the account's own repositories to pin", async () => {
    let preferences: DashboardPreferences = defaultDashboardPreferences();
    const listed: string[] = [];
    sendMessage.mockImplementation(async (request) => {
      if (request.type === "octobase/token-state") {
        return { kind: "token-state", token: { connected: true, source: "app" } };
      }
      if (request.type === "octobase/preferences") return { kind: "preferences", preferences };
      if (request.type === "octobase/update-preferences") {
        preferences = { ...preferences, ...request.changes };
        return { kind: "preferences", preferences };
      }
      if (request.type === "octobase/viewer-repositories") {
        listed.push(request.accountLogin);
        return {
          kind: "viewer-repositories",
          accountLogin: "octocat",
          repositories: [
            {
              id: "1",
              nameWithOwner: "octo/secret-plans",
              url: "https://github.com/octo/secret-plans",
              isPrivate: true,
            },
          ],
        };
      }
      if (request.type === "octobase/dashboard") {
        return {
          kind: "dashboard",
          stale: false,
          snapshot: { fetchedAt: "2026-08-23T12:00:00.000Z", data: dashboardSnapshot() },
        };
      }
      return { kind: "ok" };
    });

    render(<App accountLogin="octocat" sendMessage={sendMessage} />);
    await userEvent.click(await screen.findByRole("button", { name: "Pin a repository" }));
    await userEvent.type(screen.getByLabelText("Repository to pin"), "secret");

    const match = await screen.findByRole("button", { name: /octo\/secret-plans/ });
    expect(within(match).getByText("Private")).toBeVisible();
    // One list fetch feeds every keystroke.
    expect(listed).toEqual(["octocat"]);

    await userEvent.click(match);
    expect(preferences.favoriteRepositories).toEqual(["octo/secret-plans"]);
  });

  it("pins the top match when a partial name is submitted", async () => {
    let preferences: DashboardPreferences = defaultDashboardPreferences();
    sendMessage.mockImplementation(async (request) => {
      if (request.type === "octobase/token-state") {
        return { kind: "token-state", token: { connected: true, source: "app" } };
      }
      if (request.type === "octobase/preferences") return { kind: "preferences", preferences };
      if (request.type === "octobase/update-preferences") {
        preferences = { ...preferences, ...request.changes };
        return { kind: "preferences", preferences };
      }
      if (request.type === "octobase/viewer-repositories") {
        return {
          kind: "viewer-repositories",
          accountLogin: "octocat",
          repositories: [
            {
              id: "1",
              nameWithOwner: "octo/spec-tools",
              url: "https://github.com/octo/spec-tools",
              isPrivate: false,
            },
          ],
        };
      }
      if (request.type === "octobase/dashboard") {
        return {
          kind: "dashboard",
          stale: false,
          snapshot: { fetchedAt: "2026-08-23T12:00:00.000Z", data: dashboardSnapshot() },
        };
      }
      return { kind: "ok" };
    });

    render(<App accountLogin="octocat" sendMessage={sendMessage} />);
    await userEvent.click(await screen.findByRole("button", { name: "Pin a repository" }));
    await userEvent.type(screen.getByLabelText("Repository to pin"), "spec");
    await screen.findByRole("button", { name: /octo\/spec-tools/ });
    await userEvent.click(screen.getByRole("button", { name: "Pin" }));

    await waitFor(() => expect(preferences.favoriteRepositories).toEqual(["octo/spec-tools"]));
  });
});
