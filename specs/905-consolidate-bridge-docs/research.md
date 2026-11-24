# Research decisions

- **Inventory rather than a fixed count.** The validator lists ten slugs; the homepage hard-codes nine active. `bridges/` contains ten active directories including Ping; `archive/` contains IDM Energy. Comparing the directories catches future omissions.
- **Root source, stable public paths.** Nine bridges already have VitePress projects; AdGuard Home has contributor docs plus a README guide. The root Pages workflow uploads only Nuxt output. A Markdown-only move would leave published guides stale. Keeping separate projects would preserve duplicate build configuration.
- **Namespace historical records by bridge.** Nine bridges have both `specs/` and `.specify/`. Most feature names repeat; Roborock and WLED also have unique histories. A flat move would overwrite data. Preserve both trees outside active root templates and skills.
- **Keep historical evidence distinct.** Date-stamped verification notes and old project policies are historical evidence. Migration snapshots must continue to describe the layout at the recorded commit.
