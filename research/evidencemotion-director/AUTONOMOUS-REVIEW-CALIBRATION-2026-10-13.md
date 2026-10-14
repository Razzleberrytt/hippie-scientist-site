# EvidenceMotion autonomous review system — first measured CPU pilot

**Owner direction, Oct 13, 2026:** Routine EvidenceMotion reviews should NOT depend on the owner watching/listening to every video, another human being available, or an unrepeatable subjective signoff. ChatGPT may autonomously inspect real media, question science, diagnose quality failures and request repairs. Choose the most consistently premium renderer-neutral result. **Do not confuse this owner preference with permission to publish unreviewed medical claims.**

**Pilot status:** research only under #6743, not a new R-number, active workstream, canonical video release policy or production integration. The version/capability freeze and 24/46 evidence baseline remain in force pending proven alternative acceptance.

## One narrow working piece: actual decoded-film visual critic

`native_autocritic.py` takes a **real 12–90 second MP4**, optionally requires a caller-pinned exact SHA-256, fully decodes the actual stream, samples the actual subject visuals every two seconds at 180×320, suppresses static branded header and bottom caption/UI bands, and computes how often whole-subject edge-layout composition barely changes. It also detects nearly blank primary stages.

- Issues such as `REPETITIVE_SOURCE_LAYOUT_REQUIRES_ART_DIRECTION_REPAIR` produce **AUTO_REVISE** with exact SHA, repetition fraction, and reproducible time windows. **No human approval is needed to reject a weak candidate and send it back for repair.**
- A nontriggering candidate returns `AWAIT_MULTIMODAL_SCIENCE_VOICE_CRAFT_EVIDENCE`. This **does not mean the video is excellent**, only that this inexpensive negative filter did not find two specific faults.
- The critic does not currently judge natural speech, factual claims, original story flow, reference-grade lighting, whether captions are too small, experimental effects, or actual premium quality. It must not grant positive craft/science/editorial/publishing approval.
- Its thresholds are **provisional**, not calibrated against an independently rated gallery. A useful educational evidence-reading hold may be marked repetitive. Such false positives belong in a labeled calibration dataset; do not silently loosen thresholds to let the current video pass.
- All output includes separate `automaticallyApprovedPremiumCraft=false`, `automaticallyApprovedScientificClaims=false`, `mayPublish=false`.

## Proposed review stack (future admission or tightly scoped extensions)

1. **Source/science checker**: parse each spoken/captioned claim into an exact claim ID; retrieve original PMID/DOI, check publication/date/identity, evidence class (cell/animal/human), endpoint/population, contradictory and null results, explicit uncertainty and mechanism/human boundary. Auto-pass only explicitly source-matched *bounded, low-risk* claims; if primary source cannot be obtained or ambiguous, ABSTAIN/REVISE, never infer a clinical effect.
2. **Voice/transcript checker**: exact pin to emitted WAV and mastered AAC, local word-level ASR alignment, phonetic candidate scoring for flagged scientific names (7-OH, hydroxyl, mitragynine), loudness/peak/silence/pace/pronunciation stress checks from the **actual audio**, with sentence-level re-render and recheck. The model may flag likely errors; uncalibrated ASR/phoneme likelihood does **not** prove natural human speech. No TTS time stretching.
3. **Media/craft judge**: inspect frames *throughout the actual MP4* and sampled clips (not metadata or a hand-picked poster), reason over story/question→reveal→evidence→limit→payoff, subject salience/variety, type size and mobile safe zones, lighting, transitions, originality, source-linked graphical identity and audible cadence. Benchmark against 3–5 transparently archived comparable real niche reference clips chosen on quality metrics, not production technology. Independent reviewer agents should issue **separate correctness and craft judgments** with timestamped repairs, then compare disagreements adversarially.
4. **Calibration and conflict rule**: retain labeled good/bad videos and adversarial counterexamples, track per-error-class recall, false rejects, disagreement and confidence *before* enabling automatic **positive** approvals. Reject now for clear mechanical or semantic violations; abstain on unsupported clinical assertions and uncertainty. If evaluations disagree, retry with fresh independent evidence and bounded repair—not auto-vote a pass.
5. **Controlled promotion**: require actual calibrated performance, exact pinned artifacts and mandatory protected checks. Routine autonomous approvals can eventually replace per-video owner ear/quality calls **for the proven domain only**; more hazardous or unresolved health claims remain unpublished until evidence permits a defensible positive decision. Do not silently lift frozen production/publishing controls. No new paid model or uncontrolled GitHub-minute spend is authorized.

## Provenance, performance and budget

- No user laptop, GPU, new model download, model API key, background scheduler or recurring paid service required for this pilot; uses Pillow/NumPy/FFmpeg on bounded remote CPU.
- GitHub CI generates and fully decodes a **real** synthetic static MP4, expects automatic REVISE, and checks adversarial sample arrays including blank scenes and varied content. Varied content **does not** count as premium. The movie is not a chemical-science example and does not demonstrate clinical-claim judgment.
- Real 7-OH Treatment B (SHA pinned in a separate review receipt when run): the earlier broad-crop audit showed about 50% of neighboring two-second pairs with edge similarity above 0.95. Re-evaluation using **the new source-stage-only crop** measured **43.75%** (7/16 pairs), a median 0.9396 similarity, and exact MP4 SHA `5a3ba3313a091fd745bd9cab6764b644fbe97b38a0aaac05217f8a0752059550`. At the unmodified provisional **45%** threshold, the automated critic properly returns **AWAIT** instead of a false REVISE; separate visual film criticism remains REVISE. This is calibration disagreement requiring reference examples, not a universal aesthetic grade.
- Do not move any existing 24/46 gate or 0/1 + 0/5 milestone for this pilot. Record genuine owner-free **negative review capacity** as a new supporting research ability rather than rewriting a human review checkbox without validated positive replacement.

## Acceptance to close this pilot

Exact-head scoped negative CI, full required build/tests, code review, decoded real synthetic MP4 rejection and a clearly explained no-auto-publish report. Record and repair any false negatives; calibrate against an actual reference shelf and actual voice/source review before another ticket grants automatic positive approval.
