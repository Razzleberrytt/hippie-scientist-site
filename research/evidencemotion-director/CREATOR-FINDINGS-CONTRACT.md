# Director research — creator findings adopted as an executable production-design contract

**Status:** RESEARCH ONLY, October 12, 2026. Owner's production freeze is binding. All code, experiments and docs are isolated under this directory in draft PR #6734. Nothing merged or published by this change. V's previous verification of the clean draft is **not** verification of new code.

## Owner decision: PHONE-FIRST
The iPhone is the user interface and the authoritative finished-video playback device. Rendering and preview decoding run on existing remote CPU-capable systems. The RTX 3050 laptop (4 GB dedicated VRAM) is parked as a future optional route; it requires no installation, upgrade, or active work.

Do not plan around FLUX, Wan, TRELLIS, LTX-2, or any large GPU-first video model. No paid inference approved. A creator anecdote that an **unspecified smaller quantized LTX-Video variant may run on 4 GB** is an **unverified research lead**, not a statement that LTX-2 will run on this laptop, meet acceptable speed, or produce useful quality. The older LTX-Video models and new LTX-2 releases must not be conflated. No local experimentation is scheduled or required.

## Still-first, voice-governed edit order
These are complementary, not competing priorities:
1. **Concept**: choose narrative claim/visual purpose, with approved science input.
2. **Look**: make ONE impressive still per visual concept; inspect at phone size. A recognizable, properly lit hero is essential. Lock source pixels (SHA-256), material/light/color/reference composition. Do not reprompt/recreate it during every cut.
3. **Depth stack**: derive authored foreground/mid/background layers with real clean segmentation masks and inpainted backplates. If assets cannot be layered without ugly edge halos, reject them before motion. Use the same pinned art source, not regenerated approximations.
4. **Sound**: scientifically review and freeze narration, dry-run Kokoro pronunciations in sentence-sized chunks, human ear-check actual WAV against the original voice. Scientific spellings remain intact in captions. Permit pronunciation overrides ONLY in the TTS input lexicon. Keep an auditable ledger. Do not change rate to force visuals.
5. **Edit / design**: use original audio timestamps to determine shot starts and ends; choose ONE camera move per shot, restrained parallax (initial research policy max 5% screen width, orbit 8 degrees) and a motivated compositional change where needed. Visual registers may change naturally every 2–3 seconds, but never cut solely to game the counter.
6. **Cheap previz**: render 360p/low-fps still animatics. Confirm actual decoded frames and visual intent; run reviewer kill loop at preview stage. One final 1080x1920 render only after accepted concept.
7. **Final**: exact decoded visual/audio scientific/source QA, native iPhone playback, independent craft review and owner approval. No automatic publishing. The six-video milestone remains unchanged.

### Hard gates versus flexible creative heuristics
| Creator observation | Research implementation | Status |
| --- | --- | --- |
| Still first, then animate | SHA-bound source still + layers reused across shots | Hard gate in `stage-gates.mjs`; producer pixel verification still needed |
| One camera move | Exactly one declared move per shot | Hard gate; perceptual check needed |
| Small 2.5D travel | Motion constrained to plausible displacement; never require gratuitous motion | Parametric gate, human artistic review |
| Avoid AI-generated people | Generated faces prohibited by default | Hard gate |
| AI texture/atmosphere only | Factual diagrams/figures/labels generated deterministically, pinned background assets | Hard gate |
| Single style reference | Exact source pixel identity and derived depth layer hashes | Hard gate; hash of claim alone not physical verification |
| Pronunciation dry-run | Original Kokoro audition and approved lexicon SHA required before render | Hard gate when real narration exists |
| Sentence-sized TTS | Explicit per-sentence WAV SHA and audition receipts | Hard gate |
| First 2s three hooks | Readable visual, early motion and an immediately relevant first spoken line | Stage gate; must be verified with decoded media, not metadata |
| 2–3s visual change | Pacing advisory, not arbitrary hard cut; >6s static is kill | Hybrid |
| UI-safe vertical captions | Protected top, bottom and right margins, compare on real phone | Hard gate plus device check |
| Repair one scene | Asset-identity and per-shot revision; no invalidation of unrelated approved science/voice | Future producer requirement, not yet automated |

## Lessons from decoded research animatics
Earlier CPU-only 360x640 preview pair `macro_push_RESEARCH_ONLY.mp4` and `orbit_reveal_RESEARCH_ONLY.mp4` were 5s/12fps. Independently decoded motion audit reports central cropped 6s static streak lengths **0.917s** and **0.167s**, respectively. A deliberately frozen 7.5s sample returned **7.417s**, correctly a KILL. These metrics DO NOT certify art, narrative appeal, lighting, subject recognition or the exact original voice.

A second still-first, stylized **specimen bottle** concept (480x854, 4.5s, 12fps; entirely nonfactual and silent) uses three immutable art layers and a single restrained macro push. It reports 0.417s max central static streak. It has a recognizable illustrated hero but still resembles a poster, so its **craft verdict is REJECT / REDIRECT**, despite passing the motion negative-filter. It is not 7-OH evidence, product footage, actual bottle packaging, or a flagship. This proves why a director needs explicit human quality critique, not self-awarded cinematic scoring.

## Research-ready code
- `previz-director.mjs`: six grammar candidates; source-audio-science constraints, never auto-approves.
- `stage-gates.mjs`: still/voice/parallax/camera/disclosure/safe-area contracts, returns `PREVIZ_PACKAGE_READY_FOR_PIXEL_AUDIT` only, not cinematic PASS.
- `audit_decoded_preview.py`: stream-decodes actual FFmpeg frames, crops caption-dominated regions, compares per-frame pixel differences, reports >6s static. Never certifies perceptual quality. Requires Python NumPy and FFmpeg installed.
- `specialist-router.mjs`: proposes *roles*, not model integrations. VTK/Pillow/locked stills available on CPU; Depth Anything V2 Small/MobileSAM are benchmark-only, not installed or called by this router.
- Node's built-in tests are under `*.test.mjs`; execute manually; no new CI triggers.
- Experiment renders and owner's reference-shelf acceptance still require separate review.

## Next engineering and art tasks (not claims of completion)
1. Enforce actual source PNG hash verification at render time, validate alpha-edge halos and hole-filled backplates rather than trusting identity flags.
2. Draw/review two dramatic recognizable storyboards rooted in the same source content (e.g., familiar product to physical mechanism), with source/voice reviewed separately.
3. Compare *hero, materials, depth*, and transition pacing at iPhone size, not motion-score only. Kill cheap-looking candidates before 1080p master.
4. Add explicit perceptual *negative* evidence (recognizability, material credibility, phone-scale legibility) and real reviewer receipts to director/evaluator pairing.
5. Benchmark optional small model CPU assistance only if manually authored layers clearly bottleneck the visual outcome. The laptop remains parked.
