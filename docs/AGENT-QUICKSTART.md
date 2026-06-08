# Agent Enrichment System: Quick Start

New to the agent enrichment system? Start here.

## What Is It?

The agent system automatically generates research patches (JSON files) that enrich your content with:
- Evidence from PubMed and clinical trials
- Confidence scoring
- SEO optimizations (FAQs, topics, links)
- Enriched descriptions and mechanisms
- Interaction data
- Affiliate recommendations

These patches sit in `agent/patches/` and must be reviewed before merging into the workbook.

## 5-Minute Overview

### 1. Check Current Status
```bash
npm run status:agent-patches
```
See how many patches exist, what agents made them, and what's been reviewed.

### 2. Run Agents (if authorized)
```bash
npm run agent:run --mode=standard --batch=5
```
Generates patches for 5 compounds. This may take time depending on batch size and network.

**Modes:**
- `fast`: Metadata only, 20 compounds, no enrichment
- `standard`: Lightweight enrichment, 5 compounds (default)
- `deep`: Full enrichment, 1 compound at a time

### 3. Validate Patches
```bash
npm run validate:agent-patches
```
Checks all patches are well-formed. Fails if there are errors.

### 4. Review Patches
```bash
npm run agent:review
```
Creates human-readable summary in `ops/agent-review/`:
- `approved-patches.json` — Full patch data
- `approved-patches.csv` — Spreadsheet format (open in Excel)

**What to look for:**
- Confidence score (higher is better, target > 0.5)
- Evidence count (more studies = better)
- Rejection reasons (any flags?)
- Claims match evidence

### 5. Apply to Workbook
For each approved patch:
1. Open `data-sources/herb_monograph_master.xlsx`
2. Find the compound row
3. Merge in:
   - Evidence data
   - Enrichment content
   - SEO assets
   - Interactions
4. Save workbook

### 6. Rebuild Data
```bash
npm run data:build
```
Regenerates `public/data/` from updated workbook.

### 7. Commit
```bash
git add data-sources/herb_monograph_master.xlsx public/data/
git commit -m "chore: apply agent patches for [compounds]"
```

## Commands Reference

**Status & Validation:**
```bash
npm run status:agent-patches      # Quick overview
npm run validate:agent-patches    # Check patch JSON structure
npm run report:pending-patches    # Summarize pending patches
```

**Generation & Review:**
```bash
npm run agent:run                 # Generate patches
npm run agent:review              # Create review artifacts
```

**Build & Verification:**
```bash
npm run data:build                # Rebuild public/data from workbook
npm run check:full                # Full validation (includes patch validation)
```

## Workflow at a Glance

```
Developer                  CLI Commands                  Artifacts
─────────────────────────────────────────────────────────────────
                                                         agent/patches/*
                          npm run agent:run
Developer                 ✓                             ops/agent-review/*
or bot                    npm run agent:review
                          
                          Review CSV
Manual editing            ↓
                          npm run data:build
of workbook               
                          public/data/* (rebuilt)
                          npm run check:full
Done                      ✓ All checks pass
```

## Common Scenarios

### Scenario 1: "How do I see what patches exist?"
```bash
npm run status:agent-patches
npm run report:pending-patches
```

### Scenario 2: "I want to review patches before applying"
```bash
npm run agent:review
# Open ops/agent-review/approved-patches.csv in Excel
# Review confidence scores, evidence counts, flags
```

### Scenario 3: "I have 180+ patches, how do I manage them?"
```bash
npm run agent:review
# Filter CSV by confidence score (>= 0.6)
# Filter by agent type (focus on one)
# Process compounds in batches
```

### Scenario 4: "A patch looks wrong, how do I report it?"
1. Review the patch details in the CSV or JSON
2. Check the source agent (metadata-harvester? enrichment-agent?)
3. File an issue or contact the team
4. Skip that patch for now, focus on good ones

### Scenario 5: "What if validation fails?"
```bash
npm run validate:agent-patches
# See error messages
# Fix the problematic patch file or regenerate
```

### Scenario 6: "I want CI to catch invalid patches"
See `docs/ci-workflow-example.md` for:
- GitHub Actions setup
- GitLab CI setup
- Cloudflare Pages integration

## Detailed Documentation

**Full Details:**
- `docs/agent-integration-guide.md` — Complete architecture, patch formats, CI integration
- `docs/ci-workflow-example.md` — Setting up CI validation
- `scripts/enrichment/guide-manual-patch-application.md` — Step-by-step application guide

**Configuration:**
- `CLAUDE.md` — Agent commands and system overview
- `AGENTS.md` — Agent constraints and guidance
- `agent/orchestrator/run-orchestrator.js` — Agent execution code

## Troubleshooting

### "No patches found"
- Run `npm run agent:run` to generate them
- Agents may require API keys (OpenAI for enrichment mode)

### "Patches failed validation"
- Check patch JSON is valid: `npm run validate:agent-patches`
- Review error messages
- Regenerate patches if needed

### "Review artifacts don't exist"
- Run `npm run agent:review` to generate them
- Check `ops/agent-review/` directory

### "Can't apply patches to workbook"
- See `scripts/enrichment/guide-manual-patch-application.md`
- Verify workbook structure matches expected columns
- Validate after each change: `npm run data:build`

### "CI is blocking my build"
- If `validate:agent-patches` fails, fix patch structure
- If `report:pending-patches` appears, it's informational (not blocking)
- Run locally: `npm run validate:agent-patches`

## Next Steps

1. **Immediate:**
   ```bash
   npm run status:agent-patches
   npm run validate:agent-patches
   ```

2. **Review pending:**
   ```bash
   npm run agent:review
   # Open ops/agent-review/approved-patches.csv
   ```

3. **Plan application:**
   - Decide which patches to apply
   - Read application guide if needed
   - Edit workbook carefully

4. **Set up CI:**
   - Use template from `docs/ci-workflow-example.md`
   - Add to your CI platform
   - Test locally first

5. **Consider automation:**
   - Future: `npm run agent:apply --approved-only`
   - Set up scheduled agent runs
   - Establish review + approval workflow

## Getting Help

**For questions about:**
- Patch validation → `docs/agent-integration-guide.md`
- CI setup → `docs/ci-workflow-example.md`
- Manual application → `scripts/enrichment/guide-manual-patch-application.md`
- Agent behavior → `AGENTS.md` + agent source code in `agent/`

**Command Help:**
```bash
npm run status:agent-patches --help
npm run validate:agent-patches --help
```

---

**Last Updated:** 2026-06-07
**Agent System Version:** 2.0
