# GPT Patch Normalization (Phase 4)

> Status: **implemented**. Normalization only — patches are NOT applied to
> canonical data in this phase (that is Phase 5).

Accepts enrichment patches produced by different GPTs in different arrangements
and normalizes them into ONE canonical patch shape, quarantining anything
uncertain via `requires_review` + explicit warnings.

## Supported input formats

| Format | How records are derived |
|---|---|
| Canonical JSON patch | Explicit `operations[]` normalized directly. |
| Loose JSON object | Non-envelope keys → operations via field-alias resolution. |
| JSON array | One patch per element. |
| JSONL / NDJSON | One patch per line. |
| YAML | Object or list; nested `target` supported. |
| CSV | One patch per row (via `csv-parse`). |
| Markdown tables (GFM) | One patch per table row; frontmatter merged as shared context. |
| Structured Markdown | `---` frontmatter + `## Section` fields merged into one patch. |

Format is chosen by extension, then by content sniffing.

## Normalized patch shape

`patch_id, patch_version, created_at, generator?, target{id?,slug?,canonical_name?,alias?,entity_type?}, operations[], sources[], notes, confidence, requires_review, original_filename, original_hash` — validated by `normalizedPatchSchema` (Zod).

Operations supported: `create_entity, update_field, add_alias, add_claim,
update_claim, add_relationship, update_relationship, add_source,
add_safety_warning, add_drug_interaction, deprecate, merge_candidates`.

## Field aliases (configurable)

`config/field-aliases.json` maps incoming variants to canonical fields
(case/space/underscore-insensitive), e.g. `common_name|name|herb_name|title →
canonical_name`, `benefits|effects|uses|outcomes → effects`,
`citations|references|sources|studies → sources`,
`side_effects|adverse_effects → side_effects`,
`mechanism|mechanisms|mechanism_of_action → mechanisms`. Source-group fields are
routed to source extraction, not field updates. `side_effects`/`safety` become
`add_safety_warning`; `aliases` become `add_alias`; `interactions` become
`add_drug_interaction`.

## Safeguards (this phase)

- Never guesses structure it doesn't recognize — unmapped fields are preserved
  as `legacy.<field>` update operations flagged for review (nothing discarded).
- Evidence-bearing ops (claim/safety/interaction) with **no source** → flagged
  and `requires_review = true`.
- Destructive ops (`deprecate`, `merge_candidates`) → `requires_review = true`.
- Missing target identifier → warning.
- Raw input hash (`original_hash`, full sha256) preserved; deterministic
  `patch_id` when none supplied → re-normalizing the same file is stable.
- Unparseable input returns a structured error (never throws/crashes the batch).

## Commands

```bash
npm run data:normalize-patch -- --file data/patches/inbox/example.md
npm run data:normalize-inbox        # normalize every file in data/patches/inbox/
npm run data:review-patches         # human-readable summary of normalized patches
```

Normalized output + a `.raw` copy of the original + a `.report.json` are written
to `data/patches/normalized/` (a gitignored working area; the raw is preserved
permanently there and, once applied, in `data/patches/applied/` in Phase 5).

## Files created

- `scripts/data/canonical/patch-normalize.mjs` — core normalizer.
- `scripts/data/normalize-patch.mjs`, `normalize-inbox.mjs`, `review-patches.mjs` — CLIs.
- `scripts/data/canonical/__tests__/fixtures/*` — 8 differently-arranged GPT patches.
- `scripts/data/canonical/__tests__/patch-normalize.test.mjs` — 15 tests.
- `yaml` added as a direct dependency (was transitive).
- npm scripts: `data:normalize-patch`, `data:normalize-inbox`, `data:review-patches`.

## Verification

15 normalization tests pass; all 8 fixtures normalize + schema-validate; CLIs run
clean on the fixture set.
