# Enrichment governor control plane

Implementation issue: #4223.

This directory is the **persistent, auditable control plane** for autonomous enrichment work. It intentionally does not replace `ops/enrichment/`, which remains rebuildable runtime state for the canonical enrichment pipeline.

The canonical scientific source of truth is still `data-sources/herb_monograph_master.xlsx`, and production-facing workbook changes must continue through the repository's governed workbook-patch/import path.

## Persistent files

- `state.json` — high-level governor checkpoint and selected next frontier.
- `scoreboard.json` — cumulative quality/reliability/efficiency metrics.
- `work-queue.json` — cross-run work queue and short-lived coordination leases.
- `quarantine.json` — repeatedly failing or ambiguous work that must not be hammered every hour.
- `self-improvements.json` — experimental/adopted/rejected/reverted workflow changes.
- `ledger.jsonl` — append-only audit events and learned lessons.
- `integrity-watch.json` — publication-integrity recheck schedule/state.
- `postmortems.jsonl` — structured failure/revert postmortems, created on first use.

Derived consolidation outputs such as `coverage-heatmap.json`, `claim-source-graph.json`, `canary-report.json`, `research-targets.json`, `architecture-fingerprint.json`, and `daily-summary.json` are produced by `scripts/enrichment-governor/daily.mjs`.

## Coordinator rules

Before work begins, the autonomous agent must inspect open enrichment PRs and the governor queue, then acquire a non-overlapping lease for the files/entities it intends to touch. Work overlapping an active lease, conflicting PR, deployment, or incompatible branch is queued or blocked rather than guessed through.

Low-value changes should be batched. Safety, publication-integrity, or materially misleading-evidence corrections may bypass batching urgency, but they do not bypass scientific or CI gates.

### Durable operator commands

`control.mjs` is the only command-line writer for routine governor state. It uses an exclusive lock and atomic JSON replacement for structured files, and appends audit events to the ledger.

```bash
# Reserve non-overlapping work before mutating the repo
node scripts/enrichment-governor/control.mjs lease-acquire \
  --id=lease-round-10 --owner=enrichment-agent \
  --entities=herb:ashwagandha,compound:magnesium \
  --files=data-sources/workbook-patches/round-10.json

node scripts/enrichment-governor/control.mjs lease-release \
  --id=lease-round-10 --disposition=completed

# Queue useful work or record outcome metrics/blockers
node scripts/enrichment-governor/control.mjs queue-add --key=herb:ashwagandha:safety --kind=safety --score=92
node scripts/enrichment-governor/control.mjs metric --name=duplicatesPrevented --delta=1
node scripts/enrichment-governor/control.mjs blocker --category=formulation_identity --detail='extract mismatch'

# Record authoritative publication-integrity checks
node scripts/enrichment-governor/control.mjs integrity-record \
  --source=src_pubmed-31517876 --status=clear --url=https://pubmed.ncbi.nlm.nih.gov/31517876/

# Self-improvement lifecycle; adoption reruns the fixed benchmark
node scripts/enrichment-governor/control.mjs improvement-propose \
  --id=imp_search-null-terms --surface=search_strategy \
  --reason='two runs missed null trials' --benefit='increase contradictory-evidence recall'
node scripts/enrichment-governor/control.mjs improvement-adopt --id=imp_search-null-terms
# or improvement-reject / improvement-revert

# Record repeated failure for quarantine evaluation
node scripts/enrichment-governor/control.mjs failure --key=herb:example --reason=formulation_identity_conflict
```

## Cheap scan vs deep work

Every hourly run begins with a cheap scan. Deep literature research, full builds, repository edits, and PR creation happen only when a scored opportunity clears the configured threshold or a safety/publication-integrity override applies.

The score considers evidence-gap severity, page importance, evidence quality, freshness, safety importance, user-facing accuracy impact, implementation effort, and scientific/merge risk. Existing enrichment-pipeline priority signals remain authoritative inputs where available; this governor adds cross-run coordination and research-maintenance signals rather than replacing that scoring system.

## Independent verification

Run:

```bash
node --test scripts/enrichment-governor/__tests__/governor.test.mjs
node scripts/enrichment-governor/governor.mjs benchmark
node scripts/enrichment-governor/governor.mjs verify-state
node scripts/enrichment-governor/governor.mjs scan
node scripts/enrichment-governor/canary.mjs
node scripts/enrichment-governor/daily.mjs --dry-run
```

Permanent self-improvements require benchmark evidence. A workflow heuristic that worsens benchmark behavior or validator reliability is rejected or reverted.

## Daily consolidation

The daily pass refreshes the claim-to-source graph, coverage heatmap, canaries, publication-integrity queue, research targets, architecture fingerprint, scoreboard rates, active leases, ledger summary, and next research frontier. It is strategic/diagnostic; it does not bypass canonical data governance or merge protection.

## Publication integrity

High-impact source IDs are due for recheck more frequently than ordinary sources. The external research agent is responsible for checking authoritative publication status (retractions, expressions of concern, major corrections, identifier changes, and strong new contradictions) and recording the result here. A changed integrity status must conservatively propagate through every linked claim/page using the claim-to-source graph.

## Failure quarantine and escalation

A repeated failure is quarantined after the configured threshold and is not retried until cooldown has elapsed **and** something material changed. Scientific identity/formulation ambiguity, publication-integrity uncertainty, contradictory safety interpretation, and persistent CI failures are hard cases and must not be auto-merged on guesswork.

## Post-merge contract

A green PR is not the end of the run. After merge, the same Enrichment Governor workflow runs again on `main`, re-executing unit/regression tests, the benchmark, control-plane seed checks, durable-control smoke tests, the repository scan, canaries, and daily consolidation dry-run. The autonomous agent must also verify the exact merged SHA/checks and deployment/live behavior when deployment evidence is available. If the merge causes a clear attributable regression and no immediate deterministic fix exists, create a clean protected revert rather than stacking speculative changes.

## Immutable boundary

Self-improvement may optimize discovery, prioritization, deduplication, batching, validation order, memory/caching, and execution efficiency. It may **never** lower the scientific evidence standard, safety standard, provenance requirements, negative/null evidence visibility, required validators, or branch protections.
