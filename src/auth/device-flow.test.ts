import { afterEach, describe, expect, it, vi } from "vitest";
import { exchangeDeviceCode, startDeviceAuthorization } from "@/auth/device-flow";

describe("device flow", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("requests a code using the configured client ID", async () => {
    const fetchMock = vi
      .fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>()
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            device_code: "device-code",
            user_code: "ABCD-EFGH",
            verification_uri: "https://github.com/login/device",
            expires_in: 900,
          }),
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(startDeviceAuthorization("client-id", "repo")).resolves.toMatchObject({
      deviceCode: "device-code",
      userCode: "ABCD-EFGH",
      interval: 5,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://github.com/login/device/code",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("leaves authorization to the GitHub App's selected permissions by default", async () => {
    const fetchMock = vi
      .fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>()
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            device_code: "device-code",
            user_code: "ABCD-EFGH",
            verification_uri: "https://github.com/login/device",
            expires_in: 900,
          }),
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    await startDeviceAuthorization("client-id");
    const request = fetchMock.mock.calls[0]?.[1];
    if (!(request?.body instanceof URLSearchParams))
      throw new Error("Expected a form request body.");
    expect(request.body.get("scope")).toBeNull();
  });

  it("reports GitHub's polling state without treating it as a token", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ error: "authorization_pending", error_description: "Waiting." }),
            {
              status: 400,
            },
          ),
        ),
    );

    await expect(exchangeDeviceCode("client-id", "device-code")).rejects.toMatchObject({
      code: "authorization_pending",
    });
  });
});
