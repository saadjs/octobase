import { describe, expect, it } from "vitest";
import { KeyedSerialQueue } from "@/lib/keyed-serial-queue";

describe("KeyedSerialQueue", () => {
  it("orders work for one key and continues after a rejection", async () => {
    const queue = new KeyedSerialQueue();
    const events: string[] = [];
    const failed = queue.run("octocat", async () => {
      events.push("first");
      throw new Error("failed");
    });
    const next = queue.run("octocat", async () => {
      events.push("second");
      return 2;
    });

    await expect(failed).rejects.toThrow("failed");
    await expect(next).resolves.toBe(2);
    expect(events).toEqual(["first", "second"]);
  });

  it("does not block unrelated keys", async () => {
    const queue = new KeyedSerialQueue();
    const blocked = Promise.withResolvers<void>();
    const first = queue.run("octocat", () => blocked.promise);

    await expect(queue.run("hubot", async () => "ready")).resolves.toBe("ready");
    blocked.resolve();
    await first;
  });
});
