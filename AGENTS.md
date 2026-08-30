# AGENTS.md

`Octobase` is a WXT + React browser extension that replaces GitHub's logged-in homepage with a read-only, actionable dashboard.

## Project map

- `src/entrypoints/` — WXT background and GitHub content-script entrypoints.
- `src/app/` — dashboard React UI, controller hook, TanStack Query layer, connect and token-entry panels, and Shadow DOM provider.
- `src/components/ui/` — generated shadcn primitives.
- `src/auth/` — GitHub App device flow and the background-owned token provider; the token entry UI lives in `src/app/components/`.
- `src/data/` — typed GitHub GraphQL query, attention ranking, preferences, IndexedDB cache.
- `src/content/` — route, GitHub-dashboard hiding, and theme lifecycle helpers.
- `src/messages.ts` — the typed content-script ↔ background message contract.
- `src/lib/` — message sender, dashboard push broadcast, and shared helpers.
- `src/gql/` — generated GraphQL artifacts; regenerate rather than hand-edit.
- `tools/oxlint/anti-slop/` — custom oxlint plugin enforced by `pnpm lint`.
- `tools/safari/` — Safari wrapper generation, unsigned build check, and archive/export/notarization for both the App Store and Developer ID (Homebrew) channels.
- `tests/e2e/` — Playwright end-to-end and performance suite over the built extension.

Stack: WXT, React 19, TypeScript, Tailwind v4, shadcn, TanStack Query, valibot, GitHub GraphQL, IndexedDB, Vitest, Playwright.

<important if="you need to run commands to develop, build, test, lint, format, type-check, or generate GraphQL code">

| Command                                              | What it does                                                              |
| ---------------------------------------------------- | ------------------------------------------------------------------------- |
| `pnpm dev` / `pnpm dev:chrome`                       | Start the Chrome development build.                                       |
| `pnpm dev:firefox`                                   | Start the Firefox development build.                                      |
| `pnpm dev:safari`                                    | Build the Safari extension into `.output/`.                               |
| `pnpm dev:all`                                       | Build Safari; start Chrome and Firefox development.                       |
| `pnpm check`                                         | Format check, lint, type-check, and test.                                 |
| `pnpm test`                                          | Run all tests once.                                                       |
| `pnpm vitest run <path>`                             | Run one test file; add `-t "<name>"` for one test.                        |
| `pnpm test:watch`                                    | Vitest in watch mode.                                                     |
| `pnpm test:coverage`                                 | Tests with v8 coverage.                                                   |
| `pnpm test:e2e` / `test:e2e:ui`                      | Playwright e2e against the built Chrome extension.                        |
| `pnpm size`                                          | Gzip budget gate over `.output/chrome-mv3`.                               |
| `pnpm lint` / `pnpm lint:fix`                        | oxlint, type-aware, warnings are errors.                                  |
| `pnpm format` / `format:check`                       | oxfmt write / check.                                                      |
| `pnpm typecheck`                                     | `tsc --noEmit`.                                                           |
| `pnpm codegen` / `:watch`                            | Regenerate GraphQL types from the local GitHub schema.                    |
| `pnpm build` / `:firefox` / `:safari` / `:all`       | Production builds into `.output/`.                                        |
| `pnpm zip`                                           | Package a build for store upload.                                         |
| `pnpm package:safari`                                | Generate the Safari Xcode wrapper into `.output/safari-xcode`.            |
| `pnpm open:safari`                                   | Generate the wrapper and open it in Xcode.                                |
| `pnpm sync:safari`                                   | Rebuild Safari and rsync it into the generated wrapper's resources.       |
| `pnpm check:safari`                                  | Build the generated native wrapper without signing.                       |
| `pnpm archive:safari`                                | Signed App Store archive; needs `APPLE_TEAM_ID` and `APPLE_BUILD_NUMBER`. |
| `pnpm package:safari:direct`                         | Generate the Developer ID wrapper into `.output/safari-xcode-direct`.     |
| `pnpm check:safari:direct` / `archive:safari:direct` | Unsigned build check / signed Developer ID archive of that wrapper.       |
| `pnpm export:safari` / `notarize:safari`             | Export the Developer ID app; notarize, staple, and zip it for the tap.    |
| `pnpm release:safari`                                | Archive, export, and notarize the Homebrew build in one run.              |

