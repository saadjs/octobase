/** A stand-in for GitHub's logged-in dashboard: the chrome we keep, and the feed we hide. */
export function githubPageHtml(login: string): string {
  return `<!doctype html>
<html lang="en" data-color-mode="light" data-light-theme="light" data-dark-theme="dark">
  <head>
    <meta charset="utf-8" />
    <meta name="user-login" content="${login}" />
    <title>GitHub</title>
    <style>
      body { margin: 0; font-family: system-ui, sans-serif; }
      .AppHeader { height: 64px; background: #24292f; color: #fff; }
      #dashboard { height: 2000px; background: #f6f8fa; }
    </style>
  </head>
  <body>
    <header class="AppHeader" data-testid="github-header">
      GitHub header
      <input data-testid="github-search" aria-label="Search GitHub" />
    </header>
    <div class="application-main">
      <div id="dashboard" data-testid="dashboard">GitHub news feed</div>
    </div>
    <script>
      // GitHub binds single-key shortcuts on document and skips events aimed at a form field.
      document.addEventListener("keydown", (event) => {
        const target = event.target;
        const editable =
          target instanceof HTMLElement &&
          (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable);
        if (editable || event.metaKey || event.ctrlKey || event.altKey) return;
        if (event.key === "s" || event.key === "/") {
          event.preventDefault();
          document.querySelector('[data-testid="github-search"]').focus();
        }
      });
      // GitHub navigates with Turbo; the content script reconciles on turbo:load.
      window.turboNavigate = (path) => {
        history.pushState({}, "", path);
        document.dispatchEvent(new CustomEvent("turbo:load"));
      };
      window.switchAccount = (nextLogin) => {
        document.querySelector('meta[name="user-login"]').setAttribute("content", nextLogin);
      };
    </script>
  </body>
</html>`;
}
