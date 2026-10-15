# EvidenceMotion — independent research operator handoff and rehearsal

**Status: RESEARCH-ONLY.** This is an offline procedure, not permission to approve or publish a video. It works without ChatGPT, V/Muse, a paid media API, persistent runner or production credentials. Companion: [V3 archived technical operator draft](7OH-V3-OPERATIONS-HANDOFF-DRAFT.md). The V3 archive is not the later 99%-research 7-OH candidate; keep SHA inventories separate.

## Source of truth and original artifacts

The operator receives one immutable evidence ZIP containing the exact 1080×1920/30fps movie, sound-off movie and SHA-linked JSON reports. A separately supplied SHA-256 of the **ZIP itself** is mandatory; the archive's internal manifest alone cannot establish authenticity. The 99% research rubric means mechanical visual-recovery coverage; it does **not** mean 99% of viewers understand, that the film is premium, or that voice/science/phone gates have cleared.

Current independently replayed research example (not a GitHub repository binary or permanent escrow):

| Identity | Expected evidence |
|---|---|
| Archive | EvidenceMotion_CIDBound_Operator_Replay.zip |
| ZIP SHA-256 | a4cacf25ddc124b05ae1c450d07ed1e715daa63a09f996b8669a774bb014dcda |
| Movie SHA-256 | acff8b90d29c0a3086dc50a41b5c411fea8c1d770ce5467d31bd16329fc3f574 |
| Original WAV SHA-256 in receipt | 9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435 |
| Hosted source of the 12 bundle payloads | 38783118695, artifact 11996832735 (temporary retention only) |
| Encoded narration AAC SHA-256 | f0057c19c9d06b8a2f3c6d8fec948ca4555966114579fd1a48b0bcfccc84aa98 |

**The original WAV bytes are NOT inside this QA ZIP**, so complete renderer/source escrow is not established.

**Compatibility note (2026-10-15):** The historical `EvidenceMotion_7OH_99_PixelVerified_QA.zip` (ZIP SHA `30761c120d777f48e603fb2bac46529023de3381fb86be46b6504854f8870042`, film SHA `8e2d487f53ff39af7dd4e544a0bbbf5b54cc03c3d7305028369b5308d4666055`) records only **8** independent screenshot negative checks. The source-controlled source-identity evaluator later added **2 independent CID-to-molecule mapping mutations**, requiring **10**. The stricter operator intentionally rejects that old film/bundle; it is no longer a passing example. Never edit counts or recompute internal hashes to bless it. The current verifier pins the reviewed film and source WAV identities independently of the ZIP and compares the actual extracted AAC stream to its decoded technical receipt.

The current example was freshly assembled from the 12 required hosted payloads and replayed offline with the unmocked FFprobe/FFmpeg probe. Both real videos decoded as 1,031 native frames, the original had one AAC stream and the muted copy had none, and the extracted AAC hash matched the table. The result was `PASS_RESEARCH_ONLY_RELEASE_HELD`. This demonstrates this particular research handoff, not a cold render, audience comprehension, permanent escrow or production rollback. Different ZIP packaging may change its outer hash; use a separately recorded trusted hash for those exact new archive bytes, never infer it from this table.

## Rehearse it independently, offline

Prerequisites: Python 3.11+ standard library and FFprobe/FFmpeg installed locally. No cloud login needed. From the repository root, run this command with a separately trusted expected hash:

    python research/evidencemotion-director/operator_evidence_rehearsal.py --bundle /path/to/EvidenceMotion_CIDBound_Operator_Replay.zip --expected-sha a4cacf25ddc124b05ae1c450d07ed1e715daa63a09f996b8669a774bb014dcda --out ./qa-operator-rehearsal.json

Expected stdout/receipt: **PASS_RESEARCH_ONLY_RELEASE_HELD**. This checks actual decoded film/audio streams, strict external ZIP hash, exact movie and muted-stream/source/claim/phone-plan identities, five source answers from the earlier pixel checks, ten rejected adversarial controls (including two distinct molecule-CID association mutations), 12 objective visual tests, 16 critical label checks and nine **overlay-only** reading-budget rows. The script rejects duplicate ZIP entries, symlinks, path traversal, missing source files and oversized compressed archives without trusting file names or reading from this conversation.

