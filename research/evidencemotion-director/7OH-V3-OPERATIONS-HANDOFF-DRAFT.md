# EvidenceMotion 7-OH V3 — repeatable research operator handoff

**DRAFT / not a production release manual.** Current branch stores an inert source-led 7-OH review movie; runtime integrations and public posting are not authorized. No new R version. This guide is intentionally usable without the originating conversation but still needs a separate operator rehearsal before checklist system-completion credit.

## Inventory and exact identity

Securely retain *unchanged originals*: `EvidenceMotion_7OH_Final_Technical_Review_V3.zip` (SHA-256 `6c8de2ceeb6b0abda0efe4010903d2e2a6c513b79c55f8360b42b39e0e7c6111`); V3 portrait MP4 (SHA-256 `9259b639d607baf131c26cd8d0f09935e03cbd7c9107f8e6d8d4747565ad9c22`); original Kokoro WAV (SHA-256 `9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435`). Earlier selected native video `130857e331d40e452edd38a1d112d88e552b56009c4aa0e57cd1e15559581b86` is a *different* immutable candidate, not a green-reviewed substitute.

The downloadable V3 ZIP stores source scripts, two chemical identity assertions, original voice and beat timeline, final MP4, 720p fallback, 13 QA negative fixtures, 2D comparison repair frames, manifests, and research-only release holds. Binary copies are conversation artifacts, **not files in this GitHub repository**. Check every SHA after transferring between systems.

## Regenerable source-asset escrow (separate from final film)

An actual 72-file input/provenance package now accompanies the caption-safe master: `EvidenceMotion_7OH_Intermediates_Provenance_RESEARCH.zip` SHA-256 `2c2d06028e86978ce6799f58c5476a881144cff623322c3339f2d9c83ffe0618`. Its `intermediates/` folder includes all **63 exact PNGs** independently regenerated twice from the pinned script/chemical identities; it also includes `original/`, `delivery/`, the exact current final MP4 and `verify_source_input_manifest.py`.

On a clean extract run `python verify_source_input_manifest.py --root . --manifest source_input_manifest.json`. Expect `PASS_RESEARCH_ONLY` with **72 files**. The package's intentional tamper test changed one VTK frame and verified an immediate hash-mismatch HOLD. Retain the original ZIP and manifest hashes when troubleshooting. Headless VTK on the current CPU runner requires `VTK_DEFAULT_OPENGL_WINDOW=vtkEGLRenderWindow LIBGL_ALWAYS_SOFTWARE=1`; record and test alternative backends before adopting them. Full encoded silent-film byte-identical reproduction is **not** established (see [source byte proof](7OH-V3-INTERMEDIATE-SOURCE-BYTE-PROOF-2026-10-13.md)); do not silently call this a golden master.

## Research QA procedure (not approval)

1. Obtain the exact ZIP, confirm its hash with `sha256sum` or equivalent, then `unzip -t`. Reject archive paths outside the target directory and symlinks in a new/repacked bundle.
2. Extract into a clean folder, not a shared working directory. Require Python 3.12+, FFmpeg and FFprobe in PATH. From the extracted V3 subfolder run `python -m unittest discover -p test_verify_compatibility.py -v` and `python verify_compatibility.py`. Confirm **13/13** negative tests and actual full-media decode with a manifest `PASS`; do not silently pass on a missing FFmpeg binary.
3. Independently inspect the final MP4 via `ffprobe`: exactly 1080×1920 H.264 yuv420p 30fps, 1,031 video frames, AAC 48kHz stereo, playable fast-start box order. Check every presentation timestamp, not `r_frame_rate` alone. Expected video 34.3667s; source voice 34.3473s.
4. Use `audio_identity_check.py` and `caption_source_audit.py` against original source. The source timeline has six spoken beats and a **3.2-second intentional silent source card**; that silence is not an encoding defect. No word-level MFA timings are available, so do not claim karaoke-accurate alignment.
5. Review exact screenshot frames at opening, the pairwise mitragynine/7-OH comparison around 9.5/10s, 3D caveat around 20s, quiet source card, and outro. Reject incorrect chemical bonds, label/CID mismatch, missing “computed/not measured” qualifiers, obscured diagram/caption, apparent receptor imagery or any claim that this is observed pharmacology.
6. For any altered bytes, **HOLD**; record discrepancy and create a new manifest/hash. Never edit V3 in place or reuse prior science/craft/audio/device reviews.

