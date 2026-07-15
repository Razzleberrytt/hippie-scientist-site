# Safety coverage completion — batch 1

Date: 2026-07-15

Status: research and workbook patch proposal complete; human safety review required before workbook application.

## Scope and prioritization

This batch reviewed 25 `full_public_runtime` compound profiles selected from the strict contraindication audit, prioritizing profiles with the highest internal-link frequency and reusable evidence groups.

Reviewed compounds:

- Probiotics: `probiotics`, `probiotic-multistrain`, `probiotic-strain-bifidobacterium`, `probiotic-strain-lactobacillus`, `probiotics-bifidobacterium`, `probiotics-lactobacillus`
- Aged garlic: `aged-garlic-extract`, `garlic-aged-extract`
- Ginkgo constituents: `ginkgolide-b`, `ginkgolides`
- Ginger constituents: `gingerol`, `gingerols`
- Betaine/TMG: `betaine`, `betaine-anhydrous`, `trimethylglycine`
- Other: `artichoke-extract`, `beetroot-nitrate`, `taurine-sleep`, `taurine-blend`, `holy-basil-extract`, `pomegranate-extract`, `glycine-sleep`, `inositol-sleep`, `eaa-blend`, `electrolyte-blend`

## Baseline audit

The permissive fill-rate audit reported 588/588 compounds with narrative safety context but only 355/588 with a non-empty contraindication/flag value.

The strict audit found:

- 588 compound rows total
- 141 rows with real contraindication prose
- 214 rows with token-only values
- 233 rows with empty contraindication fields
- 50 `full_public_runtime` rows with an empty or token-only contraindication field

The strict audit initially produced no report on Windows because its executable-module check constructed an invalid file URL. The audit entry point was corrected with `pathToFileURL(process.argv[1]).href`.

## Proposed changes

Patch: `data-sources/workbook-patches/safety-coverage-batch-1-2026-07-15.json`

- 25 compounds reviewed
- 20 compounds with proposed workbook corrections
- 39 proposed cell edits
- 9 token-only contraindication values replaced with source-backed prose
- 11 unsupported severity tokens intentionally cleared rather than converted into invented contraindications
- 19 safety narratives revised for precision, formulation limits, population specificity, or uncertainty
- 5 compounds left unchanged because reliable, formulation-specific evidence was unavailable

The nine proposed contraindication completions cover six probiotic profiles, two aged-garlic profiles, and artichoke extract.

The eleven intentionally blank contraindication fields are `betaine`, `betaine-anhydrous`, `trimethylglycine`, `beetroot-nitrate`, `taurine-sleep`, `holy-basil-extract`, `pomegranate-extract`, `ginkgolide-b`, `ginkgolides`, `gingerol`, and `gingerols`. Their previous `moderate` values were severity labels, not medical contraindications.

## Evidence-limited gaps

The following reviewed profiles remain intentionally incomplete:

- `glycine-sleep`: human adverse-effect and dose-response safety evidence is not sufficient to establish condition, pregnancy, lactation, surgery, liver, kidney, or medication contraindications.
- `inositol-sleep`: available tolerability literature supports mild dose-related gastrointestinal effects, but the workbook patch contract requires a DOI-backed source and no sufficiently direct source was identified for a categorical contraindication.
- `eaa-blend`: the blend composition and dose are not defined precisely enough to assign amino-acid-specific contraindications.
- `electrolyte-blend`: sodium, potassium, magnesium, and other electrolyte amounts are not defined precisely enough to assign renal, cardiovascular, or medication contraindications.
- `taurine-blend`: isolated-taurine evidence cannot be generalized to an unspecified multi-ingredient blend.
- `ginkgolide-b` and `ginkgolides`: evidence for standardized whole Ginkgo leaf extract cannot establish isolated-ginkgolide contraindications.
- `gingerol` and `gingerols`: whole-ginger pregnancy and lactation evidence cannot establish isolated-constituent contraindications.
- `betaine`, `betaine-anhydrous`, and `trimethylglycine`: regulatory review identifies safety uncertainty but does not establish a generic disease-specific contraindication.
- `beetroot-nitrate`, `taurine-sleep`, and `pomegranate-extract`: blood-pressure effects do not by themselves prove clinically significant medication interactions or categorical contraindications.
- `holy-basil-extract`: short human trials do not adequately characterize pregnancy, lactation, surgery, or medication-interaction safety.

