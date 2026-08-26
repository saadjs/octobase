const EDITABLE_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);
const ISOLATED_EVENTS = ["keydown", "keypress", "keyup"] as const;

export function isEditableElement(node: EventTarget | undefined): boolean {
  if (!(node instanceof HTMLElement)) return false;
  return EDITABLE_TAGS.has(node.tagName) || node.isContentEditable;
}

/**
 * For a listener outside the shadow tree, `composedPath()` is retargeted to the host, so this
 * only recognises fields in the page's own DOM — which is what a document listener can act on.
 */
export function isEditableEventTarget(event: Event): boolean {
  return isEditableElement(event.composedPath()[0]);
}

/**
 * GitHub's hotkeys skip events aimed at a form field, but shadow DOM retargets our fields to the
 * host, so GitHub sees a plain element and steals the key: typing `s` in a filter jumped the
 * cursor to GitHub's search. The listener has to sit on the shadow root itself, where the target
 * is still the real field — one on the host would see the same retargeted element GitHub does.
 * Keys pressed anywhere else leave GitHub's own shortcuts working.
 */
export function keepEditingKeysInsideShadowRoot(shadow: ShadowRoot): () => void {
  const stopPropagation = (event: Event) => {
    if (isEditableElement(event.target ?? undefined)) event.stopPropagation();
  };
  for (const type of ISOLATED_EVENTS) shadow.addEventListener(type, stopPropagation);
  return () => {
    for (const type of ISOLATED_EVENTS) shadow.removeEventListener(type, stopPropagation);
  };
}
