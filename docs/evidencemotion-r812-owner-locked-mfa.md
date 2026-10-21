# EvidenceMotion R8.12 — owner-selected exact-WAV MFA candidate

**Status:** genuine source-locked offline MFA research result, **not certified caption timing or a video**. Existing owner issue [#6732](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6732); merged voice hardening [#6944](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6944). No new R-version, scheduled pipeline, release gate or publication right.

## Durable source escrow, not an expiring Actions dependency

The owner accepted the full original Kokoro `am_michael` WAV for preproduction on 2026-10-21. Exact WAV SHA-256: `82e94ea07dd28cd16ab86e0bd6b14c57dade0391583d31f03f36578813c7f6a1`; **938,368** frames, 24,000-Hz mono PCM16. Preserve the original generation receipt's `humanAuditoryReview=pending`; the distinct chat decision is recorded in #6732 and does not approve acoustic word boundaries.

**Owner Drive voice vault, original ZIP (verified by authenticated download-back):** [original audio and original receipt](https://drive.google.com/file/d/1VHm_h5D9rcXDXs_oqAugGVokrl-bls87/view?usp=drivesdk), `THS_R812_OWNER_SELECTED_EXACT_WAV_82e94ea0_SOURCE.zip`. The ZIP contains `r812-mitragynine-authentic-voice-REVIEW.wav` and `r812-mitragynine-authentic-voice-REVIEW.receipt.json`. After download, verify the actual uncompressed WAV hash and frame count. Do not silently regenerate from the model: other same-text original Kokoro outputs have different WAV hashes.

**Owner Drive voice vault, historic real MFA evidence:** [93-word acoustic output with 10 TextGrids](https://drive.google.com/file/d/1lrqI1oG2U-__2m9yhL1x9Ss2HWNwV0ro/view?usp=drivesdk). From authentic [run #39601946785](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/39601946785), artifact #12346079426, all 93 word identities in the right ten-scene order. Its combined word start/end are full-master-relative; **its old nested phone hypothesis times are scene-relative**, so do not treat those nested values as full-master timestamps. This PR's adapter rebases nested phones in *new* runs and labels them full-master absolute.

The short-lived `gh run download 39525077773` test dependency is deliberately **not retained** in permanent GitHub workflows. Automatic CI should not break merely because that artifact expires after 30 days. Existing R8.12 house narrator production workflow remains unchanged. The source is recoverable privately from the user-owned Drive archive; a future run needs operator-provided authenticated restore, not a public/unguarded Drive share or a new GitHub production token.

## Repeat real acoustic alignment in a properly equipped checkout

Use the existing repo's pinned CPU MFA `3.3.8` (same setup and *official* English US ARPA dictionary, acoustic, and G2P model releases/pins as `.github/workflows/evidencemotion-actual-asr-research.yml`). This job uses **real local MFA**, not word-length guesses or an online speech service:

```bash
# Unzip the archived original source ZIP into a fresh directory, retaining originals.
sha256sum SOURCE/r812-mitragynine-authentic-voice-REVIEW.wav
THS_R812_SOURCE_DIR=SOURCE python -m unittest discover \
  -s scripts/distribution -p test_r812_owner_locked_mfa_candidate.py -v

python scripts/distribution/r812-owner-locked-mfa-candidate.py \
  --source-dir SOURCE \
  --dictionary MODELS/english_us_arpa.dict \
  --acoustic-model MODELS/acoustic.zip \
  --g2p-model MODELS/g2p.zip \
  --out NEW_UNUSED_CANDIDATE_OUTPUT_DIR
```

The adapter rejects anything but the SHA-pinned approved WAV, wrong historical receipt, changed voice, altered silence, scene boundary drift, changed model pins/runtime, corrupt TextGrid, unaligned/OOV words, or any changed/reordered transcript. It writes ten scene TextGrid-derived byte-bound reports and a whole-master word candidate, but never mutates the selected WAV. New outputs use exclusive distinct directories; no overwrite. Nested phone hypotheses and word boundaries both refer to the **full master timeline**.

## Non-negotiable limitations

MFA estimates are research acoustic *hypotheses*, not a listener-calibrated declaration of what the narrator pronounced. **Five source words required G2P candidates:** `craytum`, `itraconazole`, `mitragynine`, `opioid`, `pretreatment`. `craytum` is only a pronunciation-input alias; public-facing captions must spell *kratom*. The distinct spoken `seven o h` / `d e a` tokens need separately checked display grouping.

Human word onset/offset review, stress/phonetics, narrative/CTA currency, 2019/2024 evidence claims, science/craft decisions, final rendered H264/AAC mobile phone review and public publishing remain HOLD. The owner accepted the original audio overall, not the aligned captions. First accepted excellent film remains **0/1**. The completed source archive and archived MFA research do not confer /1590 workcard completion.
