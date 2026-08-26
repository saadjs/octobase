import { describe, expect, it, vi } from "vitest";
import { runBackgroundTask } from "@/lib/background-task";

describe("runBackgroundTask", () => {
  it("contains a rejected background task and reports it", async () => {
    const report = vi.fn<(label: string, cause: Error) => void>();

    await expect(
      runBackgroundTask(
        "refreshing the dashboard",
        async () => {
          throw new Error("network unavailable");
        },
        report,
      ),
    ).resolves.toBeUndefined();

    expect(report).toHaveBeenCalledWith(
      "refreshing the dashboard",
      expect.objectContaining({ message: "network unavailable" }),
    );
  });
});
