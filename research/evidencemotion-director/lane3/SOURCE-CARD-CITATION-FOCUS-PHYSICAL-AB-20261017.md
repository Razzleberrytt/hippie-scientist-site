# Lane 3 — actual 7-OH source-card focus A/B (2026-10-17)

**Research-only, existing draft PR #6831, no normal new WIP, mayPublish=false.** No merge, no accepted new atomic card, no premium verdict.

## Original real-media defect and autonomous treatment

Independent Lane4 measured the source card f822–937, ~3.9s, as near-static while its original speech WAV is almost silent. The screen contains critical PubChem citations, two CIDs, formula and source website; leaving enough reading time is necessary. From the CURRENT exact opening-corrected original film SHA **1e336488d39c7e070b7edefbad9e3fead26c4ad9cd86e1e487e717113ca5e8a0**, I rendered one **opt-in research-only reading-guide alternative** f821–937. A tiny accent advances from source CID to 7-OH CID, formula and source URL in a reserved left gutter (new pixels x<=58), with smooth entry/exit; the scientific text, timing, original chemical drawings and AAC narration are unchanged.

**Two experiments were deliberately REJECTED** in internal screen:
1. Colored citation underlines visibly crossed existing PubChem and chemical text at phone width.
2. RGBA automatic color-mode composite altered unrelated shots (914 outside-card frames, mean grayscale thumbnail MAE 1.25184/255).

The accepted *candidate for independent review*, NOT production, uses explicit YUV420 overlay to prevent color-space drift.

## Native physical verification

- New full H264/AAC SHA256 **033583d2b5ac41fe0dfedc0e7ad5bd815e6adde55ba7b230f68e6a70e10bdf61**; previous full film SHA **1e336488d39c7e070b7edefbad9e3fead26c4ad9cd86e1e487e717113ca5e8a0**.
- Actual strict FFmpeg full-film decoded **1,031 frames**, 1080×1920, 30fps each. Actual **807/807** AAC packet PTS/DTS/duration/size tuples identical; bit-exact original ADTS SHA **f0057c19c9d06b8a2f3c6d8fec948ca4555966114579fd1a48b0bcfccc84aa98**.
- Full native H264 source card 117 frames; **111/117** actual encoded frames have >30/255 changed pixels in research focus gutter x35–58 y710–1179. First/last frame clean return to original. No new claims or text.
- All **914 other frames** full actual decoded gray 96×170 thumbnails compared, outside-card mean MAE **0.00594242/255**, worst **0.01519608/255**. This is not pixel-by-pixel codec identity.
- Source-card native CID/formula/website text region x62–661, y710–1199: actual decoded grayscale mean MAE **0.0026875/255**, **99.97475%** of pixels differing by <=2/255, so original source text remains visibly unchanged at pixel research threshold.
- Local native-source contract regressions **6/6 PASS**, film H264/AAC replay PASS. The actual research renderer and tests match committed Git blobs **f6709f596a596cb189aaea3f20f7781762da428a** and **b759c6ec36983951652078106bcef129af6b50c3**. This does not substitute for GitHub hosted actual-media CI, qualified science review or actual phone.

## Shared-source receipt and release HOLD

Archive uploaded to ChatGPT Library at **/EvidenceMotion/EvidenceMotion_Lane3_SourceCard_Focus_AB_Research_20261017.zip**. Actual **5,741,899 bytes**, outer SHA256 **6994cbb4be47934b0dcd5b43a1cc0a529b047af719769a5837a2cae03278e615**, ZIP CRC + **20/20** payload SHA passes. Both full MP4s, original unmodified narrator WAV, original MOL, source/tests, physical reviewer code, 320/375/430px actual frame previews, native proof and rebound nine-shot research story inside. Physical proof SHA256 **a83952ff5b5f20d885f017bc536c1f0fd09f5dff94d912a93b09ae0c24305df6**; new current-film story SHA **9b2500be13ac976c630b556cd090f3ff3e634af89a104e1d8ad49f687361a540**.

Story's film SHA and present physical proof are current, but renderReceiptSha256 and phonePlanSha256 remain **null** to avoid laundering an older render receipt into a valid current phone plan. It is NOT COMPLETE intake. No changes to renderer runtime, protected merge, release, premium first-render or x/1590 completion.

**Next autonomous work:** Lane6 independently retrieve same exact archive and reconcile current story/source/mobile plan; Lane4 independently scrutinize native pixels, 320/375/430 safe zones and original-source card readability and determine if small focus accent adds enough craft value to justify it. Since cue x<=58, left-edge phone safety remains a critical independent check. L1/L2 check updated source/audio; L5 preserve original first-attempt ledger. If the improvement is marginal or adds safe-zone risk, **retain prior baseline** rather than ship cosmetic motion. Science, phoneme, real handset, human premium and publish gates remain HOLD.
