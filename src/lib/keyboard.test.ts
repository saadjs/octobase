import { beforeEach, describe, expect, it } from "vitest";
import { keepEditingKeysInsideShadowRoot } from "@/lib/keyboard";

function shadowTree() {
  const host = document.createElement("div");
  document.body.append(host);
  const shadow = host.attachShadow({ mode: "open" });
  const input = document.createElement("input");
  const button = document.createElement("button");
  shadow.append(input, button);
  const reachedPage: string[] = [];
  document.addEventListener("keydown", (event) => reachedPage.push(event.key));
  return { button, input, reachedPage, shadow };
}

function press(target: Element, key: string) {
  target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, composed: true }));
}

describe("keepEditingKeysInsideShadowRoot", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("keeps a key typed in a shadow field away from the page", () => {
    const { input, reachedPage, shadow } = shadowTree();
    keepEditingKeysInsideShadowRoot(shadow);

    press(input, "s");
    expect(reachedPage).toEqual([]);
  });

  it("lets the page keep its shortcuts everywhere else", () => {
    const { button, reachedPage, shadow } = shadowTree();
    keepEditingKeysInsideShadowRoot(shadow);

    press(button, "s");
    expect(reachedPage).toEqual(["s"]);
  });

  it("reaches the page again once the dashboard is removed", () => {
    const { input, reachedPage, shadow } = shadowTree();
    keepEditingKeysInsideShadowRoot(shadow)();

    press(input, "s");
    expect(reachedPage).toEqual(["s"]);
  });
});
