# AI Claim Integrity Standard

## Purpose

AI-search optimization only helps if retrieved claims are internally consistent and traceable to evidence. This standard defines the canonical QA layer for preventing contradictory, weakly sourced, or overly concentrated evidence from becoming high-confidence AI snippets.

## Canonical checks

### Claim consistency

Run `node scripts/ci/audit-ai-claim-integrity.mjs`.

It flags:

- strong-evidence labels that coexist with preliminary, mixed, limited, theoretical, animal-only, or research-pending language;
- positive efficacy language that coexists with unsupported/no-clear-benefit language;
- multiple materially different evidence labels on one profile;
- strong-evidence labels that have no obvious human-study signal in the record.

The audit is advisory by default. `--strict` upgrades warnings to release-blocking failures. Contradictions classified as errors fail in either mode.

### Evidence topology and concentration

Run the canonical research-quality pipeline through `npx tsx scripts/ci/research-quality.ts` (or the release/CI command that owns it).

The shared `ResearchQualitySnapshot` is the authority for:

- unsupported claims and dangling source links;
- claims dependent on only one independent canonical study;
- profiles dominated by narrative reviews rather than primary human research or systematic synthesis;
- profiles where one underlying study supports a disproportionate share of claims;
- source-integrity failures, canonical hard-gate decisions, and remediation priorities.

Study dependence is evaluated using canonical study identity rather than raw citation-row IDs, so DOI/PMID aliases and duplicate source rows do not create false evidence diversity.

This does not assume that one-study evidence is false. It identifies concentration risk so answer surfaces can preserve uncertainty instead of presenting apparent consensus.

## Editorial interpretation

A flagged record should be resolved in the source-of-truth data, not patched only in rendered copy. Preferred resolution order:

1. Determine whether the claims actually conflict or merely address different populations, formulations, doses, outcomes, or time windows.
2. Split materially different claims instead of flattening them into one profile-level conclusion.
3. Attach the correct source IDs to each atomic claim.
4. Downgrade evidence language when independent human replication is absent.
5. Preserve legitimate conflicting evidence explicitly.
6. Prefer systematic synthesis plus primary human studies over narrative-review-only support for strong clinical conclusions.
7. Rebuild governed/runtime artifacts and rerun the canonical claim-integrity and research-quality checks.

## AI-search rule

No AI-specific page, schema field, FAQ, snippet block, or `llms.txt` instruction may make a claim stronger than the governed source record and its claim-level evidence.

The goal is not to manufacture certainty for answer engines. The goal is to make the site's real level of certainty easier to retrieve, understand, and cite.
