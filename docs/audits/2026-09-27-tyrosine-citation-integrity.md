# Tyrosine citation-integrity containment — #6056

Status: in review in PR #6059; integrated with main be5a4a1b9. Parent #4444 remains open.

## Baseline and scope

Inspected main `228cdfc400a3f1cf8b45458e5fc7af48e7ab6521` on 2026-09-27.
This is the first bounded containment slice from the owner's 100-finding inventory,
not independent confirmation or closure of all 100 findings.

The committed legacy `herbs-detail/tyrosine.json` contained four source associations,
an evidence object claiming one source and one claim despite an empty claim map,
and summary prose asserting Grade A. The secondary summary index supplied
`evidence_grade: a` and `Strong Human Evidence` despite `herbs.json` omitting the
legacy owner. Runtime merging can revive these stale secondary records.

The existing `/herbs/tyrosine/` and `/compounds/tyrosine/` redirects already target
`/compounds/l-tyrosine/`. This change preserves them. It does not claim that the
taxonomy redirect was missing or that an HTTP 200 legacy page was reproduced live.
A full production regeneration removes the retired herb record; stale committed
or reintroduced layers must remain safe too.

## Source decisions

The [retained receipt](../../ops/audit/tyrosine-citation-hold-2026-09-27.json)
contains the original source rows, evidence counters, and workbook claim.

| Identifier | Verified record | Decision boundary |
|---|---|---|
| [PMID 30000526](https://pubmed.ncbi.nlm.nih.gov/30000526/) | LactMed record for interferon alfacon-1 | Unrelated drug; not tyrosine intervention evidence |
| [PMID 8629725](https://pubmed.ncbi.nlm.nih.gov/8629725/) | Breast-cancer neighborhood epidemiology | Unrelated outcome/entity; not a tyrosine RCT |
| [PMID 22554242](https://pubmed.ncbi.nlm.nih.gov/22554242/) | Plant aromatic-amino-acid biosynthesis review | Tyrosine-related biochemistry, not direct human supplement efficacy |
| [PMID 12482446](https://pubmed.ncbi.nlm.nih.gov/12482446/) | Rosmarinic-acid review, including plant biosynthesis | Not direct tyrosine supplementation evidence |

The legacy profile's entire evidence presentation is held pending source-to-claim
review. This does not assert that L-tyrosine has no human evidence. The separate
`compound:l-tyrosine` source PMID 32093203 remains unchanged. No replacement paper,
efficacy claim, evidence grade, or dosing protocol is promoted.

## Shared failure boundaries repaired

- Existing citation quarantine contains held detail records, summary layers, and
  workbook claims, retaining originals in its internal report.
- Runtime lists attach their herb/compound namespace before merging. Record merging
  and workbook-evidence attachment apply the same herb:tyrosine hold so
  stale overlays cannot restore accepted sources, evidence grade, or counters.
- The shared visibility predicate honors explicit indexing, recommendation, and
  monetization denials. Previously `monetizationAllowed: false` could still produce
  `canMonetize: true`. True flags never promote a record past existing restrictions.
- Safety fields and existing redirects are preserved. A surviving held legacy
  record stays renderable but cannot be indexed, featured, or monetized.

The broader generator/source-of-truth reconciliation, identity resolution,
formulation boundaries, and scientific governance findings require separate
bounded acceptance cases. An open research ticket alone is not current proof;
in particular, cobalamin closure #5703 / PR #5961 has already merged.

## Validation

- Focused application tests: 42 passed (four files), including after main integration.
- Script tests after integration: 10 passed (receipt suite plus quarantine). The quarantine test includes repeat execution, DOI-only
  evidence, reintroduced stale input, retained provenance, and an unaffected
  compound control.
- Running both Vitest projects in one invocation hit an existing mixed-worker
  configuration error; explicit `--project app-dom` and `--project scripts-node`
  runs succeeded without changing the test configuration.
- `npm run build`: PASS, all 37 production steps, 866.35 seconds. Compilation,
  type checking, static export, output invariants, and Pagefind completed.
- `npm run check:fast`: PASS, including typecheck, lint, core regeneration,
  evidence-grade, citation-integrity/identifier, scientific-name, and contrast checks.
- Export inspection: `out/herbs/tyrosine/index.html` absent;
  `out/compounds/l-tyrosine/index.html` present with PMID 32093203 and none of the
  four held identifiers/titles; existing 301 retained in `out/_redirects`.
- Browser inspection of the built compound destination: light and dark desktop,
  plus 390 x 844 phone in both themes. Existing C/Limited and one-source display
  observed. Phone layout is cramped and retains existing editorial safety-pass
  text; these are unresolved UX/editorial issues, not a visual acceptance claim.
- Unrelated regenerated artifacts were restored after validation; the committed
  generated delta is produced by the quarantine step on the original artifacts.
  This avoids bundling broad pre-existing regeneration drift into containment.
- Main advanced with #6057 (source-receipt governance) during validation. The PR
  must integrate that change and obtain current-head CI; the earlier local build
  is not proof of the integrated head. No merge/deployment/business impact claimed.

## Follow-up containment after review

The initial hold correctly protected the detail/runtime path but review found independently publishable derived surfaces that could still preserve the stale herb `tyrosine` Grade A/PUBLISH presentation. The containment boundary now also sanitizes `herb-index.json`, mixed search indexes, alphabetical/entity shard indexes, and the herb Tyrosine AI-entity sidecar. Regression coverage seeds each shape and verifies the separate `compound:l-tyrosine` owner remains unchanged.

After the branch was synchronized with current `main`, the previously conflicting planning documents were resolved by retaining the newer `main` control state rather than restoring stale sprint/backlog ownership.
