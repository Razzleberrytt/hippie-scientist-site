# Research iteration — still-first photographic macro, source-integrity gate

**2026-10-12. PR #6734, DRAFT/RESEARCH ONLY.** Owner iPhone is the only required device. Existing CPU renders; RTX 3050 and heavyweight video models stay parked. No production code, version, publication, or auto-workflow changes.

## What was actually attempted
- One image-generation experiment produced *visually appealing but scientifically unsafe* model-created diagrams, text and pretend receptor geometry. It was rejected **as a full image**. A second image also contained machine-created molecular drawings and labels; its scientific portions were rejected.
- The visually reviewed second source still is 940×1672 PNG, SHA-256 `b041fb2ec302b869d9d69cb02dad52afd4186e6aa577e794ba93b05c79b6978d`.
- Only explicitly reviewed botanical pixels from crop `[0,0,940,520]` were retained; the rest of the source image is **NOT ADMITTED**. Resulting safe-crop PNG SHA-256 `4516b902806630ba97941636fbe11a5db8859b8c19a5089adaedbde6d497090e`.
- This is generative **illustrative art**, not recorded footage, a botanically authenticated specimen, real clinical imagery or an approved molecular structure. Text, claims, chemical diagrams, source footers and mechanism demonstrations remain deterministic.
- Rendered a silent **6.0 s, 540×960, 15 fps** two-beat research MP4 from those safe botanical pixels, leaf macro then wooden scoop, with one intentionally limited camera move per beat and `AI-ILLUSTRATED BOTANICAL ART` disclosure. It is an art test, not a science or voice video.
- MP4 SHA-256 `eb0bb8fc20e15477f32cb893ffba4d10c8597e8884c81beed3d20a84995f880b`. Original local artifact/contact sheet not committed to repository; replay requires the approved, source-verified still and render script. Never invent a checkout-only reproducer or publication receipt.

## Independent media observation
OpenCV separately decoded **90 real frames at 15 fps** and measured changes within subject ROI [59,173,481,730], outside most header/caption regions. Measured longest low-motion sequence: **0.333 s**. Measured median changed-pixel fraction: approximately **0.00003** (0.003%). This **passes the old >6-second static streak veto** but is near-static most of the time and resembles a moving photograph. This is the important regression.

**CREATIVE VERDICT: HOLD / redesign.** Real leaves and wooden scoop have visibly more convincing texture and material than the old vector-bottle preview; this has not achieved a meaningful narrative/physical transformation, voice-driven timing, cinematic wow factor, genuine depth-layer animation or first-render milestone quality. Do not list it as approved, published, excellent or independently V-reviewed. No audio is present and no source-bound claim was attempted.

## Specific director corrections implemented in research
- `preview-proof.mjs`: validates actual decoder-style receipt dimensions/ROI and warns `NEAR_STATIC_MOVING_POSTER_RISK` when median subject change fraction is less than 0.005. It does **not** auto-certify art, and does **not** treat a declared `origin` as a tamper-resistant attestation; an independent processor must really decode and hash media.
- `previz-director.mjs`: the evaluator reads that audit contract and holds moving-poster candidates for human review. Previous six-second kill and all science/audio safety gates remain.
- `illustrative-crop-gate.mjs`: manually annotated bounding-box exclusions must not overlap admitted creative pixels; source SHA must match the human-reviewed source. This is an *admission fence*, not a computer-vision science verifier.
- Local 9/9 targeted Node tests of both new isolated gates passed. The updated integration-level `previz-director.test.mjs` has new cases but is **not represented as run/green** without its actual execution.
- No external generative-model package, paid inference account, RTX 3050 driver, or new GPU route was installed/integrated.

## What the next shot must do (not just more photo-pan)
Choose an approved science brief and narrated anchor FIRST; choose a single excellent photograph-like still for visual quality; then use VTK/physical geometry for the **specific, source-justified change** that the narration describes. Demand a recognizable hero subject, motivated depth occlusion and a visible **before / after** meaning shift by second 2–3. Cheap preview concept gets owner/reference-shelf review before any full-quality MP4 render. Factual mechanisms never inherit generated molecule pixels. Only correctly attributed symbolic geometry may be shown and must say it's illustrative; unsupported docking fails closed.

### Operating boundaries
Draft PR #6734 remains separate and unmerged, no publishing permissions. The milestone is unchanged: **one excellent first-final-render master, then five excellent first-final-render masters consecutively**. Merely passing the mechanical tests is not an improvement to the milestone count.
