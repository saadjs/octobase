import { Children, Fragment, isValidElement, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { TabsContent } from "@/components/ui/tabs";
import { formatCount } from "@/app/presentation";

export function DashboardTabContent({
  children,
  description,
  value,
}: {
  children: ReactNode;
  description: string;
  value: string;
}) {
  return (
    <TabsContent value={value}>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <div className="mt-3 grid items-stretch gap-4 md:grid-cols-2">{children}</div>
    </TabsContent>
  );
}

export function WorkPanel({
  children,
  count,
  displayedCount,
  empty,
  filteredCount,
  filtersActive,
  hasNextPage,
  isLoading,
  isLoadingAll,
  onShowAll,
  title,
}: {
  children: ReactNode;
  count: number;
  displayedCount: number;
  empty: string;
  filteredCount: number;
  filtersActive: boolean;
  hasNextPage: boolean;
  isLoading: boolean;
  isLoadingAll: boolean;
  onShowAll: () => void;
  title: string;
}) {
  const hasHiddenResults = displayedCount < count;
  return (
    <Card className="h-full gap-0 overflow-hidden py-0">
      <CardHeader className="min-h-13 items-center py-3">
        <CardTitle>{title}</CardTitle>
        <CardAction className="self-center">
          <Badge className="min-w-6 px-1.5" variant="secondary">
            {filtersActive
              ? `${filteredCount} shown`
              : hasHiddenResults
                ? `${formatCount(displayedCount)} of ${formatCount(count)}`
                : formatCount(count)}
          </Badge>
        </CardAction>
      </CardHeader>
      <Separator />
      <CardContent className="px-0">
        {filteredCount > 0 ? (
          children
        ) : isLoading ? (
          <LoadingRows title={title} />
        ) : (
          <p className="flex min-h-20 items-center px-4 py-4 text-sm text-muted-foreground">
            {filtersActive && count > 0 ? "No loaded items match your filters." : empty}
          </p>
        )}
      </CardContent>
      {hasHiddenResults && hasNextPage ? (
        <div className="mt-auto border-t px-4 py-3">
          <Button
            className="w-full"
            disabled={isLoadingAll}
            onClick={onShowAll}
            size="sm"
            type="button"
            variant="outline"
          >
            {isLoadingAll ? "Loading all…" : `Show all ${formatCount(count)}`}
          </Button>
        </div>
      ) : hasHiddenResults ? (
        <p className="mt-auto border-t px-4 py-3 text-xs text-muted-foreground">
          GitHub search exposes at most 1,000 results.
        </p>
      ) : null}
    </Card>
  );
}

function LoadingRows({ title }: { title: string }) {
  return (
    <div className="flex min-h-20 flex-col justify-center gap-3 px-4 py-4" role="status">
      <span className="sr-only">{`Loading ${title}…`}</span>
      <Skeleton className="h-4 w-3/5" aria-hidden />
      <Skeleton className="h-4 w-2/5" aria-hidden />
    </div>
  );
}

export function SeparatedRows({ children }: { children: ReactNode }) {
  const rows = Children.toArray(children).filter(isValidElement);
  return rows.map((row, index) => (
    <Fragment key={row.key}>
      {row}
      {index < rows.length - 1 ? <Separator /> : null}
    </Fragment>
  ));
}
