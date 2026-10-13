# EvidenceMotion: system completion checklist (living tracker)

**Updated:** 2026-10-13 (V3 exact-media audit) | **Verified foundations proposed: 18/46; 28 open (pending PR CI/merge)** | **Owner direction:** phone-first, existing remote CPU | **Production freeze:** ON | **Video quality milestone:** 0/1 first excellent native final, then 0/5 consecutive excellent native first renders.

## Definition of "complete"
**A video** is release-ready only after source/correctness review, original voice ear-check, native 1080×1920/30fps first final, full decoded A/V and real iPhone playback, craft approval against best-in-niche references, and the owner's explicit go/no-go. **The director system** is canonically complete only after that first excellent first-render master **and five consecutive excellent first renders on varied topics**, with reproducible locked sources, model/execution budgets, robust failed-shot regression tests, and no safety bypass.

Checklist states: `[x]` = evidence established, `[ ]` = open gate. An implementation being present is **not** proof that it passes human quality standards. Recheck any box if the source/WAV/renderer changes.

### A. Operating and science foundation — mostly complete
- [x] Phone-first operation: remote CPU builds, owner reviews on iPhone; RTX 3050 laptop parked as optional alternate, not a requirement.
- [x] Freeze preserved: research code isolated; no new R-version, GPU-model dependency, automatic production pipeline integration, or video publication.
- [x] Six shot composition grammars and rule-based research director/evaluator exist; no aesthetic self-certification.
- [x] Verified 7-hydroxymitragynine chemical graph against pinned PubChem CID 44301524, InChIKey RYENLSMHLCNXJT-CYXFISRXSA-N, formula C23H30N2O5; RDKit source tests passed locally.
- [x] 3D conformer identified as *computed illustration*, not measured pose, drug effects or receptor docking. Scientific diagram rendered deterministically.
- [x] Botanical generative atmosphere identified as illustrative, not real filmed scientific evidence.
- [ ] Independent qualified review of **every claim, source attribution, implied 7-OH botanical context**, depiction, and uncertainty in the chosen final script; retain reviewer verdict.
- [ ] Explicitly disallow any visual inference of verified 7-OH content in the illustrative botanical art and verify disclosure at phone size.

### B. Narration and factual timing — release blockers
- [x] Original pinned Kokoro ONNX INT8 `am_michael` WAV generated in successful GitHub workflow; voice/model provenance and WAV hashes recorded.
- [x] V9 uses unchanged original AAC audio and genuine exact-WAV **beat-level** boundaries (33.135 seconds).
- [x] **V11 research preview only:** corrected severely quiet narrator mastering from −27.79 to −17.52 LUFS (peak −1.49 dBTP), preserved exact original Kokoro performance and timing (0 ms measured shift, 0.99836 waveform correlation), and independently decoded 497/497 frames. This is mechanical QC, **not** the owner ear-check.
- [x] **Locant-safe Kokoro research voice + matching phone-level V12/V13 hybrid preview (Oct 13):** revised narration avoids ambiguous “position seven,” original pinned `am_michael` engine was used, and the new 34.3473-second WAV SHA `9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435` was cut to seven measured beats; actual 515-frame 540×960/15fps revised-preview SHA `18baf92ea4877d38c285ff33c70c7acaf76906ee31922207378ef7e1f887405e` passed full decode and −17.6 LUFS/−1.5dBTP check; both source edit and mastered output reproduced byte-identically in clean directory. **Research engineering pass only: new utterance is NOT owner-auditioned, not word-aligned, not science/editorial approved, and not a native release final.**
- [x] **Owner preliminary audio feedback (Oct 13):** after receiving the V11 phone-audition preview, owner reports the narration “sounds alright.” Treat as provisional acceptance of overall voice/loudness and freeze the existing take for visual iteration. **Not** explicit certification of each specialized pronunciation, final native-master playback, or craft.
- [ ] Owner ear-check of **this exact WAV** for `7-OH`, `hydroxyl`, `mitragynine`, conversational cadence, stress and endings; record audible PASS/FAIL, not only waveform metrics.
- [ ] If voice rejected, regenerate only affected natural sentence chunks, validate original vault, **invalidate old cuts/hashes** and realign; never substitute Flite/espeak or time-stretch.
- [ ] Genuine original-WAV word-level acoustic alignment (MFA or equivalently validated) for on-screen word cues, highlighted OH timing, and any word-synchronized captions.
- [ ] Independent audit that scientific caption spelling, emitted narration, cited source and emphasis mean the same thing. Keep subtitles readable when muted.

