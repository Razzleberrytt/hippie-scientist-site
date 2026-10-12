
# EvidenceMotion R8.17 — Canonical First-Pass Quality

Status: REVIEW ONLY. Stacked implementation candidate on R8.14 PR #6698. Not merged, not deployed, not yet proven by end-to-end production video.

## Owner requirement

Build the best first render possible. Prefer imaginative, recognizable, cinematic 2D/3D scientific storytelling over static slides and mechanical templates. Technical numbers, visual motion, caption alignment and scientific provenance are mandatory. A reviewer's aesthetic preferences are advisory; the owner's artistic direction leads unless science/playback requires a correction.

## Failures this version must prevent

1. A purple rectangle with a question mark is not a retail bottle. Placeholder subjects, generic floating spheres, unexplained blobs and generic slideshow beats fail quality preflight.
2. A floating ligand that never docks is not a binding animation. Binding plans require a visible pocket and visible ligand motion. The explanatory model must say SYMBOLIC, not imply measured chemical docking.
3. Key numbers require exactly one upstream reviewed claim ID, source ID, evidence tier and DENOMINATOR. Do not copy numbers between cards. Count-up values must be marked COUNTING until they visibly settle on the canonical number for at least a second.
4. The real saved Kokoro ONNX 0.6.1 am_michael narrator is required; pinned model/voicebank checksums and no substitute Flite/robot narrator.
5. The voice owns scene timing: on-screen captions reproduce that scene's narration exactly, never the wrong beat. Regulatory death warnings must be attributed to regulators, not a study whose cohort reported no fatalities.
6. Decorative Science/Signal/Context, 001/Evidence footers, cluttered visuals, too-long static stats and captions overlapping important material are unacceptable.
7. Final delivery requires native 1080x1920 art, 30fps H.264, audible 44.1 kHz stereo AAC, final-media loudness review and decoded exact-frame visual checks.
8. Technical acceptance does not certify aesthetic excellence, published status, exact-acoustic caption alignment or owner iPhone playback.

## Implementation in this branch

- scripts/distribution/r817-canonical-first-pass.mjs: deterministic pure functions for source-bound preflight, rendered scene binding and exact-master review assessment.
- scripts/distribution/r817-first-pass-cli.mjs: preflight and review-hold CLI, no external cost or publishing.
- scripts/distribution/render-vertical-video-package.mjs: optional R8.17 quality lane runs BEFORE any scene files are written; binds reviewed plan, voice, content identity and exact scene text, then creates immutable SHA-bound sidecar.
- scripts/distribution/render-vertical-video-mp4.mjs: verifies the sidecar AGAIN before encoded production and attaches an encoded-review-only receipt.
- scripts/distribution/__tests__/r817-canonical-first-pass.test.mjs: negative regressions for bad percentages, placeholder values, denominator drift, wrong narrator, fake binding, unqualified symbolic 3D and captions copied from another scene.

A new video explicitly uses creativeSpec.canonicalFirstPassRelease = R8.17 and provides creativeSpec.r817FirstPass, while retaining the pre-existing R8.10/R8.11 scientific and voice lineage. This quality lane does not replace the governed media pack, scientific evidence ledger or existing narrator.

Usage:
    node scripts/distribution/r817-first-pass-cli.mjs preflight first-pass.json source-manifest.json
    node scripts/distribution/r817-first-pass-cli.mjs encoded exact-master-review.json

The first command validates an authored plan before expensive work. The second checks technical delivery and reports human/word-alignment/owner approval blockers separately. Neither command authorizes publishing.

## Canonical future sequence

Freeze approved scientific claims and denominators → synthesize and approve original Kokoro narration → voice-timed scene design and three distinct hook drafts → choose symbolic real 3D when helpful and multi-plane cinematic 2.5D elsewhere → generate accurate 2D captions/source overlays → perform source/stat/scene preflight before full render → produce 1080p MP4 with 44.1 kHz stereo AAC → decode final media, inspect first/middle/settled-stat/final frames at native phone size → human owner review and independent exact-master science review → separately authorized publication and genuine performance observation.

Target: one creative pass plus at most one measured correction pass for ordinary topics. This is a target, not demonstrated time savings; measure actual labor time, defect recurrence, acceptance rate, 3D render seconds and provider-credit use.

## Honest blocker: reusable real 3D render adapter

The current site renderer still creates native SVG-based cinematic 2.5D assets. The new R8.17 producer FAILS if a requested shot requires rendered-3d, because a reusable VTK/Blender compositor is not yet integrated with the source-bound repository video producer. It must not silently downgrade 3D direction to floating circles. The prior local R8.16 tianeptine VTK scripts are topic-specific reference implementations; an independent reusable compositor, material/lighting/camera presets, frame synchronization, cached 3D asset identity and rendered-frame checks are the next needed release slice.

Normal CI, CURRENT_SPRINT workstream admission, protected merge controller, actual source validation, final audible video review and owner approval remain mandatory. PR #6698 needs to be resolved before this stacked release can reach main. Do not claim the draft passed final CI or was deployed, and never call solo assistant review V_VERIFIED.
