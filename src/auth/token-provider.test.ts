import { beforeEach, describe, expect, it } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";
import { TokenProvider } from "@/auth/token-provider";

describe("TokenProvider", () => {
  const provider = new TokenProvider();

  beforeEach(async () => {
    await fakeBrowser.storage.local.clear();
  });

  it("stores tokens per account without exposing them in public state", async () => {
    await provider.set("OctoCat", "octocat-secret", {
      source: "fine-grained",
      expiresAt: "2026-09-01T00:00:00.000Z",
      scopes: ["repo"],
    });
    await provider.set("hubot", "hubot-secret", { source: "app" });

    expect(await provider.state("octocat")).toEqual({
      connected: true,
      source: "fine-grained",
      expiresAt: "2026-09-01T00:00:00.000Z",
      scopes: ["repo"],
    });
    expect(await provider.get("octocat")).toMatchObject({ accessToken: "octocat-secret" });
    expect(await provider.get("hubot")).toMatchObject({ accessToken: "hubot-secret" });
    expect(await provider.state("another-user")).toEqual({ connected: false });
  });

  it("invalidates only the affected account", async () => {
    await provider.set("octocat", "expired-token", { source: "app" });
    await provider.set("hubot", "valid-token", { source: "app" });
    await provider.invalidate("octocat");

    expect(await provider.get("octocat")).toBeUndefined();
    expect(await provider.state("octocat")).toEqual({ connected: false });
    expect(await provider.get("hubot")).toMatchObject({ accessToken: "valid-token" });
  });

  it("uses the legacy single token until the background can identify its owner", async () => {
    await fakeBrowser.storage.local.set({
      "github-token": { accessToken: "legacy-token", source: "app" },
    });

    expect(await provider.state("octocat")).toMatchObject({ connected: true, source: "app" });
    expect(await provider.getLegacy()).toMatchObject({ accessToken: "legacy-token" });
  });
});
