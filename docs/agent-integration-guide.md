# Agent Enrichment System Integration Guide

## Overview

This document describes the agent enrichment system that produces patches to enhance content with AI-generated research, scoring, and enrichment data. Patches are validated in CI and must be reviewed before merging into the workbook source of truth.

## Architecture

### Agent Workflow

```
agent/orchestrator/run-orchestrator.js (npm run agent:run)
    ↓
    Metadata harvesting, evidence scoring, enrichment
    ↓
agent/patches/{date}/*.json
    ↓
    CI Validation (npm run validate:agent-patches)
    ↓
    Manual Review (npm run agent:review)
    ↓
    Integration into workbook (manual or scripted)
    ↓
    public/data/* (rebuilt via npm run data:build)
```

### Patch Structure

Patches are JSON files stored by date: `agent/patches/{YYYY-MM-DD}/{slug}-{source_agent}-{uuid}.json`

**Common Fields:**
- `patch_id`: UUID for patch tracking
- `schema_version`: Format version (e.g., "2.0")
- `source_agent`: Agent that produced the patch (e.g., "metadata-harvester", "enrichment-agent")
- `created_at`: ISO timestamp
- `slug`: Compound or herb slug this patch applies to
- `patch_type`: Type of patch ("evidence", "enrichment", "affiliate")
- `research_depth`: How deep the research went ("metadata_only", "lightweight_enrichment", "full_enrichment")
- `metadata_sources`: Array of external data sources referenced
- `confidence_notes`: Uncertainty flags or caveats
- `review_flags`: Quality issues requiring human attention
- `seo_assets`: FAQ candidates, SEO topics, internal link targets

**Evidence Patches:**
- `evidence`: Array of evidence rows (studies, trials, etc.)
- `validation`: Validation agent output (rejection_reasons, etc.)
- `scoring`: Confidence scoring data

**Enrichment Patches:**
- `enrichment`: Enrichment agent output (generated content, insights, etc.)

**Affiliate Patches:**
- `affiliate`: Affiliate-related metadata and recommendations

## CI Integration

### Validation Scripts

#### 1. `npm run validate:agent-patches`
**Purpose:** Validates patch JSON structure and required fields
**Location:** `scripts/ci/validate-agent-patches.mjs`
**When it runs:** Part of `npm run check:full`
**Exit codes:**
- 0: All patches valid or no patches found
- 1: One or more patches have validation errors

**Checks:**
- Required fields (patch_id, slug, source_agent, patch_type, etc.)
- Valid patch_type values
- Correct data types for each field
- Evidence arrays present in evidence patches
- Schema version is set

#### 2. `npm run report:pending-patches`
**Purpose:** Summarizes pending patches that need review
**Location:** `scripts/ci/report-pending-patches.mjs`
**When it runs:** End of `npm run check:full`
**Exit codes:**
- 0: Always (informational only)

**Output:**
- Total patches by date and compound
- Agents involved
- Patch types
- Guidance on next steps (review, merge)

### Build Integration

The agent patch validation is integrated into the full build pipeline:

```bash
npm run check:full
    ├── tsc --noEmit
    ├── eslint
    ├── validate-workbook-source
    ├── validate-agent-patches          ← NEW
    ├── data:build
    ├── semantic checks
    ├── orchestrate-build
    ├── verify:build
    └── report:pending-patches          ← NEW
```

If patches are detected with validation errors, `check:full` will fail and report the issues.

## Workflow: From Agent to Workbook

### Step 1: Agent Runs (Developer or Scheduled)
```bash
npm run agent:run --mode=standard --batch=5
```
This generates patch files in `agent/patches/{date}/`.

### Step 2: Automatic CI Validation
```bash
npm run check:full
```
Patches are automatically validated:
- JSON structure validated
- Required fields checked
- Invalid patches cause CI failure
- Pending patches are reported

### Step 3: Manual Review
```bash
npm run agent:review
```
This:
- Scans all patches in `agent/patches/`
- Summarizes last 20 patches with evidence, claims, flags
- Reports uncertainty/conflict markers
- Creates output in `ops/agent-review/` (JSON + CSV)

**Review Process:**
1. Read the CSV or JSON output
2. Check confidence scores
3. Verify claims are evidence-based
4. Look for rejection reasons and conflict flags
5. Approve or reject in manual decision (future: via web UI or spreadsheet)

