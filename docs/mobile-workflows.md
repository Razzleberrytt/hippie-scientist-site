# Mobile Workflow Dashboard

## Master Research Pipeline
Runs the full metadata-first pipeline in safe order.

## Agent Metadata Harvester
Fast deterministic harvesting.
Default:
- mode=fast
- batch=50

## Patch QA Audit
Audits generated patches.
Checks:
- duplicates
- malformed metadata
- missing sources
- conflict flags

## Review Agent Patches
Exports approved standalone patches.
Does NOT mutate workbook/runtime.

## Deep Enrichment
Runs selective enrichment for flagship compounds.
Use sparingly.

## Relationship Graph Builder
Builds related compounds and stack relationships.

## SEO Asset Generator
Generates:
- faq candidates
- internal links
- comparison targets
- seo topics

## Product Intelligence
Generates:
- buyer guidance
- product quality notes
- affiliate metadata
