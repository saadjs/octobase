export const HIDE_STYLE_ID = "octobase-hide";

// GitHub's dashboard body. The header and nav stay put so their navigation keeps working.
const HIDDEN_SELECTORS = [".application-main", 'div[data-testid="dashboard"]', "#dashboard"];

/** Injected at document_start so GitHub's feed never paints. */
export function installHideStyle(doc: Document = document): HTMLStyleElement {
  const existing = doc.getElementById(HIDE_STYLE_ID);
  if (existing instanceof HTMLStyleElement) return existing;

  const style = doc.createElement("style");
  style.id = HIDE_STYLE_ID;
  style.textContent = `${HIDDEN_SELECTORS.join(",")}{display:none !important}`;
  doc.documentElement.append(style);
  return style;
}

/** The escape hatch: if we cannot render, give the user GitHub's homepage back. */
export function removeHideStyle(doc: Document = document): void {
  doc.getElementById(HIDE_STYLE_ID)?.remove();
}

export function isHidden(doc: Document = document): boolean {
  return doc.getElementById(HIDE_STYLE_ID) !== null;
}
