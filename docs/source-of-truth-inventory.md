# Source of Truth Inventory

| Path | Contains real production content? | Classification | Action |
|---|---|---|---|
| `archive/` | No (missing) | UNRELATED_UI_OR_CONFIG | No action (path not present). |
| `content/` | Yes (published markdown/MDX content) | UNRELATED_UI_OR_CONFIG | Keep; active editorial content for app features. |
| `data/` | Mixed (identity maps + legacy imports + misc config) | OBSOLETE_DUPLICATE_SOURCE | Delete duplicate content sources under `data/import/` (removed `citations.xlsx` + `Blank`); keep non-content config/identity maps used by scripts. |
| `data-sources/` | Yes (workbook source) | CANONICAL_WORKBOOK | Keep; workbook remains authoritative source. |
| `public/data` | Yes (runtime payload used by app) | GENERATED_OUTPUT | Keep; generated deterministically from workbook via `data:build`. |
| `public/data-next` | Yes (duplicate generated runtime payload) | OBSOLETE_DUPLICATE_SOURCE | Deleted folder as duplicate scaffold store. |
| `public/data/projections` | No (missing) | OBSOLETE_DUPLICATE_SOURCE | No action (path not present). |
| `scripts/` | No (code) | GENERATOR_OR_VALIDATOR_CODE | Keep; update scripts to stop referencing deleted duplicate outputs. |
| `src/data` | No (missing) | UNRELATED_UI_OR_CONFIG | No action (path not present). |

## Deleted duplicate sources

- `public/data-next/` (entire duplicate generated dataset tree).
- `data/import/citations.xlsx` (duplicate import source outside canonical workbook flow).
- `data/import/Blank` (legacy import placeholder).
