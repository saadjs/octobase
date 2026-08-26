import { beforeEach, describe, expect, it } from "vitest";
import { HIDE_STYLE_ID, installHideStyle, isHidden, removeHideStyle } from "./hide";

describe("hide style", () => {
  beforeEach(() => {
    document.getElementById(HIDE_STYLE_ID)?.remove();
  });

  it("hides GitHub's dashboard", () => {
    installHideStyle();
    const style = document.getElementById(HIDE_STYLE_ID);
    expect(style?.textContent).toContain(".application-main");
    expect(style?.textContent).toContain("display:none !important");
    expect(isHidden()).toBe(true);
  });

  it("only ever installs one", () => {
    const first = installHideStyle();
    expect(installHideStyle()).toBe(first);
    expect(document.querySelectorAll(`#${HIDE_STYLE_ID}`)).toHaveLength(1);
  });

  it("restores the page when removed", () => {
    installHideStyle();
    removeHideStyle();
    expect(isHidden()).toBe(false);
  });

  it("is safe to remove when never installed", () => {
    expect(() => removeHideStyle()).not.toThrow();
  });
});
