---
name: em-tiktok-producer
version: 3.0.1
description: Standalone, authentic EvidenceMotion TikTok/Shorts production. Trigger on "EM video:", "make a TikTok with EM", and "EM TikTok Producer". Source-check, resume previous work, recover the pinned original voice, render exact master and verify before delivery.
owner: The Hippie Scientist
upgrades-from: 2.0.0
---
# EM TikTok Producer v3 — quality and completion-first
This supersedes the Library v2 instruction file; it does not upgrade the Kokoro binaries, internal render engine, or remote services.

## Scope and defaults
- Standalone **production only**, not EvidenceMotion Lane 1/2 engineering, the 1,590-card backlog, any PR or scheduler. Isolate in `productions/<YYYYMMDD-topic>` or a disposable local folder and keep canonical repo unmodified.
- Default: 30–55 seconds, 9:16 1080×1920 at 30fps; original source-verified narrative, native 2.5D/3D purposeful visuals, H.264 video / 44.1-kHz stereo AAC audio, phone-readable karaoke captions, native upload by user.
- Five **maximum** TikTok hashtags. Give one strong short description, cover suggestion, source ledger and release proof. Do not auto-post.

## Start by resuming, not restarting
- Search authorized previous Library/conversation/local job checkpoints and reuse hash-matched, still-relevant narration, claims, storyboard, assets and receipts. Re-verify changing law, medicine and science before reusing claims.
- Mark old silent/previews `REVIEW_ONLY`; do not elevate them because they have dimensions/fps.

## Production stages
1. **Claims.** Browse dated primary sources for law, regulation and breaking research; record event/publication/effective dates, jurisdiction, study type, sample, directness, null findings and legal status. Distinguish proposed/final/in-force/blocked. Emit `claims.json` IDs, exact authorized phrases, prohibited inferences and URLs. Neither legal status nor mechanism alone demonstrates safety/efficacy. Respect newer AAP 2026 `Digital Ecosystems, Children, and Adolescents` when covering toddler screen-time, not superseded 2016 policy.
2. **Story lock.** Test up to three different evidence-safe hook concepts, select a single factual hook with visible visual teaching transformation in first **3 seconds**, then write final voice-first script and 2+ different teaching actions. Reveal finding promptly, show key qualifiers and source cues. One core audience question per video; beginner terms explained.
3. **Runtime preflight.** Detect checkout/current source SHA; inspect actual CLI help and voice-vault provenance. Original voice only: `kokoro-onnx==0.6.1` with pinned SHA-verified `am_michael` Kokoro INT8/voicebank, with correct `kratom` pronunciation = “kray-tum”. If assets missing, attempt documented approved local/official pinned-archive recovery and hash-check **both** files; install pinned local deps only in isolated venv if allowed. Never substitute generic hosted TTS/system Flite/cinematic stock generator.
   **Cross-session runtime recovery:** A fresh ChatGPT container is not an approved production worker. Before local synthesis run `python scripts/distribution/voice-runtime-readiness.py --vault "$THS_VOICE_VAULT"`. If it reports HOLD (e.g., Python 3.13, missing ONNX Runtime, espeak-ng or offline package installation), stop local synthesis attempts and use the **existing GitHub-hosted** `kokoro-voice-production.yml` with the approved brief on an isolated `voice/<video-job-id>` branch. First exercise its `runtime_canary=true` manual mode for a fresh-runner check if needed; get the workflow's exact WAV and receipt after successful job. Do not treat a canary as a full video. Follow `docs/original-voice-production-runner.md` and maintain original asset SHA and acoustic alignment requirements. If the GitHub worker or artifact retrieval is blocked, emit an explicit HOLD packet; never claim the recurrent narrator problem is repaired without a successful fresh-runner canary **and** a real voice-job run.
4. **Render.** Use current repo's authentic EvidenceBridge → StackPilot → Asset Director → EvidenceMotion → original THS Voice Engine → PerceptualQA → PublishOps interfaces, checked against actual filenames/usage. Synthesize voice, listen for pronunciation, obtain real acoustic word-level alignment from actual waveform (never guessed durations), then compose narration-synchronous semantic visuals and karaoke timings. Synthetic symbolic 3D must be labeled when appropriate; no fabricated receptor/mechanism claims.
5. **Exact-master QA.** Inspect newly encoded bytes; ffprobe true 1080×1920, 30fps H.264, 44.1kHz stereo AAC; waveform duration, caption match, visual semantics with subtitles muted, first 3 seconds, citations, safe areas, true peak/loudness, scene black frames, 4fps karaoke pixel sampling and beginning/mid/end frames. Run repository QA + independent spot checks. If failing, bounded repair of **job inputs**, rerender and recheck latest master; don't alter engine or stale receipts.
6. **Deliver.** Require actual master SHA, source/claim ledger, `caption.txt` + ≤5 hashtags, storyboard, pronunciation proof, QA and review status. Ship native MP4 + ZIP when honestly verified. A machine QA PASS is `READY_FOR_OWNER_REVIEW`, not `READY_TO_UPLOAD`; final upload requires owner approval/phone check. No `V_VERIFIED` without independent V proof.

## Fail-closed checkpoints
Status enum: `RESEARCHING`, `SCRIPT_READY`, `RUNTIME_RECOVERY`, `VOICE_READY`, `ALIGNMENT_READY`, `RENDERED_REVIEW_ONLY`, `READY_FOR_OWNER_REVIEW`, `READY_TO_UPLOAD`, `BLOCKED_PREPRODUCTION`.
If unavailable tools, network, pinned assets, correct provenance or review prevent final master, preserve checkpoint/job JSON with source URLs, stage, working files, hashes, attempted recovery and next executable command. Deliver explicitly labeled `PREPRODUCTION_ONLY` ZIP, **not** a fake finished video. The existence of any MP4 proves nothing about voice authenticity or readiness.

## Fail-closed action
- **Trigger:** The pinned original voice/voicebank, claim provenance, real EM renderer, acoustic alignment, exact-master QA or owner approval is unavailable.
- **Action:** HOLD release and publishing; preserve checkpoint and labeled PREPRODUCTION_ONLY or REVIEW_ONLY artifacts with exact missing prerequisites and no READY_TO_UPLOAD claim.
