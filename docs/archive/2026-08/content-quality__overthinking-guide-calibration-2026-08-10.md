# Overthinking decision-guide calibration — 2026-08-10

## Route

`/guides/anxiety/best-supplements-for-overthinking/`

## Why this changed

The prior page used winner-style language for L-theanine, protocol-like dose/timeline language, stack suggestions, and a one-ingredient affiliate module even though the page compares several options. That framing was stronger than the cited evidence and conflicted with the evidence-first decision-page standard.

## Evidence boundary applied

- L-theanine: the cited PMID 18006208 is an acute cognition/mood crossover study, not a rumination-treatment trial.
- Magnesium: PMID 28445426 is a systematic review of subjective anxiety/stress evidence in vulnerable populations; it describes the evidence quality as poor.
- Ashwagandha: PMID 23439798 is a 60-day randomized placebo-controlled chronic-stress trial using one specific root extract; it does not establish an immediate anti-rumination effect or equivalence across products.

## Commercial-neutrality change

Removed the ashwagandha-only recommendation module from this broad comparison page. Dedicated ingredient and buying pages remain the appropriate place for product sourcing modules.

## Regression coverage

`app/__tests__/best-supplements-overthinking-calibration.test.ts` prevents restoration of the prior winner claims, protocol-like framing, or single-ingredient commercial bias while preserving references, FAQ schema, safety pathways, and email capture.
