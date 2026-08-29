# Source-Backed Promotions — 2026-08-22

First verification pass over the `hidden_until_grounded` backlog. Every citation
below was fetched from PubMed and read before any decision. Nothing was promoted
on the strength of a PMID merely *existing*.

## Why this pass exists

391 profiles are held by a `noindex-decision:`, 385 of them
`hidden_until_grounded`. Re-scored with the hold lifted, **238 already satisfy
every content signal** — identity, mechanism, effects, safety context, summary
depth. Evidence is the only missing ingredient.

An earlier reading of this backlog counted the `sources[]` array on the detail
payloads and concluded ~31 profiles were "already sourced and just held". **That
was wrong.** The governance gate in `apply-governance-overlay.mjs` does not read
`sources[]`; it requires a claim in `claims.json` carrying a PMID/DOI *and* the
slug registered in `SOURCE_BACKED_PROMOTION_SLUGS`. That registry is not a
shortcut — it is the record that a human checked the citation, which is why
`saw-palmetto` carries the note "Verified as a real citation before
registering."

Filtering correctly: **44 held profiles have an identifier-bearing claim and are
not yet registered.** This pass verified the ten with the cleanest identifiers.

## Verified and promoted — 8

| Profile | PMID | Paper | Claim | Verdict |
|---|---|---|---|---|
| andrographolide | 15095142 | *Andrographis paniculata* in upper respiratory tract infections — systematic review, 7 double-blind trials, n=896 | immunity, inflammation | Supports |
| arabinoxylan | 29456638 | Biobran/MGN-3 arabinoxylan rice bran enhances NK cell activity in geriatric subjects, RCT | immunity | Supports |
| banaba-leaf-extract | 34726501 | Effect of Banaba on metabolic syndrome, insulin sensitivity and secretion — randomised, double-blind, placebo-controlled | metabolic_syndrome | Supports |
| beta-glucans | 30198828 | Yeast (1,3)-(1,6)-beta-glucan on URTI severity — double-blind RCT, n=299 | immunity, heart_health | Supports immunity; blood-pressure secondary outcome partially supports the second |
| beta-sitosterol | 9313662 | Multicentric double-blind placebo-controlled trial of beta-sitosterol in BPH | prostate_health | Supports |
| bromelain | 17121765 | Bromelain as adjunctive treatment for moderate-to-severe knee osteoarthritis — randomised placebo-controlled | inflammation, pain | Supports — **null result** |
| citrulline-malate | 39408204 | Acute citrulline malate on exercise performance — randomised, double-blind, cross-over | blood_flow, performance | Supports — **largely null** |
| glucomannan | 24533610 | Glucomannan in overweight and obesity — systematic review and meta-analysis | weight/glucose | Supports — **null result** |

Three of the eight are null or largely null findings. They are registered anyway:
the bar is whether the citation is real and about this entity and this outcome,
not whether it flatters the supplement. A profile whose evidence says "no
significant effect" is still an honestly grounded profile.

## Rejected — 2 misattributed

Both cite real papers about something else entirely. **Not promoted**, and the
citations should be treated as defects rather than evidence.

