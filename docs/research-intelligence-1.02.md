# Semantic System 1.02 — exact witness trails and append-only review

This PR is **stacked on the 1.01 Science Atlas branch** and must not merge to main before its parent PR #6407. The shared /research/intelligence/ route and canonical semantic graph remain singular.

## Changes

- Derive at most six small, source-exact title or abstract sentence excerpts per bibliographic record. Every span carries its PMID, canonical concept, title/abstract basis, matching alias, source signature, sentence index, and exact source-character offsets.
- A witness exists only when the quote is an *unmodified substring* of the pinned source receipt and contains the detected alias with whole-token boundaries. Abstract snippets are omitted, never truncated, when longer than 320 characters; title/abstract mention extraction remains separate.
- Study DNA now offers per-paper **Inspect verbatim evidence trail** and a copyable review packet. Ask the Evidence exposes the original literal source wording behind retrieved concept matches.
- Introduce `ops/research-semantic-adjudications.json`, an empty, append-only **source-mention indexing ledger**. It supports explicit editorial events (`source-text-match-confirmed`, `false-positive`, `needs-full-text`) linked to a source-signature-bearing witness. Validated event identities, reviewer attribution codes, UTC chronology, prior-event chain and minimum substantive rationale are required.
- Existing unreviewed source-only guardrails, static export, noindex hold, click-to-fetch loading, source-register scope, and 0 automatic medical promotions remain unchanged.
- A review is an editor's source-indexing assertion, **not independently validated medical evidence** or a clinical grade. No event authorizes articles, medications, adverse interactions, or autonomous publishing.

## Quality gates

```bash
node scripts/ci/validate-research-source-register.mjs
npx tsx scripts/ci/validate-research-semantic-network.ts
npx tsx scripts/ci/validate-research-intelligence-studio.ts
npm run typecheck
npm run check:fast
npm run build
```

Negative tests cover altered quotation offsets, stale source signatures, duplicate ledger identities, broken event ancestry and same-batch verbatim integrity.

## Next experimental frontier

Cross-PMID document cohort identity checks; source-segment representations for arms, dosage, population and outcomes, with human verification and explicit missingness before graph promotion.
