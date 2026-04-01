# Indexability rescue workflow

This workflow builds repeatable workpacks from **current quality-gate failures** and routes them through source discovery, source promotion, and enrichment authoring without changing gate rules.

## 1) Audit current failures

Run the gate-driven rescue report:

```bash
npm run report:indexability-rescue
```

Artifacts:

- Deterministic target set: `ops/targets/indexability-rescue-wave.json`
- Operator report: `ops/reports/indexability-rescue-wave.md`
- Deterministic wave fingerprint: `summary.deterministicTargetHash`

Each target also includes a generated `workpack` object that tells operators the intended queue, lane expectation, and suggested command sequence.

## 2) Source discovery workpacks

Use targets where:

- `recommendedNextAction=source-discovery-workpack`
- `workpack.workpackType=source-discovery`

For each target:

- prioritize `highestPriorityMissingTopics`
- constrain discovery to `sourceGapTypes`
- draft candidate entries in `ops/source-candidates.json` with matching `intakeTaskId`

Do **not** bypass identity validation. Any target with `blockedForHumanReview=true` remains a manual blocker.

## 3) Source promotion

Review and promote discovered sources through the existing governed source-candidate review path.

Promotion-first queue selector:

- `recommendedNextAction=source-promotion-then-enrichment-batch`
- `workpack.workpackType=source-promotion-and-enrichment`

- keep schema/domain validation intact
- promote only candidates that meet registry requirements
- keep rejected candidates rejected (no silent downgrades)

## 4) Herb/compound enrichment batches

For targets with promoted sources or existing promotable coverage:

1. plan: `npm run enrichment:plan -- --task <task> --batch-size <n>`
2. run: `npm run enrichment:run -- --task <task> --batch-size <n>`
3. validate: `npm run enrichment:validate`
4. apply: `npm run enrichment:apply`

Lane and review safeguards still apply (including lane C explicit approval requirements).

## 5) Verification

After each rescue wave:

- rerun `npm run report:indexability-rescue`
- confirm `deterministicTargetHash` changes only when the underlying failing set or queue logic changes
- run targeted enrichment verification commands used by the wave
- confirm reduced queue size in `sourceDiscoveryQueue` and/or `sourcePromotionQueue`
- confirm no increase in `blockedForHumanReview`

This keeps indexability rescue measurable, repeatable, and governed.
