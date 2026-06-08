# Manual Patch Application Guide

This guide explains how to manually review and apply approved patches to the workbook after agent enrichment.

## Overview

Agent patches contain validated evidence, enrichment data, and metadata. Once reviewed and approved, this data needs to be integrated back into `data-sources/herb_monograph_master.xlsx`.

## Process

### Step 1: Generate Patches

Run the agent to create patches:

```bash
npm run agent:run --mode=standard --batch=5
```

Patches will appear in `agent/patches/{date}/`.

### Step 2: Validate Patches

Ensure patches are well-formed:

```bash
npm run validate:agent-patches
```

If validation fails, check error messages and fix patch generation.

### Step 3: Review Patches

Generate a review summary:

```bash
npm run agent:review
```

This creates:
- `ops/agent-review/approved-patches.json` — Full patch data
- `ops/agent-review/approved-patches.csv` — Spreadsheet for easier review

### Step 4: Decide on Patches

For each compound with patches, decide:
- **Approve:** Apply this patch's data to the workbook
- **Reject:** Skip this patch, rely on existing data
- **Flag:** Mark for follow-up or further research

**Review criteria:**
- Confidence score (look for scores > 0.5)
- Evidence count (more evidence = better)
- Rejection reasons (any red flags?)
- Conflict flags (contradictions with existing data?)
- Claims are reasonable and evidence-based

### Step 5: Apply Approved Data

For each approved patch, you'll need to merge its data into the workbook.

**Data to extract from patches:**

1. **Evidence data** (from evidence patches):
   - Study type, sample size, PMID, results
   - Confidence scoring information

2. **Enrichment data** (from enrichment patches):
   - Generated summaries and descriptions
   - Mechanism information
   - Interaction data
   - Safety notes

3. **SEO assets** (from both):
   - FAQ candidates
   - SEO topics
   - Internal link targets
   - Comparison candidates

4. **Affiliate data** (from affiliate patches):
   - Product recommendations
   - Affiliate links and tags

### Step 6: Edit Workbook

Open `data-sources/herb_monograph_master.xlsx` in Excel or similar:

1. Find the compound/herb row by slug
2. Locate the relevant columns:
   - Evidence-related columns (varies by sheet)
   - Description/enrichment columns
   - Safety/interactions columns
   - SEO metadata columns

3. Merge approved patch data:
   - For evidence: Add new rows or update existing studies
   - For enrichment: Update descriptions if improved
   - For interactions: Merge new interactions carefully
   - For SEO: Update FAQ, topics, links

4. **Important:** 
   - Never delete existing approved data
   - Merge new data carefully to avoid conflicts
   - Document the source (agent enrichment) in comments if workbook supports it

### Step 7: Validate Changes

Rebuild data from the modified workbook:

```bash
npm run data:build
```

Check for errors. If errors occur:
1. Review what changed
2. Fix the workbook
3. Retry `npm run data:build`

### Step 8: Verify Output

Check that `public/data/` is correct:

```bash
npm run data:validate
```

### Step 9: Commit

Once everything validates:

```bash
git add data-sources/herb_monograph_master.xlsx
git add public/data/  # (generated files)
git commit -m "chore: apply agent patches for [compounds]

Applied evidence and enrichment patches from agent run on [date]:
- [compound1]: Added [N] new studies, updated mechanisms
- [compound2]: Updated safety information, added interactions
"
```

## Patch Structure Reference

### Evidence Patch

```json
{
  "slug": "berberine",
  "evidence": [
    {
      "pmid_or_source": "12345678",
      "study_type": "randomized_trial",
      "sample_size": 50,
      "duration_weeks": 12,
      "outcome": "positive"
    }
  ],
  "scoring": {
    "confidence_score": 0.75
  },
  "seo_assets": {
    "faq_candidates": ["Is berberine safe?"],
    "seo_topics": ["berberine efficacy"]
  }
}
```

**Apply to workbook:**
- Add evidence rows to the evidence sheet
- Update summary statistics if provided
- Update confidence score field

### Enrichment Patch

```json
{
  "slug": "berberine",
  "enrichment": {
    "summary": "Berberine is...",
    "mechanism": ["Activates AMPK", "..."],
    "interactions": ["May interact with..."]
  }
}
```

**Apply to workbook:**
- Update description/summary field
- Add/merge mechanism information
- Merge interactions carefully with existing data

## Automation (Future)

In future, you may use:

```bash
npm run agent:apply --approved-only
```

This would:
1. Read `ops/agent-review/approved-patches.json`
2. Apply approved patches to workbook automatically
3. Generate rollback manifest
4. Rebuild `public/data`

For now, do this manually using the steps above.

## Common Issues

### "Evidence row already exists"
- Check if study PMID is already in workbook
- If different data, update the existing row
- If duplicate, skip it

### "Enrichment conflicts with existing description"
- Compare the two descriptions
- Keep the better one or merge them
- Document the choice in git commit

### "Interaction list is too long"
- Verify interactions are real (check confidence)
- Group by category if possible
- Consider linking to a separate interactions page

### "Confidence score is low"
- Question whether to include this data
- Check rejection reasons
- Require higher confidence for claims (>0.6)

## Tips

1. **Batch similar compounds:** If reviewing multiple similar compounds, process them together
2. **Use CSV for review:** The CSV export is easier to scan in a spreadsheet app
3. **Track what you apply:** Mark approved patches as applied so you don't duplicate
4. **Communicate changes:** Document in commit messages what patches were applied
5. **Validate frequently:** Run `npm run data:build` after every workbook change to catch errors early
6. **Backup first:** Save a copy of the workbook before making large changes

## Contact & Questions

For issues with patch content, review:
- `docs/agent-integration-guide.md` — Agent system overview
- `AGENTS.md` — Agent guidance and constraints
- `scripts/review-patches.mjs` — Review script source code

For workbook editing help, see:
- `docs/workbook-only-data-contract.md` — Data structure and contracts
