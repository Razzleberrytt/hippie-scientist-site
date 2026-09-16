# Sleep + ADHD decision-routing upgrade

## Goal
Turn the evidence atlas into a clearer decision tool without weakening its evidence restraint.

## Acceptance criteria
- Add a prominent decision map that routes readers by sleep pattern before intervention choice.
- Preserve distinctions between sleep benefit and ADHD treatment, association and causation, subjective and objective outcomes, deficiency status and supplement efficacy, and pediatric and adult evidence.
- Keep red-flag breathing symptoms routed toward evaluation rather than supplement selection.
- Strengthen internal links to melatonin and iron/ferritin evidence where those contexts are specifically relevant.
- Preserve the existing evidence table, FAQ schema, references, canonical route, and ArticleLayout structure.

## Validation
- npm run lint
- npm run typecheck
- npm test
- Production Content Lint
- Site Health
- Atomic Upgrade Gate
- Build Quality

## Regression contract
Do not convert the page into a supplement recommendation page, do not imply that sleep improvement treats core ADHD, and do not weaken evaluation language around suspected sleep-disordered breathing.