`pnpm dev` needs no `.env`: `wxt.config.ts` defaults `WXT_GITHUB_CLIENT_ID` and `WXT_GITHUB_APP_SLUG` to the public Octobase GitHub App. Override them in `.env` (see `.env.example`) to target a different App. `pnpm codegen` needs no token.
</important>

<important if="you are changing the GitHub homepage content script or its mounted layout">

- Preserve GitHub's native header and navigation at the top of the page.
- Mount the replacement dashboard as an overlay below that header; it must not take normal body flow or push GitHub chrome downward.
- Keep the `turbo:load` route reconciliation and the unhide-on-mount-failure escape hatch.
  </important>

<important if="you are adding or modifying dashboard UI, controls, badges, cards, or separators">

- Compose generated primitives from `src/components/ui/` before adding custom UI equivalents.
- Install or refresh primitives with `pnpm dlx shadcn@latest add COMPONENT -y -p src/components/ui` (`-o` when refreshing); the explicit path is required because WXT's generated tsconfig otherwise makes the CLI write outside this repository. Apply project-specific changes only after generation.
- Keep shadcn's Shadow DOM setup intact: tokens live on `:host` and portal-capable components use `ShadowRootProvider`.
- `src/app/App.tsx` is a composition root only. Message-driven state belongs in `use-dashboard-controller.ts`, panels in `src/app/components/`, and pure selectors/formatting in `dashboard-items.ts` and `presentation.ts`.
  </important>

<important if="you are changing GitHub authentication, API calls, cache, or extension messages">

- The background owns tokens, network requests, cache writes, extension storage, and alarms. Content scripts only use typed `src/messages.ts` requests.
- Treat the service worker as ephemeral: durable state belongs in IndexedDB or extension storage, never in background module scope.
- Tokens and cache entries are keyed by normalized `viewer.login`; verify the fetched viewer matches the requesting account before returning a snapshot.
- Never expose an access token to page DOM, page scripts, or a content-script response.
  </important>

<important if="you are editing a GraphQL operation or the attention queue">

- Change `src/data/dashboard.graphql`, then run `pnpm codegen`; do not hand-edit `src/gql/`.
  </important>

<important if="you are writing or modifying tests">

- Vitest + happy-dom + Testing Library; `tests/setup.ts` resets `fakeBrowser` before each test.
- Module mocking is banned by lint (`anti-slop/no-module-mocking`). Use `fakeBrowser` and the fakes in `src/data/test-fixtures.ts` instead of `vi.mock`.
- e2e lives in `tests/e2e/*.spec.ts` and drives the real `.output/chrome-mv3` build in Chrome. It is
  hermetic: `tests/e2e/fixtures/extension.ts` stubs github.com and api.github.com with
  `context.route`, seeds a token straight into the service worker, and closes the tab the extension
  opens on install. Never point e2e at the live GitHub API.
- Performance budgets (mount latency, total blocking time, request counts) live in
  `tests/e2e/performance.spec.ts`; bundle budgets live in `tools/size/check-bundle-size.mjs`.
  </important>

<important if="you hit an unfamiliar lint error, or are writing types, type assertions, or function signatures">

The local `anti-slop` oxlint plugin errors on patterns beyond the usual rules: `unknown` parameters/returns/aliases, unsafe dictionary types, chained or widen-then type assertions, runtime `typeof` narrowing, `Reflect` access, and object-bag parameters. Type assertions require a short safety comment. See `tools/oxlint/anti-slop/rules/` for a rule's exact condition.
</important>
