# AI source-audit inputs

Drop CSV exports or manually recorded audit batches in this directory. The source-gap audit reads every `*.csv` file and keeps the input format deliberately simple so checks from ChatGPT/search assistants can be recorded without coupling the repository to one vendor.

## Minimum columns

```csv
question,assistant,cited_url
"Does magnesium help sleep?","ChatGPT","https://example.com/article"
```

## Recommended columns

```csv
question,assistant,cited_url,topic,target_url,missing_fact,structure_gap,notes,date
"Does magnesium help sleep?","ChatGPT","https://example.com/article","magnesium sleep","https://thehippiescientist.net/compounds/magnesium/","Competitor states the studied dose and trial duration beside the conclusion","Competitor uses a compact evidence table directly below the answer","Verify against primary sources before adding any fact","2026-08-15"
```

Accepted aliases are documented in `scripts/seo/ai-source-gap-audit.mjs`.

## Recording rules

- Record one row per cited source. If an answer cites four sources, record four rows with the same question + assistant.
- `target_url` should be an **existing canonical Hippie Scientist page** that ought to answer the question. Leave it blank if mapping is genuinely unclear.
- `missing_fact` is an observation, not permission to copy a competitor. Verify the fact against primary/reliable sources before changing the site.
- `structure_gap` should describe useful information architecture (for example, “dose beside conclusion” or “population limitation in table”), not visual mimicry.
- Do not paste copyrighted competitor passages into this dataset.
- Do not create a new AI-only page to satisfy an audit row. Improve the best canonical source or map the query to an existing source first.
- Avoid personal or sensitive health information in prompts stored here; use generic research questions.

## Run

```bash
node scripts/seo/ai-source-gap-audit.mjs
```

Optional dated label:

```bash
node scripts/seo/ai-source-gap-audit.mjs --label=2026-08-15
```

Outputs:

- `ops/reports/ai-source-gaps.json`
- `ops/reports/ai-source-gaps.md`
- `ops/ai-citations/source-gap-history/<label>.json`

The history enables topic-level citation-rate change tracking, while the existing `ai-citation-tracker.mjs` continues to track Bing AI Performance citations and cited URLs from first-party exports.
