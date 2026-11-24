# Data model

- **Bridge:** slug, active/archive status, source directory, documentation destination. Slugs are unique and sorted; status agrees with directory ownership.
- **Guide:** bridge slug, landing page, topic pages, assets, edit links and previous public URLs. Each previous public route maps to equivalent content.
- **Historical record:** bridge slug, original relative path, Git object ID and destination. Each destination has one origin; compare object IDs to verify preservation.
