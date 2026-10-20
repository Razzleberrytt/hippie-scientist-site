# EvidenceMotion: laptop-free Blender Cycles CPU research proof

Status: **RESEARCH ONLY** / 2026-10-13. No production runtime integration, no new R-version, no owner or independent science/craft approval, no release. This is a bounded investigation under [#6743](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6743), not a fourth normal workstream.

## What actually exists in this PR

- `blender_cpu_research.py` exports the **existing pinned, RDKit-verified 7-OH molecular graph** and a fixed-seed **computed** 3D conformer as one packet. It carries the original PubChem CID/InChIKey and preserves atom indices, element types, explicit bond kinds and the real hydroxyl O index. The renderer does not generate any molecule or pharmacology.
- The same script can validate the schema and exact SHA without Blender; headless Blender then draws ONLY source-specified atoms/bonds, renders one 270×480 **Cycles CPU** still for each of `whole` and `hydroxyl-detail`, and records input/output hashes and render wall-time. These are **two shot treatments, not two independently approved story concepts**.
- `test_blender_cpu_research.py` checks fail-closed guards using synthetic fixtures; these are contract tests, **not source-independent chemical verification**.
- `.github/workflows/evidencemotion-blender-cpu-research.yml` runs on paths changed by this PR (or manual dispatch), performs tests, provisions free software on a **remote GitHub-hosted CPU**, exports authentic RDKit geometry, renders both stills, and retains short-lived artifacts for review. No owner laptop, GPU, credentials, scheduled recurrence or paid inference service is required. Hosted runner billing/quotas are **UNKNOWN** and should be checked separately. Timeout: 12 minutes.

## Actual validation to perform

1. Confirm exact PR-head workflow/job PASS. If the runner cannot install Blender or fails to export geometry, mark it FAIL, diagnose from job logs, do not infer a render.
2. Confirm workflow artifacts contain BOTH actual PNGs plus receipts, exact matching packet SHA and two distinct verified output SHA values.
3. Compare the *actual PNG pixels* with corresponding source-locked VTK views, not with an invented reference. Preserve scientific bond/atom identity and explicitly label the conformer as computed. Don't promote an illustrative pose to measured structure or claim drug effect.
4. Record Blender version, startup/wall seconds, per-frame time, observed memory if measured, billable minutes/price if actually known, and whether a blinded reviewer prefers Blender at similar view and resolution. Unmeasured cost is **UNKNOWN**, not free.
5. If image quality is meaningfully better for a tolerable observed cost, next work is a short, narration-timed low-resolution 3D moving shot and composition QA. No full MP4 or production feature switch until separate authorization and the existing 1+5 milestone.

## How to run remotely

The scoped GitHub Actions workflow automatically runs on the matching PR change; the optional workflow_dispatch control appears in GitHub Actions after the workflow is available on the default branch.

For local *development only* (not required for the owner):

```sh
python -m unittest discover -s research/evidencemotion-director -p test_blender_cpu_research.py -v
python research/evidencemotion-director/blender_cpu_research.py --export /tmp/verified-7oh.json
SHA="$(sha256sum /tmp/verified-7oh.json | cut -d' ' -f1)"
blender -b --factory-startup --python-exit-code 22 --python research/evidencemotion-director/blender_cpu_research.py -- --render /tmp/verified-7oh.json --expected-sha "$SHA" --direction whole --out /tmp/ths-blender-proof
```

## Safeguards and unchanged checklist

- Preserve original Kokoro WAV and story-first voice/source/claim gates, and the production/version freeze.
- No Blender renders count as source/editorial, cinema, voice, phone-playback or publishing approval. Visible atom colors/materials/lighting are aesthetic representations, not laboratory measurements. The aromatic-bond geometry is a stylized visual representation, not electron-density data.
- Existing authoritative [completion checklist](COMPLETION-CHECKLIST.md) remains **23/46**. First excellent owner-approved master **0/1**; five consecutive excellent first renders **0/5**. Do not tick these because code or two stills exist.
- The real next creative blockers are better art direction, source-grounded narration, two visually *different complete* concepts, and direct MP4/phone review against an owner-curated reference shelf.
