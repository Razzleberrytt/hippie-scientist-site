# Exact-WAV word timing: byte-bound research handoff

Existing owner: [#6743](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6743). Fixed inspected base: `0ed64d45a22be6e6e505d4d144bf1758ddb7edb4`. Research-only continuation; no runtime import, new D/R/A slot, production integration or publication. Version freeze was lifted; correctness/craft/device/publishing safeguards remain.

## Implemented behavior and limits

`exact_wav_alignment.py` imports a strict single-speaker, two-tier **long TextGrid** with `words` and `phones`, matched to exact 24 kHz mono PCM16 WAV bytes, a frozen transcript, dictionary and acoustic-model artifact. It consumes every TextGrid token and rejects incomplete/overlapping intervals, incorrect duration, missing/reordered/changed words, unknown words/phones and phone sequences absent from the pinned dictionary. This uses the existing narration-first `audio-word-cuts.mjs`; the new `proposeFileBoundAudioLockedCuts` entry point rehashes every input and reparses the TextGrid with the importer on each invocation. A newly rehashed report with fabricated word windows still fails. The older pure proposal API remains a supplied-contract helper, not byte verification.

Every candidate carries a revision bound to all five inputs, parser schema and word windows. Passing a previous revision after a source/model/dictionary/timing edit returns `STALE_CUTS_REALIGNMENT_REQUIRED` with no shots. A failed CLI invocation with a readable, noncolliding manifest replaces its old candidate report with HOLD and an empty alignment. The integration retains narration pauses; it does not stretch, regenerate, overwrite or shorten the voice. Negative word anchors now fail closed explicitly.

**Earlier importer-only boundary (PR #6791):** it did not run MFA. The execution below now does; the importer alone still cannot authenticate a submitted TextGrid. **Still unverified:** real-speech boundary accuracy; independent phonetic/stress/cadence calibration; final word cue acceptance; targeted sentence regeneration; production approval revocation. This importer cannot tell whether a TextGrid was manually fabricated. Even silent synthetic audio with structurally valid timing returns only `BYTE_BOUND_WORD_TIMING_CANDIDATE_REVIEW_REQUIRED`. A matched dictionary phoneme sequence is not evidence that those phonemes were audibly produced correctly. No pronunciation or checklist PASS is emitted.

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

The exact V5 MP4 and portable ZIP were not attached or found locally in the searched Downloads/Codex directories. The GitHub issue records them as prior-conversation artifacts, not repository binaries. No V5 frames, AAC sync, phone playback, native-render quality or clean replay was inspected anew. The importer has now consumed a genuine MFA result for this WAV in the continuation below; a calibrated scientific lexicon and independently checked boundary accuracy remain missing. Checklist stays **25/46**, quality milestones **0/1 and 0/5**.

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

## Actual CPU alignment and two full-narration treatments (2026-10-15 UTC)

The continuation executes MFA **3.3.8** `g2p` and `align_one`, using the recovered original WAV and exact creative-brief SHA `db95adc5dce3eb6e19c81719fec9222e3511856e85dbf862351ce231c8661ea8`. It verifies that all six brief sentences match the existing frozen script. No narration is regenerated. All input hashes are checked again after execution. The source WAV remains `9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435`.

Pinned official MFA assets (CC BY 4.0 model attribution: Montreal Corpus Tools; [model documentation](https://mfa-models.readthedocs.io/en/latest/acoustic/English/index.html)):

| Input | Release | Actual SHA-256 |
|---|---|---|
| English US ARPA dictionary | v3.0.0 | `e8c6c7b036ae2b7c78d2768b8dc6b1f9359175b842956d00b48c53c9c332e6b0` |
| English US ARPA acoustic model | v3.0.0 | `d35ce271ded357d833d2f4b8d1041dc3748b9538567ba13f2c697f4e4126711b` |
| English US ARPA G2P model | v2.0.0 | `f079ae88f792458fa7c123b256e5b86cc55c29ac2ffc457c673e6c60c36cd143` |

The base dictionary lacks `hydroxyl`, `hydroxymitragynine`, and `mitragynine`. G2P generated phone **candidates** for precisely those terms; these are not validated pronunciations. Local fresh run 003 completed both real model invocations with exit 0 (G2P 15.828s; align_one 12.016s), yielding **73/73 script words**, TextGrid SHA `fa65964b44635ff2300065ce34bc6ba86e0069bd9c360393eefd88366b28f373`, and alignment revision `a5b44de4c4b8a2386f5e8071f012d93bc45a3b07faec9c7767c0944afd1c4ad0`. The prior successful model run 002 produced the same TextGrid hash. Failed run 001 (incorrect G2P positional arguments) and the importer rejection from run 002 remain separate local failures, not successful receipts.

Real MFA word-tier `<eps>` pauses initially failed the importer. A regression reproduced that failure before repair. It now permits only those epsilon word intervals fully covered by empty/silence phones; unknown/speech phones in such an interval still HOLD. `<eps>` in the phone tier remains rejected. The natural 27.35–31.25s source-reading pause is retained.

| Term occurrence | Acoustic window (seconds) | Pronunciation verdict |
|---|---|---|
| seven O H | 0.56–1.62 | Uncalibrated; no audible confidence assigned |
| mitragynine | 2.11–2.92 | Uncalibrated |
| hydroxyl | 3.67–4.54 | Uncalibrated |
| seven-hydroxymitragynine | 7.19–9.13 | Uncalibrated |
| mitragynine | 9.46–10.27 | Uncalibrated |

`narration_locked_treatments.py` reuses the existing graph validator, editorial easing and byte-bound importer to render two genuinely different **new research candidates**, never claimed as recovered V5: light bond-diagram `atlas` and dark shaded computed-pose `specimen`. Six exact sentence captions and word highlights follow the actual alignment, preserving hyphenated scientific spellings and contractions. Source-reading hold remains in the real voice pause; all computed spatial views carry a computed-illustration disclosure, and cropped views say DETAIL VIEW. No botanical, receptor interaction or human-effect footage is introduced. Both full 34.347s previews draw at 540×960/30fps; `--native` is available for later 1080×1920 output, but no premium native final is awarded here.

Fresh local word-cued encoded previews:

- Atlas SHA `55c961cf7e04b4210b8ffd99db776baa99004eee88ab873c721dcf757114818b`, 26.203s render wall time.
- Specimen SHA `0722c7c4e88a8b055aae61918056c8de4b2af0ccfe3c4ac0a361d97996a7e7a5`, 18.203s render wall time.
- Existing native auditor, configured for these preview dimensions: **both PASS**, all **1,031** frames decoded, constant 30fps presentation timestamps, and both AAC elementary streams equal an independently encoded reference (SHA `1e12192a442f8d54650f76623b285e5759b15539b7fc9567e4556ab532cd5b5a`).
- Existing source-waveform audit: **both PASS**, 0ms relative lag, 100% active source-window retention, zero clipped samples, 0.99594 source-matched waveform correlation. Gain/latency-compensated limiting is explicitly declared; original bytes never change. Actual mastered output measured **−18.05 LUFS / −1.75 dBTP / 2.80 LU LRA**. These are signal checks, not listening approval.

The existing actual-ASR workflow is extended, not replaced: pinned CPU MFA, source-artifact restore, model hash checks, both actual preview renders, full decoding and signal checks, then 14-day research artifacts. Hosted execution and protected exact-head gates must pass before merge. Local tests: importer **15 cases, 14 pass / one Windows symlink capability skip**; acoustic preparation **7/7**; treatment scheduling/real chemistry **4/4**; existing JS cut regressions **8/8**. Linux must exercise the symlink case.

**Before the external-reference comparison below**, status was 25/46, 0/1 excellent master, 0/5 streak: real execution is a substantive advance, but independently validated scientific lexicon/boundary accuracy and accepted final cue integration remain open. Two rendered directions alone do not close the external-reference comparison or craft gate. The first visual inspection led to repairs for overlapping comparison labels, insufficient subject scale and near-full-scale audio peaks. Neither treatment has calibrated premium acceptance. The comparison below establishes one narrow process requirement; the current branch records 26/46, with protected merge still required to advance the merged baseline.

Additional store/privacy inventory: generated script/TextGrid/dictionary/receipts and full TTS-narrated previews go to the existing GitHub research artifact store for **14 days**; source WAV/model copies are excluded from that upload. Artifact deletion/expiry does not remove Actions logs or this task history. Local `.local` source/model/runtime/reference/candidate files have operator-managed retention and can be deleted separately after evidence escrow; no cleanup scheduler or listener/device data collection is added. External reference clips are private review inputs and are not uploaded or redistributed. Production imports, publishing, new normal WIP and reviewer impersonation remain absent.

## Actual reference comparison: one narrow previz requirement

Three public, creator-attributed excerpts (0–35s) were accessed for private research comparison, decoded with FFmpeg, and sampled at **1, 8, 16, 24 and 32 seconds**. These are frame/sequence samples, not a full audiovisual, scientific or calibrated aesthetic review. YouTube metadata confirmed channels and distinct video IDs. No reference footage is included in our videos or uploaded to GitHub.

| Reference | Creator / original URL | Private excerpt SHA-256 |
|---|---|---|
| How do Electron Microscopes Work? Taking Pictures of Atoms | Branch Education, [9DnnxvS6BBQ](https://www.youtube.com/watch?v=9DnnxvS6BBQ) | `4cd5b0be99bcd47cc6357a32254c3435e295d0ac7ac3579cca807f3e9776df1a` |
| What is a Protein? Learn about the 3D shape and function of macromolecules | RCSBProteinDataBank, [qBRFIMcxZNM](https://www.youtube.com/watch?v=qBRFIMcxZNM) | `7a0d464ce0581012bcd10cfdc866c2ababb17a837c0845dbda31091144314026` |
| What is a Protein? (from PDB-101) | RCSBProteinDataBank, [wvTv8TqWC48](https://www.youtube.com/watch?v=wvTv8TqWC48) | `8a6e6aa85590c32172229f48080e40d603384b4f0b56b67879020d64eccbf666` |

The reference shelf is three science explainers, including two distinct editions of one institution's protein lesson; it is not a representative Shorts/TikTok performance dataset. The official [PDB-101 lesson](https://pdb101.rcsb.org/learn/videos/what-is-a-protein-video) links the later video and [Branch Education](https://www.branch.education/videos) identifies its science/engineering video library.

Both actual candidate videos were fully decoded; candidate frames at **1, 4, 12, 18, 24, 29 and 32s** were extracted for the same private comparison. Findings from the inspected pixels:

- **Atlas:** a genuinely different light, flat bond-diagram treatment, with two distinct chemical records shown separately in the hook; stronger explicit structural comparison than Specimen. However, the stacked diagrams are small at preview scale and most later shots return to a repeated headline/diagram/caption arrangement. **Reject as premium final; retain as an explanatory diagram component.**
- **Specimen:** shaded computed spatial geometry, a slow camera change, declared detail crop and source-to-computed-view changes. However, the near-edge-on conformation weakens the OH teaching moment, the hero occupies too little of the canvas in whole views, and the same text scaffold repeats. **Reject as premium final; needs a better teaching angle and stronger scene progression.**
- **External anchors:** the Branch samples progress from atomic lattice to instrument to specimen/observed image; the PDB samples progress from varied recognizable protein examples to constituent atoms and an explicit element-color key. Those visible changes teach scale/representation and give context. Our candidates lack that range and payoff. No pixel similarity, invented audience score or solo-model positive verdict is used.

This establishes only the original **two distinct low-resolution previz candidates evaluated against a real reference shelf before a final native render** requirement. It includes actual video artifacts and a negative comparison verdict; it is not documentation-only credit and does not certify excellence, full-motion smoothness, calibrated reviewers, premium materials or independent correctness. No final native film was rendered from these rejected concepts. The merged research baseline advances **25→26/46 only after this batch passes exact-head checks and protected merge**; all other 20 gates and the 0/1, 0/5 milestones remain open. Reproduce previews with the recorded exact WAV, model/lexicon/alignment revision and renderer/font/runtime hashes; external reference clips stay private and may be re-encoded differently on later downloads.

## Native teaching-view and mobile repair continuation (2026-10-15)

This continues the same #6743 research owner after the acoustic/two-treatment batch. It reuses `narration_locked_treatments.py`, the two verified graph records and #6790's existing `phone_ui_audit.py`; no new renderer framework, production import, reviewer or publication right is introduced.

An actual native baseline (`b1a3b950bf2eb06c0081656d63e7a3632a366a5d0e9d531ddb1f4c917019dce6`) exposed 34px computed-image disclosure type. The existing native phone preflight correctly rejected that declared emitted font with `TINY_CRITICAL_TYPE`; this is a layout failure, not a real-phone observation. A source-geometry check also reproduced the edge-on view before repair. The renderer now derives a right-handed principal-axis camera basis, then faces the exposed side of the verified OH bond. It changes no atom identity or inter-atom distance and never reflects stereochemistry. Real RDKit graph/conformer tests check both compound identities, all pairwise distances and the positive camera-basis determinant.

Text annotation rectangles are now measured from the **same text/font/draw call that emits the pixels**, including every caption word. They are not separately hand-authored boxes. Disclosures use 38px type; the explicitly omitted hydrogens are disclosed at 36px, and the –OH detail is explained in plain language. The source title was narrowed to stay inside the existing conservative right-side exclusion. The renderer generates a native plan, validates it and runs the existing auditor on the actual H.264 frames. It preserves the original source-reading pause and exact narration timing. Camera/source files and fonts remain hash-bound and are rechecked after rendering.

Latest local native research candidate, **not original V5**:

- MP4 SHA **`b6926fa781ce50617f8d27ccd30fcc8e9e6c007f3b40f25f42b1d4596e54e3b2`**; pixels drawn directly at **1080×1920**, **30fps**, **1,031 frames**; local render/encode/overlay wall time **39.281s**. Hosting dollar cost is unknown.
- Existing exact-master auditor: **PASS**, full H.264/AAC decode and every constant presentation timestamp verified. AAC elementary stream equals the independent gain/limiter reference `1e12192a442f8d54650f76623b285e5759b15539b7fc9567e4556ab532cd5b5a`.
- Existing decoded-waveform audit: **PASS**, **0ms** lag, **100%** active voice-window retention, **0** clipped samples and **0.99594** source-matched waveform correlation. Original `9dca...9435` WAV unchanged. No resynthesis, sentence regeneration or stretching.
- Reused #6790 phone auditor: **OVERLAY_PREFLIGHT_PASS_REVIEW_REQUIRED**, **1,031 decoded timestamps**, seven shot-midpoint overlays plus two opening probes, all bound to the exact MP4. Actual decoded opening/detail/computed-view frames were inspected; the front-facing OH is now visible and critical text stays clear of the conservative exclusion zones.
- Focused treatment checks **6/6 PASS**, including real chemistry, right-handed rigid view and emitted native text layout; existing phone-audit tests **16/16 PASS**. The new geometry/layout checks failed before implementation. The workflow now additionally renders/fully decodes the native candidate and uploads its exact receipts and decoded overlays. Exact-head hosted CI/build and protected merge are still required.

A probe attempted before one local encoder had finished correctly held on the incomplete MP4; no successful receipt was issued. Validation was repeated only after the encoder exited zero. Intermediate camera/type experiments retain separate identities and carry no approval.

**No additional checklist credit:** the two-treatment process remains the sole 25→26 advance; this native repair leaves **26/46**, **0/1 excellent master**, **0/5 varied first renders**. The approved-source native-final, muted comprehension, pronunciation, science/craft and handset requirements remain open. Renderer-emitted annotations plus decoded overlays do not establish OCR, real app UI, human legibility, comprehension or physical playback. The craft remains held; no premium self-score is issued. Original V5 bytes remain unavailable, and the new identity is explicit.

Precise closure dependencies remain: independently labelled scientific-term acoustic/boundary ground truth; a qualified or demonstrably calibrated exact-claim/depiction review; independently calibrated full-video craft reviewers with positive/negative niche anchors; an accessible real handset; and subsequent accepted-master, production-admission and publication decisions. Existing primary-source access and real CPU media execution work, so neither a mandatory owner laptop nor a missing generic rendering framework is claimed as the blocker. Research artifacts retain the existing 14-day retention/deletion boundary above; no original WAV/model upload or external reference redistribution is added.
