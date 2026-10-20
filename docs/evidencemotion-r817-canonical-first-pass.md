
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


## V 90+ quality upgrade (October 12) — R8.17 review gates

V scored the prior tianeptine video 81/100 with science at 95. Those are external reviewer scores for the earlier video, not a proven score for the upgraded renderer or measured retention.

**P1 — progressive acoustic word captions:** r810-aligned-captions.mjs now builds real ASS karaoke-word events from independently reviewed MFA word timestamps. render-vertical-video-mp4.mjs uses the new track for the R8.17 lane and blocks any phrase-only fallback. The exact encoded MP4 still requires a 4fps word-highlight pixel check and human perceptual verification.

**P1 — show the twist:** r817-retention-gates.mjs requires the first three seconds to visibly transform a named before-state into a named after-state. A labeled bottle is insufficient. First-time muted-viewer comprehension remains a real external review, not a self-certification.

**P1 — decoded-final motion:** r817-motion-qa.mjs samples the finished H264 MP4 at 5fps, cropping the central science region rather than using moving subtitles to inflate movement. A video with >=40% static central frames or any six-second static streak within a beat fails, even if its storyboard passed. Motion density is a mechanical proxy, not an aesthetic score.

**P1 — open-loop CTA:** each R8.17 closing scene must include both a primary action/safety CTA and a smaller follow-earning evidence-driven teaser. FDA and 911 emergency actions retain priority. Factual state-law or safety teasers require a separate source ID and hash, not invented promotion.

**P2 — preregistered controlled experiments:** r817-experiments.mjs establishes human presence versus animation-only on the same approved source, narration script and original Kokoro house voice. One proposed rule is at least five matched topics and 250 real views per arm per topic, with a 15% relative lift in three-second retention to trigger human review of an observed candidate. Platform samples are confounded; no causal claims, invented results or auto-adoption. The alternative house-voice-delivery experiment requires owner approval and each variant must retain its verified Kokoro speaker and WAV hash.

**81-point regression floor:** regulator severe-outcome attribution, denominators in visible graphics, symbolic 3D labeling, source footers on each factual beat, and pinned original Kokoro narrator. These are hard boundaries even when retention pressure encourages shortcuts.

### Verification and known blockers

- Targeted new tests: npx vitest run scripts/distribution/__tests__/r817-*.test.mjs. This is a command, not a claim that CI passed.
- R8.17 producer currently rejects actual 3D shots until a reusable VTK/Blender compositor is connected and tested; it never silently substitutes a flat vector drawing.
- Final MP4 requires SHA-bound receipt, decoded AAC stereo with measurable loudness, authentic original voice, word-caption pixel QA at 4fps, settled exact data values, readable PMID/source caveats, source-licensed B-roll, before/after hook frames, muted-viewer comprehension and independent science review.
- First new R8.17 master must be rendered through the upgraded pipeline, paired with a final contact sheet, and independently rescored by V. No prediction of 89 or 90+ is a measured result.
- Merge/deploy status remains governed: R8.17 is on a stacked R8.14 branch under normal project admission and controller rules.



## V's D13 fix: R8.18 geometry telemetry (compatible with the R8.17 gate)

**Implementation stage: the physical VTK 3D + Pillow 2D producer, exact native-30fps PNG sequence, geometry telemetry, SHA-bound package/MP4 bridge, source-bound local narration adapter, and GitHub headless smoke runner are connected and demonstrated.** A short silent physical-render smoke passed locally and on GitHub; the first *full narrated R8.17* accepted master remains unproven. Do not mark the complete canonical engine production ready or auto-publish.

The proposed renderer-owned telemetry avoids untrustworthy paid VLM-as-judge decisions for assets that THS itself renders. The renderer, not an LLM or the storyboard, must supply a 5fps sampled record of projected object geometry/state including objectId, kind, bbox, zIndex, label, numeric values and visible/opacity state. The native recorder samples every sixth 30fps frame. Its receipt includes a SHA-256 binding to renderer code, produced scene assets and source manifest. The package records the immutable sidecar hash; the MP4 encoder revalidates it, binds it to the encoded master, and publication review holds when the exact telemetry is absent.

R8.18 action contracts: ligand must approach a physically visible pocket monotonically within a 3% frame-width tolerance, finish within 15% of width and remain inside for at least two consecutive 5fps samples. Additionally, the compositor must report **at least 10 consecutive native 30fps frames** with the ligand centroid inside the projected pocket. Sparse 5fps telemetry alone cannot prove the exact dwell. Counters must match the source-bound numeric value at rest for five 5fps samples (one-second observation window). Transformations must show named before/after objects, reveals must change opacity/visibility, and activation must change an explicit renderer state. Unknown verbs fail.

**Known measurement limitations:** This validates instrumentation-reported geometry, not final rendered pixels or scientific molecular realism. A buggy/compromised renderer could report plausible coordinates and draw something else. Native-frame dwell is tracked separately at the full 30fps geometry level by the native recorder; this still verifies renderer instrumentation, not decoded pixels. The human backstop remains three actual decoded frames per beat (start/mid/end), muted-hook test, word-highlight pixel review, captions/source cards, and V independent assessment. No AI image judge, unverified V_VERIFIED flag, or automatic publishing.

