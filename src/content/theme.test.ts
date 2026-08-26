import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveTheme, watchTheme, type Theme } from "./theme";

afterEach(() => {
  delete document.documentElement.dataset.colorMode;
});

describe("resolveTheme", () => {
  it("follows GitHub's colour mode", () => {
    document.documentElement.dataset.colorMode = "dark";
    expect(resolveTheme()).toBe("dark");
    document.documentElement.dataset.colorMode = "light";
    expect(resolveTheme()).toBe("light");
  });

  it("falls back to the OS preference when GitHub says auto", () => {
    document.documentElement.dataset.colorMode = "auto";
    // SAFETY: resolveTheme only reads the MediaQueryList matches field.
    vi.spyOn(globalThis, "matchMedia").mockReturnValue({ matches: true } as MediaQueryList);
    expect(resolveTheme()).toBe("dark");
  });
});

describe("watchTheme", () => {
  it("reports GitHub's toggle and stops after cleanup", async () => {
    const onChange = vi.fn<(theme: Theme) => void>();
    const stop = watchTheme(onChange);

    document.documentElement.dataset.colorMode = "dark";
    await vi.waitFor(() => expect(onChange).toHaveBeenCalledWith("dark"));

    stop();
    onChange.mockClear();
    document.documentElement.dataset.colorMode = "light";
    await new Promise((r) => setTimeout(r, 10));
    expect(onChange).not.toHaveBeenCalled();
  });
});
