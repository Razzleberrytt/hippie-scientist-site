# Contractor Onboarding

## Repo Purpose

This repository hosts Hippie Scientist application and data migration tooling. Current governance emphasizes rebuild safety, canonical workbook sourcing, and controlled generation of runtime data.

## Canonical Workbook Rule

- Canonical source of truth: `data-sources/herb_monograph_master.xlsx`

## Recommended Windows Path

- `C:\Users\Will\Projects\hippie-scientist-site`

## VS Code Folder Guidance

- Open only the repository folder in VS Code, not a parent folder.

## Safe First Commands

- `git status`
- `git log --oneline -10`
- `cat package.json`

## Branch Naming Convention

- `type/short-description`

## PR Discipline

- No mega-refactor PRs.

## Never Manually Edit

- `data-sources/herb_monograph_master.xlsx`
- `public/data`
- `public/data-next`

## Related Docs

- [SPEC-1: Hippie Scientist Rebuild](./SPEC-1-Hippie-Scientist-Rebuild.md)
- [Generated Data Policy](./generated-data-policy.md)
- [Import Boundaries](./import-boundaries.md)
