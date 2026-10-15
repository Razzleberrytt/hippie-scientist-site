# EvidenceMotion — independent research operator handoff and rehearsal

**Status: RESEARCH-ONLY.** This is an offline procedure, not permission to approve or publish a video. It works without ChatGPT, V/Muse, a paid media API, persistent runner or production credentials. Companion: [V3 archived technical operator draft](7OH-V3-OPERATIONS-HANDOFF-DRAFT.md). The V3 archive is not the later 99%-research 7-OH candidate; keep SHA inventories separate.

## Source of truth and original artifacts

The operator receives one immutable evidence ZIP containing the exact 1080×1920/30fps movie, sound-off movie and SHA-linked JSON reports. A separately supplied SHA-256 of the **ZIP itself** is mandatory; the archive's internal manifest alone cannot establish authenticity. The 99% research rubric means mechanical visual-recovery coverage; it does **not** mean 99% of viewers understand, that the film is premium, or that voice/science/phone gates have cleared.

Exact earlier research example (not a GitHub repository binary):

| Identity | Expected evidence |
|---|---|
| Archive | EvidenceMotion_7OH_99_PixelVerified_QA.zip |
| ZIP SHA-256 | 30761c120d777f48e603fb2bac46529023de3381fb86be46b6504854f8870042 |
| Movie SHA-256 | 8e2d487f53ff39af7dd4e544a0bbbf5b54cc03c3d7305028369b5308d4666055 |
| Original WAV SHA-256 in receipt | 9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435 |
| Hosted original-film run | 38776081873, artifact 11993079335 (temporary retention only) |

**The original WAV bytes are NOT inside this QA ZIP**, so complete renderer/source escrow is not established.

## Rehearse it independently, offline

Prerequisites: Python 3.11+ standard library and FFprobe/FFmpeg installed locally. No cloud login needed. From the repository root, run this command with a separately trusted expected hash:

    python research/evidencemotion-director/operator_evidence_rehearsal.py --bundle /path/to/EvidenceMotion_7OH_99_PixelVerified_QA.zip --expected-sha 30761c120d777f48e603fb2bac46529023de3381fb86be46b6504854f8870042 --out ./qa-operator-rehearsal.json

Expected stdout/receipt: **PASS_RESEARCH_ONLY_RELEASE_HELD**. This proves actual decoded film/audio streams, strict external ZIP hash, exact movie and muted-stream/source/claim/phone-plan identities, five visually answerable source claims from the earlier independent pixel checks, eight tested adversarial controls, 12 objective visual tests, 16 critical legibility labels and nine below-budget scene spans. The script rejects duplicate ZIP entries, symlinks, path traversal, missing source files and oversized compressed archives without trusting file names or reading from this conversation.

**Every release hold stays on:** mayPublish=false, human audience comprehension uncalibrated, science/craft/voice/handset approvals absent. A media-hash change invalidates old receipts; a true JSON field invented by an operator is never proof of a qualified independent verdict.

## Error triage and rollback simulation

1. **Quarantine before acceptance:** place the original research ZIP in an immutable, hash-addressed candidate location; keep previous verified candidate active and never post to TikTok/YouTube/Meta or change production website integrations.
2. **Verify:** run the command above. On any RESEARCH_HANDOFF_HOLD, do not overwrite the last good ZIP or tweak an expected hash to bless corrupted content. Save the failure reason and source SHA inventory.
3. **Negative tests:** from repository root run: python -m unittest discover -s research/evidencemotion-director -p test_operator_evidence_rehearsal.py -v. Thirteen hermetic tamper tests must HOLD on altered video/phone hashes, fake approval or human reviewers, missing receipts, altered negative controls, extra unsafe ZIP files, duplicate names, symlinks and path traversal. This proves failure handling, not actual end-user quality.
4. **Research-only rollback:** the rehearsal simulates a corrupt new research candidate while retaining the known-good research hash. It does not contact production, write deployment state or claim a real-world rollback. Video decode failure requires further actual-player testing; voice failure requires the exact WAV and qualified ear/acoustic ground truth; science mismatch requires new primary-source review; weak craft requires re-edit and independent reference comparison.
5. **Durable escrow:** outside any ephemeral runner retain the original ZIP and source WAV bytes, full renderer/chemical source/lexicon, exact final MP4, all QA/report/reviewer/device data, signed or recorded identities, review/rollback decision and old approved manifests. Re-check SHA on restore. ChatGPT sandbox and 14-day GitHub Actions artifacts are not permanent storage by themselves.
6. **Actual production promotion and rollback (future):** only after explicit owner authority, real device playback, separate science and craft review, and any established quality streak. Record flag state, old/new asset hashes, operator, timestamp and deployment receipt. If a release fails, revert the approved feature flag in the real authorized controller and verify the old live content; **never** pass a simulated rehearsal as the production rollback.

## Canonical progress accounting

This guide, the standalone byte-level verifier, true research-bundle rehearsal, and thirteen fault-injection tests meaningfully reduce dependency on this conversation. **Do not mark EvidenceMotion checklist #46 complete** until an authorized canonical release/rollback and durable complete WAV/source escrow are also independently demonstrated. 26/46 is the canonical current completed count; 99% is a research-only metric for a different requirement, not an audience success rate.
