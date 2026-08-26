import * as v from "valibot";
import type { DeviceAuthorization, StoredToken } from "@/auth/types";

const DEVICE_CODE_URL = "https://github.com/login/device/code";
const ACCESS_TOKEN_URL = "https://github.com/login/oauth/access_token";

const deviceCodeResponseSchema = v.object({
  device_code: v.string(),
  user_code: v.string(),
  verification_uri: v.string(),
  verification_uri_complete: v.optional(v.string()),
  expires_in: v.number(),
  interval: v.optional(v.number()),
});
const accessTokenResponseSchema = v.object({
  access_token: v.string(),
  scope: v.optional(v.string()),
});
const githubErrorSchema = v.object({
  error: v.optional(v.string()),
  error_description: v.optional(v.string()),
});
type GitHubErrorResponse = v.InferOutput<typeof githubErrorSchema>;

export class DeviceFlowError extends Error {
  constructor(
    message: string,
    readonly code?: string,
  ) {
    super(message);
    this.name = "DeviceFlowError";
  }
}

export async function startDeviceAuthorization(
  clientId: string,
  scope?: string,
): Promise<DeviceAuthorization> {
  const body = new URLSearchParams({ client_id: clientId });
  if (scope) body.set("scope", scope);
  const response = await fetch(DEVICE_CODE_URL, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const responseBody = await response.json();
  const result = v.safeParse(deviceCodeResponseSchema, responseBody);

  if (!response.ok || !result.success) {
    throw responseError(
      v.safeParse(githubErrorSchema, responseBody),
      "GitHub could not start device authorization.",
    );
  }

  return {
    deviceCode: result.output.device_code,
    userCode: result.output.user_code,
    verificationUri: result.output.verification_uri,
    verificationUriComplete: result.output.verification_uri_complete,
    expiresIn: result.output.expires_in,
    interval: result.output.interval ?? 5,
  };
}

export async function exchangeDeviceCode(
  clientId: string,
  deviceCode: string,
): Promise<StoredToken> {
  const body = new URLSearchParams({
    client_id: clientId,
    device_code: deviceCode,
    grant_type: "urn:ietf:params:oauth:grant-type:device_code",
  });
  const response = await fetch(ACCESS_TOKEN_URL, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const responseBody = await response.json();
  const result = v.safeParse(accessTokenResponseSchema, responseBody);

  if (!response.ok || !result.success) {
    throw responseError(
      v.safeParse(githubErrorSchema, responseBody),
      "GitHub has not authorized this device yet.",
    );
  }

  return {
    accessToken: result.output.access_token,
    source: "app",
    scopes: result.output.scope?.split(",").filter(Boolean),
  };
}

function responseError(
  result: v.SafeParseResult<typeof githubErrorSchema>,
  fallback: string,
): DeviceFlowError {
  const response: GitHubErrorResponse | undefined = result.success ? result.output : undefined;
  return new DeviceFlowError(response?.error_description ?? fallback, response?.error);
}
