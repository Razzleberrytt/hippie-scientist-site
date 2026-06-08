# Next.js 15.5.18 Upgrade

This repository is being prepared for a narrow patch upgrade from Next.js 15.3.2 to Next.js 15.5.18.

Scope:
- upgrade Next.js only
- preserve React 18
- preserve React DOM 18
- preserve static export configuration
- preserve current App Router architecture

## Required Local Lockfile Regeneration

The GitHub connector intentionally did not modify `package-lock.json`.

Before merge:
- regenerate `package-lock.json` locally or in Codespaces
- commit the regenerated lockfile
- verify CI passes

## Constraints

- Do not upgrade to Next 16.
- Do not upgrade React or React DOM.
- Preserve `output: "export"`.
- Do not run `npm update`.
- Do not manually edit `package-lock.json`.

## Maintainer Validation

```bash
npm install next@15.5.18 --save
npm ci
npm run build
npm run lint
npx tsc --noEmit
```

## Expected Validation Areas

Validate:
- App Router static export behavior
- Dynamic route params compatibility
- Data build scripts
- Runtime payload generation
- Existing route verification scripts