**Recorder adapter:** `scripts/distribution/r818-native-telemetry-recorder.mjs` exports `R818NativeGeometryRecorder`. Real renderers call `recordActualFrame` with true screen-projected nodes/mesh bounds, then `finalize` to write `r818-telemetry.json`. The package builder exposes `rendererGeometryRecorder` as an optional native callback. When a R8.17 plan requests quality enforcement, its missing telemetry is a hard error, never silently invented or waived. Physical VTK projected meshes and Pillow 2D geometry are instrumented for four initially supported actions. Arbitrary legacy SVG and Blender shots are not yet automatically instrumented; uninstrumented actions fail closed.

**Review/test receipts:** unit negative cases cover ligand never docking, incorrect count-up final values, mismatched visual kinds, missing source/asset hashes, unknown actions, and missing beat instrumentation; V's D1–D12 tests cover caption pixels, minimum karaoke duration, alignment review, spatial hook change, independent mute reviewer, particle/flicker motion, prominent primary CTA, factual teaser sources, time-matched A/B and repeated looks. Passing fixtures are not substitutes for rendering a new 1080p MP4 from the real producer.


## Reddit-informed delivery upgrades and measured smoke milestone (October 12)

Practitioner advice from r/blender, r/ffmpeg and r/AfterEffects supports deterministic headless rendering, individual frame-sequence checkpointing, using ASS/libass for genuinely word-aligned captions, and avoiding fragile re-encoding/25fps-image-default errors. Those discussions are design input, **not independent certification**. The rules below are verified by local and GitHub code/tests.

- `r818-frame-cache.mjs`: content-addressed frame recipes and atomic per-frame receipts; resume verifies existing PNG hashes, rerenders corrupt frames, never reuses wrong source/voice/renderer. This utility is available to renderer adapters, but the first VTK producer has not yet been optimized to use it automatically.
- `r818-physical-cinema.py`: actual headless VTK offscreen symbolic seven-helix 3D + Pillow native 2D evidence frames. Supports ligand-enters-pocket, count-up-then-settle, bottle-rotates-to-reveal-label and reveal-emergency-guidance. Other verbs fail. 3D coordinates are projected from the actual fixed VTK camera; native 30fps pocket frames counted separately. Not validated atomistic geometry or receptor structural docking.
- `r818-physical-cinema-provider.mjs` and `build-bounded-pilot.mjs`: normal voice-first R8.10 production route injects native frame+telemetry provider whenever approved creative spec selects R8.17. It fails if VTK, archived Kokoro/MFA, exact source/asset hashes or geometry data are unavailable; it never substitutes static SVG, cheap AI narration, or paid assets.
- `r818-native-frame-sequence.mjs`: verify each source PNG is actual 1080x1920 and matches its SHA; the MP4 encoder reads consecutive images with FFmpeg `-framerate 30`, **not** fragile concat 25fps defaults. It verifies decoded H.264 30/1 output and exact frame count.
- `r818-render-contact-sheet.mjs`: automatically decode three actual frames per beat from the exact master, hash them and render a review sheet. A thumbnail cannot certify visual semantics; independent V pixel review remains separate.
- `r818-physical-smoke.mjs` and `.github/workflows/evidencemotion-r818-physical-smoke.yml`: install pinned Python VTK/Pillow/numpy plus Mesa, Xvfb and FFmpeg; generate a new **195 native-frame, 6.5-second** 1080p 30fps *silent* physical sample and all review receipts. The first hosted smoke attempts detected missing Mesa and then missing FFmpeg; both were repaired, and the subsequent full hosted smoke passed.
- Local technical review-only demo: 90 frames at 1080x1920 30fps, symbolic receptor and incoming ligand, 892 poison-center single-substance reports (2015–2023; **not all users**), 911 CTA. It is explicitly not a branded product ad, independent scientific review, fully captioned or narrated release.

**Remaining release blockers:** first full Kokoro original-voice R8.10→R8.17 narration/word alignment render; verify progressive caption pixels at 4fps, check physical CTA prominence and first-three-second visual twist on the exact encoded master; evaluate scene artistry against owner standard; independent V master and scientific review; owner iPhone listening/visual approval; exact merged-head workflow/CI, then explicit publication authorization. No measured 90+/100 quality score or sub-four-hour promise yet. Production throughput must be measured on subsequent completed videos, not inferred from smoke-test duration.

## R8.18 long-beat compositional-activity guard — October 12 follow-up

V's independent 7-OH explainer audit scored the 54s 720x1280 cut 83/100, identifying a ~13-second user-report section in which changing karaoke words obscured stationary cards in raw pixel-motion analysis. This is external reviewer evidence about that cut, **not** verification of the canonical 1080x1920 renderer or a new video acceptance.

The R8.18 geometry audit now checks scenes lasting 8 seconds or more in 1-second comparisons of actual named scene objects. It excludes caption/subtitle/progress/source overlay kinds and requires multiple three-second windows containing meaningful object displacement, size, visibility, opacity, emphasis or activation changes. The intended user-report repair is narration-time sequential emphasis of real report cards, not a cosmetic animated subtitle. A single pulse in an otherwise 13-second hold must fail. This guard uses SHA-bound renderer telemetry and negative regression fixtures; it cannot independently certify that the decoded pixels match telemetry or that artistic motion is interesting.

**Release boundaries:** This guard is not evidence of a new 7-OH master, a 90+ score, a -14 LUFS audio repair or owner/V publication approval. A genuine 1080x1920 30fps full-mix MP4 must still pass post-encode EBU R128, intelligibility and full-phone viewing, exact word/scene alignment, factual/symbolic labels and separate human review.
