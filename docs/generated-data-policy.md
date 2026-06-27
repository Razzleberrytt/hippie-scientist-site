# Generated Data Policy

## Source of Truth Rules

- Workbook = data authority (`data-sources/herb_monograph_master.xlsx`)
- Scripts = transformation layer
- `public/data/` = runtime output
- Site = read-only consumer

## Runtime Data Rules

- All runtime data is generated into `public/data/`
- This is the ONLY source consumed by the site
- No manual editing of files in `public/data/` is allowed

## Canonical Source Rule

- `data-sources/herb_monograph_master.xlsx` is the sole canonical source of truth

## Generated Output Rules

- Only approved scripts may write generated runtime data
- Generated files must always be reproducible from the workbook

## Legacy Data Caution

- Any dataset outside the workbook → scripts → `public/data` pipeline is considered unsafe unless explicitly documented

## Commit Policy for Generated Files

- Do not commit generated files unless explicitly required by the repo’s deployment model
