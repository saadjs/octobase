import { QueryClient } from "@tanstack/react-query";
import { DashboardRequestError } from "@/app/dashboard-queries";

export function createDashboardQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // A cold MV3 service worker can drop the first message; one retry recovers it.
        // A typed extension error (e.g. account_mismatch) is deterministic, so retrying it
        // only delays showing it to the user.
        retry: (failureCount, error) =>
          failureCount < 1 && !(error instanceof DashboardRequestError),
      },
      // Mutations stay at no retry so a user-triggered action never silently repeats.
      mutations: { retry: false },
    },
  });
}
