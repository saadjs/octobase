import type { OctobaseRequest, OctobaseResponse } from "@/messages";

/**
 * Content scripts may ask the background for data, but never receive the access token itself.
 */
export async function sendOctobaseMessage(request: OctobaseRequest): Promise<OctobaseResponse> {
  try {
    return await browser.runtime.sendMessage(request);
  } catch (error) {
    return {
      kind: "error",
      message:
        error instanceof Error && isExtensionContextInvalidated(error)
          ? "Octobase was reloaded. Refresh this tab to reconnect."
          : "Could not reach the extension background.",
    };
  }
}

function isExtensionContextInvalidated(error: Error): boolean {
  return /extension context invalidated/i.test(error.message);
}
