import { describe, expect, it } from "vitest";
import { actionIconPaths } from "@/lib/action-icon";

describe("actionIconPaths", () => {
  it("points at the ink that reads on the browser's own theme", () => {
    expect(actionIconPaths("light")[16]).toBe("icon/light/16.png");
    expect(actionIconPaths("dark")[128]).toBe("icon/dark/128.png");
  });
});
