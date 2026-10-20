# Lane 3 — source-locked three-cue real-media typography correction (2026-10-17)

**Existing EvidenceMotion research-only DRAFT PR #6831 and coordination issue #6743.** No fourth implementation workstream; no production import, R-version promotion, owner publishing authorization, merge or first-render acceptance.

## Concrete cause, actual current movie, bounded repair

After Lane3's Scene 2 science-title correction, the **real 845-frame 1080×1920 30fps H264/AAC** full Gut V10 film `67c0183891640b0f97e2db9f92fc922827d16bb90f2ee0650d8d066d9781012c` still inherited Lane4's source-scoped 14px phone-width exploratory negative-screen defects. The original 19 cues' scientific/audio wording remains SHA-locked in `CAPTIONS_ACOUSTIC_DRAFT.srt` SHA `40622b677cd6db8c493eff55727904c5017c4a3d7803b22d4c361e84a1ff9bee`.

Exactly three pre-existing cue windows targeted, preserving every authored character and unchanged timing:
- cue **2** `not the same as`: frames **46–75** (30)
- cue **17** `Form, food, and`: frames **718–752** (35)
- cue **18** `interactions matter. Read`: frames **753–803** (51), reflowed visually across two rows

Actual new *completely re-encoded and strict decoded* film SHA: **`044c1f0573f01d3fe850cbd74f270c90019cc3e37b364a0fa627d56e7ecb39f2`**. Exactly **845 video frames**, no extra/short frame. Re-running the updated self-contained source re-render from the input archive produced **the identical full MP4 SHA** (real second execution, not metadata self-attestation).

## Two mistakes independently detected and stopped

First early render was **REJECTED**: looping PNG input extended output beyond original 845-frame movie. Bounded video-only encoding fixes it.

The next early render was also **REJECTED**: `-t` on audio-video output truncated four original AAC packets at the tail. The corrected process first encodes bounded 845 video frames, then **remuxes the complete untouched exact source AAC**, never re-recording/stretching/normalizing voice.

## Independently observed final *actual decoded* media

- Original **1,323/1,323 complete AAC packet ordered (PTS,DTS,duration,size,flags) tuples exactly preserved**. Elementary original AAC copied bitwise, ADTS SHA `24188032e84974f624093c2193e4216fa2adbea20faebab8ac33770a016c8233` identical. Entire 845-frame H264/AAC strict decode PASS.
- Independent every-target-frame 540px RGB24 optical screen (not title-font metadata): actual caption ink minima at projected **320px phone width** cue 2 **16.59px** (30/30 frames), cue 17 **20.74px** (35/35), cue 18 **16.59px** (51/51). Each exceeds **provisional 14px** negative screen.
- Exactly **116 selected frames** intentionally changed. The other **729** decoded full-film 96×170 grayscale frame means differ from original by mean **0.041909/255**, maximum **0.058272/255**; ordinary H264 re-encode, no out-of-window visual edit claim beyond that measured proxy.
- **10/10 local source/word/font/size/output-path regression tests PASS**, and after extracting the shared exact ZIP to an isolated new folder, **10/10 PASS again**. Test cases reject wrong film/SRT SHA, modified cue wording, clipped/undersized caption, output collision; full source/render and independent actual-media verifier included. The machine ink proxy is not calibrated human reading, app UI, semantic/OCR truth or premium craft.
- **Craft tradeoff:** the selected three cues now show whole static phrases within their original time window instead of preserving kinetic karaoke emphasis. Do **not** pre-certify audio-driven visual quality; independent motion/cue-boundary review must assess it.

## Immutable portable evidence for independent lanes

Self-contained owner conversation ZIP **`EvidenceMotion_Lane3_GutV10_ThreeCue_Research_20261017.zip`**, outer SHA-256 **`a68c2ffd82f7463ffc98adaa0c1d516442626ee611371c04c8b6fdeb46c302fd`**, bytes **5,241,446**, ZIP CRC PASS, **13/13 inner payload size/SHA256 manifest checks PASS**. Contains original+new real full movies, pinned SRT, Python source/test scripts, independent new full physical-media report JSON, deterministic replay receipt, overlay PNGs, matched 320px phone screenshots; **no font binaries**. GIF/metadata is not substitute for the real video. This new physical output and renderer are in owner conversation ZIP, not GitHub Actions-hosted movie execution.

## Still OPEN — no blanket font promotion

Lane4 previously found **every one of 845 frames' small explanatory body text and source-credit text** below the provisional optical negative screen, with other 16 SRT cue treatments not remeasured as corrected. Those defects remain. The 3-cue experiment cannot imply whole-film readability acceptance.

**Independent handoff:** Lane4 re-download/rehash this exact corrected full MP4, measure 320/375/430 presentation, seam/rhythm/word reveal, caption and source overlap and correct all-scene negative screens; do not inherit our internal screen as separate acceptance. Lane1 re-check actual new science title/meaning; Lane2 preserve source phonetics/audio; Lane5 keep later iterative render outside first-try excellent streak; Lane6 exact-source master input/phone plan/render receipt remains incomplete and must not be conjured.

**Research HOLD:** `mayPublish=false`, `externalIndependentReviewed=false`, `physicalPhoneReviewed=false`, `newAcceptedAtomicCards=0`; last reconciled coordinator **872/1590 provisional** unchanged. Controller-only merge/release.
