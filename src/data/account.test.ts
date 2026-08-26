import { describe, expect, it } from "vitest";
import { isDashboardForAccount, normalizeGitHubLogin } from "@/data/account";
import type { DashboardSnapshot } from "@/data/github";

describe("GitHub account matching", () => {
  it("normalizes logins without matching a different account", () => {
    expect(normalizeGitHubLogin(" OctoCat ")).toBe("octocat");

    // SAFETY: Account matching only reads viewer.login from this fixture.
    const dashboard = { viewer: { login: "OctoCat" } } as DashboardSnapshot;
    expect(isDashboardForAccount(dashboard, "octocat")).toBe(true);
    expect(isDashboardForAccount(dashboard, "another-user")).toBe(false);
  });
});
