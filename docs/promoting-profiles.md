# Promoting a profile (the one-command runbook)

Publishing a curated herb/compound profile is **one command**. This doc exists
because doing it by hand is a trap: the wrong rebuild rewrites ~855 unrelated
records, and there are two different "why is this indexable" gates that are easy
to confuse. Read the 60-second model, then run the command.

---

## TL;DR

```bash
# 1. See where a profile stands (read-only): current state, what promotion yields,
#    and whether it will pass the governance source gate.
npm run promote:check -- --slug <slug>

# 2. Promote it (edits the workbook, rebuilds cleanly, refreshes its detail file, verifies).
npm run promote:profile -- --slug <slug> --summary "Clean, grounded summary here."

# 3. Validate + commit.
npm run guard:source-of-truth && npm run validate:evidence-language
git add -A && git commit -m "Publish <slug>: <one line>"
```

That's it. The tool (`scripts/data/promote-profile.mjs`) does the workbook edit,
the **drift-free** rebuild, the single detail-file refresh, and prints the diff
surface so you can confirm it's tight.

---

## The 60-second model: two gates, not one

A profile's visibility is decided in **two independent places**. Confusing them
is what makes this hard.

### 1. The LIVE gate — decides the deployed site
`scripts/data/indexability-policy.mjs`, applied inside
`build-runtime-from-workbook`. A profile is **PUBLISH** when:
- `runtime_export_decision` is a publishable value (e.g. `full_public_runtime`), **and**
- its content **scores ≥ 75** (summary depth, effects, mechanism, safety, `profile_status`, `evidence_tier`).

`hidden_until_grounded` / `research_archive_runtime` hard-gate it to NOINDEX
**before** scoring. `profile_status: research_only` / `minimal` caps the score
below the publish line — those need editorial certification, not just a holdback lift.

**`promote:profile` flips this gate.** It is what actually publishes the page.

### 2. The GOVERNANCE gate — a CHECK, not a deploy step
`scripts/data/apply-governance-overlay.mjs`. It downgrades any indexable profile
that **lacks real sources** to NEEDS_REVIEW. Crucially, **it runs in `check:data`
and audits — not in the deploy build** (`build:fast` → `data:build:core`). So it
never rewrites the committed data; it's a governance assertion.

To keep `check:data` green, the promoted slug must be **source-backed** by one of:
- **real citation path (preferred):** the slug has a real `Evidence_Register`/claims
  citation **and** is listed in `SOURCE_BACKED_PROMOTION_SLUGS` (in the overlay).
- **record-level sources:** the record itself carries a `sources[]` entry.
- **curated allowlist:** the slug is in `src/lib/index-allowlist.ts` (mirrored as
  `CURATED_*_SLUGS` in the overlay). This is a broad editorial bypass — use it only
  for high-traffic slugs whose evidence lives in narrative, not a PMID list.

`promote:check` tells you exactly which path (if any) applies and, when a citation
exists but isn't registered, prints the one-line fix.

---

## The drift trap (why quota gets burned)

**Never run `npm run data:build` to commit a single promotion.**

The full `data:build` runs the governance overlay + `postprocess-workbook-payloads`,
which add `governance`/`safety`/`sources` fields to **every** record (~855) and
apply source-gate downgrades. None of that is committed by the deploy path
(`build:fast` → `data:build:core`), so committing a full build produces a
thousand-line diff that has nothing to do with your one profile and conflicts with
every parallel promotion.

`promote:profile` rebuilds with the **core pipeline only**
(`build-runtime-from-workbook` → summary indexes → export batches → search index),
which is exactly what the deploy path commits. Result: a tight, profile-scoped diff.

If you ever need to rebuild data by hand for a committed change, use:
```bash
npm run data:build:core
```
not `npm run data:build`.

---

## What `promote:profile` does, step by step

1. Validates the slug exists and is **not** restricted/high-risk (those never auto-promote).
2. Prints current state + the simulated post-promotion **live** score + the **governance** gate verdict.
3. Edits only the gating workbook cells via the surgical `Entity_Master` editor
   (`runtime_export_decision`, and `--summary` if given) — never a full ExcelJS rewrite.
4. Rebuilds `public/data` with the core pipeline (drift-free) and discards the
   build-info timestamp noise.
5. Refreshes **only** the promoted slug's detail file (summary + indexability
   mirror) so a freshly published profile never ships leaked/stale text.
6. Prints the resulting state and `git diff --stat public/data`.

Flags: `--check` (read-only), `--dry-run` (plan only), `--decision <value>`
(default `full_public_runtime`), `--no-detail`, `--summary "<text>"`.

---

## When a profile is NOT ready

`promote:check` will tell you which of these applies:

| Symptom | Meaning | Fix |
|---|---|---|
| `if promoted … NEEDS_REVIEW` + `capped by profile_status` | Editorial completeness cap (e.g. `research_only`) | A human editor raises `profile_status` in the workbook — appropriate to keep gated for risk-heavy slugs (5-HTP, GABA). |
| `if promoted … NEEDS_REVIEW` (not capped) | Thin content | Improve summary/effects/mechanism/safety in the workbook, then re-check. |
| governance gate `✗ NOT source-backed`, citation present | Real citation exists but slug isn't registered | Add the slug to `SOURCE_BACKED_PROMOTION_SLUGS` in `scripts/data/apply-governance-overlay.mjs`. |
| governance gate `✗ NOT source-backed`, no citation | No evidence on file | Add a real `Evidence_Register` citation first. **Never fabricate a PMID/DOI.** |
| `WARNING: leaked pipeline text` | Summary has placeholder text | Pass a clean `--summary`. |

## Guardrails (unchanged, enforced)

- Source of truth is the workbook; generated `public/data` is disposable.
- The tool never fabricates citations, never edits restricted slugs, never runs a
  full ExcelJS workbook write, and never bypasses the score-based quality gate.
- Related: `docs/workbook-pipeline.md` (editing the workbook safely),
  `docs/grounding-noindex-profiles.md` (per-profile grounding notes).
