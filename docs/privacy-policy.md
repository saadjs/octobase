---
title: Privacy Policy
---

# Octobase Privacy Policy

**Last updated: August 25, 2026**

Octobase is a browser extension that replaces the GitHub logged-in homepage with a read-only
dashboard. This policy explains exactly what the extension
touches and where it goes.

## The short version

Octobase has no backend. There is no Octobase server, no analytics, no telemetry, and no third
party that receives your data. The extension talks only to GitHub, using your own credentials, and
everything it keeps is stored locally in your browser.

## What Octobase stores on your device

| Data                                                                                                                                 | Where it lives                                   | Why                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------------------------------ |
| Your GitHub access token                                                                                                             | Extension local storage, keyed by GitHub account | Authenticates your requests to GitHub                                    |
| A snapshot of your dashboard (pull requests, issues, repository names, authors, labels, CI status, your login, name, and avatar URL) | IndexedDB database named `octobase`              | Renders the dashboard instantly and avoids refetching on every page load |
| Your dashboard preferences (active tab, filters, pinned repositories)                                                                | Extension local storage                          | Remembers how you left the dashboard                                     |

All of this stays on the device where it was created. Octobase does not sync it, upload it, or
transmit it anywhere.

## Where Octobase sends data

Octobase makes network requests to GitHub and nowhere else:

- `https://github.com/login/device/code` and `https://github.com/login/oauth/access_token`: the
  GitHub App device authorization flow that connects your account.
- `https://api.github.com/graphql`: reads the pull requests, issues, and repository metadata shown
  on the dashboard.
- `https://api.github.com` REST endpoints: checks which repositories you have granted the GitHub
  App access to.

Every request carries your own GitHub token and is subject to GitHub's own
[Privacy Statement](https://docs.github.com/site-policy/privacy-policies/github-privacy-statement).
Octobase never sends your token, your GitHub data, or your browsing activity to any other
destination.

## What Octobase does not do

- It does not run on any site other than `github.com`, and only on the homepage and dashboard
  routes.
- It does not read, collect, or transmit your browsing history.
- It does not expose your access token to the GitHub page, to page scripts, or to any content
  script. The token is held by the extension's background service worker only.
- It does not write to GitHub. Every action in the dashboard is a link back to GitHub itself.
- It does not sell, share, or transfer data to third parties. There are no third parties.
- It does not use your data for advertising, profiling, or model training.

## Permissions

- **`storage`**: saves your token, dashboard cache, and preferences locally.
- **Host access to `https://github.com/*`**: lets the extension replace the homepage and complete
  the sign-in flow.
- **Host access to `https://api.github.com/*`**: lets the extension read your dashboard data from
  the GitHub API.

## Deleting your data

Disconnecting your account from within Octobase removes the stored token and the cached dashboard
for that account. Uninstalling the extension removes everything Octobase stored, including the
`octobase` IndexedDB database and all preferences. You can also revoke Octobase's access at any
time from your GitHub account under **Settings → Applications**.

## Children

Octobase is a developer tool and is not directed at children under 13.

## Changes to this policy

Material changes will be published here with an updated date above, and the revision history is
public in the project's Git repository.

## Contact

Questions or concerns: open an issue at
[github.com/saadjs/octobase/issues](https://github.com/saadjs/octobase/issues).
