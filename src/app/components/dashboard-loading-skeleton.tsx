import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const DASHBOARD_ROWS = ["w-2/3", "w-4/5", "w-1/2"] as const;

/** Mirrors the dashboard panel while the independently loaded pinned sidebar remains usable. */
export function DashboardLoadingSkeleton() {
  return (
    <section aria-label="Loading your dashboard" className="min-w-0" role="status">
      <div aria-hidden>
        <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
        <Card className="mt-3 gap-3 p-3 sm:p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(14rem,1fr)_auto] lg:items-end">
            <div className="grid gap-1.5">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
          <div className="flex gap-2 border-t pt-3">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-28" />
          </div>
        </Card>
        <Skeleton className="mt-3 h-4 w-3/5" />
        <div className="mt-3 flex gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Card className="mt-3 gap-0 overflow-hidden py-0">
          {DASHBOARD_ROWS.map((width) => (
            <div className="border-b px-4 py-4 last:border-b-0" key={width}>
              <Skeleton className={`h-4 ${width}`} />
              <Skeleton className="mt-2 h-3 w-2/5" />
            </div>
          ))}
        </Card>
      </div>
    </section>
  );
}
