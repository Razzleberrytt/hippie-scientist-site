# EM-014.01 — five actual original-WAV scientific term intervals

2026-10-16. Scope: enumerate the 7-OH, hydroxyl, mitragynine and 7-hydroxymitragynine spoken instances and extract exact PCM review clips from the locked original WAV. This **does not** establish pronunciation correctness, stress/naturalness, phoneme alignment calibration or voice approval. Canonical EM-014 is OPEN.

**Original narration:** source SHA-256 `9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435`; source format 24,000 Hz, 16-bit mono PCM; 824,336 source frames. Frozen alignment revision `2414833bfd35c18ad6c629c3d10cbfab8501b09e296cc1963db01638b854bbaf`. The existing five-input manifest, `source_check`, `inspect_alignment`, `inventory` (73/73 locked words), and original MFA term finder are reused, not reimplemented.

**Actual hosted execution:** [run 38899936929](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/38899936929), implementation head `e17c7dac4cf22342724b3b3842ba2456bf55f68e`: five new term-isolation tests PASS; the actual original-WAV/MFA term isolation step PASS; six-file [term-window and clip artifact #12045312965](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/38899936929/artifacts/12045312965) uploaded. ZIP SHA-256 `c04f8936145b6df9b5a4bf9810f2c200239fc62f59de1fd49a99782c57077792`; `term-windows.json` SHA-256 `0f02daec08b3e97cc1fca7d33fda21fe15db8aeb70057f95b9242451c7a16752`.

| Source term instance | MFA candidate interval | Exact PCM sample interval [start,end) | Independently checked |
|---|---|---|---|
| 7-OH | 0.56–1.57 s | 13,440–37,680 | PASS |
| mitragynine (first) | 2.11–2.92 s | 50,640–70,080 | PASS |
| hydroxyl | 3.67–4.54 s | 88,080–108,960 | PASS |
| 7-hydroxymitragynine | 7.19–9.13 s | 172,560–219,120 | PASS |
| mitragynine (second) | 9.46–10.27 s | 227,040–246,480 | PASS |

**Independent artifact check:** downloaded that six-file artifact and the earlier original pinned `ths-kokoro-narration` artifact [run 38417454106](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/38417454106), confirmed original full WAV SHA and header; decoded all five clip WAVs, verified each clip's SHA-256 and frame rate/count from JSON, and compared every extracted 16-bit PCM byte directly with `original_pcm[2*startSample:2*endSampleExclusive]`. **5/5 exact matches**, no alteration to the original audio. These are candidate MFA boundaries; no human listening observations were supplied.

**Negative regressions:** tests reject missing, duplicated/altered term words, altered original WAV identity, overlap or negative candidate boundaries, nonfinite/out-of-range timing, incomplete PCM and false sample indices. Five hosted unit tests PASS on the recorded source head. Keep separate later EM-014.02–06 requirements for pronunciation lexicon, stress/phonetic evaluation, real listener calibration and term verdicts.

| Card | Decision | Narrow research-only receipt |
|---|---|---|
| `EM-014.01.U` | VERIFIED_MACHINE_RESEARCH | Exactly five candidate spoken instances, stable ids and original token indices |
| `EM-014.01.S` | VERIFIED_MACHINE_RESEARCH | Original WAV, pinned source SHA, original MFA five-input manifest and frozen alignment |
| `EM-014.01.O` | VERIFIED_MACHINE_RESEARCH | Predeclared full term count and lossless original-sample extraction invariant |
| `EM-014.01.X` | VERIFIED_MACHINE_RESEARCH | Actual hosted source-WAV execution and downloadable six-file artifact |
| `EM-014.01.T` | VERIFIED_MACHINE_RESEARCH | Independent original-WAV SHA and five exact PCM sample-slice comparisons |
| `EM-014.01.N` | VERIFIED_MACHINE_RESEARCH | Five hosted tests including hostile missing/stale/timing/PCM cases |
| `EM-014.01.R` | VERIFIED_MACHINE_RESEARCH | This hash-linked GitHub receipt, source code and persistent artifact link |

One child inventory/isolation task satisfied; the parent EM-014 is OPEN. Seven separate machine-research cards are credited only once (40 → 47); provisional total 747 → **754/1,590 (47.4214%)** (707 inherited foundations not individually audited). Full current PR head CI/build, protected merge, science review, calibrated voice/listening, craft, device and real viewers remain HOLD; `mayPublish=false`.
