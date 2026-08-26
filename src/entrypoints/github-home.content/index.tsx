import "./style.css";
import { createRoot, type Root } from "react-dom/client";
import type { ShadowRootContentScriptUi } from "wxt/utils/content-script-ui/shadow-root";
import { App } from "@/app/App";
import { createDashboardQueryClient } from "@/app/query-client";
import { ShadowRootProvider } from "@/app/shadow-root";
import { installHideStyle, removeHideStyle } from "@/content/hide";
import { isHomePath } from "@/content/paths";
import { resolveTheme, watchTheme, type Theme } from "@/content/theme";
import { keepEditingKeysInsideShadowRoot } from "@/lib/keyboard";
import { sendOctobaseMessage } from "@/lib/messages";

type OctobaseUi = ShadowRootContentScriptUi<Root>;

// One client per injected script, not per mount: a Turbo trip away from the dashboard and back
// then reads the cache it already has instead of refetching everything.
const queryClient = createDashboardQueryClient();

export default defineContentScript({
  matches: [
    "https://github.com/",
    "https://github.com/dashboard",
    "https://github.com/dashboard/*",
  ],
  runAt: "document_start",
  cssInjectionMode: "ui",

  async main(ctx) {
    let ui: OctobaseUi | undefined;
    let mountedLogin: string | undefined;
    let routeVersion = 0;

    const removeUi = () => {
      ui?.remove();
      ui = undefined;
      mountedLogin = undefined;
    };

    const createUi = async (accountLogin: string): Promise<OctobaseUi> => {
      let stopWatchingTheme: (() => void) | undefined;
      let stopIsolatingKeys: (() => void) | undefined;

      return createShadowRootUi<Root>(ctx, {
        name: "octobase-root",
        position: "overlay",
        alignment: "top-left",
        anchor: "body",
        // WXT's default `all: initial !important` reset overrides our :host typography.
        // Keep GitHub's inherited font stack available, then normalize the host in style.css.
        inheritStyles: true,
        append: "first",
        onMount(container, shadow, shadowHost) {
          // WXT's absolute overlay container shrink-wraps by default, which defeats centered layouts.
          container.style.width = "100vw";
          container.style.maxWidth = "none";
          container.style.overflowX = "clip";

          const applyTheme = (theme: Theme) => {
            shadowHost.setAttribute("data-theme", theme);
            // Only a page can read the browser's colour scheme; the background owns the icon.
            void sendOctobaseMessage({ type: "octobase/set-theme", theme });
          };
          applyTheme(resolveTheme());
          stopWatchingTheme = watchTheme(applyTheme);
          stopIsolatingKeys = keepEditingKeysInsideShadowRoot(shadow);

          const root = createRoot(container);
          root.render(
            <ShadowRootProvider container={container}>
              <App accountLogin={accountLogin} queryClient={queryClient} />
            </ShadowRootProvider>,
          );
          return root;
        },
        onRemove(root) {
          stopWatchingTheme?.();
          stopWatchingTheme = undefined;
          stopIsolatingKeys?.();
          stopIsolatingKeys = undefined;
          root?.unmount();
        },
      });
    };

    const reconcileRoute = async () => {
      const currentVersion = ++routeVersion;

      if (!isHomePath(location.pathname)) {
        removeUi();
        removeHideStyle();
        return;
      }

      installHideStyle();

      try {
        await bodyReady();
        if (currentVersion !== routeVersion || !isHomePath(location.pathname)) return;

        const accountLogin = currentGitHubLogin();
        if (!accountLogin) {
          removeUi();
          removeHideStyle();
          return;
        }

        if (
          ui?.shadowHost.isConnected &&
          mountedLogin?.toLowerCase() === accountLogin.toLowerCase()
        ) {
          return;
        }
        removeUi();

        const nextUi = await createUi(accountLogin);
        if (currentVersion !== routeVersion || !isHomePath(location.pathname)) {
          nextUi.remove();
          return;
        }

        ui = nextUi;
        mountedLogin = accountLogin;
        ui.mount();
      } catch (error) {
        if (currentVersion !== routeVersion) return;

        // A blank page is worse than GitHub's homepage. Give it back.
        removeUi();
        removeHideStyle();
        // Reloading the extension invalidates scripts already running in open tabs.
        // Chrome records console.error calls as extension errors, even though the
        // only useful recovery here is restoring GitHub until the tab is refreshed.
        if (!(error instanceof Error && isExtensionContextInvalidated(error))) {
          console.error("[octobase] failed to mount, restored GitHub's homepage", error);
        }
      }
    };

    ctx.addEventListener(document, "turbo:load", () => {
      void reconcileRoute();
    });

    await reconcileRoute();

    let observedLogin = currentGitHubLogin()?.toLowerCase();
    const loginObserver = new MutationObserver(() => {
      const nextLogin = currentGitHubLogin()?.toLowerCase();
      if (nextLogin === observedLogin) return;
      observedLogin = nextLogin;
      removeUi();
      void reconcileRoute();
    });
    // The login meta tag lives in <head>. Observing the whole document made every React and
    // GitHub DOM update run an account lookup even though body mutations cannot change it.
    loginObserver.observe(document.head ?? document.documentElement, {
      attributes: true,
      attributeFilter: ["content"],
      childList: true,
      subtree: true,
    });
    ctx.onInvalidated(() => {
      routeVersion += 1;
      loginObserver.disconnect();
      removeUi();
      removeHideStyle();
    });
  },
});

function currentGitHubLogin(): string | undefined {
  const login = document.querySelector<HTMLMetaElement>('meta[name="user-login"]')?.content.trim();
  return login || undefined;
}

function bodyReady(): Promise<void> {
  if (document.body) return Promise.resolve();
  return new Promise((resolve) => {
    new MutationObserver((_, observer) => {
      if (document.body) {
        observer.disconnect();
        resolve();
      }
    }).observe(document.documentElement, { childList: true });
  });
}

function isExtensionContextInvalidated(error: Error): boolean {
  return /extension context invalidated/i.test(error.message);
}
