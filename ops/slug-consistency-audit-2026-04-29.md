# Slug Consistency Audit (2026-04-29)

## Scope
- public/data/herbs.json
- public/data/compounds.json
- public/data/entity-slug-aliases.json

## Rules checked
- Slugs are lowercase
- Slugs are hyphenated
- No duplicate normalized slugs within each entity list
- Alias keys/targets normalize cleanly
- No alias key maps to multiple normalized targets

## Results
- Herbs scanned: 285
- Compound scanned: 235
- Herb slug normalization fixes required: 0
- Compound slug normalization fixes required: 0
- Herb duplicate normalized slugs: 0
- Compound duplicate normalized slugs: 0
- Herb alias normalization issues: 0
- Compound alias normalization issues: 0
- Herb alias conflicts: 0
- Compound alias conflicts: 0

## Fixes applied
- No data changes were required; all audited slugs and alias mappings already met consistency rules.
- Existing mappings were preserved unchanged.
