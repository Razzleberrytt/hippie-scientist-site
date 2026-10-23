# The Hippie Scientist — Agent Skills (2026-10-22)

**Status:** Versioned, owner-authored instruction references in the repository. Not automatically installed ChatGPT plugins, not executable features, and not evidence that remote jobs or media renderers work.

## Use and authority

- Start with repository [`AGENTS.md`](../../AGENTS.md) and [`docs/DOCS_INDEX.md`](../../docs/DOCS_INDEX.md). The authoritative project charter, current state, sprint, backlog, decisions, scoreboard and GitHub evidence outrank any skill text.
- Load only the skill relevant to the scoped task. `ths-operating-system` provides common boundaries; the two EvidenceMotion **development** skills are `em-build-repair` and `em-verify-ship`. Historical five domains remain backlog categories.
- Do not execute unadmitted tasks or create extra development lanes, bypass the serialized protected merge controller, auto-publish, or count daily videos toward the 1,590-card ledger.
- Standalone `em-tiktok-producer` produces video outputs outside repository implementation lanes and must fail closed without the original pinned voice, authentic render path and exact-master QA. It does not install voice assets or authorize publishing.
- `firstcert-regulatory-gate` is a sanitized public interface only. FirstCert is a separate, private project; check up-to-date private sources and avoid committing nonpublic pricing, correspondence, or customer/regulatory details.
- Any content here conflicting with live source authority, scientific review, security, privacy, or release governance is non-authoritative and must be flagged rather than followed.

## Available skills

| Skill | Focus |
| --- | --- |
| `ths-operating-system` | Routing, scope and release boundaries |
| `em-build-repair` | EvidenceMotion Lane 1, one scoped change |
| `em-verify-ship` | EvidenceMotion Lane 2, independent validation and controller handoff |
| `em-tiktok-producer` | Standalone authentic video production (v3) |
| `ths-evidence-integrity` | Source, study, claim and quarantine checks |
| `ths-publishing-seo-qa` | Built-output and live-site evidence, SEO and accessibility |
| `ths-growth-economics` | Measured traffic, revenue and ROI |
| `ths-scheduler-reliability` | Bounded retries, truthful scheduled-run receipts |
| `firstcert-regulatory-gate` | Private-project feasibility hold |
| `ths-skill-maintainer` | Versioning, gaps and skill QA |

## One-PR preflight (October 23, 2026)

Before creating a new implementation PR, run `node .agents/skills/pr-admission-preflight.mjs --repo Razzleberrytt/hippie-scientist-site --issue <ISSUE> --files path/a,path/b`. A live GitHub inventory is mandatory; same issue, overlapping files, or any existing non-draft and non-held implementation PR returns BLOCK. Use `--existing <PR>` to repair a current PR. Research and editorial drafts are preserved, not discarded.

Run `node --test .agents/skills/pr-admission-preflight.test.mjs` to validate the admission rules, then `node .agents/skills/pre-pr-fast-check.mjs` (focused route/TOML/security checks) before spending a full CI cycle where a local checkout is available. These checks do not create PRs, grant publication approval, or replace the protected controller.

## Validation

Run `python3 .agents/skills/validate_skills.py`. This requires installed project Node dependencies (the pinned `yaml` package), validates strict YAML syntax and duplicate keys, names, relative references, explicit `## Fail-closed action` Trigger/Action paths, and the exact ten-file inventory. Run `node --test .agents/skills/validate-skills-regression.mjs` for negative regression fixtures (malformed YAML, duplicate keys, incidental `Unknown`). It cannot attest to CI, human review, production deployment, running voice assets, business metrics or installed ChatGPT capabilities.

## Change protocol

Use one documented scoped PR; run relevant repository/hosted checks, obtain necessary reviews, merge only through the existing serialized controller, and verify the real `main` SHA. Do not open a second PR simply because the first is blocked.
