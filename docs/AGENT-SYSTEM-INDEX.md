# Agent Enrichment System: Complete Index

Comprehensive reference for the integrated agent enrichment system.

## Quick Navigation

| Need | Read | Time |
|------|------|------|
| **5-minute intro** | `docs/AGENT-QUICKSTART.md` | 5 min |
| **Full system understanding** | `docs/agent-integration-guide.md` | 15 min |
| **Setting up CI** | `docs/ci-workflow-example.md` | 20 min |
| **Applying patches manually** | `scripts/enrichment/guide-manual-patch-application.md` | 10 min |
| **Commands reference** | `CLAUDE.md` Agent section | 5 min |
| **Agent constraints** | `AGENTS.md` Agent section | 5 min |

## What Is the Agent System?

Automated AI agents generate enrichment patches for your content:
- **Evidence patches:** Studies from PubMed and clinical trials
- **Enrichment patches:** Descriptions, mechanisms, interactions, FAQs
- **Affiliate patches:** Product recommendations and links

Patches live in `agent/patches/{date}/` and must be reviewed before merging into the workbook.

## The Workflow at a Glance

```
1. GENERATE         2. VALIDATE         3. REVIEW           4. APPLY
───────────────     ─────────────       ─────────────       ────────────
npm run agent:run   npm run check:full  npm run agent:review  Edit workbook
     ↓                   ↓                    ↓                  ↓
agent/patches/*     Validation logs     ops/agent-review/*  data-sources/
                    + report            (CSV + JSON)        herb_monograph_
                                                            master.xlsx
                                                            ↓
                                                        5. REBUILD
                                                        ───────────────
                                                        npm run data:build
                                                        ↓
                                                        public/data/*
```

## Essential Commands

### Status & Visibility
```bash
npm run status:agent-patches       # Quick dashboard
npm run report:pending-patches     # What's waiting for review
npm run validate:agent-patches     # Check patch validity
```

### Generation & Review
```bash
npm run agent:run --mode=standard  # Generate patches
npm run agent:review               # Create review artifacts
```

### Build & Verification
```bash
npm run check:full                 # Full validation (includes patches)
npm run data:build                 # Rebuild from workbook
```

## File Organization

### Core Scripts
- **`scripts/ci/validate-agent-patches.mjs`** — Patch structure validation
- **`scripts/ci/report-pending-patches.mjs`** — Pending work summary
- **`scripts/ci/agent-patches-status.mjs`** — Status dashboard

### Documentation
- **`docs/AGENT-QUICKSTART.md`** — For new users
- **`docs/agent-integration-guide.md`** — Full system guide
- **`docs/ci-workflow-example.md`** — Platform-specific examples
- **`scripts/enrichment/guide-manual-patch-application.md`** — Application guide

### Agent Infrastructure
- **`agent/orchestrator/run-orchestrator.js`** — Main orchestrator
- **`agent/agents/`** — Individual agent implementations
- **`agent/lib/`** — Shared agent utilities
- **`agent/patches/`** — Generated patches (by date)
- **`agent/cache/`** — Cache directory

### Related Documentation
- **`CLAUDE.md`** — Project overview (updated with agent info)
- **`AGENTS.md`** — Agent system constraints (updated)
- **`data-sources/herb_monograph_master.xlsx`** — Source of truth

## Use Cases

### "I want to understand the agent system"
1. Read: `docs/AGENT-QUICKSTART.md` (5 min)
2. Read: `docs/agent-integration-guide.md` (15 min)
3. Run: `npm run status:agent-patches` (see real state)

### "I'm setting up CI for patch validation"
1. Check: `docs/ci-workflow-example.md`
2. Copy template for your platform (GitHub/GitLab/Cloudflare)
3. Test locally: `npm run check:full`
4. Deploy to CI

### "I need to review and apply patches"
1. Run: `npm run agent:review` (generate artifacts)
2. Open: `ops/agent-review/approved-patches.csv` (review in Excel)
3. Read: `scripts/enrichment/guide-manual-patch-application.md` (step-by-step)
4. Edit workbook and rebuild data

### "Patches are failing validation"
1. Run: `npm run validate:agent-patches` (see errors)
2. Check: `docs/agent-integration-guide.md` → Troubleshooting
3. Regenerate patches or fix manually

### "I want to see what's pending"
1. Run: `npm run status:agent-patches` (quick overview)
2. Run: `npm run report:pending-patches` (detailed summary)
3. Run: `npm run agent:review` (full review artifacts)

