# Source of Truth Inventory

## Source of Truth Rules

- Workbook = data authority (`data-sources/herb_monograph_master.xlsx`)
- Scripts = transformation layer
- `public/data/` = runtime output
- Site = read-only consumer

## Active Data Paths

| Path | Role | Classification |
|---|---|---|
| `data-sources/` | Workbook source | CANONICAL_WORKBOOK |
| `public/data/` | Runtime payload used by app | GENERATED_OUTPUT |
| `scripts/` | Data generation and validation | GENERATOR_OR_VALIDATOR_CODE |
| `content/` | Editorial/static content | STATIC_SITE_COPY |

## Rules

- All production data MUST originate from the workbook
- Scripts transform workbook data into runtime JSON
- The site MUST ONLY read from `public/data/`
- No duplicate or parallel data sources are allowed

## Deleted / Deprecated Sources

- Any legacy or duplicate datasets outside the workbook pipeline should be removed or ignored
