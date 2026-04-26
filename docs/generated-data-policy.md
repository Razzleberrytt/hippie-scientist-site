# Generated Data Policy

## Canonical Source Rule

- `data-sources/herb_monograph_master.xlsx` is the sole canonical source of truth.

## Generated Output Rules

- `public/data-next` is migration output and must not be hand-edited.
- `public/data` is final runtime output and must not be hand-edited.
- Only approved scripts may write generated runtime data.

## Legacy Data Caution

- Legacy datasets are suspicious unless proven generated from the workbook.

## Migration Write Boundary

- During migration, scripts must write only to `public/data-next`.

## Commit Policy for Generated Files

- Do not commit generated files unless explicitly required by the repo’s deployment model.

## Related Docs

- [SPEC-1: Hippie Scientist Rebuild](./SPEC-1-Hippie-Scientist-Rebuild.md)
- [Import Boundaries](./import-boundaries.md)
- [Contractor Onboarding](./contractor-onboarding.md)
