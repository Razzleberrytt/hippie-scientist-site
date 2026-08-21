# Homepage redesign QA

## Comparison setup

- Source of truth: `artifacts/homepage-qa/source-option-2.png` (853 × 1844 px)
- Implementation: `artifacts/homepage-qa/implementation-mobile-390x844.png` (375 × 812 px capture from a requested 390 × 844 CSS viewport; device scale factor 1)
- State: homepage, top of page, light theme, production header visible
- Side-by-side evidence: `artifacts/homepage-qa/source-vs-implementation.png`
- Additional checks: `implementation-desktop-1440x1024.png`, `implementation-desktop-full.png`, `implementation-mobile-full.png`, and `implementation-mobile-dark-390x844.png`

The full-viewport comparison was readable at original resolution, so a separate cropped-region comparison was not necessary.

## Comparison history

1. Initial implementation comparison found two P2 issues: the mobile search placeholder was clipped by its submit control, and excess vertical spacing pushed the decision section farther below the first viewport than the selected design.
2. Fixed the placeholder, reduced only mobile hero/goal spacing, retained accessible touch targets, and recaptured the same viewport and state.
3. Final comparison found no P0, P1, or P2 differences.

## Remaining intentional differences

- P3: The production header retains the existing search action and brand asset instead of replacing the global navigation component with the mock's simplified header.
- P3: The generated mock's decorative botanical branch is omitted to keep the shipping page lean and avoid introducing a non-functional asset.
- Data values come from the current build report, so sourced claims show 571 rather than the mock's illustrative 512.
- The visible search submit control is retained so the primary path works for pointer and keyboard users.

## Functional and quality checks

- Homepage search submitted `magnesium` and navigated to `/search/?q=magnesium`.
- Sleep goal navigated to `/guides/sleep/`.
- Light and dark themes were visually inspected at the mobile breakpoint.
- Desktop and full-page layouts were visually inspected for clipping and overflow.
- Browser console: no runtime errors; one existing Next.js future-warning about `scroll-behavior: smooth`.
- `npm run typecheck`: passed.
- `npx eslint components/homepage-v2.tsx --max-warnings=0`: passed.
- `npm run test:a11y`: passed (5 tests).
- `npx next build`: passed and exported 1,330 static pages. The project's wrapper `npm run build` still stops earlier in its data step on the pre-existing Windows `UNKNOWN open public\\data\\herbs-detail\\berberis-aristata.json` error; its generated side effects were restored.

## Final result

passed
