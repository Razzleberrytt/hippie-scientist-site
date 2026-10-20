# Phone-first director — full-frame botanical edge-trace experiment

**Research only (October 12, 2026).** This is an illustrative scene-design and decoding trial, NOT a scientific mechanism video, a production release, a reviewed voice master or a milestone completion.

## Why this replaced the previous lens pilot
The first lens candidate looked like a framed slide with a digital loupe. It measured as highly active in the cropped region but still failed the niche-level *cinematic* bar. The revised preview uses a **single full-frame hero image** and an optical image transformation directly on the hero pixels, not a border, card, fake microscopic scene, molecular rendering or animating particle decoration.

### Exact proof from local research environment
- Source still SHA-256: `4516b902806630ba97941636fbe11a5db8859b8c19a5089adaedbde6d497090e`. It was previously cropped from generative artwork to exclude model-drawn chemical diagrams and labels. It remains an *illustrative* source image, not genuine plant/microscopy evidence.
- The reproducible CPU renderer `render-leaf-trace.py` requires an **external user-supplied approved source PNG**; its image bytes are not in GitHub. Example: `python research/evidencemotion-director/render-leaf-trace.py --source /path/to/approved_source_safe_botanical_only.png --output /tmp/ths-leaf-trace`.
- Video: `leaf_edge_trace_RESEARCH_ONLY_SILENT.mp4`, 540×960, 15 fps, 90 frames, 6.0 seconds, H.264 without audio. Local verified encoded SHA-256: `67adf35bbace233111325a51645397724e2f023e1e87998da5e509a0eebe84a1`.
- Independent actual-frame audit: 90 frames decoded; longest low-motion streak in subject-centred ROI 0.467 seconds; median changed-pixel fraction 0.03238. This does **not** prove high craft or narrative meaning.
- New source-pixel **before/after state pair** audit: sample video frames at 1.0 s and 5.0 s; subject ROI `[40,235,490,760]`; 24×24 averaged blocks and per-channel difference >=25; 0.9921 of blocks change. A prior framed lens prototype also scores 0.9259, demonstrating that the state-pair metric alone **cannot certify artistic improvement**. It is useful only as a one-way negative filter to flag static or particle-only tests.
- The adversarial state-pair tests covered static, sparse particle motion, a deliberately changed hero and invalid timing: **4/4 passed locally**. They never grant human craft approval.
- Portable renderer was re-executed with explicit `--source` and `--output` on CPU and generated the exact same MP4 SHA from that source and renderer. The GitHub copy requires independent execution in a checkout before calling its own output SHA verified.

## Subjective craft assessment (ChatGPT-only, NOT V_VERIFIED)
Improved: physical photographic texture remains recognizable, subject undergoes a visually obvious before/after transformation, no fake molecule/claim graphics; one sustained restrained camera move.

Still short of the required quality bar: digital edge-map wipes can look like generic educational motion graphics, the synthetic leaf looks *illustrated* rather than an authentic specimen, large title zones dilute full-screen visual immersion, the chemical/biological explanation is absent, and the shot lacks narration and the owner-selected reference-shelf comparison. **Craft status: HOLD, not ACCEPTED.**

## Canonical next cut
Move from **art-only texture reveal** to a **real source-justified physical action** with a pinned and audited hero model/geometry. Freeze the scientific research brief and natural Kokoro WAV first, then script a single camera action and render two silent low-cost treatments against that same voice timing, optionally using the locked botanical texture for atmosphere. Only after owner phone preview and independent shelf review authorize any one 1080×1920 final. No heavyweight video model or local RTX 3050 required.

## Safety and freeze
All operations remain under `research/evidencemotion-director/`. No new R-number, no production importer, auto-triggered CI run, deployment, website edit, video publishing, paid inference or hardware purchase. Never treat a decoded-pixel score, provenance hash or QA receipt as acceptance of the finished video. Current goal remains one excellent first-final-render video, then five consecutive excellent first-final-render videos.


## Phone-first codec retest + paired evaluator (verified local research)
The first render above used H.264 **High** profile. The portable research renderer was tightened to explicitly request `-profile:v baseline -level 3.1 -pix_fmt yuv420p -movflags +faststart`; a fresh run now probes as **H.264 Constrained Baseline**, 540×960, 15fps, yuv420p, Level 3.1, no audio stream (intentionally silent).

- Phone-safe encoded master SHA-256: `07a353b73c06b0ac7a3ec43bb6b83359ae0146e427931fb695eaa9c920a17fc2`. The source input is the same locked botanical PNG. The prior High-profile SHA above is historical, not the preferred phone-first preview.
- Independent CPU decode: 90 frames, subject ROI [59,173,481,730], longest static run 0.467s, **median subject changed-pixel fraction 0.00278**. This is below the documented 0.005 near-static heuristic. Different encoder profiles may affect the pixel-motion proxy; never compare the metrics as if they were codec-independent.
- Independently decoded state-pair comparison at 1.0s→5.0s: **0.9921** fraction of 24px subject blocks differ; visually the leaf art becomes a cyan edge trace. This verifies a large before/after *pixel* change only, not an explanation, narration sync or aesthetic merit.
- Newly committed `reveal-quality-gate.mjs` couples both reports bound to the exact MP4 hash. It returns `RESEARCH_HOLD` with `NEAR_STATIC_MOVING_POSTER_RISK` on this actual phone-safe pilot, not a false PASS.
- 6/6 gate tests passed locally; 4/4 decoded state-pair adversarial Python tests passed locally. The repository's full current combined regression suite has **not** been verified in this pass. A human must still audition the exact master on iPhone before claiming playback compatibility; an encoder probe is not a device test.

**Owner review status stays UNREQUESTED / HOLD** for creative release. Zero videos have achieved the one-plus-five excellence milestone. Research remains isolated and unmerged.