| Profile | PMID | What the paper actually is | Claim it was attached to |
|---|---|---|---|
| alpha-lipoic-acid | 12874400 | *"Abeta1-42 promotes cholinergic sprouting in patients with AD and Lewy body variant of AD"* — Alzheimer's amyloid/cholinergic pathology, *Neurology* 2003, [doi:10.1212/01.wnl.0000073987.79060.4b](https://doi.org/10.1212/01.wnl.0000073987.79060.4b) | neuropathy |
| chondroitin | 17470980 | *"Esophageal temperature monitoring during radiofrequency catheter ablation: experimental study based on an agar phantom model"* — cardiac ablation instrumentation, *Physiol Meas* 2007, [doi:10.1088/0967-3334/28/5/001](https://doi.org/10.1088/0967-3334/28/5/001) | joints, pain |

Neither paper mentions the supplement it was filed under. This is the same
defect class as the curcumin citation withdrawn in
`citation-integrity-2026-08-21.md` (PMID 27403209, an art-therapy dementia
study). **A ~20% mis-attribution rate in this sample is the strongest argument
against bulk-promoting the backlog**: had these ten been registered on the
strength of having a PMID, two profiles would have been published citing
research about amyloid plaques and oesophageal probes.

Neither profile should be promoted until a correct citation is attached. The
existing wrong ones need withdrawing.

Article metadata retrieved from PubMed.

## What this implies for the remaining backlog

- **34 candidates** with identifier-bearing claims remain unverified. At the
  observed rate, expect roughly 7 of them to be misattributed.
- Several carry identifiers that are not citations at all and need sourcing
  before they can be verified: `allicin` (`"Garlic trials."`),
  `digestive-enzymes` (`source_pending_review`), and `capsicum-frutescens`,
  whose "citation" is a `consensus.app` URL carrying `utm_source=chatgpt` — an
  AI-tool link, not a reference.
- **272 held profiles have no claim at all.** Those need original sourcing
  rather than verification, and are the long-run body of work.

The unit of progress here is one verified citation, not one promoted page.


---

# Second pass — 2026-08-23

Verified the remaining 26 candidates carrying a well-formed PMID. Same rule:
fetch the paper, read it, decide.

## Registered — 17 more

`23-epi-26-deoxyactein` (PMID 20032972, phase I PK of the compound itself in
women given standardized black cohosh), `boron` (21129941, raises free
testosterone), `capsaicin` (24941673, review of five RCTs for osteoarthritis
pain), `chromium` and `chromium-picolinate` (15208835, review of chromium in
insulin resistance, which addresses the picolinate form directly),
`dihydrokavain` (12494336, GABAergic modulation in rat brainstem),
`fadogia-agrestis` (16281088, testosterone in male rats), `folate` (15671130,
folate and B12 in depression), `hyaluronic-acid` (32650511, oral sodium
hyaluronate RCT in knee osteoarthritis), `kava` (12131602, placebo-controlled
trial in generalized anxiety disorder), `nattokinase` (18971533, RCT on blood
pressure), `passionflower-extract` (31714321, polysomnography RCT in insomnia),
`plant-sterols` (24780090, meta-analysis of 124 studies on LDL),
`saccharomyces-boulardii` (20458757, meta-analysis across 27 trials), `shilajit`
(26395129, RCT on testosterone), `zeaxanthin` (23644932, AREDS2), `zinc`
(15496046, review of zinc for the common cold).

Where a citation covers only part of a multi-part claim, the registration
comment says so — `boron` does not evidence the bone-health half,
`hyaluronic-acid` covers joints and not skin, `shilajit` covers testosterone and
not energy.

## Rejected — 4 more misattributed

| Profile | PMID | What the paper actually is | Filed under |
|---|---|---|---|
| hawthorn-extract | 17470176 | *"Hematospermia associated with congenital arteriovenous malformation of internal iliac vessels"* — a urology case report, [doi:10.1111/j.1442-2042.2007.01576.x](https://doi.org/10.1111/j.1442-2042.2007.01576.x) | mild heart failure support |
| hesperidin | 32353900 | *"Short-range regulatory chromatin loops in plants"* — plant genomics review, [doi:10.1111/nph.16632](https://doi.org/10.1111/nph.16632) | vascular / anti-inflammatory |
| potassium | 25059961 | *"One Health: time to move on from just talking"* — a Veterinary Record news item, [doi:10.1136/vr.g4746](https://doi.org/10.1136/vr.g4746) | heart_health, blood_pressure |
| red-yeast-rice | 27282571 | *"Molecular characterization of six new cases of red blood cell hexokinase deficiency"* — haematology genetics, [doi:10.1016/j.bcmd.2016.04.002](https://doi.org/10.1016/j.bcmd.2016.04.002) | heart_health |

`red-yeast-rice` → *red blood cell* is almost certainly a string-matching
artefact, which suggests these were attached by text similarity rather than by
reading.

## Rejected — 1 dead identifier

`policosanol` cites PMID 17127598, which NCBI does not recognise. This matches
the single unresolvable PMID already recorded by `apply-pubmed-metadata.ts`.

## Held for review — 1 ambiguous

`gaba` cites PMID 41554764, a real and recent randomized trial — but of a
*probiotic* (Lactiplantibacillus plantarum Lp815) that raises endogenous GABA.
It does not test GABA supplementation, so citing it on a GABA supplement profile
for "sleep, anxiety" would overstate what was measured. Not registered.

## Running totals

| | First pass | Second pass | Total |
|---|---:|---:|---:|
| Verified and registered | 8 | 17 | **25** |
| Misattributed | 2 | 4 | **6** |
| Dead identifier | 0 | 1 | 1 |
| Ambiguous, held | 0 | 1 | 1 |
| **Checked** | 10 | 23 | **33** |

**Six misattributed citations in 33 checked — 18%.** The rate held almost
exactly across both passes, which is the clearest possible argument for reading
every citation before trusting it.

Article metadata retrieved from PubMed.
