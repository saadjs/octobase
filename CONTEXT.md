# Octobase domain model

## Dashboard refresh

A background-owned operation that obtains the current GitHub work for one normalized GitHub account, preserves unrequested Dashboard tabs, expands a requested Dashboard section, records rate-limit state, writes one account-matching snapshot, and notifies open dashboards. Refreshes for the same account are serialized.

A **Dashboard snapshot** is the cached, read-only view of the viewer's attention queue, owned work, contributions, and optional section counts at one successful refresh time.

A **Dashboard section** is one GitHub search connection within a Dashboard snapshot. Its rule fixes the owning Dashboard tab, accepted item kind, cursor search, count behavior, and page merge behavior in one place.