## Evidence sources

- Didari et al. (2014), *A systematic review of the safety of probiotics*, DOI: https://doi.org/10.1517/14740338.2014.872627
- Macan et al. (2006), *Aged garlic extract may be safe for patients on warfarin therapy*, DOI: https://doi.org/10.1093/jn/136.3.793S
- Silva and Daia (2025), *Exploring the Cardiovascular Potential of Artichoke—A Comprehensive Review*, DOI: https://doi.org/10.3390/biology14040397
- EFSA NDA Panel (2017), *Safety of betaine as a novel food pursuant to Regulation (EC) No 258/97*, DOI: https://doi.org/10.2903/j.efsa.2017.5057
- Zamani et al. (2021), *The benefits and risks of beetroot juice consumption: a systematic review*, DOI: https://doi.org/10.1080/10408398.2020.1746629
- Waldron et al. (2018), *The Effects of Oral Taurine on Resting Blood Pressure in Humans: a Meta-Analysis*, DOI: https://doi.org/10.1007/s11906-018-0881-z
- Jamshidi and Cohen (2017), *The Clinical Efficacy and Safety of Tulsi in Humans*, DOI: https://doi.org/10.1155/2017/9217567
- Giménez-Bastida et al. (2021), *Evidence for health properties of pomegranate juices and extracts beyond nutrition*, DOI: https://doi.org/10.1016/j.tifs.2021.06.014
- Kellermann and Kloft (2011), *Is there a risk of bleeding associated with standardized Ginkgo biloba extract therapy?*, DOI: https://doi.org/10.1592/phco.31.5.490
- Tiani et al. (2024), *The Use of Ginger Bioactive Compounds in Pregnancy*, DOI: https://doi.org/10.1016/j.advnut.2024.100308

## Proposed audit movement after approval

If the validated proposal is approved and applied without other workbook changes:

- Real-prose contraindication rows: 141 → 150
- Token-only contraindication rows: 214 → 194
- Empty contraindication rows: 233 → 244
- `full_public_runtime` empty/token gaps: 50 → 41
- Of the 41 remaining full-public audit gaps, 11 in this batch are intentionally empty evidence-limited records; the remaining 30 have not yet been reviewed in this pass.

The increase in empty fields is intentional: unsupported `moderate` tokens are removed instead of being misrepresented as medical contraindications.

## Validation

- `node scripts/data/apply-workbook-patch.mjs --patch data-sources/workbook-patches/safety-coverage-batch-1-2026-07-15.json` — PASS (39 changes match current workbook; dry run only)
- `npm run audit:safety` — PASS; baseline recorded
- `node scripts/audit-severity-token-contraindications.mjs` — PASS after Windows entry-point fix; baseline recorded
- `npm run typecheck` — PASS
- `npm run lint` — PASS
- `npx vitest run scripts/audit-severity-token-contraindications.test.mjs` — PASS (5 tests)
- `node scripts/ci/validate-workbook-patches.mjs` — PASS
- `npm run build` — PASS (production static export; 20 deployment-critical steps)

Workbook regeneration and the post-change safety audit are deferred until a human reviewer changes the proposal to `approved` and explicitly acknowledges the safety-field review. The repository patch runner prohibits applying a safety proposal before that review.

## PR-ready summary

This batch replaces machine-only severity labels with source-backed contraindication prose where evidence supports it, removes unsupported warnings where evidence does not support them, and tightens narrative safety language around formulation and population limits. It does not change schema, routes, templates, or build configuration.

Recommended next actions:

1. Clinically review the 39 proposed safety edits and change the patch status to `approved` if accepted.
2. Apply the patch with the repository's explicit human-review acknowledgement.
3. Run `npm run workbook:roundtrip-test`, `npm run data:build`, `npm run typecheck`, `npm run lint`, `npm run build`, and both safety audits.
4. Begin batch 2 with the remaining 30 unreviewed `full_public_runtime` gaps, prioritizing profiles with the strongest traffic and internal-link signals.
