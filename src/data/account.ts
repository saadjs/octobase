import type { DashboardSnapshot } from "@/data/github";

export function isDashboardForAccount(data: DashboardSnapshot, accountLogin: string): boolean {
  return normalizeGitHubLogin(data.viewer.login) === normalizeGitHubLogin(accountLogin);
}

export function normalizeGitHubLogin(login: string): string {
  return login.trim().toLowerCase();
}
