# EvidenceMotion: autonomous real-audio signal reviewer (research pilot)

**Scope:** continuation of EvidenceMotion owner ticket #6743. No new product version, production admission, paid model, owner/laptop dependency, scheduled background automation or permission to publish scientific claims. The 24/46 checklist and 0/1 + 0/5 first-render freeze remain intact.

The owner wants AI to diagnose and eventually approve video quality, narration and source accuracy **without routine owner or outside human verdicts**. The proper implementation order is autonomously identifiable defects first, followed by calibrated **positive** speech/science/art review on actual recordings and clips. Neither synthetic consensus nor a hash-only identity record can qualify.

## What this code measures from actual files

`autonomous_voice_signal_audit.py` compares **decoded original WAV speech with the actual decoded AAC or PCM mastered audio**, not a submitter's asserted metrics. Requires the exact original WAV hash and target final media hash, original 24 kHz mono PCM16, one real audio stream, bounded 1–180-second media, FFmpeg decoded PCM **capped at 181 seconds before buffering** (rather than relying on a timeout or container metadata). Signal analyses use 20-ms RMS speech windows and estimate up to 100-ms timing lag. Rejects:

- Absent/mismatched source or mastered media, unsupported/empty audio.
- Master performance more than 150 ms different in duration, over 35 ms delayed, or inconsistent original-vs-mastered speech energy (<0.96 envelope correlation).
- More than 4% of original active speech windows effectively muted or missing (accounting for normal overall mastering gain).
- Excessive samples close to PCM full-scale (0.99 peak threshold), **or nonlinear flat-topped waveform shape even if earlier clipping was subsequently attenuated**. Compares three high-energy 0.7s source segments against the mastered waveform with a bounded ±20ms waveform aligner (minimum matched waveform correlation 0.975). Also rejects severely under-gained mastered source speech.

The emitted JSON records the exact input hashes, duration, peak and clipped fraction, timing lag, energy correlation, speaking-window retention fraction, and specific repair reasons. The code can issue **AUTO_REVISE_AUDIO** without the owner listening to a malfunctioning file, or **MECHANICAL_AUDIO_PASS_SEMANTIC_SPEECH_AWAIT** if that *one narrow class* of defects is absent.

### Recorded genuine initial 7-OH finding

The exact source 34.347333-second Kokoro WAV SHA `9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435` was compared to the decoded AAC track from the actual Treatment B 1080×1920 review film SHA `5a3ba3313a091fd745bd9cab6764b644fbe97b38a0aaac05217f8a0752059550`. Early 20-ms speech-energy comparison found ~0.9924 Pearson correlation and no detected clipping at the 0.99-amplitude threshold. **This is not a guarantee of spoken accuracy, fluency, expressiveness, or native speaker quality.**

### Tests and deployment constraints

A path-scoped, remote GitHub-hosted job constructs actual synthetic PCM speech-like bursts and encodes them to AAC via FFmpeg. It checks the actual decoded gain/timing comparison, then injects an actual muted speech segment, clipping, **clipping attenuated below digital peak after the distortion**, truncated narration, a real 181.5-second oversized AAC master, stale hashes, unsupported sample rate and a real silent MP4 with no audio. The runner cannot reproduce the owner's original WAV/MP4 because those assets remain in conversation artifacts and are not included in the GitHub repository. Do not claim the CI test itself audited the private 7-OH recording.

This pilot is **not connected to production release control**. The existing canonical `native_master_audit.py` and audio-mastering checks remain authoritative for media-level timing, AAC stream bytes and loudness. This narrower PCM tool adds actual active-speech dropout and source-envelope assessment; it does not replace or bypass existing checks.

## Next independent speech and science work

1. Add a trusted offline or explicitly approved cost-bounded **actual ASR + word/phoneme aligner**, with a scientific-name pronunciation dictionary and reviewer-calibrated false positive/false negative measurements.
2. Run on actual decoded WAV and mastered media, comparing exact spoken captions to the frozen canonical script and at-risk scientific words. Detect deletions, additions, mispronunciations and prosody deviations with audio evidence/time ranges; do not falsely claim ASR output verifies human-quality speaking.
3. Separate original-source identity and publication claims. The science reviewer must retrieve complete primary-source evidence and evaluate directness, study design, contradictory results and uncertainties for each claim. Neither named PMIDs nor a model's confidence alone prove a treatment claim.
4. Use two demonstrably independent **full-video** aesthetic critics calibrated against a stable reference shelf and real failure examples. Candidate PASS is allowed for *review quality only* once their invocation evidence and calibration prove it; publication authority remains under existing release control.

An autonomous non-rejection from this tool does not advance the creative checklist; update the relevant canonical checklist only after an exact matching completed requirement is earned.