## Architecture Decisions

**Why patches aren't auto-applied:**
- Agents can make mistakes; patches need human review
- Merging to workbook is complex; multiple sources of truth possible
- Workbook is canonical; patches are enrichment artifacts
- Manual application gives control and visibility

**Why validation is in CI:**
- Catch malformed patches early
- Prevent bad patches from being merged
- Track patch work in the build system
- Provide visibility into pending enrichment

**Why patch structure is fixed:**
- Consistency across all agents
- Easy to validate and process
- Supports future automation
- Clean separation of concerns

## Roadmap: Future Enhancements

**Planned (infrastructure exists):**
- `npm run agent:apply --approved-only` — Auto-apply approved patches
- Lane-based approval workflow (Lane A, B, C already in code)
- Rollback support via manifest tracking
- Approval database for persistence

**Possible (with additional work):**
- Web UI for patch review
- Visual diff of patch vs. current workbook
- Annotation/commenting on patches
- Scheduled agent runs via cron
- Integration with approval/PR workflow

**Current state supports all of these without breaking changes.**

## Integration with Other Systems

### Data Pipeline
- Patches → Manual workbook edit → `npm run data:build` → `public/data/`
- No direct mutation of `public/data/`; workbook is source of truth

### CI Pipeline
- `npm run check:full` includes patch validation
- Patches validated before build artifacts created
- Invalid patches cause build failure

### Version Control
- Patches are transient (not committed)
- Review results stored in `ops/agent-review/` (also transient)
- Only workbook changes committed to git

### Authentication & Authorization
- Agent runs may require API keys (OpenAI for enrichment mode)
- Set environment variables before running agents
- Review process is manual (no authentication needed)

## Troubleshooting Index

**Patches not validating:**
→ `docs/agent-integration-guide.md` → Troubleshooting

**Can't apply patches to workbook:**
→ `scripts/enrichment/guide-manual-patch-application.md` → Step 5

**CI is failing on patch validation:**
→ Run locally: `npm run validate:agent-patches`
→ Check errors against `docs/agent-integration-guide.md`

**No patches found:**
→ Run: `npm run agent:run --mode=standard --batch=5`
→ See: `CLAUDE.md` agent commands

**Review artifacts don't exist:**
→ Run: `npm run agent:review`
→ Files created in: `ops/agent-review/`

**Can't find a specific patch:**
→ Run: `npm run report:pending-patches`
→ Shows all patches grouped by date/compound

## Related Commands Reference

```bash
# Agent System
npm run agent:run [--mode=standard] [--batch=5]
npm run agent:review
npm run status:agent-patches
npm run validate:agent-patches
npm run report:pending-patches

# Build & Validation
npm run check:full
npm run data:build
npm run data:validate
npm run verify:build

# Development
npm run dev
npm run lint
npm run typecheck
npm run test
```

## Key Files by Purpose

**Understanding the system:**
- `CLAUDE.md` — Project overview
- `AGENTS.md` — Agent constraints
- `docs/agent-integration-guide.md` — Full guide

**Running patches:**
- `agent/orchestrator/run-orchestrator.js` — Main entry point
- `agent/agents/*.js` — Individual agents
- `scripts/ci/validate-agent-patches.mjs` — Validation

**Reviewing & applying:**
- `scripts/review-patches.mjs` — Review generation
- `scripts/enrichment/guide-manual-patch-application.md` — Application steps
- `scripts/merge-patches.mjs` — Patch merging

**CI integration:**
- `scripts/orchestrate-build.mjs` — Build orchestrator
- `package.json` — Scripts (check:full includes patches)
- `docs/ci-workflow-example.md` — Platform examples

## Documentation Quality Checklist

All documentation includes:
- [x] Clear purpose statement
- [x] Step-by-step instructions
- [x] Real examples
- [x] Troubleshooting section
- [x] Links to related docs
- [x] Inline code samples
- [x] Expected outputs
- [x] Next steps guidance

## Getting Help

**Quick answers:** `docs/AGENT-QUICKSTART.md`
**How something works:** `docs/agent-integration-guide.md`
**Setting up CI:** `docs/ci-workflow-example.md`
**Applying patches:** `scripts/enrichment/guide-manual-patch-application.md`
**System overview:** `CLAUDE.md` or `AGENTS.md`

---

**Last Updated:** 2026-06-07
**System Version:** 2.0
**Status:** Fully Integrated and Ready

This index provides a complete map of the agent enrichment system. Use it to navigate documentation, find commands, and understand architecture.