**Known combined reading-load failure:** running the current reading assessor on that exact film's emitted text gives an overlay-only pass but a combined caption-plus-overlay failure. `sentence_1_part0`, `sentence_1_part1`, `sentence_5_part1` and `sentence_6` reach **9.938, 8.602, 8.537 and 5.811 words/second**, respectively, against the existing **5** limit. The research handoff pass does not erase these failures or prove muted readability. Repair those intervals and issue new media-bound evidence before any readability acceptance; do not lower the limit or treat OCR answer recovery as audience comprehension.

**October 15 combined-caption readability audit (canonical EvidenceMotion EM-034; formerly mislabeled research #27):** Previous nine-scene 5-word/s numbers measured only non-caption overlays. The generated film **also renders narration captions**, and the combined count exceeds that ceiling in some scenes. The v2 reading receipt separately exposes both layers and must say `allScenesCombinedVisibleTextBudgetPass=false`, `combinedCaptionOverlayLoadRequiresReview=true`, and `fullMutedComprehensionApproved=false`. The independent repair planner now adds per-scene `minimumSampleCaptionWordsToTimeWindow`, `readingLoadRepairAction`, and `readingLoadRepairCandidates` while preserving the same fail-closed video gates. These report the **minimum sampled-frame text overrun**, not a rendered corrected film or genuine viewer comprehension. The current four overloaded scenes remain `sentence_1_part0`, `sentence_1_part1`, `sentence_5_part1`, and `sentence_6` until a fresh full-media audit proves otherwise. The offline operator rejects archived v1-only reading evidence as stale. The research pass remains a **narrow provenance/QA rehearsal**, not a silent comprehension, clean-captions or excellent film pass. To advance canonical EM-034 toward acceptance, re-edit and re-render overly dense scenes on the unmodified source narration, retest real encoded pixels/word timing/source semantics, and obtain defensible independent calibrated muted-readability evidence. Do not relabel overflow as compliant or self-award 100%.

**Every release hold stays on:** mayPublish=false, human audience comprehension uncalibrated, science/craft/voice/handset approvals absent. A media-hash change invalidates old receipts; a true JSON field invented by an operator is never proof of a qualified independent verdict.

## Error triage and rollback simulation

1. **Quarantine before acceptance:** place the original research ZIP in an immutable, hash-addressed candidate location; keep previous verified candidate active and never post to TikTok/YouTube/Meta or change production website integrations.
2. **Verify:** run the command above. On any RESEARCH_HANDOFF_HOLD, do not overwrite the last good ZIP or tweak an expected hash to bless corrupted content. Save the failure reason and source SHA inventory.
3. **Negative tests:** from repository root run: python -m unittest discover -s research/evidencemotion-director -p test_operator_evidence_rehearsal.py -v. Twenty-three hermetic tests cover altered video/phone hashes, fake approval or human reviewers, missing receipts, altered negative controls, extra unsafe ZIP files, duplicate names, symlinks and path traversal. They also reject a substituted movie despite internally refreshed hashes, wrong source WAV, missing full-decode proof and an extracted AAC stream that differs from the technical receipt. Synthetic probes test contracts only; the unmocked actual-media example above is separate evidence.
4. **Research-only rollback:** the rehearsal simulates a corrupt new research candidate while retaining the known-good research hash. It does not contact production, write deployment state or claim a real-world rollback. Video decode failure requires further actual-player testing; voice failure requires the exact WAV and qualified ear/acoustic ground truth; science mismatch requires new primary-source review; weak craft requires re-edit and independent reference comparison.
5. **Durable escrow:** outside any ephemeral runner retain the original ZIP and source WAV bytes, full renderer/chemical source/lexicon, exact final MP4, all QA/report/reviewer/device data, signed or recorded identities, review/rollback decision and old approved manifests. Re-check SHA on restore. ChatGPT sandbox and 14-day GitHub Actions artifacts are not permanent storage by themselves.
6. **Actual production promotion and rollback (future):** only after explicit owner authority, real device playback, separate science and craft review, and any established quality streak. Record flag state, old/new asset hashes, operator, timestamp and deployment receipt. If a release fails, revert the approved feature flag in the real authorized controller and verify the old live content; **never** pass a simulated rehearsal as the production rollback.

## Canonical progress accounting

This guide, the standalone byte-level verifier, actual research-bundle rehearsal, and twenty-three safety and rejection tests reduce dependency on this conversation. **Do not mark EvidenceMotion checklist #46 complete** until an authorized canonical release/rollback and durable complete WAV/source escrow are also independently demonstrated. 26/46 is the canonical current completed count; 99% is a research-only metric for a different requirement, not an audience success rate.
