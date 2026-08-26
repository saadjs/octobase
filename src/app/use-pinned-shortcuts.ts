import { useEffect } from "react";
import { favoriteRepositories } from "@/app/favorite-repositories";
import { isEditableEventTarget } from "@/lib/keyboard";

/** Digit keys open a pinned repository in a new tab, unless the reader is typing somewhere. */
export function usePinnedRepositoryShortcuts(pinned: readonly string[]): void {
  useEffect(() => {
    const repositories = favoriteRepositories(pinned);
    if (repositories.length === 0) return undefined;

    function onKeyDown(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (isEditableEventTarget(event)) return;
      const position = Number.parseInt(event.key, 10);
      if (!Number.isInteger(position) || position < 1) return;
      const repository = repositories[position - 1];
      if (!repository) return;
      // GitHub binds its own single-key shortcuts on this page; claim the digit first.
      event.preventDefault();
      event.stopPropagation();
      window.open(repository.url, "_blank", "noopener,noreferrer");
    }

    document.addEventListener("keydown", onKeyDown, { capture: true });
    return () => document.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [pinned]);
}
