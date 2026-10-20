# 7-OH / original house voice — first complete voiced research cut (2026-10-13)

**Status:** RESEARCH PREVIEW / NOT RELEASED / CRAFT HOLD. No production imports, no new R version, no publishing permission, no GPU/laptop dependencies, no metered voice API.

## Provenance and reproducible voice source
- Canonical R8.05 creative brief with seven voiced/silent beats, staged as `scripts/distribution/voice-briefs/active.json` on `voice/7oh-director-review-20261013` (commit `01588d4ba780cb969a01d2c41acd655d1240b834`).
- Original unmodified house narrator: Kokoro ONNX 0.6.1, Kokoro-82M INT8, `am_michael`. Its model weights and voicebank were restored/verified from the project-owned pinned voice vault.
- GitHub Actions run: https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/38392496817 — **success**, downloadable artifact `ths-kokoro-narration` (artifact ID 11810611073, normal retention policy).
- Exact emitted WAV SHA-256: `434fca399f1ab74a12a5beb3da44373fe1117696b045ffd8026179df7bf14b34`. 24,000 Hz, mono, PCM16, **33.135333 seconds**.
- Duration-authoritative semantic beat boundaries (seconds): `[0.000, 3.5120, 9.4607, 15.2627, 22.0433, 26.6353, 29.8353, 33.1353]`, straight from the voice workflow's exact-WAV beat timeline; no time-stretch or target-length fitting. This is **beat-level** narration timing, not Montreal Forced Aligner word timestamps.
- Source science: pinned PubChem CID 44301524 molecular identity + RDKit ETKDG/MMFF *computed* illustrative conformation. Source-locked botanical artwork is generative illustrative atmosphere only; does not demonstrate actual 7-OH content in depicted leaves.
- Released full video: **none**. This is a candidate audition package.

## First review-only MP4 (conversation artifact, not committed)
- `7oh_KOKORO_V3_TIMED_RESEARCH_PREVIEW.mp4`
- Encoded SHA-256 `42aeefbe43623a326ab4819b1bfa5d30feb80f08fd166a05baa178c6e49b3895`.
- **540×960 / 15fps / 497 decoded video frames**, H.264 Constrained Baseline/yuv420p with AAC LC @48 kHz; complete FFmpeg decode succeeds without error. Video duration 33.133333 s; encoded audio duration 33.135 s, matching original voice within a frame.
- Seven purpose-assigned science scenes use the original voice's beat boundaries; the exact spoken beat sentences are visible as **beat-aligned** captions. The sound is not re-timed; no fabricated phoneme or word-alignment receipts are claimed.
- Instagram/TikTok phone safe-area treatment leaves roughly the lower 18% without essential content; science/source notes are in the central readable region. Actual phone UI playback is still untested.
- Generated using existing verified 7-OH VTK research footage frames and locked nonfactual botanical art. Visuals reuse source pixels rather than generatively reimagining the molecule.
- Portable renderer script and exact preview media are local **conversation artifacts**, not checked in, and no claim of GitHub exact-source rerender is made.

## Separate verdicts
- **Engineering:** Full file decodes and A/V durations align; Kokoro voice engine provenance/hash and source graph identity verified.
- **Scientific accuracy:** The brief deliberately avoids receptor affinity, potency, doses or clinical claims. Claim-level independent human science review still required; chemically correct identifiers are not a full editorial sign-off.
- **Craft:** **HOLD.** Three-dimensional molecule/source callout is legible, but repeatedly reuses a similar ball-and-stick subject, and lacks top-of-niche physical materials and art direction. This is a bridge to a better first-render treatment, not the owner's flagship-quality milestone.
- **Voice:** Real project-approved narrator model, but the *specific emitted performance* has NOT passed human ear-check for 7-OH / hydroxyl / mitragynine. Do not represent wave-identity QA as a listening verdict.
- **Phone:** Codec decoded and is nominally compatible; no claim of tested iPhone playback yet.
- **Owner:** no acceptance. V independent review: not performed. **0/1** excellent first render, **0/5** consecutive follow-ups.

## What should happen next
1. Owner listens to the exact WAV/MP4, especially 7-OH and mitragynine; reject and regenerate only the affected sentence-size audio if the pronunciation or naturalness fails. A regenerated WAV invalidates all prior aligned cut timing.
2. Review the mobile visual against the reference shelf; if still generic, design a genuinely different hero visual (not a repainted ball-stick layout) on low-res previz **before** a 1080×1920 native final.
3. After exact audio is approved, compute genuine word-level acoustic alignment (MFA) and use its original-WAV anchors for captions, action and cuts. The `audio-word-cuts.mjs` contract now assigns silent pauses to adjacent shots rather than leaving black intervals.
4. Run independent claim/craft/iPhone video QA; only then attempt **one** native 1080×1920 / 30fps first final master. A future good review preview does not count as first-render excellence.

Production version freeze remains in force. Research materials may be saved without modifying the production path.