### Step 4: Apply/Merge Patches
**Current state:** Manual process
**How:**
1. View approved patches from review
2. Extract data and manually edit workbook
3. Run `npm run data:build` to regenerate public/data
4. Commit workbook changes

**Desired state (future):** Automated merge
- Approved patches could be applied to workbook programmatically
- `npm run agent:merge` would batch-apply patches
- Rollback support via manifest tracking

## Patch Formats by Type

### Evidence Patch Example
```json
{
  "patch_id": "uuid-here",
  "schema_version": "2.0",
  "source_agent": "metadata-harvester",
  "created_at": "2026-05-06T12:34:56Z",
  "slug": "berberine",
  "patch_type": "evidence",
  "research_depth": "lightweight_enrichment",
  "evidence": [
    {
      "pmid_or_source": "12345678",
      "study_type": "randomized_trial",
      "sample_size": 50
    }
  ],
  "validation": {
    "validation_status": "approved",
    "rejection_reasons": []
  },
  "scoring": {
    "confidence_score": 0.75,
    "evidence_strength": "moderate"
  },
  "metadata_sources": ["pubmed", "clinicaltrials"],
  "confidence_notes": [],
  "review_flags": [],
  "seo_assets": {
    "faq_candidates": ["What is berberine used for?"],
    "seo_topics": ["berberine benefits", "berberine safety"]
  }
}
```

### Enrichment Patch Example
```json
{
  "patch_id": "uuid-here",
  "schema_version": "2.0",
  "source_agent": "enrichment-agent",
  "created_at": "2026-05-06T12:34:56Z",
  "slug": "berberine",
  "patch_type": "enrichment",
  "enrichment": {
    "summary": "...",
    "mechanisms": ["..."],
    "interactions": ["..."]
  },
  "seo_assets": { ... },
  "metadata_sources": [],
  "confidence_notes": [],
  "review_flags": []
}
```

## Troubleshooting

### Patches not validating
**Error:** `validate-agent-patches` fails
**Solution:**
1. Check patch JSON is valid: `node -e "console.log(JSON.parse(require('fs').readFileSync('agent/patches/...')))"` 
2. Verify required fields are present
3. Check `patch_type` is one of: evidence, enrichment, affiliate

### Patches are validated but not reviewed
**Issue:** Patches sit in `agent/patches/` without being reviewed
**Solution:**
1. Run `npm run agent:review` to generate summary
2. Check `ops/agent-review/approved-patches.csv`
3. Plan to integrate patches into workbook
4. Consider setting up a scheduled review process

### CI reports pending patches in build
**Info:** This is normal. Patches are reported at end of check:full
**Next steps:**
1. Review the patches: `npm run agent:review`
2. Decide which to apply
3. Update workbook with approved data
4. Run `npm run data:build`

## Scripts Reference

| Script | Purpose | Exit |
|--------|---------|------|
| `npm run agent:run` | Generate patches | 0 (success) |
| `npm run agent:review` | Create review artifacts | 0 (always) |
| `npm run validate:agent-patches` | Validate patch JSON | 0 or 1 |
| `npm run report:pending-patches` | Summarize pending | 0 (always) |
| `npm run check:full` | Full build + patches | 0 or 1 |

## Configuration

Agent behavior is configured in:
- `agent/orchestrator/run-orchestrator.js`: Mode, batch size, enrichment depth
- `agent/lib/*.js`: Individual agent logic and scoring rules
- `agent/schemas/`: JSON Schema definitions for validation

## Future Enhancements

1. **Patch Application Script:** `npm run agent:apply` to batch-apply approved patches to workbook
2. **Web Review UI:** Visual review interface for patches with annotation support
3. **Rollback Support:** Maintain manifest of applied patches for easy rollback
4. **Lane-based Workflow:** Different approval lanes for different patch types
5. **Scheduled Agent Runs:** Cron job to generate patches on schedule
6. **Approval Database:** Track which patches have been approved/rejected

## Related Documentation

- `AGENTS.md`: General agent system guidance
- `docs/workbook-only-data-contract.md`: Data pipeline and source of truth
- `scripts/ci/`: Individual CI validation scripts
- `agent/`: Agent system source code
