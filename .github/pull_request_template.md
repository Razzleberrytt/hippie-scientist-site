## Atomic upgrade

Closes #

### Summary

- 

### Relevant URLs

- 

### Acceptance criteria

- [ ] 

### Validation commands

- [ ] `npm run lint`
- [ ] `npm run check`
- [ ] `npm run validate:release` for generator, route, schema, sitemap, or structural changes
- [ ] no package-lock drift
- [ ] no unexpected `public/data` diffs
- [ ] no generated file corruption
- [ ] static export compatible

### Before → after metrics

| Metric / invariant | Before | After |
|---|---:|---:|
|  |  |  |

### Generator/source-of-truth decision

- [ ] The fix is at the generator/canonical-source/shared-component level where the defect is systemic, **or** this PR explains why an isolated page-level patch is correct.

### Regression contract

- [ ] The change is independently useful and independently mergeable.
- [ ] Relevant regression baseline/snapshot comparison is unchanged or improved.
- [ ] Any intentional regression/tradeoff is explicitly documented below and is outweighed by a measured improvement.

### Risk notes / justified tradeoffs

- None.
