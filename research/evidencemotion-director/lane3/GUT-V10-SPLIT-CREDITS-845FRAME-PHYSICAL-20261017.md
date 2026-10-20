# Lane 3 — genuine 845f Gut V10 split-source-credit experiment: spacing STOP resolved (2026-10-17)

**Existing research-only DRAFT PR #6831, coordination issue #6743.** No admission of new D/R/A workstream, implementation version, controller merge, production change, external approval or publication.

## Immutable media and exact source scope

- Prior **source movie** (real 845-frame 1080×1920/30 H264/AAC with corrected Scene 2 headline and earlier 3-cue enlargement): SHA **`044c1f0573f01d3fe850cbd74f270c90019cc3e37b364a0fa627d56e7ecb39f2`**.
- Source frozen **19-cue SRT** SHA **`40622b677cd6db8c493eff55727904c5017c4a3d7803b22d4c361e84a1ff9bee`**.
- Rejected lower-third credit-in-same-panel experiment: **`dd308ae64cc77edda5202e28da758ba031de1f065980c736fd147e3a60624b1b`**. It met 14px text-size proxy in all **2956/2956** real observations but failed experimental >=12px source-to-spoken-caption separation on **738/738 real kinetic frames** (worst **0.889px** projected).
- **NEW REAL FULL opt-in movie, SHA `198126df23b35a2200ff066af521ebd959f73937c90a031745a0f03c2ada681c`.** Six scene-specific source headers separate agency names from two/three-line explanatory text, without changing sentence words, artwork geometry, music/speech, frozen narrated cues, or stage durations. Old lower agency letters are covered by corrected lower panels. This is not a posting master.

## Actual physical FFmpeg video/audio and decoded-pixel observations

All **845** frame/native H264 and original AAC streams strictly decoded, not inferred from scripted font sizes. An **independently implemented** second process decoded three frozen film regions (credit strips, lower explanatory text, moving subtitle zone) on **EVERY frame** and checked exact authenticated stage bounds.

- Exactly **2956/2956** physically measured credit + body rows across 845 frames clear provisional >=14px glyph-ink negative screen at 320-wide video. **Minimum 49 actual native glyph rows = 14.519 projected pixels**.
- Actual **738/738** genuine kinetic-caption foreground frames now maintain >=12px projected *body-text-to-caption* separation; **minimum conservative 23.407px projected**, compared to prior *credit-to-caption* 0.889px. The new conservative gap uses the authored verified body lower bounding edge and independently decoded actual caption top: a lower bound, not calibrated viewer physiology.
- Full **1323 AAC ordered packets** preserve all original PTS/DTS/duration/size/flags. Actual original AAC ADTS SHA `24188032e84974f624093c2193e4216fa2adbea20faebab8ac33770a016c8233` matches before/after; no invented narration, missing AAC tail, resampling or time stretch.
- A separate independent all-845-frame source-versus-new 96-ish-size grayscale comparison outside the edited source/footer found science-art ROI mean **0.1090/255**, per-frame max **0.2978/255**; right-control proxy strip mean **0.0304/255**, max **0.0849/255**; moving-caption ROI mean **0.0839/255**, max **0.2045/255**. Ordinary lossy H264 re-encode noise, **not bitwise pixel identity**, lexical OCR, actual TikTok UI or subjective professional craft PASS.
- An initial all-6-images-in-one-filter FFmpeg attempt timed out at **636/845 frames**, was explicitly discarded. Six isolated exact native source-frame `trim` segments (**119+139+134+155+171+127 = 845**) are encoded then concat-copied before remuxing **ALL** unchanged original AAC packets. A *fresh independent rerender* of complete output repeatedly had identical full final MP4 SHA above.
- **13/13** local source/layout negative-control tests PASS. After extracting exact portable ZIP into a new directory: **13/13 PASS**, and a fresh complete independent decoder check reproduces all 845 physical frame observations. Hosted contract tests are distinct synthetic receipt-consistency checks and **never** claimed to independently re-decode owner Library media.

## Exact owner research artifact

`EvidenceMotion_Lane3_GutV10_SplitCredit_Research_20261017.zip`, **outer SHA-256 `9769048b6d877be1001a2eb5dc755d8cfa8d1cf8c9b00a3a3516d1a1b5e0c305`**, **8,296,058 bytes**. ZIP CRC and **18/18** manifested member SHA/size verified; includes before+after real full movies, rejected previous control, original SRT, **self-contained font-SHA-pinned replay renderer**, separate actual-H264/NumPy checker + 845 per-frame JSON, 13 tests, genuine decoded six-scene 320px previews and README. No actual font files redistributed. GitHub holds this **research report** plus separately hosted fail-closed per-frame receipt validator and adversarial contract tests; the new full movie and renderer source are kept in the owner conversation ZIP, not run on hosted CI.

### Independent physical reviewer tasks

**Lane 4:** acquire/re-hash the exact new movie, independently inspect actual visual text/credit/art placement and source authenticity at 320/375/430, shot transitions, app UI controls, actual native handset and motion/pacing before quality credit. The top credit can still compete with heading/illustration in particular scenes, and the lower full-mat panel may be aesthetically heavy; optical size and clearance alone do not prove cinematic craft. **Lane 1:** independently review displayed nutritional/formulation claims and appropriateness of NIDDK/NIH-ODS attribution, especially nonheme iron/tea. **Lane 2:** original spoken-word phonetics/word timing unchanged. **Lane 5:** this is a **later corrected render**, not an excellent FIRST render or five-streak candidate. **Lane 6:** obtain real full source-bound phone plan / renderer receipt and external authority; prior nulls are still not to be invented. No owner routine QA burden.

**Status: `mayPublish=false`, science/real handset/qualified review/premium PASS all HOLD, new accepted Lane 3 x/1590 +0. Last distinct coordinator total **875/1590 provisional** was raised by Lane 1 prerequisites, not this research repair. Controller-only merge.**