### C. Director and cinematography — current bottleneck
- [x] V9 source-bound detail→whole molecule camera reveal; complete RDKit graph when labeled as whole, explicit `DETAIL VIEW` when cropped.
- [x] Source-specific ball-and-stick, 2D bond diagram, and space-filling views from the **same** graph; deterministic physical cameras and constraints.
- [x] CPU research previews and V9 clean-directory MP4 SHA reproduction, including exact original audio preservation, have been demonstrated.
- [ ] Redesign remaining over-static **18.48–22.04s computed-conformer** beat using a meaningful alternate visualization, not a decorative wipe. Preserve exact voice and avoid false molecular motion.
- [ ] Design recognizable, premium hero materials: lighting, physically plausible shading, readable element colors, depth/composition, clean silhouettes; reject basic-CGI look.
- [ ] Replace repetitive chemistry panels with motivated transformations and a distinct visual payoff. Keep one intentional camera move per shot and explicit source-bound visual purpose.
- [x] **V3 exact-shot director plan completed**: all 15 actual scene intervals mapped to source IDs, hero, grammar, camera/cut, intended viewer reaction, and abort conditions in [7OH-V3-SHOT-DECISIONS-2026-10-13.md](7OH-V3-SHOT-DECISIONS-2026-10-13.md). This is planning/documentation, **not** visual craft or owner acceptance.
- [ ] Two genuinely different low-resolution previz candidates evaluated *against real reference shelf* before any final native render; reject cheap concepts, not just poorly scored pixels.
- [ ] Capture and inspect semantic negative filters beyond pixel motion: cropped structure, wrong OH highlight, scene identity drift, meaningless particles, flat-card templates, captions obscuring molecule, and cheap-looking transitions.
- [x] **Verified V3 3.2-second PubChem source hold** is exempt from moving-poster penalties **only for that source-reading window**, with the other hero/motion kills unchanged. Actual decoded 29.5s portrait frame visibly displays CID 44301524 and pubchem.ncbi.nlm.nih.gov; source frame hash `2949511637f1296fbabd67002c75192e3e96bd6cc4ecce77c0b4b28f65ae3017`. Narrow fail-closed guard/test: [source-reading-hold.mjs](source-reading-hold.mjs) and [tests](source-reading-hold.test.mjs). **Owner phone legibility approval remains separate/open**.
- [ ] Visual originality and whole-piece cohesion accepted by **owner**, and independent reviewer when available (never claim `V_VERIFIED` from solo review).

### D. Trust, mobile and final media validation — release blockers
- [x] V9 preview decoded: 497/497 frames, 540×960 @15fps, H.264 Constrained Baseline + AAC; original audio bitstream verified identical to V8.
- [x] Mechanical negative QA exists for static intervals, weak hero motion, missing preview evidence, audio time-stretch, source drift and undisclosed synthetic footage.
- [ ] Source-asset SHA validator on **actual final-render inputs** (not solely metadata booleans); binding of graph, 2D/3D source, background, script, WAV and exact final MP4 hash. **Partial:** V3 manifests match real MP4/WAV/renderer/patch bytes; explicit independently hash-pinned generated 2D/3D/background intermediates are not yet closed; see [V3 exact-media audit](7OH-V3-ACTUAL-MEDIA-AUDIT-2026-10-13.md).
- [ ] 1080×1920 @30fps **native** render (not upscale mislabeled as native) from approved locked audio and final source assets; record timing/runtime/costs.
- [ ] Complete final MP4: decode every frame; validate video geometry and frame rate, AAC content/signal, exact natural duration, no missing/silent segment, lipless audio sync and captions in phone-safe zones. **Partial:** V3 decoded all 1,031 frames; exact 30fps PTS, AAC/WAV identity, six voiced sections, intentional silent source-card and source text agreement checked. Comprehensive mobile-safe-area and muted visual inspection still OPEN; see [V3 media audit](7OH-V3-ACTUAL-MEDIA-AUDIT-2026-10-13.md).
- [ ] Caption/metadata audit in native TikTok/Shorts UI safe zones with tiny-type elimination, meaningful first-two-second hook and muted comprehension.
- [ ] Watch exact encoded master on real iPhone with sound at normal speed, test scrubbing and hearing voice from device speaker; owner files explicit quality verdict.
- [ ] Human audio/craft/science review receipts attached to **exact master hash**, no transferable approvals after edits.
- [ ] Explicit owner authorization before posting to TikTok/YouTube or changing production publishing integrations. No silent auto-publication.

