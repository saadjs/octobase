import * as v from "valibot";
import { normalizeGitHubLogin } from "@/data/account";
import { KeyedSerialQueue } from "@/lib/keyed-serial-queue";

export type DashboardTab = "attention" | "owned" | "contributions";
export type ItemTypeFilter = "all" | "pull-request" | "issue";

export interface DashboardPreferences {
  selectedTab: DashboardTab;
  repositoryQuery: string;
  itemType: ItemTypeFilter;
  showDrafts: boolean;
  showHidden: boolean;
  hiddenItems: Record<string, string>;
  favoriteRepositories: string[];
}

export type DashboardPreferenceChanges = Partial<
  Pick<
    DashboardPreferences,
    | "selectedTab"
    | "repositoryQuery"
    | "itemType"
    | "showDrafts"
    | "showHidden"
    | "favoriteRepositories"
  >
>;

const dashboardPreferencesSchema = v.object({
  selectedTab: v.union([v.literal("attention"), v.literal("owned"), v.literal("contributions")]),
  repositoryQuery: v.string(),
  itemType: v.union([v.literal("all"), v.literal("pull-request"), v.literal("issue")]),
  showDrafts: v.boolean(),
  showHidden: v.boolean(),
  hiddenItems: v.record(v.string(), v.string()),
  // Optional so preferences saved before pinned repositories existed still parse.
  favoriteRepositories: v.optional(v.array(v.string()), []),
});
const legacyPreferencesStorage = storage.defineItem<Record<string, DashboardPreferences>>(
  "local:dashboardPreferences",
  { fallback: {} },
);
const preferenceUpdates = new KeyedSerialQueue();

export function defaultDashboardPreferences(): DashboardPreferences {
  return {
    selectedTab: "attention",
    repositoryQuery: "",
    itemType: "all",
    showDrafts: true,
    showHidden: false,
    hiddenItems: {},
    favoriteRepositories: [],
  };
}

export async function readDashboardPreferences(
  accountLogin: string,
): Promise<DashboardPreferences> {
  const account = normalizeGitHubLogin(accountLogin);
  const key = preferencesKey(account);
  const current = v.safeParse(dashboardPreferencesSchema, await storage.getItem(key));
  if (current.success) return current.output;

  // Read the former shared object as a migration fallback. The next update writes the
  // per-account key, which cannot overwrite another account's preferences.
  const legacy = v.safeParse(
    dashboardPreferencesSchema,
    (await legacyPreferencesStorage.getValue())[account],
  );
  return legacy.success ? legacy.output : defaultDashboardPreferences();
}

export async function updateDashboardPreferences(
  accountLogin: string,
  changes: DashboardPreferenceChanges,
): Promise<DashboardPreferences> {
  return writeAccountPreferences(accountLogin, (current) => ({ ...current, ...changes }));
}

export async function setHiddenDashboardItem(
  accountLogin: string,
  itemId: string,
  updatedAt?: string,
): Promise<DashboardPreferences> {
  return writeAccountPreferences(accountLogin, (current) => {
    const hiddenItems = { ...current.hiddenItems };
    if (updatedAt) hiddenItems[itemId] = updatedAt;
    else delete hiddenItems[itemId];
    return { ...current, hiddenItems };
  });
}

export function isDashboardItemHidden(
  preferences: DashboardPreferences,
  itemId: string,
  updatedAt: string,
): boolean {
  return preferences.hiddenItems[itemId] === updatedAt;
}

async function writeAccountPreferences(
  accountLogin: string,
  update: (current: DashboardPreferences) => DashboardPreferences,
): Promise<DashboardPreferences> {
  const account = normalizeGitHubLogin(accountLogin);
  const key = preferencesKey(account);
  return preferenceUpdates.run(key, async () => {
    const next = update(await readDashboardPreferences(account));
    await storage.setItem(key, next);
    return next;
  });
}

function preferencesKey(accountLogin: string): `local:${string}` {
  return `local:dashboardPreferences:${accountLogin}`;
}
