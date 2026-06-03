# Evidence grading and conflict handling (contractor quick guide)

This layer converts **approved normalized enrichment entries** into deterministic evidence judgments at two levels:

1. `topicEvidenceJudgments[topicType]` (per-topic)
2. `pageEvidenceJudgment` (rollup across all topic entries for an entity)

## Labels

Output labels are rule-based:

- `stronger_human_support`
- `limited_human_support`
- `observational_only`
- `preclinical_only`
- `traditional_use_only`
- `mixed_or_uncertain`
- `conflicting_evidence`
- `insufficient_evidence`

## Grading dimensions captured in output

Each judgment contains:

- `evidenceClass` (classes present)
- `studyDesignWeight`
- `humanRelevance`
- `directnessToClaim`
- `replicationDepth`
- `sourceReliabilityTier`
- `recencyWeight`
- `editorialConfidence`
- `conflictState`
- `confidenceIndex`

## Deterministic conflict rules

Conflicts are explicit and never hidden:

- **human vs human disagreement**: supported-use + unsupported/null human findings => `conflicting_evidence`
- **guidance disagreement**: mixed regulatory/monograph claim directions => `conflicting_evidence`
- **preclinical enthusiasm vs weak/negative human direction** => `mixed_or_uncertain` unless direct human contradiction is present
- **explicit conflict entries** (`conflict_note` / `evidence_conflict`) => at least `mixed_or_uncertain`
- **uncertainty notes / contradictory structures** => at least `mixed_or_uncertain`

## Guardrails

- Preclinical and traditional-use evidence cannot be labeled as strong human support.
- Traditional-use-only topics stay as `traditional_use_only` unless other classes are present.
- Sparse evidence defaults to `insufficient_evidence` with uncertainty notes.

## Reporting

`node scripts/enrichment/normalize-enrichment-entries.mjs` now also writes:

- `ops/reports/evidence-grading-summary.json`

Summary report includes:

- evidence label counts
- entity/topic label map
- conflict cases
- downgraded topics (preclinical/traditional/mixed/conflicting/insufficient)
