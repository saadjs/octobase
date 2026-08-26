/** Helpers the stubbed github.com page exposes so specs can drive Turbo and account switches. */
interface Window {
  turboNavigate(path: string): void;
  switchAccount(login: string): void;
  octobaseLongTasks: number[];
}
