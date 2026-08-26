/* eslint-disable react-perf/jsx-no-new-function-as-prop -- Filter callbacks carry a small value and do not cross memoized boundaries. */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type {
  DashboardPreferenceChanges,
  DashboardPreferences,
  ItemTypeFilter,
} from "@/data/dashboard-preferences";

const ITEM_TYPES: readonly { label: string; value: ItemTypeFilter }[] = [
  { label: "All items", value: "all" },
  { label: "Pull requests", value: "pull-request" },
  { label: "Issues", value: "issue" },
];

export function DashboardFilters({
  hiddenCount,
  onUpdate,
  preferences,
}: {
  hiddenCount: number;
  onUpdate: (changes: DashboardPreferenceChanges) => void;
  preferences: DashboardPreferences;
}) {
  // Saving a preference is an async round trip through the background, so binding the field
  // straight to it re-renders the input with a value several keystrokes behind and drops what
  // was typed meanwhile. The field owns its text; the stored preference only seeds it.
  const [query, setQuery] = useState(preferences.repositoryQuery);

  const hasActiveFilters =
    query !== "" ||
    preferences.itemType !== "all" ||
    !preferences.showDrafts ||
    preferences.showHidden;

  return (
    <Card className="mt-3 gap-3 p-3 sm:p-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(14rem,1fr)_auto] lg:items-end">
        <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
          Repository or organization
          <Input
            aria-label="Filter by repository or organization"
            onChange={(event) => {
              setQuery(event.currentTarget.value);
              onUpdate({ repositoryQuery: event.currentTarget.value });
            }}
            placeholder="owner or owner/repository"
            type="search"
            value={query}
          />
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by item type">
          {ITEM_TYPES.map(({ label, value }) => (
            <Button
              aria-pressed={preferences.itemType === value}
              key={value}
              onClick={() => onUpdate({ itemType: value })}
              size="sm"
              type="button"
              variant={preferences.itemType === value ? "secondary" : "ghost"}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 border-t pt-3">
        <Button
          aria-pressed={!preferences.showDrafts}
          onClick={() => onUpdate({ showDrafts: !preferences.showDrafts })}
          size="sm"
          type="button"
          variant={!preferences.showDrafts ? "secondary" : "ghost"}
        >
          {preferences.showDrafts ? "Hide drafts" : "Drafts hidden"}
        </Button>
        <Button
          aria-pressed={preferences.showHidden}
          disabled={hiddenCount === 0 && !preferences.showHidden}
          onClick={() => onUpdate({ showHidden: !preferences.showHidden })}
          size="sm"
          type="button"
          variant={preferences.showHidden ? "secondary" : "ghost"}
        >
          {preferences.showHidden ? "Showing hidden" : `Show hidden (${hiddenCount})`}
        </Button>
        {hasActiveFilters ? (
          <Button
            className="sm:ml-auto"
            onClick={() => {
              setQuery("");
              onUpdate({
                repositoryQuery: "",
                itemType: "all",
                showDrafts: true,
                showHidden: false,
              });
            }}
            size="sm"
            type="button"
            variant="outline"
          >
            Clear filters
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
