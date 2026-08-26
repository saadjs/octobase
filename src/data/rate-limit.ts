import * as v from "valibot";
import { normalizeGitHubLogin } from "@/data/account";
import type { DashboardQuery } from "@/gql/graphql";
import { KeyedSerialQueue } from "@/lib/keyed-serial-queue";

export type RateLimitField = DashboardQuery["rateLimit"];

/** What the last GitHub response told us about the account's remaining budget. */
export interface RateLimitState {
  remaining?: number;
  resetAt?: string;
  /** GitHub rejected a request for rate limiting; no request may go out before this. */
  blockedUntil?: string;
  /** Consecutive rejections, used to grow the cooldown. */
  strikes?: number;
}

export interface RateLimitDecision {
  allowed: boolean;
  retryAt?: string;
}

/** Measured 2026-08-23 against `rateLimit.cost`; every page of a section costs the same. */
const DASHBOARD_FETCH_COST = 10;
/** Keep enough budget for three user-requested fetches. */
const RESERVE = 3 * DASHBOARD_FETCH_COST;
const COOLDOWN_MINUTES = [5, 15, 30, 60];

const rateLimitStateSchema = v.object({
  remaining: v.optional(v.number()),
  resetAt: v.optional(v.string()),
  blockedUntil: v.optional(v.string()),
  strikes: v.optional(v.number()),
});
const legacyRateLimitStorage = storage.defineItem<Record<string, RateLimitState>>(
  "local:rateLimit",
  { fallback: {} },
);
const rateLimitUpdates = new KeyedSerialQueue();

export function rateLimitDecision(
  state: RateLimitState | undefined,
  now: Date = new Date(),
): RateLimitDecision {
  if (!state) return { allowed: true };

  const blockedUntil = parseTime(state.blockedUntil);
  if (blockedUntil && blockedUntil > now.getTime()) {
    return { allowed: false, retryAt: state.blockedUntil };
  }

  const resetAt = parseTime(state.resetAt);
  const spent = state.remaining !== undefined && state.remaining < RESERVE;
  if (spent && resetAt && resetAt > now.getTime()) {
    return { allowed: false, retryAt: state.resetAt };
  }
  return { allowed: true };
}

export function rateLimitWarning(retryAt?: string): string {
  const at = parseTime(retryAt);
  return at
    ? `GitHub's API rate limit is spent. Showing cached work; Octobase retries after ${new Date(at).toLocaleTimeString()}.`
    : "GitHub's API rate limit is spent. Showing cached work until it resets.";
}

export class RateLimitedError extends Error {
  readonly code = "rate_limited";

  constructor(readonly retryAt?: string) {
    super(rateLimitWarning(retryAt));
    this.name = "RateLimitedError";
  }
}

export async function readRateLimitState(
  accountLogin: string,
): Promise<RateLimitState | undefined> {
  const account = normalizeGitHubLogin(accountLogin);
  const key = rateLimitKey(account);
  const current = v.safeParse(rateLimitStateSchema, await storage.getItem(key));
  if (current.success) return current.output;

  const legacy = v.safeParse(
    rateLimitStateSchema,
    (await legacyRateLimitStorage.getValue())[account],
  );
  return legacy.success ? legacy.output : undefined;
}

export async function checkRateLimit(accountLogin: string): Promise<RateLimitDecision> {
  return rateLimitDecision(await readRateLimitState(accountLogin));
}

/** A successful response carries the live budget, and proves any cooldown has expired. */
export async function recordRateLimitSuccess(
  accountLogin: string,
  rateLimit: RateLimitField,
): Promise<void> {
  await writeAccountRateLimit(accountLogin, () => ({
    remaining: rateLimit?.remaining,
    resetAt: rateLimit?.resetAt,
  }));
}

export async function recordRateLimitRejection(
  accountLogin: string,
  retryAt?: string,
  now: Date = new Date(),
): Promise<void> {
  await writeAccountRateLimit(accountLogin, (current) => {
    const strikes = (current.strikes ?? 0) + 1;
    const cooldown = COOLDOWN_MINUTES[Math.min(strikes, COOLDOWN_MINUTES.length) - 1] ?? 60;
    const until = Math.max(parseTime(retryAt) ?? 0, now.getTime() + cooldown * 60_000);
    return { ...current, strikes, blockedUntil: new Date(until).toISOString() };
  });
}

export async function clearRateLimitState(accountLogin: string): Promise<void> {
  const key = rateLimitKey(normalizeGitHubLogin(accountLogin));
  await rateLimitUpdates.run(key, () => storage.removeItem(key));
}

async function writeAccountRateLimit(
  accountLogin: string,
  update: (current: RateLimitState) => RateLimitState,
): Promise<void> {
  const account = normalizeGitHubLogin(accountLogin);
  const key = rateLimitKey(account);
  await rateLimitUpdates.run(key, async () => {
    await storage.setItem(key, update((await readRateLimitState(account)) ?? {}));
  });
}

function rateLimitKey(accountLogin: string): `local:${string}` {
  return `local:rateLimit:${accountLogin}`;
}

function parseTime(value?: string): number | undefined {
  if (!value) return undefined;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? undefined : time;
}
