# Governed self-replenishing opportunity queue

This contract connects #5767 and #5778 so performance signals continuously produce small, reviewable Builder work without bypassing existing governance.

## Inputs
Use only project-available, attributable signals:
- AI citation/query performance
- GSC/search performance and index-recovery diagnostics
- evidence freshness/provenance state
- canonical/internal-link/indexability diagnostics
- conversion/action opportunities
- CI/build throughput measurements

## Opportunity score
For each candidate route or technical target, record:
- source signal and observation date
- expected site-value impact range
- confidence: low / medium / high
- effort: S / M / L
- risk: low / medium / high
- lane: Growth / Authority / Technical / Conversion
- deduplication key
- smallest safe executable unit
- required gates

Prefer high expected value, high confidence, low effort, and low risk. Scores prioritize review; they never authorize publication.

## Top-50 scorecards
Maintain scorecards for the 50 strongest commercial/informational opportunities across:
1. search/AI visibility
2. index status
3. evidence freshness
4. answerability completeness
5. internal-link strength
6. conversion opportunity
7. technical/template defects
8. estimated effort/risk

Every score must point to an underlying signal. Unknown data stays unknown rather than being guessed.

## Replenishment rules
- Maintain a target runway of at least 25 actionable candidates.
- When actionable inventory drops below 15, replenish toward 25 from the scorecards.
- Emit small executable tickets, normally one page/cluster or one deterministic technical defect per ticket.
- Deduplicate against open PRs/issues and recently merged work before creating a candidate.
- Do not reopen completed work unless a new dated signal demonstrates regression or a materially new opportunity.
- Research-only findings must pass the existing evidence/governor path before becoming public claims.
- Generated opportunities must not merge themselves.

## Starvation prevention
If no fresh Builder PR exists, the Builder should pull the highest-value eligible candidate from this queue. If the queue has no eligible candidate, refresh scorecards from available signals rather than inventing speculative work.

## Guardrails
Never weaken scientific, provenance, security, privacy, accessibility, publication, release, review, or branch-protection gates. Never fabricate performance data, evidence, rankings, or confidence. Affiliate opportunity cannot alter scientific conclusions.

## Completion contract for #5767 / #5778
- reproducible top-50 scorecards exist
- >=25 deduplicated actionable candidates can be produced
- every candidate carries signal, impact range, confidence, effort, risk, lane, and smallest safe unit
- queue refill thresholds are documented
- Builder can select work without broad rescanning
- existing Shipper/governor protections remain authoritative