### E. Canonical EvidenceMotion promotion — AFTER one excellent first final
- [ ] One **genuinely excellent** 1080×1920/30fps first-final-render MP4 accepted on craft and correctness separately; accept against external niche anchors, not our earlier iteration history.
- [ ] Pin a golden-master bundle: source graphs, exact WAV/model/lexicon hashes, reference images, composition grammar, camera paths, render config, evaluator results and approved MP4.
- [ ] Extract reusable director rules rather than hardcode 7-OH shots: object→mechanism, follow-process, evidence-under-lens, two-world, uncertainty, scale/consequence.
- [ ] Integrate approved rules behind a controlled production feature gate; preserve scientific deterministic layer; prove old outputs/regressions unchanged and rollback is possible.
- [ ] Benchmark real runner CPU minutes, memory, render costs, failure rate; never make a GPU model or laptop prerequisite. Optional models require separate budget/quality proof.
- [ ] Add automated regression tests reproducing **each rejected failure** (generic poster, disconnected bonds, mispronunciation, clip-truncated AAC, cropped 2D source, fake science, broken caption safe area, moving confetti, lint/test discovery).
- [ ] Show robust output diversity with **five consecutive truly excellent first-final renders** on different scientific subjects (not minor re-edits of one video), all owner-accepted. One failure restarts streak.
- [ ] Only after 1+5 success, lift version/capability freeze through explicit owner approval; then mark the validated production architecture canonical.
- [ ] Document operator guide, release rollback, provenance/honesty rules, artifact retention and triage so future videos do not depend on this one chat or a disposable runner. **Draft produced:** [V3 operations handoff](7OH-V3-OPERATIONS-HANDOFF-DRAFT.md), but independent operator rehearsal and eventual canonical release/rollback are still missing; no checkbox credit.

## Execution order from the current V3 research review state
1. **Now (machine gates):** finish hash-pinning generated 2D/3D/background intermediate inputs; independent real-word acoustic alignment; full decoded native 1080p safe-area/muted-comprehension audits; semantic failure and source-hold regression tests. The V3 technical receipt is linked above, not a production approval.
2. **Next (craft preparation):** run the exact 15-shot plan against actual decoded frames and owner-curated 3–5 outside reference clips; record repairs and generate new immutable preview hashes without changing the locked original voice.
3. **Last (human gates at owner's direction):** qualified scientific/editorial sign-off, exact owner ear-check and on-iPhone video review, separate correctness and craft acceptance, then explicit publication decision.
4. **Only after acceptance:** freeze a genuinely approved golden master, demonstrate five consecutive genuinely excellent first renders across varied topics, then consider canonical integration/freeze lift with owner permission.

## Current authoritative artifacts
- Research PR #6742 (full-HD source-verified comparison): merged. PR #6744 (provenance validator): merged. PR #6745 (native Python exact-MP4 auditor and hosted smoke suite): open at this update; do not claim merged.
- V9 reproduced MP4 SHA-256: `deaf54d09d40239ce91e77619d9be291fcb6f46ad468f20f02280c3580fe00aa`; saved in `EvidenceMotion_7OH_V9_structural_reveal_RESEARCH.zip` in the conversation, not committed to the repo.
- Original WAV SHA-256: `434fca399f1ab74a12a5beb3da44373fe1117696b045ffd8026179df7bf14b34`; no human auditory acceptance yet.

**Do not convert any research `[x]` into video-release approval.** Aesthetic excellence, owner listening approval, full native final and first-render consistency remain open.
