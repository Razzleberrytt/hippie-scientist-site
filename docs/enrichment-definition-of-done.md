# Enrichment Definition of Done

Research throughput is not the outcome. The outcome is a governed terminal disposition that changes canonical/public truth when evidence supports it, or explicitly records why promotion is not legal.

A normal enrichment workpack follows this lifecycle:

`research → validate → scientific/source review → source admission where required → canonical promotion → generated public/runtime verification → exact-head repository gates → merge → production verification when observable`

A staged finding is **not complete** while it remains `draft_submission`, `ready_for_review`, or `approved_for_rollup`.

A finding is terminal only when it is either:

1. promoted through governed canonical/public handling; or
2. explicitly declined/quarantined/inactivated/deprecated by governance with the evidence and blocker preserved.

The session bootstrap enforces scheduling pressure toward closure by keeping staged-but-nonterminal workpacks in `closureBacklogWorkpacks`, counting them in `remainingWorkpacks`, and prioritizing them ahead of unstarted research.

A merged research-only PR is therefore a checkpoint, not proof of completion.
