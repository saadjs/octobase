import { describe, expect, it, vi } from "vitest";
import { sendOctobaseMessage } from "@/lib/messages";

describe("sendOctobaseMessage", () => {
  it("returns a response when an extension reload invalidates the content script", async () => {
    vi.spyOn(browser.runtime, "sendMessage").mockRejectedValue(
      new Error("Extension context invalidated."),
    );

    await expect(
      sendOctobaseMessage({ type: "octobase/token-state", accountLogin: "octocat" }),
    ).resolves.toEqual({
      kind: "error",
      message: "Octobase was reloaded. Refresh this tab to reconnect.",
    });
  });
});
