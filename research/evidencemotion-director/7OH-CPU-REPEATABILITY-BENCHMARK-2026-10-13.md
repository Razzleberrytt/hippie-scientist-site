# EvidenceMotion 7-OH: actual bounded CPU rendering reliability experiment (2026-10-13)

**Research-only CPU benchmark, NOT a public video release, a production runner SLA or an artistic score.** This experiment uses the existing frozen 7-OH deterministic chemical/source renderer without a new EvidenceMotion R version.

## Reproducible source and bounded method

- Input archive: `EvidenceMotion_7OH_Intermediates_Provenance_RESEARCH.zip`, SHA-256 `2c2d06028e86978ce6799f58c5476a881144cff623322c3339f2d9c83ffe0618`.
- Existing renderer source: `original/build_fullhd_matchcut.py`, SHA-256 `7b3233673cb1d69fadd3abc7e98a659236895eeb1f582b1d3eb9cdb94c80de69`.
- Unmodified narration source WAV input: SHA-256 `9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435`.
- Current *different* captioned/AAC full-HD review candidate remains SHA-256 `d2aff53b7a18c32eb6c4ee9d60fd3bb216593d897b730f5ebf58086dd2a71e51`. The benchmark outputs here are **silent source pictures**, not claimed replacement mastered videos.
- Executed independently in **three fresh temporary source directories**, SHA-checking the archive, exact original script and WAV before running. CPU software VTK used `VTK_DEFAULT_OPENGL_WINDOW=vtkEGLRenderWindow` and `LIBGL_ALWAYS_SOFTWARE=1`, without requiring a GPU/laptop.
- `/usr/bin/time` measured wall seconds, combined user/system CPU seconds and peak resident KiB; `ffprobe` checked each output is H.264 1080×1920/30fps/1031 frames, then FFmpeg fully decoded it with `-xerror`. No source script was modified between attempts.

## Actual results

| Run | Full decode / geometry | Wall time | User + system CPU | Peak RSS |
|---|---|---:|---:|---:|
| 1 | PASS | 58.57 s | 1.6297 CPU min | 657.66 MiB |
| 2 | PASS | 63.27 s | 1.7477 CPU min | 658.03 MiB |
| 3 | PASS | 61.30 s | 1.7285 CPU min | 658.45 MiB |

- **3 of 3 cold local renders PASS**, observed run failures **0/3**. Median wall time **61.30s**, observed min/max **58.57–63.27s**, total wall time **183.14s**. Peak resident memory **658.45MiB**. Total **5.1059 CPU minutes**.
- All three rendered **exactly the same silent-MP4 SHA-256**: `f7e81c428e19b6b7b426fb3d88f7a4e138795be136e0d1ed500014f7973f1c21`. Earlier October 13 single-render benchmark independently recorded the same SHA, but its **88.24s** wall time reflects another scheduling/load snapshot; do not combine those runtimes into a known provider SLA.
- The three repeat videos contain source-defined real native 1080p frames (not a 540p upscale), and complete decoding passed. The measured bytes are those of the **unmastered silent source renderer**: audio/captions from the separate final review cut are not regenerated in this benchmark.
- No paid creative-model API was invoked: observed external generation-API bill **$0**. CPU usage is a real resource **cost**. Actual cloud hosting price or marginal charge is **UNKNOWN** without a provider bill/rate; estimated cost requires the explicit instance price × total wall hours, not an invented total.
- **Observed failure fraction 0/3 is NOT an estimate of production/long-term reliability**. Same runner and source across all three attempts; no cold infrastructure outage, different subject, parallel load, TikTok/YouTube publication, codec compatibility on iPhone, or CI runner billed rate is measured.

## Reuse and fail-closed gates

- [repeat_cpu_render_benchmark.py](repeat_cpu_render_benchmark.py) accepts a private source ZIP and a bounded attempt count (1–10), refusing SHA-drift and recording a receipt even if a child renderer errors.
- [test_repeat_cpu_render_benchmark.py](test_repeat_cpu_render_benchmark.py) includes 13 negative/contract tests for native geometry, truncation, missing streams, exact identical MP4 hashes across all runs, fail-closed incomplete receipts, missing/nonfinite resource measurements, explicit Linux renderer process-group termination after timeout, unknown billed rates, and forged source ZIP.
- Path-scoped GitHub CI runs the **13 fail-closed unit regressions**, **not** the 3 expensive full source renders. Unfinished partial artifacts must stay HOLD, and only the completed, same-hash batch can PASS. The original three cold renders were independently observed with identical hashes; the corrected harness adds enforcement for future runs. The actual 3-run receipt is also provided separately as an exact downloadable conversation research artifact.
- The research helper uses no dedicated GPU or laptop; optional image/voice models remain prohibited until separately justified by spend/quality proof.

**Checklist disposition:** the *research CPU-runner benchmark* requirement is supported with explicit runtime, CPU-minutes, memory, observed failure fraction, compute budget and transparent unknown hosting price. This does not prove production-fleet reliability, 1+5 excellent first renders, owner listening, phone compatibility, source-qualified scientific peer review or craft approval. Freeze ON, no upload or production invocation.
