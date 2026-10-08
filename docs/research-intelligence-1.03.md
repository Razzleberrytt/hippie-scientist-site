# Semantic System 1.03 — publication identity and unresolved study independence

This system expands the canonical eight-instrument Science Atlas rather than introducing a competing endpoint. PR #6408 (1.02) is merged before this branch.

## Intelligence advance

1. A deterministic, browser-capable publication-identity crosswalk joins the exact-verified 500 research intake papers to independently published citation records by canonical PMID or canonical DOI, never by concept co-mention, author names, title similarity or model-generated reasoning.
2. Repeated reviewed citation IDs attached to the exact same publication are displayed as **duplicates of citation records**, not extra independent studies.
3. Conflicting known PMIDs/DOIs explicitly block automatic collapse and are reported for editorial investigation.
4. Bibliographic publication identity does **not** establish whether two publications represent different underlying trials. Trial independence remains `null` / unverified, not 0 or true.
5. The Contradiction Observatory exposes this uncertainty before readers interpret directional differences. Study DNA shows exact reviewed citations connected to a source PMID.
6. All derived work is read-only and research-only. The canonical `research-quality-topology` and its trial-registration and underlying-study independence analyses remain the evidence authority for approved claims. This bridge does not rewrite, bypass or substitute those analyses.
7. The static source snapshot remains cheap: it contains source identifiers only; the browser joins existing static reviewed evidence on user activation. Zero additional subscription/credit requirements.

## Guardrails

- Exact PMID is strictly numeric and 5–10 digits. DOI requires an explicit DOI syntax; URL/prefix normalization alone does not establish that other metadata agree.
- Matching DOI against a conflicting known PMID must fail closed, and matching PMID against a conflicting DOI must fail closed.
- The 500-DOI intake receipt already prevents duplicates; duplicate intake DOI aborts rather than double-counting.
- No unverified registry IDs are inferred from titles or abstract snippets. Repeated trial publications with distinct PMID/DOI remain *unknown* until editorially admitted structured trial linkage.
- Never auto-grade, auto-approve, auto-publish, recommend doses or infer interaction safety.

## Acceptance gates

```
npx tsx scripts/ci/validate-research-intelligence-studio.ts
npm run typecheck
npm run check:fast
npm run build
```
Synthetic regression tests cover valid exact-PMID, DOI-only overlap, duplicate citation aliases, contradictory source identifiers, duplicate intake DOI, incompatible duplicate citation IDs, empty/unknown independence.

## Next layer

Governed trial-registry/protocol/participant-cohort citations should attach to the existing approval-quality evidence topology, then surface separately as independently reviewed trial/lineage units in the Atlas. No auto-parsing from arbitrary text into approved clinical independence.

### Citation-conflict quarantine

When the same known PMID is attached to different known DOIs (or vice versa), all citation IDs participating in that conflict are withheld from automatic intake cross-references, including if the intake has a PMID but no DOI. This is a metadata conflict, not evidence of a second trial; human resolution is required. Regression tests cover the under-specified-intake-DOI case.
