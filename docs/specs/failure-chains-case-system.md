# Failure Chains Case System Specification

## 1. Purpose

Failure Chains is a forensic case-study format for explaining how psychoactive-drug emergencies develop. Each entry reconstructs a documented incident, separates established facts from interpretation, explains the relevant pharmacology and toxicology, and identifies the sequence of conditions that turned an exposure into a medical crisis.

The format should help a reader answer:

> What happened, why did it happen, what remains uncertain, and what could prevent a similar outcome?

Failure Chains is an educational and harm-reduction system. It is not dosing guidance, a substitute for emergency care, or a vehicle for sensational stories.

## 2. Product goals

1. **Make the causal sequence visible.** Readers should be able to understand the incident at a glance before reading the full reconstruction.
2. **Standardize case reporting.** Every standalone case should use the same identifiers, summary fields, article anatomy, and evidence language.
3. **Preserve uncertainty.** The presentation must distinguish documented findings, reasonable inference, and unresolved questions.
4. **Teach systems thinking.** The focus is the chain of identity, route, dose, timing, biology, environment, and response failures—not moral blame.
5. **Remain reusable in MDX.** Authors should be able to create a new case without writing page-specific React code.
6. **Support future indexing.** Case metadata and terminology should be regular enough to power a Failure Atlas later.

## 3. Non-goals

The initial implementation does not include:

- A searchable Failure Atlas database.
- Automated extraction of failure-chain metadata from prose.
- A new content collection or a dedicated `/failure-chains` route.
- Clinical treatment protocols or personalized medical advice.
- User-submitted case reports.
- Numerical risk estimates inferred from individual case reports.

Those features may be added after the editorial format is stable across several published entries.

## 4. Case identity

Standalone Failure Chains entries receive permanent identifiers in publication order.

Format:

```text
FC-001
FC-002
FC-003
```

Rules:

- The identifier belongs to the standalone case article, not to every incident mentioned in an overview article.
- Identifiers are never reused, even when an article is retired or substantially revised.
- Roundups and series overviews are not assigned a case number.
- The case ID appears in the article title or opening case-file component and in the article tags.

The existing eight-case article is treated as a series overview. The injected-mushroom-tea article becomes the first standalone entry, `FC-001`.

## 5. Editorial contract

Every standalone case must contain the following sections, although headings may be adjusted for readability.

1. **Case file** — structured summary and visible failure chain.
2. **Safety note** — emergency framing without operational drug-use guidance.
3. **Executive summary** — the incident and central lesson in plain language.
4. **The story** — chronological reconstruction.
5. **What the source documented** — findings reported directly by the primary source.
6. **Pharmacology and toxicology** — the mechanism relevant to the outcome.
7. **Failure-chain analysis** — why the event escalated.
8. **Emergency response** — what clinicians recognized and managed, described at an educational level.
9. **Could it have been prevented?** — a direct, evidence-bounded answer.
10. **Evidence quality and uncertainty** — limitations of the source record.
11. **Bigger questions** — unanswered scientific, clinical, or policy questions.
12. **References** — primary sources first.

## 6. Case-file component contract

The reusable `FailureChainCaseFile` MDX component is the visual entry point for a case.

Required props:

| Prop | Type | Purpose |
| --- | --- | --- |
| `caseId` | string | Permanent identifier, such as `FC-001`. |
| `incident` | string | Short human-readable incident name. |
| `reported` | string | Publication year or incident date when reliably known. |
| `outcome` | string | Concise clinical or historical outcome. |
| `primaryFailure` | string | The dominant preventable or causal failure. |
| `preventability` | enum | `Low`, `Moderate`, `High`, `Very high`, or `Unknown`. |
| `medicalSeverity` | enum | `Moderate`, `Severe`, `Critical`, or `Fatal`. |
| `documentationConfidence` | enum | `Low`, `Moderate`, or `High`. |
| `documentation` | string | Source basis, such as `Peer-reviewed case report`. |
| `steps` | string[] | Ordered failure-chain steps. |

Example:

```mdx
<FailureChainCaseFile
  caseId="FC-001"
  incident="Intravenous mushroom tea"
  reported="Reported 2021"
  outcome="Septic shock, respiratory failure, multiorgan injury; survived"
  primaryFailure="Injection of nonsterile biological material"
  preventability="Very high"
  medicalSeverity="Critical"
  documentationConfidence="Moderate"
  documentation="Single peer-reviewed case report with culture confirmation"
  steps={[
    'Therapeutic research was interpreted as support for unsupervised self-treatment',
    'Whole mushroom material was boiled and passed through cotton',
    'The nonsterile liquid was injected intravenously',
    'Bacterial and fungal material entered the bloodstream',
    'Sepsis and multiorgan failure developed',
    'Intensive-care treatment led to survival',
  ]}
/>
```

## 7. Evidence language

Failure Chains articles should use three evidence categories in prose:

