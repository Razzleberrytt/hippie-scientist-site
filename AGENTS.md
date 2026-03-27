# AGENTS.md

Project: The Hippie Scientist
Source of truth: main branch
Current structure:

- content/blog
- public/blogdata
- public/data

Rules:

- Do not touch unrelated app code unless required for workflow fixes.
- Prefer deleting stale workflows over patching them.
- Treat gh-pages as build output only, not source.
- Flag any workflow referencing old paths like src/content/blog, src/data/blog, src/data/herbs.
- Keep the final workflow set minimal:
  1. deploy workflow
  2. one daily blog/content workflow
  3. optional audit workflow
- Write findings to docs/workflow-cleanup-plan.md

## Prerender

- Current cap: 500 top-scored entities per type
- To increase: set `PRERENDER_ENTITY_CAP` env var in Netlify build settings
- Scoring: sources×3 + effects + mechanism×2 + description×2 + contraindications
