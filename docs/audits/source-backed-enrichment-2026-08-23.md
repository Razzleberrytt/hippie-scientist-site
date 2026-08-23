# Source-backed enrichment and citation repair — 2026-08-23

Owner-directed continuation of the `hidden_until_grounded` evidence-enrichment pass.
This pass deliberately treats **source validity**, **claim-role accuracy**, and
**publication eligibility** as separate questions. A PMID/DOI merely existing is
not sufficient evidence, and registering a source-backed slug does not force a
profile live or change its evidence outcome.

## Scope and guardrails

- Continued from `source-backed-promotions-2026-08-22.md`.
- Read the stored citation metadata and, for the verified wave, checked the actual
  biomedical record rather than trusting identifier presence.
- Positive, negative, and null findings are equally eligible when the citation is
  genuinely about the entity and claim context.
- Preclinical evidence remains preclinical.
- Combination interventions remain combination-specific.
- No generated JSON defect is treated as durably fixed when its canonical row is
  workbook-owned.
- No profile is force-indexed by this work.

## Newly verified and registered — 13

These slugs were added to `SOURCE_BACKED_PROMOTION_SLUGS` after source-level
review. Registration means the existing claim citation may count toward the
**governance source gate**. It does not certify the whole profile, raise its
clinical evidence grade, or bypass the live publication score.

| Profile | Identifier | What was verified | Scope / caveat preserved |
|---|---:|---|---|
| `capsaicin` | PMID 24941673 | Clinical review of topical capsaicin for osteoarthritis pain | Topical/OA context; not a universal oral-capsaicin benefit claim |
| `boron` | PMID 21129941 | Human boron supplementation study | Very small study (8 healthy men); biomarker/endocrine-inflammatory context only |
| `kava` | PMID 12131602 | Placebo-controlled study in generalized anxiety disorder | Primary kava-placebo difference was not statistically significant; null/mixed result retained |
| `shilajit` | PMID 26395129 | Purified shilajit study measuring testosterone in healthy volunteers | Preparation, population, and outcome remain narrow |
| `nattokinase` | PMID 18971533 | Randomized controlled blood-pressure trial | Does not generalize to all cardiovascular outcomes |
| `zeaxanthin` | PMID 23644932 | AREDS2 phase-3 randomized clinical trial | Lutein + zeaxanthin / omega-3 factorial context; primary analyses were null |
| `plant-sterols` | PMID 24780090 | Meta-analysis of randomized studies across sterol/stanol doses | LDL-cholesterol outcome; dose-range context retained |
| `saccharomyces-boulardii` | PMID 20458757 | Systematic review/meta-analysis in adults | Indication-specific probiotic evidence, not a generic wellness claim |
| `hyaluronic-acid` | PMID 32650511 | Double-blind randomized placebo-controlled oral sodium-hyaluronate knee-OA trial | Oral formulation and knee-OA context retained |
| `passionflower-extract` | PMID 31714321 | Double-blind randomized placebo-controlled polysomnography study in insomnia disorder | Passiflora preparation and insomnia population retained |
| `23-epi-26-deoxyactein` | PMID 20032972 | Human pharmacokinetics after standardized black-cohosh extract | PK / acute-safety context only; not an efficacy trial |
| `dihydrokavain` | PMID 12494336 | GABAergic activity in a rat gastric-brainstem preparation | **Preclinical only**; must never be represented as a human outcome |
| `lions-mane` | PMID 18844328 | Double-blind placebo-controlled Hericium erinaceus trial in mild cognitive impairment | n=30, 16-week product-specific intervention; not proof of disease prevention |

### Important null-result examples

The registry records whether a citation is real and on-topic, not whether the
finding is favorable. AREDS2 did not show a statistically significant primary
reduction in progression to advanced AMD from adding lutein + zeaxanthin, and
the kava trial's primary kava-placebo comparison was not statistically
significant. Those limitations are reasons to keep the sources, not to discard
them.

## Rejected as misattributed — 4 in this wave

These are real publications attached to the wrong entity or intervention. They
were **not** registered.

| Profile | Stored identifier | What the cited paper actually concerns | Verdict |
|---|---:|---|---|
| `red-yeast-rice` | PMID 27282571 | Red-blood-cell hexokinase deficiency | Reject; replace/withdraw workbook citation |
| `gaba` | PMID 41554764 | A *Lactiplantibacillus plantarum* probiotic sleep RCT that measured urinary GABA | Reject as grounding for oral GABA supplementation |
| `potassium` | PMID 25059961 | `One Health: time to move on from just talking` in *Veterinary Record* | Reject; unrelated to potassium supplementation |
| `hesperidin` | PMID 32353900 | `Short-range regulatory chromatin loops in plants` | Reject; unrelated to hesperidin vascular claims |

