import type { DeviceAuthorization, PublicTokenState, TokenMetadata } from "@/auth/types";
import type { CachedDashboard } from "@/data/cache";
import type { Theme } from "@/content/theme";
import type {
  DashboardPreferenceChanges,
  DashboardPreferences,
  DashboardTab,
} from "@/data/dashboard-preferences";
import type { DashboardSnapshot } from "@/data/github";
import type { RepositoryAccess } from "@/data/repository-access";
import type { PinnableRepository } from "@/data/viewer-repositories";
import type { DashboardSection } from "@/data/dashboard-sections";

export type { DashboardSection } from "@/data/dashboard-sections";

export type OctobaseRequest =
  | { type: "octobase/token-state"; accountLogin: string }
  | {
      type: "octobase/set-token";
      accountLogin: string;
      accessToken: string;
      metadata: TokenMetadata;
    }
  | { type: "octobase/disconnect"; accountLogin: string }
  | { type: "octobase/repository-access"; accountLogin: string }
  | { type: "octobase/repository-installation-state"; accountLogin: string }
  | { type: "octobase/viewer-repositories"; accountLogin: string }
  | { type: "octobase/open-repository-installation"; accountLogin: string }
  | {
      type: "octobase/update-preferences";
      accountLogin: string;
      changes: DashboardPreferenceChanges;
    }
  | {
      type: "octobase/set-hidden-item";
      accountLogin: string;
      itemId: string;
      updatedAt?: string;
    }
  | { type: "octobase/set-theme"; theme: Theme }
  | { type: "octobase/start-device-flow" }
  | { type: "octobase/complete-device-flow"; accountLogin: string; deviceCode: string }
  | { type: "octobase/preferences"; accountLogin: string }
  | {
      type: "octobase/dashboard";
      accountLogin: string;
      refresh?: boolean;
      showAll?: DashboardSection[];
      selectedTab: DashboardTab;
    };

/** The one background -> content direction: revalidation wrote a newer durable snapshot. */
export type OctobasePush = {
  type: "octobase/dashboard-updated";
  accountLogin: string;
  snapshot: CachedDashboard<DashboardSnapshot>;
};

export type OctobaseResponse =
  // Token state is a storage read only. Installation state costs a REST round trip and rides
  // on `octobase/repository-installation-state`, so connecting never waits for it.
  | { kind: "token-state"; token: PublicTokenState }
  | { kind: "device-authorization"; authorization: DeviceAuthorization }
  | {
      kind: "dashboard";
      snapshot?: CachedDashboard<DashboardSnapshot>;
      stale: boolean;
      warning?: string;
    }
  | { kind: "preferences"; preferences: DashboardPreferences }
  | { kind: "repository-access"; accountLogin: string; access: RepositoryAccess }
  | { kind: "repository-installation-state"; hasPersonalInstallation: boolean }
  | { kind: "viewer-repositories"; accountLogin: string; repositories: PinnableRepository[] }
  | { kind: "ok" }
  | { kind: "error"; message: string; code?: string };
