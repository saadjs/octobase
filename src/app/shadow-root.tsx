import { createContext, use, useCallback, type ReactNode } from "react";

/**
 * Radix portals default to document.body, which lands them outside our shadow root
 * where none of our styles apply. Every portal must be handed this container.
 */
const ShadowRootContext = createContext<HTMLElement | null>(null);

export function ShadowRootProvider({
  container,
  children,
}: {
  container: HTMLElement;
  children: ReactNode;
}) {
  return <ShadowRootContext value={container}>{children}</ShadowRootContext>;
}

export function usePortalContainer(): HTMLElement | undefined {
  return use(ShadowRootContext) ?? undefined;
}

/**
 * Radix's modal scroll lock listens for `wheel` on the document and only allows the event
 * when the overlay's content contains `event.target`. Shadow DOM retargets that target to our
 * host, so the check fails and every scroll inside an overlay is cancelled. Keeping the event
 * inside the shadow tree leaves the lock working for the page and lets the overlay scroll.
 */
export function useScrollLockEscape(): (node: HTMLElement | null) => (() => void) | undefined {
  return useCallback((node: HTMLElement | null) => {
    if (!node) return undefined;

    const stopPropagation = (event: Event) => event.stopPropagation();
    node.addEventListener("wheel", stopPropagation);
    node.addEventListener("touchmove", stopPropagation);
    return () => {
      node.removeEventListener("wheel", stopPropagation);
      node.removeEventListener("touchmove", stopPropagation);
    };
  }, []);
}
