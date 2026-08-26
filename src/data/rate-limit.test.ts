import { describe, expect, it } from "vitest";
import {
  checkRateLimit,
  clearRateLimitState,
  rateLimitDecision,
  readRateLimitState,
  recordRateLimitRejection,
  recordRateLimitSuccess,
} from "@/data/rate-limit";

const NOW = new Date("2026-08-23T12:00:00.000Z");
/** Recorded state is checked against the real clock, so this must outlive the test run. */
const FUTURE_RESET = "2099-01-01T00:00:00.000Z";

describe("rateLimitDecision", () => {
  it("allows fetches with no recorded budget", () => {
    expect(rateLimitDecision(undefined, NOW)).toEqual({ allowed: true });
  });

  it("stops a fetch once the budget is nearly spent", () => {
    const state = { remaining: 4, resetAt: "2026-08-23T12:30:00.000Z" };

    expect(rateLimitDecision(state, NOW).allowed).toBe(false);
  });

  it("allows fetches again once the reset time has passed", () => {
    const state = { remaining: 0, resetAt: "2026-08-23T11:30:00.000Z" };

    expect(rateLimitDecision(state, NOW)).toEqual({ allowed: true });
  });

  it("honors a cooldown from a rejection even with budget left", () => {
    const state = { remaining: 5000, blockedUntil: "2026-08-23T12:05:00.000Z" };

    expect(rateLimitDecision(state, NOW)).toEqual({
      allowed: false,
      retryAt: "2026-08-23T12:05:00.000Z",
    });
  });
});

describe("recorded rate-limit state", () => {
  it("stores the budget per account, case-insensitively", async () => {
    await recordRateLimitSuccess("OctoCat", {
      cost: 4,
      nodeCount: 1020,
      remaining: 120,
      resetAt: FUTURE_RESET,
    });

    expect(await readRateLimitState("octocat")).toEqual({
      remaining: 120,
      resetAt: FUTURE_RESET,
    });
    expect(await readRateLimitState("hubot")).toBeUndefined();
    expect((await checkRateLimit("octocat")).allowed).toBe(true);
  });

  it("grows the cooldown across consecutive rejections", async () => {
    await recordRateLimitRejection("octocat", undefined, NOW);
    expect(await readRateLimitState("octocat")).toMatchObject({
      strikes: 1,
      blockedUntil: "2026-08-23T12:05:00.000Z",
    });

    await recordRateLimitRejection("octocat", undefined, NOW);
    expect(await readRateLimitState("octocat")).toMatchObject({
      strikes: 2,
      blockedUntil: "2026-08-23T12:15:00.000Z",
    });
  });

  it("waits for GitHub's own deadline when it is further out", async () => {
    await recordRateLimitRejection("octocat", "2026-08-23T13:00:00.000Z", NOW);

    expect(await readRateLimitState("octocat")).toMatchObject({
      blockedUntil: "2026-08-23T13:00:00.000Z",
    });
  });

  it("clears the cooldown once a request succeeds", async () => {
    await recordRateLimitRejection("octocat", undefined, NOW);
    await recordRateLimitSuccess("octocat", {
      cost: 4,
      nodeCount: 1020,
      remaining: 4800,
      resetAt: "2026-08-23T13:00:00.000Z",
    });

    expect(await readRateLimitState("octocat")).toEqual({
      remaining: 4800,
      resetAt: "2026-08-23T13:00:00.000Z",
    });
  });

  it("forgets an account on disconnect", async () => {
    await recordRateLimitRejection("octocat", undefined, NOW);
    await clearRateLimitState("octocat");

    expect(await readRateLimitState("octocat")).toBeUndefined();
  });
});
