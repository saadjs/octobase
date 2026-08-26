import { describe, expect, it } from "vitest";
import { isHomePath } from "./paths";

describe("isHomePath", () => {
  it("matches the dashboard paths", () => {
    expect(isHomePath("/")).toBe(true);
    expect(isHomePath("/dashboard")).toBe(true);
    expect(isHomePath("/dashboard/following")).toBe(true);
  });

  it("leaves the rest of GitHub alone", () => {
    expect(isHomePath("/notifications")).toBe(false);
    expect(isHomePath("/octocat/repo")).toBe(false);
    expect(isHomePath("/dashboards")).toBe(false);
  });
});
