# 7-OH V3 exact-media audit and unresolved gates (2026-10-13)

**Review-only. This is source and media engineering evidence, never science/craft/phone/publication approval.**

## Exact material (conversation-retrievable binary, not Git tracked)

- ZIP `EvidenceMotion_7OH_Final_Technical_Review_V3.zip` SHA-256 **`6c8de2ceeb6b0abda0efe4010903d2e2a6c513b79c55f8360b42b39e0e7c6111`**.
- V3 portrait final `EvidenceMotion_7OH_FullHD_MatchCut_PLAYBACK_REVIEW.mp4` SHA-256 **`9259b639d607baf131c26cd8d0f09935e03cbd7c9107f8e6d8d4747565ad9c22`**.
- Source narration `original_kokoro_narration.wav` SHA-256 **`9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435`**.
- Existing earlier selected master **`130857e331d40e452edd38a1d112d88e552b56009c4aa0e57cd1e15559581b86`** remains distinct; do **not** imply the V3 MP4 is that previously accepted or approved binary.
- Direct source identity: mitragynine CID 3034396 and 7-hydroxymitragynine CID 44301524; 3D is seeded ETKDG/MMFF illustration, not laboratory-measured receptor geometry.

## Independent local QA performed on an extracted clean V3 package

1. Executed bundled `verify_compatibility.py --quick` (all three MP4 bytes match `PLAYBACK_MANIFEST.json`, plus ALL `auxiliarySources` hashes, including original WAV, source scripts, exact graphic patch frames, text, and storyboard/beat timeline); also executed its **full-decode path** for the exact V3 portrait video; **PASS**.
2. Bundled `python -m unittest discover -p test_verify_compatibility.py -v`: **13/13 PASS**, including altered media, missing file, symlink, traversal, missing safety hold and altered helper detection.
3. FFprobe decoded-frame timestamp extraction on the **actual final V3 MP4**: exactly **1,031** presentation timestamps at 30fps with each offset within 0.0001 s of the constant grid; actual H.264 video **1080×1920**, AAC audio, complete FFmpeg error-on-decode **PASS**.
4. Original PCM narration WAV: 24kHz mono, measured 34.347333 s, correct exact hash. Seven immutable contiguous voice-led beat windows. Six spoken segments each have nonzero measured voice RMS; the intentionally silent source-card window 27.89–31.09 s has **RMS 0.0**. No blanket “zero silence” rule that would invalidate a deliberate editorial hold.
5. `CAPTION_SOURCE_QA.json`: six spoken subtitle cues match their approved written beat texts after punctuation normalization and cover declared speech ends; **NO genuine word-level MFA** or independently verified transcription is claimed.
6. Spot-inspected actual decoded V3 frames at ~9.5s and 20s. The 9.5s mitragynine structure is not obscured by the caption; the 20s model states “possible 3D shape” and “not a measured pose.” These sampled visual checks do not establish whole-film aesthetic brilliance or exhaustive phone safe-area coverage.
7. The V3 renderer's source includes both expected PubChem CIDs/InChIKeys, computational model identification, script and WAV hash guards, and a hard-cut molecular comparison. This is a source-inspection check; **no new independent clean full-film generation and hash-equal 3D model rerun was completed during this audit**.

Independent ephemeral `ACTUAL_V3_EVIDENCE_AUDIT.json` SHA-256 **`308ad1f59a05ad69cfc3f0184c6f73b2d3a76074ab075a4fd4af7be3b82b50ce`** accompanies this local review but is not in Git. GitHub build checks cannot replace a missing user-facing media binary.

## What passes, and what must remain OPEN

- PASS **research engineering subset only**: actual-media hashes, native picture dimensions and frame timings, full final video decode, source voice identity, controlled beat times, source-card intentional silence, and six written subtitle cue contracts.
- **Still OPEN:** source-render asset SHA closure on all underlying 2D, 3D, background intermediate outputs; qualified chemical/script editorial review; independently verified actual spoken-word alignment; comprehensive display/safe-area and first-second comprehension; original voice listening; full iPhone playback; outstanding basic-CGI visual-craft veto; controlled production integration, reusable renderer, five distinct excellent first renders, canonical adoption and owner publication authorization.
- This record adds engineering proof but **does not tick whole mixed human+technical checklist items** merely because their technical subset passed. The source-bitstream bundle itself is not a currently shipped production workflow.

See `7OH-V3-SHOT-DECISIONS-2026-10-13.md` for per-shot visual purpose and abort plan. **Never overwrite V3's original hashes**; after any edit, issue a new immutable manifest and re-run every approval.
