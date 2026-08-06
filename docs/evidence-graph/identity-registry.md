# Evidence Graph Identity Registry

This subsystem creates stable herb and compound identities from the canonical workbook without changing the live site importer or writing back to the workbook.

## Outputs

Running the pipeline generates:

- `data/graph/identity/substance-registry.json`
- `data/graph/identity/identity-validation-report.json`
- `data/graph/identity/identity-collision-review.csv`
- `data/graph/identity/identity-resolution-report.json`

Generated outputs are validation artifacts. The durable source files are the identity rules, registry schema, scripts, and the human-reviewed resolution ledger.

## Commands

```bash
node scripts/evidence-graph/build-identity-registry.mjs
node scripts/evidence-graph/build-identity-collision-review.mjs
node scripts/evidence-graph/apply-identity-resolutions.mjs
node --test scripts/evidence-graph/__tests__/*.test.mjs
```

## Identity policy

1. Stable IDs use `herb:<canonical-slug>` and `compound:<canonical-slug>`.
2. Canonical slugs take precedence over names and aliases.
3. Duplicate names and slugs enter a review queue; they are never merged automatically.
4. Approved alias merges remain visible as deprecated child records pointing to the canonical identity.
5. Distinct chemical or product forms remain active child identities with `parentEntityId`.
6. The workbook remains the source of imported identity candidates; `identity-resolutions.json` is the source of human decisions.

## Current approved resolutions

The initial ledger resolves CoQ10, lion's mane, and nicotinamide riboside abbreviations as aliases, while retaining berberine hydrochloride as an active form of berberine.

## Next work

Review remaining same-type canonical-name collisions and cross-type name conflicts before claims, sources, and relationship edges rely on these identities.
