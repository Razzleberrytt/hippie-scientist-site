# Exact-WAV word timing: byte-bound research handoff

Existing owner: [#6743](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6743). Fixed inspected base: `0ed64d45a22be6e6e505d4d144bf1758ddb7edb4`. Research-only continuation; no runtime import, new D/R/A slot, production integration or publication. Version freeze was lifted; correctness/craft/device/publishing safeguards remain.

## Implemented behavior and limits

`exact_wav_alignment.py` imports a strict single-speaker, two-tier **long TextGrid** with `words` and `phones`, matched to exact 24 kHz mono PCM16 WAV bytes, a frozen transcript, dictionary and acoustic-model artifact. It consumes every TextGrid token and rejects incomplete/overlapping intervals, incorrect duration, missing/reordered/changed words, unknown words/phones and phone sequences absent from the pinned dictionary. This uses the existing narration-first `audio-word-cuts.mjs`; the new `proposeFileBoundAudioLockedCuts` entry point rehashes every input and reparses the TextGrid with the importer on each invocation. A newly rehashed report with fabricated word windows still fails. The older pure proposal API remains a supplied-contract helper, not byte verification.

Every candidate carries a revision bound to all five inputs, parser schema and word windows. Passing a previous revision after a source/model/dictionary/timing edit returns `STALE_CUTS_REALIGNMENT_REQUIRED` with no shots. A failed CLI invocation with a readable, noncolliding manifest replaces its old candidate report with HOLD and an empty alignment. The integration retains narration pauses; it does not stretch, regenerate, overwrite or shorten the voice. Negative word anchors now fail closed explicitly.

**Not implemented or verified:** running MFA; authenticating the submitted aligner execution; real-speech boundary accuracy; independent phonetic/stress/cadence calibration; final word cue acceptance; targeted sentence regeneration; production approval revocation. This importer cannot tell whether a TextGrid was manually fabricated. Even silent synthetic audio with structurally valid timing returns only `BYTE_BOUND_WORD_TIMING_CANDIDATE_REVIEW_REQUIRED`. A matched dictionary phoneme sequence is not evidence that those phonemes were audibly produced correctly. No pronunciation or checklist PASS is emitted.

The [official MFA data-format documentation](https://montreal-forced-aligner.readthedocs.io/en/v1.0/data_format.html) describes word/phone tiers and unknown-word behavior; its [current alignment API](https://montreal-forced-aligner.readthedocs.io/en/v3.3.1/reference/alignment/generated/montreal_forced_aligner.alignment.CorpusAligner.html) supports long TextGrid export. This bounded importer accepts only that documented subset, no probability-column dictionary, multi-speaker tier, short TextGrid or silent alias/spelling repair. Scientific lexicon entries and the actual alignment require separately validated evidence.

## Replay

Place five immutable files beneath one staging root. A JSON manifest has exactly `wav`, `transcript`, `textgrid`, `dictionary`, `acousticModel`, each containing a relative `path` and lowercase `sha256`. Pin the exact reviewed artifacts; do not infer a verified acoustic model from a filename. All path components must stay inside the root without symlinks. Maximum input sizes: 10 MB per WAV/transcript/TextGrid; 100 MB per dictionary/model. Maximum voice duration: 180 seconds.

```powershell
python research/evidencemotion-director/exact_wav_alignment.py --root <staging-root> --manifest <manifest.json> --out <candidate.json>
python -m unittest discover -s research/evidencemotion-director -p test_exact_wav_alignment.py -v
node --test research/evidencemotion-director/audio-word-cuts.test.mjs
```

The file-bound JavaScript entry point takes `root`, `reportPath`, independently pinned `expectedReportSha256`, `expectedInputSha256`, `manifest`, existing `beats` and `scienceManifestSha256`; supply the prior revision when attempting to reuse cuts. Python 3.12+ and Node 22+ suffice; no new package, GPU, service, owner laptop or paid model dependency. A failed handoff supplies no cuts. Publication remains false even when a candidate is generated.

Rollback: revert the importer, file-bound entry point and scoped workflow additions; existing production renderer is unaffected. Keep failed receipts separate from previously accepted artifacts. Never reuse candidate cuts as calibrated final cue timings.

## Genuine recovered source and evidence boundary

The original audio is recoverable from [successful narration run 38417454106](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/38417454106), artifact `ths-kokoro-narration`, ID `11824648580`, expiry `2026-11-12T14:56:40Z`. A fresh local download verified WAV SHA `9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435`, **824,336 samples / 34.34733333333333 seconds**, mono PCM16 at 24 kHz. Fresh FFmpeg loudnorm measurement of the **original unmastered WAV**: **-27.71 LUFS**, **-7.71 dBTP**, **3.30 LU loudness range**. These are source measurements, not a V5 mastered-AAC audit or naturalness judgment. No audio file was changed.

The existing [successful ASR run 38506807636](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/38506807636) has a recoverable receipt artifact `11868256156` expiring October 19, 2026. Downloaded report SHA `ccdc1cbaca624d97b0d8754b4a9aa840f2bf8483469d98b96bdd1db93c46e8f1` refers to the same WAV. Its existing ASR estimates include “Mitrogenine” at **2.24–2.98s / 9.54–10.50s**, “hydroxyl” at **3.84–4.62s**, “hydroxometrogenine” at **7.68–9.18s**, and “poles” at **17.80–18.34s**. These are archived recognition uncertainties, not confirmed pronunciation failures or freshly executed ASR in this batch. Do not feed those estimates into certified cues or regenerate the voice solely because ASR misspelled a name.

The exact V5 MP4 and portable ZIP were not attached or found locally in the searched Downloads/Codex directories. The GitHub issue records them as prior-conversation artifacts, not repository binaries. No V5 frames, AAC sync, phone playback, native-render quality or clean replay was inspected anew. The importer has not run on a genuine MFA result for this WAV; a calibrated scientific lexicon and independently checked real alignment remain missing. Checklist stays **25/46**, quality milestones **0/1 and 0/5**.

## Validation and privacy inventory

Local focused results: **14 Python cases: 13 pass, one symlink test skipped** because this Windows host denies symlink creation; **8/8 JavaScript tests pass**. The Python suite includes actual on-disk PCM fixtures and a Python→Node integration, changed-byte checks for all five artifacts, stale revision, forged timing-report refusal, and failed-output invalidation. Independent GitHub review identified an uncaught `EOFError` when a newly rehashed WAV contains a partial RIFF header; its regression failed before repair, then passed after the CLI was made to overwrite the old report with HOLD. Fixtures are synthetic and cannot establish real pronunciation or timing accuracy. The existing audio-screen workflow now runs these tests on Linux, where symlink behavior must also pass. Exact-head hosted checks and production build are separate release evidence, not implied by local tests.

This field/store map uses code/schema metadata and synthetic test records. It does not collect listeners, microphone recordings, device identifiers or personal-data samples. Custom transcript content is not represented as anonymized.

| Fields / artifact | Purpose | Stores | Retention | Deletion path / limitation |
|---|---|---|---|---|
| Manifest relative paths + five SHA values | Reproduce and reject stale inputs | Caller staging files; process memory | Caller controls staging lifecycle; no automatic local expiry | Delete caller-owned staging manifest/files when no longer needed; upstream artifact retention is independent |
| `sampleRate`, `sampleCount`, `durationMs` | Exact original narration time base | Candidate report; process memory | Same caller report lifecycle | Delete report; importer creates no database/cache copy |
| `wordAlignment[].word`, word/phone times and labels | Inspect and derive candidate word cues | Candidate report; process memory | Caller decides; no automatic local expiry | Delete report and any downstream EDL separately; no full transcript in CLI stdout |
| `inputSha256`, `revisionSha256`, status/limitations/false approval fields | Bind evidence, invalidate stale cuts, prevent certification claims | Candidate report and CLI metadata output | Shell/task logs follow host retention; local log expiry not enforced | Delete local reports/logs via host facilities; do not claim deleting report removes task history |
| Synthetic PCM/TextGrid/dictionary/model placeholders | Adversarial tests only | Temporary test directory | Python `TemporaryDirectory` cleanup at test end | Cleanup callback; crash leftovers follow host temp retention |
| Original narration + source receipts | Original-source escrow/replay | Existing GitHub artifact; local research download | Existing GitHub artifact expiry above; local copies require explicit cleanup | Existing GitHub artifact deletion/expiry; delete local copy separately; this batch uploads no source audio |
| Existing ASR receipt | Prior-run recognition uncertainty provenance | Existing GitHub artifact; local copy | Existing GitHub 5-day retention | Existing artifact deletion/expiry; delete local copy separately |

No new remote data store, listener/device identity field, retention scheduler or source-audio upload is introduced. The scoped CI runs synthetic records without uploading candidate reports. Local staging is an operator-managed store, not an enforced privacy-retention system.
