# AI source-audit inputs

Use this directory for repeatable observations of which sources answer engines cite for important supplement questions. The source-gap audit reads every `*.csv` file here and keeps this input deliberately vendor-neutral.

## Minimum columns

```csv
question,assistant,cited_url
"Does magnesium help sleep?","ChatGPT","https://example.com/article"
```

## Recommended columns

```csv
question,assistant,cited_url,topic,target_url,missing_fact,structure_gap,notes,date
"Does magnesium help sleep?","ChatGPT","https://example.com/article","magnesium sleep","https://thehippiescientist.net/compounds/magnesium/","Studied dose and trial duration are easier to verify on the competing source","Dose, duration, and population appear beside the conclusion","Verify against primary research before changing THS","2026-08-15"
```

## Recording rules

- Record one row per cited source. If an answer cites four sources, record four rows for the same question/assistant.
- `target_url` should point to an **existing canonical Hippie Scientist page** that should answer the question. Leave it blank when mapping is genuinely unclear.
- `missing_fact` is an observation, not permission to copy a competitor. Verify the fact against primary or otherwise authoritative sources before editing THS.
- `structure_gap` should describe information architecture, such as “dose beside conclusion” or “population limitation in the evidence table,” not visual imitation.
- Do not store long competitor quotations or copyrighted passages.
- Do not create AI-only doorway pages to satisfy an audit row. Improve the best canonical source or map the intent to an existing source first.
- Use generic research questions; do not put personal or sensitive health information into these audit files.

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

This complements `ai-citation-tracker.mjs`: the tracker measures THS citation performance from first-party exports, while this audit explains where competing sources win and routes the remediation back to canonical THS pages.
