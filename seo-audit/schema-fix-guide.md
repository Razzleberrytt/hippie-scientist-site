# Schema.org Fix Guide

878 pages have schema.org validation errors. Rich results (FAQ, HowTo, Product) won't trigger until fixed.

## Common Issues

1. **Missing required fields** — FAQ schema requires 2+ Q&A pairs with `@type: Question`, `name`, `acceptedAnswer.text`
2. **Invalid date formats** — Use ISO 8601: `2026-07-03T00:00:00Z`
3. **Missing @context** — Every schema block needs `"@context": "https://schema.org"`
4. **URLs must be absolute** — No relative paths in schema URLs

## Priority Pages to Fix

Run these through [Google Rich Results Test](https://search.google.com/test/rich-results-test):

1. Best-supplements-for-adhd (5 GSC keywords)
2. Melatonin-vs-magnesium comparison (6 GSC keywords)
3. Compound profile pages (5 GSC keywords per page)
4. Evidence-report (816 studies — perfect for Article schema)

## Validation

```bash
# Test a page
curl -s https://thehippiescientist.net/page/ | grep -o 'application/ld+json[^<]*' | head -1
```

Or use: https://validator.schema.org/