- **Documented:** directly reported by the primary source or official record.
- **Inferred:** a conclusion supported by the documented facts but not directly measured.
- **Uncertain:** information the available record cannot establish.

Examples:

- Documented: blood cultures grew organisms identified as *Brevibacillus* and *Psilocybe cubensis*.
- Inferred: injection of contaminated biological material was the dominant cause of sepsis.
- Uncertain: the exact organisms present in the prepared liquid before injection and the precise contribution of each organism to each organ injury.

A memorable headline must not be presented as more certain than the source. In particular, “mushrooms grew in his blood” should be explained as growth from blood cultures identified as *P. cubensis*, not literal mushroom fruiting bodies growing inside veins.

## 8. Preventability rating

Preventability is an editorial assessment, not a validated clinical score.

| Rating | Meaning |
| --- | --- |
| Very high | Avoiding one clearly hazardous action would probably have prevented the event. |
| High | Several known safeguards would likely have prevented or greatly reduced harm. |
| Moderate | Important risks were modifiable, but individual biology or incomplete evidence limits certainty. |
| Low | The event was difficult to anticipate or prevent with information reasonably available at the time. |
| Unknown | The record is too incomplete to assess. |

The article must explain the rating. The badge alone is not sufficient.

## 9. Medical-severity rating

Medical severity describes the documented outcome, not the inherent danger of every exposure to the substance.

| Rating | Meaning |
| --- | --- |
| Moderate | Medical evaluation or treatment was required without major organ failure. |
| Severe | Hospitalization, major physiologic disturbance, or substantial injury occurred. |
| Critical | Intensive care, respiratory or cardiovascular support, seizures, shock, or multiorgan failure occurred. |
| Fatal | One or more deaths were documented. |

## 10. Documentation confidence

Documentation confidence describes confidence in the incident reconstruction.

| Rating | Meaning |
| --- | --- |
| High | Multiple converging primary sources, analytical confirmation, or detailed official records. |
| Moderate | A credible primary report documents the core event, but important details or methods are missing. |
| Low | The account relies heavily on retrospective reporting, incomplete records, or unverified self-report. |

A single case report usually supports only limited generalization even when the incident itself is well documented.

## 11. Safety and tone requirements

- Do not provide preparation, dosing, injection, concealment, or procurement instructions.
- Do not reproduce unnecessary quantities when they would function as operational guidance.
- State emergency warning signs and direct readers toward emergency services and poison centers.
- Avoid ridicule. Case subjects are people, not punch lines.
- Avoid implying that one unusual case defines the ordinary risk profile of a compound.
- Distinguish the intended psychoactive molecule from contamination, route-of-administration, and environmental hazards.
- Use precise language for microbiology and toxicology; avoid tabloid phrasing unless the article is explicitly correcting it.

## 12. Accessibility and presentation

The case-file component must:

- Use semantic section and ordered-list markup.
- Expose a descriptive heading to screen readers.
- Keep color as a secondary cue; all ratings must be written as text.
- Render at narrow mobile widths without horizontal scrolling.
- Avoid animation that is required to understand the chain.
- Preserve readable contrast using the site's existing design tokens.

## 13. Search and cross-linking

Each article should include:

- `Failure Chains` and its case ID in tags.
- The primary compound, toxidrome, route, and major clinical syndrome in tags when applicable.
- At least one internal link to a relevant overview, molecule page, toxicology concept, or related case when such a page exists.

Future indexing should be able to group entries by:

- Failure type: identity, dose, timing, route, interaction, environment, medical response.
- Receptor or biological system.
- Clinical syndrome.
- Substance or class.
- Outcome and severity.
- Evidence type.

## 14. Initial implementation

The first implementation includes:

1. `FailureChainCaseFile`, a reusable MDX component.
2. Registration of the component in the global MDX component map.
3. A copyable authoring template under `docs/templates`.
4. One production article: `FC-001`, the injected-mushroom-tea ICU case.
5. Component tests for the summary fields and ordered failure chain.

## 15. Acceptance criteria

The implementation is complete when:

- A new MDX article can render a case file without local imports.
- Required ratings are constrained by TypeScript unions.
- The component uses semantic and accessible markup.
- The component renders all summary fields and ordered steps on mobile and desktop layouts.
- The article cites the 2021 primary case report and relevant earlier case literature.
- The article explicitly distinguishes blood-culture growth from literal mushrooms growing in veins.
- The article explains why the route and contamination—not simply psilocybin receptor pharmacology—drove the emergency.
- Unit tests verify the core rendering contract.
- Existing article and blog rendering remain unchanged.

## 16. Future extensions

After several entries establish stable terminology, consider:

- Structured frontmatter for failure type, substances, toxidromes, and outcome.
- A `/failure-chains` series landing page.
- Case filters and the Failure Atlas.
- Relationship cards linking cases that share a failure mechanism.
- Machine-readable JSON-LD for case reports and medical concepts.
- Editorial tooling that checks required sections and duplicate case IDs.