## Adversarial triage and repair ownership

| Symptom | Diagnostic | Safe bounded repair |
|---|---|---|
| iPhone/embedded player says cannot play | FFprobe codec/profile, MP4 moov location, AAC rate/channels, full FFmpeg decode; then test external device | Produce a new Constrained Baseline/AAC + faststart compatibility encode, rehash and review; do not assert player acceptance from FFprobe |
| Quiet or oddly paced narration | Compare original WAV PCM to decoded final; measure LUFS, peak, frame/sample offset | Fix gain/encoding only; preserve original timing. If new syllables needed, new exact voice takes and invalidated approvals |
| Captions obscure bond map | Decode sample frames at all molecular comparison intervals, source-locked caption time windows | Move or split graphic within caption safe region, regenerate exact final MP4 and all receipts |
| Wrong hydroxyl or implied morph | Recheck both pinned RDKit InChIKeys/CIDs and actual structure/comparison frame | Abort scene; regenerate only from governed chemical graphs; **hard-cut** the two distinct structures |
| Synthetic CGI perceived as cheap | Compare against owner-curated outside top-niche reference films | Refine lighting and visual purpose in cheap previews, no papering-over with useless particles or unearned approval |
| Green site CI but broken Python research audit | `python -m py_compile` and actual `unittest discover` for audit sources | Use research-only native audit workflow (PR #6745 merged), never treat site build as native video proof |
| Invalid source/asset hash | Verify actual byte hash and unsafe path checks, not receipt booleans | Stop/recover trusted original, recheck manifest; do not replace expected hash to hide mismatch |

## Approval and publication gates — deliberately LAST

Only after all technical and scientific preparation: (1) qualified science/editorial review of precise narration and depiction, (2) owner direct audition of the **exact take**, (3) real iPhone playback with audio/scrubbing/safe-area, (4) comparison against 3–5 genuinely best-in-niche clips with separate **CORRECTNESS** and **CRAFT** decisions, (5) explicit owner publication go/no-go. No approval is transferable across hashes. Never label this V_VERIFIED from solo review.

Production promotion remains blocked until one owner-accepted excellent first-final-render video **and five additional excellent first renders on diverse subjects** (streak restarts after any failure). All prior releases remain frozen. No automatic posting, false medical effects, paid provider dependency, or hallucinated geometry.

## Retention / rollback

- Store each selected MP4, WAV, chemistry inputs, ZIP, source/renderer script, manifest, and QA outputs under an immutable release-identifier+SHA path; never rely solely on disposable runner artifact retention. Persist SHA inventory in project control. Keep *old and new* candidate manifests, mismatch incident receipts, and rollback reason.
- Current research branch has **nothing live to roll back**. If a future approved production integration is activated, maintain the old tested renderer behind feature gate; on failed exact-head QA, disable the new gate, restore last known-good producer/release and invalidate stale asset approvals. Product-site deployment rollback follows the site's existing protected build/deploy controls; social-platform takedown requires separate authorized action. Do not fake a successfully posted or deployed receipt.
- In case of technical mismatch, quarantine output; in case of science concern, halt release even if media hashes pass; in case of a “feels cheap” craft veto, preserve sources for regression and redesign before any new final render.

This runbook itself has not yet been independently rehearsed by a separate operator, so the canonical checklist’s operator-guide completion item remains **OPEN**.
