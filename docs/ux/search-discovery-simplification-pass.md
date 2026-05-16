# Search Discovery Simplification Pass

## Discovery philosophy

Search should feel like a calm evidence-discovery surface, not a database query builder. The page now asks users to begin with a broad research question, goal, mechanism, herb, or compound, then open profiles only when the evidence and safety context look worth investigating further.

The default state intentionally shows high-signal starting points so an empty query still teaches users how to scan profile cards. Guided discovery chips provide conservative entry points such as stress support, sleep, cognition, inflammation, energy, focus, and recovery without framing any profile as a deterministic recommendation.

## Filter simplification strategy

Filters are secondary. The primary interaction is still the search input, followed by guided discovery. Filters are hidden behind progressive disclosure and limited to profile type:

- all profiles
- herbs only
- compounds only

This keeps narrowing useful without exposing a complex control panel. The filter copy explains when to use profile-type filtering and avoids adding advanced metadata controls that would make the experience feel like an enterprise dashboard.

## Mobile scan rules

Search is optimized for small screens first:

- keep the search input near the top with generous touch targets
- stack discovery paths and result cards into readable blocks
- use short, consistent card sections
- limit each card to the highest-value scan signals
- keep CTAs full-width inside cards
- use progressive disclosure for secondary controls
- avoid dense metadata rows above the main result list

## Result hierarchy

Each result card follows a decision-oriented hierarchy:

1. profile type and evidence label
2. profile name
3. short conservative summary
4. “May be relevant for” context derived from existing profile signals
5. evidence and safety metrics
6. light mechanism/context chips when available
7. primary profile investigation CTA

The card should answer: what is it, why might it be relevant, how cautious should I be, and should I investigate the full profile?

## Evidence and safety presentation constraints

Evidence labels must stay standardized:

- Strong evidence
- Moderate evidence
- Limited evidence
- Mixed evidence
- Preliminary evidence
- Traditional use
- Insufficient evidence
- Needs review

Safety labels must use the established decision primitive language:

- Generally well tolerated
- Use caution
- Interaction risk
- Needs review
- Limited safety data

Do not introduce medical certainty, treatment claims, dosage advice, or promotional language. Search can point users toward profiles for further investigation, but it should not imply efficacy, safety guarantees, or clinical recommendations.

## Empty and sparse states

No-match and sparse-result states should help users recover:

- offer clear reset actions
- suggest broader discovery paths
- remind users that conservative evidence and safety labels are intentional
- avoid dead screens
- avoid pressuring users toward a single “best” result

## Non-goals

This pass intentionally does not:

- change workbook or runtime data generation
- modify generated JSON artifacts
- add dependencies
- redesign herb, compound, goal, or route architecture
- add advanced query-builder behavior
- invent claims, rankings, dosage guidance, or stack recommendations
- weaken conservative evidence semantics