Together with the 2026-08-22 rejects (`alpha-lipoic-acid`, PMID 12874400;
`chondroitin`, PMID 17470980), this confirms that identifier presence is not a
safe bulk-promotion criterion.

## Valid source present, but claim metadata needs repair — 9

These were intentionally **not** registered in this wave because the current
claim/source wiring or study classification is not trustworthy enough yet.

| Profile | Current issue | Required repair before registration |
|---|---|---|
| `chromium` | One attached source is an unrelated tomato/lycopene paper while a separate chromium review is on-topic | Re-link the claim to the correct source and re-review the claim wording |
| `hawthorn-extract` | Contains an on-topic heart-failure RCT plus an unrelated hematospermia/AV-malformation paper | Withdraw wrong source and verify every remaining claim-source edge |
| `fadogia-agrestis` | Rat testosterone paper is real/on-entity but claim metadata labels it `human_obs` | Correct study class to animal/preclinical before any source-backed registration |
| `folate` | Stored source is a review but the claim is modeled as a direct human RCT | Link the direct trial if intended or downgrade the source/study role to review |
| `zinc` | Stored source is an overview/review while claim is modeled as a direct RCT | Correct study role and dose/outcome attribution |
| `chromium-picolinate` | On-topic narrative review exists, but the profile's recorded design/claim semantics do not align cleanly | Normalize claim-source role before registry entry |
| `policosanol` | PMID 17127598 could not be resolved confidently from the available biomedical lookup | Treat identifier as unresolved until exact record is confirmed |
| `ginsenoside-rg1` | Source is still marked for manual normalization and evidence role is not trustworthy | Normalize primary source and correct human/preclinical classification |
| `capsicum-frutescens` | Two PubMed sources are usable, but the governed claim layer also contains a `consensus.app` URL with `utm_source=chatgpt` | Replace AI-tool link with canonical DOI/PubMed/publisher source and re-check all three claims |

## AI-tool-link provenance issue

The claims census shows that `public/data/claims.json` contains multiple
`consensus.app` URLs carrying `utm_source=chatgpt`. These are discovery links,
not canonical scholarly identifiers. At least one visible example is
cross-wired: a Hericium/Lion's Mane acute-cognition claim points to a Consensus
URL whose paper slug is `acute-effects-of-naturally-occurring-guayusa-tea...`.

Policy for enrichment going forward:

1. A Consensus/AI-tool URL may be used to *find* a paper, never as the final
   scholarly citation when PubMed, DOI, journal, or other primary metadata is
   available.
2. The underlying publication must be opened and checked against entity,
   intervention, population, outcome, and design before claim registration.
3. If the link resolves to another intervention/topic, classify it as
   misattributed and withdraw it rather than repairing the title around it.
4. Do not let a clean bibliography source silently validate a different,
   miswired claim edge.

## Backlog after this pass

The previous audit measured **34 unverified identifier-bearing held profiles**
after its first 10-record sample. This pass source-reviewed the 26 candidates
that were directly traceable from the current held-profile/detail evidence
surface: 13 registered, 4 rejected, and 9 held for structural repair.

The remaining long-run backlog is larger than the identifier-verification queue:
**272 held profiles have no governed claim at all** and require original
literature sourcing, not identifier checking. Those should be enriched in
research waves ordered by demand, content completeness, safety, and evidence
availability rather than by filling cells for completeness alone.

## Durable changes from this pass

- Added 13 source-verified slugs to the governance source registry.
- Recorded the owner-directed enrichment ticket as `SEO-006` in the current
  sprint.
- Preserved noindex/publication scoring boundaries; this pass does not
  auto-publish held profiles.
- Produced this repair manifest so workbook-owned citation defects are not lost
  or "fixed" only in disposable generated JSON.

## Next enrichment wave

1. Withdraw/replace the four newly confirmed misattributed workbook citations.
2. Repair the nine study-role/source-edge defects above.
3. Normalize AI-tool discovery URLs to canonical scholarly identifiers.
4. Re-run the held-profile census after regeneration; verify any residual
   identifier-bearing candidates source-by-source.
5. Begin original sourcing for the 272 no-claim profiles in prioritized waves,
   preserving null/negative and safety evidence alongside positive findings.
