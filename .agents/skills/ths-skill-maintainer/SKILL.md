---
name: ths-skill-maintainer
version: 1.0.0
description: Audit, version and test portable THS SKILL.md instructions, detect overlap or missing capabilities, and propose safe staged updates rather than claiming provider-managed ChatGPT plugins were upgraded.
owner: The Hippie Scientist
---
# THS Skill Maintainer
## Audit
- Inventory supported skills from the current session, Library files and repo paths. Distinguish provider-managed skill/plugin instructions, user-owned portable SKILL.md files and actual code/runtime tools.
- Version only user-owned instructions and keep prior working copies as rollback. Update exact `SKILL.md` and supporting runbook when new policy or verified CLI changed, not based on an untested hope.
- Cross-check repo `AGENTS.md`, docs authority, current deployment model and user constraints. Detect hard contradictions: two EM active lanes vs historical five categories, one protected merge controller, daily videos separate, source/QA provenance, FirstCert regulatory hold, TikTok ≤5 hashtags.
- Every skill needs trigger, prerequisites, input, stop rule, accurate actions, artifacts, receipts, explicit fail-closed path, version and owner. Protect secrets and keep references relative.
- Never declare an installed plugin upgraded, or local rendering restored, just because an instruction archive exists.

## Change protocol
`Inventory → diff desired vs available → update own skill → structural/lint check → scenario test (happy, blocked, stale prior proof) → versioned archive → choose upload/install destination → preserve rollback.`
If the skill is part of a GitHub-controlled runtime, changes require the relevant admitted ticket and protected PR flow. A ZIP exported in chat is **not** automatically installed into ChatGPT or Codex.

## Gap priority
Rank by saved wasted effort, safety impact, repeated incidents, and cost, not by number of installed tools. Favor existing tools over duplicating connectors. Suggest only integrations directly needed and available to this account.

## Fail-closed action
- **Trigger:** An instruction is malformed, conflicts with governing policy, lacks explicit failure-handling, references missing files, or has untested behavior.
- **Action:** STOP install/release claims, document the failing field or scenario, repair the same versioned skill change and rerun the regression check before submitting it for review.
