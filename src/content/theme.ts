export type Theme = "light" | "dark";

/** Follow whatever GitHub is already showing so we do not flash the wrong palette. */
export function resolveTheme(doc: Document = document): Theme {
  const mode = doc.documentElement.dataset.colorMode;
  if (mode === "dark") return "dark";
  if (mode === "light") return "light";
  return globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Re-reads the theme whenever GitHub's own toggle changes it. Returns a cleanup fn. */
export function watchTheme(onChange: (theme: Theme) => void, doc: Document = document): () => void {
  const observer = new MutationObserver(() => onChange(resolveTheme(doc)));
  observer.observe(doc.documentElement, {
    attributes: true,
    attributeFilter: ["data-color-mode", "data-light-theme", "data-dark-theme"],
  });
  return () => observer.disconnect();
}
