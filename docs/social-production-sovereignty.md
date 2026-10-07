# THS R8.04 — Sovereign Social Production

## Status

R8.04 is the canonical production-infrastructure rule for new THS social artifacts. It inherits the evidence, craft, profile, continuity, and perceptual-quality contracts from R8.03 and adds one non-negotiable operating constraint:

> A releasable THS social artifact must be producible end-to-end without a paid membership, metered generation credit, or premium external editor.

This is a production-sovereignty rule, not a ban on the internet or on first-party platform APIs. External services may be used only when they are optional and cannot become necessary to create, narrate, render, master, QA, package, or manually publish the artifact.

## Canonical path

EvidenceBridge → StackPilot → Asset Director → EvidenceMotion → Voice Engine → PerceptualQA → PublishOps → manual native upload → FieldLab.

First-party platform APIs may exist as optional adapters underneath PublishOps, but manual native upload is the baseline transport. Third-party schedulers are not publication authority.

## Local/self-hosted responsibilities

### Evidence and script
- EvidenceBridge remains the scientific-permission authority.
- Script, qualifier, evidence-class, source, and pronunciation packets are plain local artifacts.
- No provider owns canonical scientific state.

### Narration
- Voice Engine must synthesize and master locally with an open-source/local model or use an authorized human recording.
- Generate multiple local takes and select against Natural Presence, pronunciation, pacing, phrase-final contour, qualifier emphasis, and loudness/signal QA.
- A basic OS/system voice is not an acceptable production fallback.
- If the local voice cannot meet the quality floor, the release is blocked until the local path is repaired, regenerated, or replaced with an authorized human recording.

### Visual assets and motion
- Asset Director and EvidenceMotion must be able to build the releasable visual path from locally authored SVG/vector/type/diagram/chart/molecule/receptor/image assets.
- Hosted image/video generation can never be required to complete a canonical production.
- Generic stock filler is not an allowed substitution for failed generation.

### Composition and mastering
- Composition must be reproducible with local tools and FFmpeg-compatible media.
- Captions, timing, motion, transitions, audio mix, loudness, cover, and 9:16 export are part of the local production packet.
- The exact final MP4 is the QA subject.

### QA
- PerceptualQA operates on the exact encoded artifact.
- Sound-off viability, sound-on superiority, one-second cold read, random scrub, evidence drift, compression loss, UI-safe placement, and Natural Presence remain blocking.
- Provider preview quality cannot satisfy an artifact-bound gate.

### Packaging and publication
- PublishOps emits the canonical MP4, cover, caption, evidence/source packet, hashes, and manual-upload instructions.
- Manual native upload is a complete valid release path.
- First-party platform APIs may be used as optional adapters when configured.
- Metricool and similar third-party schedulers are not authorized creation or required publication paths.

## Forbidden critical-path behavior

The following are hard failures:

- automatically invoking Descript, Metricool, ElevenLabs, hosted TTS/image/video credit systems, premium editors, or similar metered services to rescue a production;
- shipping robotic placeholder narration because the preferred service is out of credits;
- shipping silence because a narration provider failed;
- lowering the visual or audio quality floor to preserve cadence;
- treating a provider-specific project, receipt, or account as the canonical creative identity;
- requiring an account-specific premium service to reproduce the final artifact.

## Allowed recovery order

1. regenerate or retune locally;
2. adjust the authored script/scene/take plan while preserving EvidenceBridge permission;
3. switch between approved local open-source models;
4. use an authorized human-recorded house voice;
5. fail closed and report the exact local capability gap.

There is no sixth step that silently buys, spends, or requests credits.

## Reproducibility receipt

Every production packet records:

- R8.04 and component versions;
- local model/tool names and versions;
- script/evidence packet hashes;
- voice/reference provenance;
- render inputs;
- encoding settings;
- final artifact SHA-256;
- QA receipts;
- whether an optional first-party platform adapter was used.

A production is non-canonical if a future rebuild requires access to an account-specific premium provider.

## Provider classifications

- Descript: prohibited in the canonical critical path.
- Metricool: prohibited for new THS creation/scheduling; historical measurement artifacts may remain read-only.
- Hosted generation credits: prohibited in the canonical critical path.
- First-party TikTok/Meta/YouTube APIs: optional adapters only, never required.
- Native manual platform upload: canonical baseline transport.

## Failure semantics

Quality may fail closed. Dependencies may not fail open.

If a local capability is missing, repair the local capability. Do not substitute a lower-quality or credit-gated provider just to produce an artifact.

## Local implementation guide

The executable local narration setup, generation, exact-audio review, and failure procedure is documented in `docs/local-voice-runtime.md`. That guide is subordinate to this policy and may not introduce a hosted or credit-gated fallback.
