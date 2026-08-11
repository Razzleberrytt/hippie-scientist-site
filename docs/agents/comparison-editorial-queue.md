# Comparison Editorial Agent Contract

This document defines how development and editorial agents should consume the behavioral comparison-priority system.

## Source artifacts

Running `scripts/rank-related-comparisons.ts` can produce these files under `reports/related-botanicals/`:

- `comparison-shortlist.json` — full scientific and editorial ranking context.
- `comparison-shortlist.md` — human-readable ranking and top assignments.
- `observed-demand-editorial-queue.json` — compact behavior/evidence action queue.
- `comparison-agent-work-queue.json` — executable work packets with explicit next tasks, blockers, and completion criteria.

Observed behavior is optional. Set `ANALYTICS_EVENTS_PATH` to a JSON analytics export when generating the report. Without behavioral data, the scientific shortlist still works but no observed-demand work packets should be treated as production priorities.

## Action contract

### `build-next`

The pair has high-confidence observed demand and at least moderate pair evidence. An agent may prepare a production-ready comparison artifact, but normal evidence, safety, SEO, editorial, and CI review gates still apply.

### `research-first`

Demand is meaningful but the evidence gate is not strong enough for production. Research and document the evidence gap. Do **not** draft or publish the final comparison merely because demand is high.

### `validate-and-outline`

Demand is promising and evidence is adequate enough to justify a structured outline. Validate the actual decision question, identify evidence requirements section by section, and keep unresolved gaps visible.

### `keep-observing`

Demand is emerging but under-sampled. Do not spend production effort yet. Continue gathering Related Botanicals exposure/click behavior until the tier changes.

### `no-action`

No active agent assignment.

## Non-negotiable guardrails

1. Observed demand can raise urgency; it cannot lower the scientific evidence requirement.
2. A high CTR from a tiny sample is not a production signal. Use the demand tier, not raw CTR alone.
3. Never invent chemistry, mechanism, safety, or efficacy distinctions to make a comparison more interesting.
4. Use the canonical evidence/data system for factual claims and preserve uncertainty in wording.
5. Work packets are assignments, not publishing authorization. Existing review, CI, safety, and content-quality gates still apply.
6. If a packet's evidence state has changed since generation, regenerate the queue before acting on it.

## Packet execution

Prefer `comparison-agent-work-queue.json` as the machine-facing entry point. For each packet:

1. Read `recommendedAction`, `actionReason`, and `nextTask` first.
2. Resolve every applicable item in `researchGaps` or explicitly document why it remains unresolved.
3. Use `completionCriteria` as the definition of done for that assignment.
4. Preserve `packetId` in notes or PR descriptions when practical so work remains traceable to the generated queue.
5. Regenerate the queue after meaningful evidence, behavior, or comparison-page changes so completed or obsolete packets do not remain authoritative.

## Preparing agent assignments

Use the orchestrator adapter when an agent needs a smaller, ordered set of executable assignments instead of the full work-packet queue:

```bash
node agent/orchestrator/prepare-comparison-assignments.js
```

The adapter intentionally converts only `build-next`, `research-first`, and `validate-and-outline` packets. `keep-observing` and `no-action` are not promoted into executable work.

Useful filters:

```bash
node agent/orchestrator/prepare-comparison-assignments.js --action=research-first --limit=5
node agent/orchestrator/prepare-comparison-assignments.js --packet=comparison:lemon-balm:passionflower --limit=1
node agent/orchestrator/prepare-comparison-assignments.js --queue=reports/related-botanicals/comparison-agent-work-queue.json
```

Assignments are ordered by evidence-gated action priority, then the existing comparison priority score. Their `assignmentId` is derived from the stable source `packetId`, so filtering or changing the queue limit does not rename the same underlying task.

The adapter does not execute, publish, or promote work. It only packages already-authorized packet actions into reviewable assignments with the packet's rationale, evidence state, demand state, research gaps, completion criteria, and explicit no-auto-publish guardrails.

The goal is a controlled progression from **observe → validate → research → build**, not autonomous page proliferation.
