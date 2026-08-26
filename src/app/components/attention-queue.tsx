/* eslint-disable react-perf/jsx-no-new-function-as-prop -- Queue callbacks carry local filter and item identity. */
import { useMemo, useState } from "react";
import { SeparatedRows } from "@/app/components/dashboard-layout";
import { IssueRow, PullRequestRow } from "@/app/components/item-rows";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ATTENTION_REASON_LABELS,
  ATTENTION_REASONS,
  type AttentionItem,
  type AttentionReason,
} from "@/data/attention";
import { isDashboardItemHidden, type DashboardPreferences } from "@/data/dashboard-preferences";

const ATTENTION_PAGE_SIZE = 15;

export function AttentionQueue({
  filtersActive,
  isLoadingMore,
  items,
  onLoadAll,
  onSetItemHidden,
  pendingSections,
  preferences,
}: {
  filtersActive: boolean;
  isLoadingMore: boolean;
  items: AttentionItem[];
  onLoadAll: () => void;
  onSetItemHidden: (itemId: string, updatedAt?: string) => void;
  pendingSections: number;
  preferences: DashboardPreferences;
}) {
  const [filter, setFilter] = useState<AttentionReason>();
  const [limit, setLimit] = useState(ATTENTION_PAGE_SIZE);
  const counts = useMemo(() => {
    const totals = new Map<AttentionReason, number>();
    for (const item of items) {
      for (const reason of item.reasons) totals.set(reason, (totals.get(reason) ?? 0) + 1);
    }
    return totals;
  }, [items]);
  const filtered = filter ? items.filter((item) => item.reasons.includes(filter)) : items;
  const visible = filtered.slice(0, limit);
  const select = (reason: AttentionReason | undefined) => {
    setFilter(reason);
    setLimit(ATTENTION_PAGE_SIZE);
  };

  if (items.length === 0) {
    return (
      <Card className="mt-3 gap-0">
        <CardContent className="py-6 text-sm text-muted-foreground">
          {filtersActive
            ? "No loaded attention items match your filters."
            : "Nothing needs your attention right now."}
        </CardContent>
        {pendingSections > 0 ? (
          <LoadAllAttentionButton isLoading={isLoadingMore} onLoadAll={onLoadAll} />
        ) : null}
      </Card>
    );
  }

  return (
    <>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter by reason">
        <FilterChip
          count={items.length}
          isActive={filter === undefined}
          label="All"
          onSelect={() => select(undefined)}
        />
        {ATTENTION_REASONS.filter((reason) => counts.has(reason)).map((reason) => (
          <FilterChip
            count={counts.get(reason) ?? 0}
            isActive={filter === reason}
            key={reason}
            label={ATTENTION_REASON_LABELS[reason]}
            onSelect={() => select(reason)}
          />
        ))}
      </div>
      <Card className="mt-3 gap-0 overflow-hidden py-0">
        <CardContent className="px-0">
          <SeparatedRows>
            {visible.map((item) =>
              item.kind === "pull-request" ? (
                <PullRequestRow
                  isHidden={isDashboardItemHidden(
                    preferences,
                    item.pullRequest.id,
                    item.pullRequest.updatedAt,
                  )}
                  key={item.key}
                  onSetHidden={onSetItemHidden}
                  pullRequest={item.pullRequest}
                  showChecks
                  waitingSince={item.waitingSince}
                />
              ) : (
                <IssueRow
                  isHidden={isDashboardItemHidden(preferences, item.issue.id, item.issue.updatedAt)}
                  issue={item.issue}
                  key={item.key}
                  onSetHidden={onSetItemHidden}
                  waitingSince={item.waitingSince}
                />
              ),
            )}
          </SeparatedRows>
        </CardContent>
        {visible.length < filtered.length || pendingSections > 0 ? (
          <div className="flex flex-col gap-2 border-t px-4 py-3 sm:flex-row">
            {visible.length < filtered.length ? (
              <Button
                className="flex-1"
                onClick={() => setLimit((current) => current + ATTENTION_PAGE_SIZE)}
                size="sm"
                type="button"
                variant="outline"
              >
                Show {filtered.length - visible.length} loaded items
              </Button>
            ) : null}
            {pendingSections > 0 ? (
              <Button
                className="flex-1"
                disabled={isLoadingMore}
                onClick={onLoadAll}
                size="sm"
                type="button"
                variant="outline"
              >
                {isLoadingMore ? "Loading from GitHub…" : "Fetch more from GitHub"}
              </Button>
            ) : null}
          </div>
        ) : null}
      </Card>
    </>
  );
}

function LoadAllAttentionButton({
  isLoading,
  onLoadAll,
}: {
  isLoading: boolean;
  onLoadAll: () => void;
}) {
  return (
    <div className="border-t px-4 py-3">
      <Button
        className="w-full"
        disabled={isLoading}
        onClick={onLoadAll}
        size="sm"
        type="button"
        variant="outline"
      >
        {isLoading ? "Loading from GitHub…" : "Fetch more from GitHub"}
      </Button>
    </div>
  );
}

function FilterChip({
  count,
  isActive,
  label,
  onSelect,
}: {
  count: number;
  isActive: boolean;
  label: string;
  onSelect: () => void;
}) {
  return (
    <Button
      aria-pressed={isActive}
      onClick={onSelect}
      size="sm"
      type="button"
      variant={isActive ? "secondary" : "ghost"}
    >
      {label}
      <Badge className="min-w-5 px-1.5" variant="secondary">
        {count}
      </Badge>
    </Button>
  );
}
