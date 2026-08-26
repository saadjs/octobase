import { describe, expect, it } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";

describe("toolchain", () => {
  it("runs tests with a fake extension API", async () => {
    await fakeBrowser.storage.local.set({ ping: "pong" });
    expect(await fakeBrowser.storage.local.get("ping")).toEqual({ ping: "pong" });
  });
});
