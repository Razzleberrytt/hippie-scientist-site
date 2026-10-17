# Lane 3 — Source-word-pinned phone legibility A/B (Oct 17, research-only)

**Draft-only research; no production path, source claims, soundtrack/caption rewrite, automatic craft/phone/clinical approval or controller merge.**

## Specific actual rendered defect

The actual cleaned 7-OH film shows complete source-linked 2D and calculated 3D molecular geometry at native 1080×1920. At the intended 375px-width phone comparison, however, the bottom-of-panel footnotes `RDKit / source-linked` and `Not a receptor recording` are much smaller than the central explanation. A/B experiments placing a large bottom banner were **rejected** because they covered timed narration captions. Simply duplicating more copy outside the cards was not a net creative improvement.

## Opt-in, bounded alternative rendered as real H.264

The chosen experimental treatment **keeps the same exact words inside their original cards**, and redraws only two native ~40px text strips with hash-pinned DejaVu Sans at **34 native pixels** (~11.8 pixels at 375px width). New research source `lane3/scene4_legible_footnotes_research.py`; static negative tests `lane3/test_scene4_legible_footnotes_research.py`.

- **Exact source film** `3c4e91b37958f1e86b6a04486933bbfc719bf6a196203711d6421eca58b70d31`, unchanged source.
- **New physically encoded full research alternative** `7a3440aab731082233cb5f700fd40b030c1de0d4ee3d6b011b38e348a98f47c9`.
- Source-font SHA is pinned for this exact opt-in render (`57f73e11f51999432bf7ab22ce55b6f945d5eca1bf824404cfa9ec2e3718c84e`); no font file is distributed.
- **Left** `RDKit / source-linked` x77/y940 is redrawn only for scene frames **498–701**.
- **Right** `Not a receptor recording` x505/y940 appears only **595–701**; it is never promoted ahead of the existing scientifically important spoken negation.
- Source title, source chemistry and conformer imagery, original orange `NOT FILMED • no receptor binding shown` strip, muted/word-by-word narration captions and sound are all unchanged at source-edit level. This is a native video **re-encode**, so pixels outside the authored strips aren't byte-identical. The source movie is preserved.
- No new scientific claim, receptor animation, molecule generator, extra vendor or version family.

### Independently probed actual-media evidence

| Check | Readback |
|---|---|
| Full encoded H264 movie frame grids, both films | **1031/1031** each; 1080×1920; 30/1 average/r frame rate; max PTS grid error 0.000000333s |
| Original AAC ADTS source and candidate | Identical SHA256 `f0057c19c9d06b8a2f3c6d8fec948ca4555966114579fd1a48b0bcfccc84aa98` |
| AAC packet PTS/DTS/duration timestamps | **807/807** packet records precisely identical |
| Independently decoded frames outside Scene4 | **827/827**, gray 96×170 mean MAE **0.00874677/255**, worst frame **0.02083333/255** |
| Inside Scene4 | All **204/204** frame samples decoded; visually altered scene mean 96×170 gray MAE **0.35322803/255** |
| Static evidence | Actual 375px, nine real-frame before/after contact, frame indices 498,554,555,594,595,630,700,701,702; new display keeps frame 702 outside edited scene |
| New opt-in source/contract unit tests | **5/5 locally PASS** after correcting a test assertion that initially split FFmpeg `between(n,a,b)` at commas |
| Media receipt | `scene4_phone_footnotes_actual_media_receipt.json`, computed locally; full film source and candidate SHA rechecked |

**Actual portable research kit in owner's current conversation:** `EvidenceMotion_Lane3_Phone_Footnotes_AB_Research_20261017.zip`, **4,630,775 bytes**, exact archive SHA256 `ed1f941a9508c34a366fc81542b864a7dec65548fe2172f4eead520b378083be`. **7 files in SHA manifest / 8 ZIP entries CRC and SHA verified**, including both full H264 films, standalone research code/test, 375px decoded A/B contact and real source media receipt. **Not hosted on GitHub Actions**, so receiver must independently acquire/hash exact bytes before promotion or attribution.

## Caveats / next review

This opt-in A/B is **not yet proven better to viewers**. The promoted words are still only ~11.8px at full-width 375px phone scaling, and a screenshot cannot represent overlaid TikTok UI, motion, real handset glare, caption comprehension or hearing. Lane4 must independently inspect *this new film SHA* for complete same-shot proposition, caption safe area, OCR of literal words, and real device playback. No source audio or science review has been approved. Research-only source contract `mayPublish=false` remains in force. The protected `main` branch, production video/voice systems, normal D/R/A slots and 1,590 atomic-card tally are not altered.

