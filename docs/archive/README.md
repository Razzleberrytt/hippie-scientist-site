# Archive

Material here is retained for context. **It must not be used to select work or to quote current status.**

Every document in this directory was accurate when it was written and may not be now. Archived plans do not authorise work; archived audits do not describe the present codebase; archived status reports do not report current status. If a claim here matters, re-verify it against code, configuration, tests, or deployment evidence before acting on it.

## Layout

`YYYY-MM/` holds the documents archived in that month, preserving the directory structure they had under `docs/`. Preserving that structure keeps their internal links intact, which is why the folders are nested rather than flattened.

## What is here

`2026-08/` — 88 documents from the documentation pass on 2026-08-29:

- **74 historical** — past plans, audits, handoffs, experiments, and dated sprint and swarm artifacts.
- **14 superseded** — seven that describe the `src/` tree with paths that no longer resolve to anything, and seven dated audits whose `src/` references were accurate when written. The `src/` tree was removed on 2026-08-29; see that date's entry in `docs/DECISIONS.md`.

## Rules

- **Nothing is deleted, only moved.** A wrongly archived document costs one command to restore. A wrongly deleted one costs the reasoning behind a decision nobody remembers making.
- **Content is not rewritten on the way in.** These are records. Links inside them point where they pointed when the document lived elsewhere, and some of those targets have since moved; `scripts/ci/validate-doc-links.mjs` therefore skips this directory rather than editing history to satisfy a linter.
- **Restoring is a normal operation.** `git mv` it back and update `docs/DOCS_INDEX.md`.
