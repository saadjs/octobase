import * as v from "valibot";
import type { PublicTokenState, StoredToken, TokenMetadata } from "@/auth/types";
import { normalizeGitHubLogin } from "@/data/account";

const LEGACY_TOKEN_KEY = "github-token";
const ACCOUNT_TOKEN_PREFIX = "github-token:";
const storedTokenSchema = v.object({
  accessToken: v.string(),
  source: v.union([v.literal("app"), v.literal("fine-grained"), v.literal("classic")]),
  expiresAt: v.optional(v.string()),
  scopes: v.optional(v.array(v.string())),
});

export class TokenProvider {
  async get(accountLogin: string): Promise<StoredToken | undefined> {
    return this.read(accountTokenKey(accountLogin));
  }

  async getLegacy(): Promise<StoredToken | undefined> {
    return this.read(LEGACY_TOKEN_KEY);
  }

  async set(accountLogin: string, accessToken: string, metadata: TokenMetadata): Promise<void> {
    await browser.storage.local.set({
      [accountTokenKey(accountLogin)]: { accessToken, ...metadata } satisfies StoredToken,
    });
  }

  async clear(accountLogin: string): Promise<void> {
    await browser.storage.local.remove(accountTokenKey(accountLogin));
  }

  async clearLegacy(): Promise<void> {
    await browser.storage.local.remove(LEGACY_TOKEN_KEY);
  }

  async state(accountLogin: string): Promise<PublicTokenState> {
    const token = (await this.get(accountLogin)) ?? (await this.getLegacy());
    if (!token) return { connected: false };
    return publicState(token);
  }

  async invalidate(accountLogin: string): Promise<void> {
    await this.clear(accountLogin);
  }

  private async read(key: string): Promise<StoredToken | undefined> {
    const stored = await browser.storage.local.get(key);
    const result = v.safeParse(storedTokenSchema, stored[key]);
    return result.success ? result.output : undefined;
  }
}

function accountTokenKey(accountLogin: string): string {
  return `${ACCOUNT_TOKEN_PREFIX}${normalizeGitHubLogin(accountLogin)}`;
}

function publicState(token: StoredToken): PublicTokenState {
  return {
    connected: true,
    source: token.source,
    expiresAt: token.expiresAt,
    scopes: token.scopes,
  };
}
