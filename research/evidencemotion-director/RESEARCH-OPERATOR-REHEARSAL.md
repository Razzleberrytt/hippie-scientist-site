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

## Lane 5: exact original-native physical receiver handoff (research-only, Oct 16)

This is a **different** film/protocol from the CID-bound 99%-pixel operator
example above. Never mix that bundle's manifest, movie hash, or 12 reports
with original-native A/B archives. The original-native receiver's evidence
is a **reproducibility and media-integrity check**, not an excellent first
render or a revision of the 99% film.

**Observed successes (source-controlled):** [first two archived A/B repeats
and physical receipts](EM04201-TWO-ORIGINAL-NATIVE-RENDERS-PHYSICAL-RECEIPT-20261016.md),
then [current-code successful hosted receiver #38987744520](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/38987744520).
Its [small receiver-only HOLD artifact](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/38987744520/artifacts/12083637497)
records both downloaded 1031-frame H.264/AAC movies fully decoded, both
real x264 logs inspected, two physical source/movie SHA comparisons agreeing,
and `mayPublish=false`. The underlying historical full-video source comes
from [first-party workflow #38975231562](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/38975231562),
artifacts named `em-lane5-native-full-a` and `em-lane5-native-full-b`.
Their source-workflow SHA must not be relabeled as a new/current render.

### Recovery commands, without rendering or a paid media service

Use an isolated clone of the **specific research PR source commit** from
[PR #6846](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6846),
not `main` while that PR is draft. Commit `116b6792722013d9e4213bb429705f4b417bb8ee`
has the fully tested fail-closed no-clobber reader; a later commit needs its
**own** validation evidence. Requires Python 3.11+, GitHub CLI with permission
to read first-party Actions artifacts, and Ubuntu-style
`/usr/bin/ffmpeg` + `/usr/bin/ffprobe`. From the checkout root:

```bash
set -euo pipefail
git fetch origin research/em-lane5-native-stdin-receipt-ci-20261016
git switch --detach 116b6792722013d9e4213bb429705f4b417bb8ee
mkdir -p /tmp/em-lane5-receiver/a /tmp/em-lane5-receiver/b
gh run download 38975231562 --repo Razzleberrytt/hippie-scientist-site \
  --name em-lane5-native-full-a --dir /tmp/em-lane5-receiver/a
gh run download 38975231562 --repo Razzleberrytt/hippie-scientist-site \
  --name em-lane5-native-full-b --dir /tmp/em-lane5-receiver/b

for label in a b; do
  root="/tmp/em-lane5-receiver/$label"
  test "$(find "$root" -maxdepth 1 -type f | wc -l)" -eq 4
  printf '%s  %s\n' \
    'c100779c2c6c15005fdef9c5166da957c8dd6f51226d45f7c2264f0a89206322' \
    "$root/specimen_NEW_RESEARCH_CANDIDATE.mp4" | sha256sum -c -
  printf '%s  %s\n' \
    '401c5c7eec184d77aeaf16bd55c430e4515106b130d4cdcd0ce39d052cbc7a88' \
    "$root/environment.json" | sha256sum -c -
done
python research/evidencemotion-director/original_native_stdin_replay.py compare \
  --first /tmp/em-lane5-receiver/a \
  --second /tmp/em-lane5-receiver/b \
  --out /tmp/em-lane5-receiver/NEW-PAIR-RESEARCH-HOLD.json
```

The `--out` name **must not already exist**: the source refuses to overwrite
existing bytes or symlinked destinations. Inspect
`NEW-PAIR-RESEARCH-HOLD.json` before interpreting anything. Expect:
`twoDownloadedNativeMoviesIndependentlyFullyDecoded=true`,
`twoPhysicalX264DisabledCpuAsmLogsIndependentlyValidated=true`,
`twoResearchSingleThreadEncodedMoviesBitwiseIdentical=true`,
`twoActualIndependentJobExecutionsAuthenticated=false`,
`nativeFullMediaDecodeAndCraftApproved=false`, `mayPublish=false`,
and status `SINGLE_THREAD_ORIGINAL_SOURCE_H264_BITWISE_REPLAY_RESEARCH_HOLD`.
A fully successful research receipt is **not** a publication receipt.

### Offline alternative when original GitHub Actions artifacts expire

A separately preserved portable bundle from **the second** pinned full-native A/B
research experiment (workflow `38973005573`, *not* a new creative film and
*not* the later `38975231562` head) was independently unpacked, SHA-rehashed
and passed its bounded bundled `verify.py` on Oct 16. Its exact independently
recorded outer identity is:

- ZIP: `EvidenceMotion_Lane5_Repeatable_Original_Replay_Research_20261016.zip`
- ZIP SHA-256: `5200a297f0b7262c1cfb0b0b68c20088be553307358743e0f7858cabd7c6045d`
- Physical A/B MP4 SHA-256: `c100779c2c6c15005fdef9c5166da957c8dd6f51226d45f7c2264f0a89206322`
- Includes A/ and B/ original encoded movies, their encoder logs, full
  source-to-stdin receipts, both environment JSONs, the physical prior pair
  research HOLD receipt, a file-SHA manifest, README and `verify.py`.
- **Not included:** original lossless WAV bytes, archived source renderer
  module tree, externally authenticated executor attestation or release review.

If the *physical* portable ZIP has been securely retained, verify its outer
SHA **before** executing the contained verifier:

```bash
set -euo pipefail
saved="/path/to/EvidenceMotion_Lane5_Repeatable_Original_Replay_Research_20261016.zip"
printf '%s  %s\n' \
  '5200a297f0b7262c1cfb0b0b68c20088be553307358743e0f7858cabd7c6045d' \
  "$saved" | sha256sum -c -
mkdir -p /tmp/em-lane5-saved-replay
unzip -q "$saved" -d /tmp/em-lane5-saved-replay
(cd /tmp/em-lane5-saved-replay && python verify.py)
```

The portable `verify.py` covers member-file SHA pins and A/B
research-receipt/source-frame consistency, **not** a fresh full video/audio
decode or source re-render. To apply the newer receiver (from the pinned PR
code checkout above), run `python research/evidencemotion-director/original_native_stdin_replay.py compare`
with `--first /tmp/em-lane5-saved-replay/A`,
`--second /tmp/em-lane5-saved-replay/B` and a **fresh** `--out` path.
This invokes the real physical video+AAC decode and log gate rather than
merely reading `verify.py` output. It still only returns a research HOLD.
The outer digest, not the bundled manifest alone, establishes that this is
the *previously observed* ZIP. When no physical copy or trusted outer digest
exists, this is **unrecoverable as an accepted original artifact**; the
written hash cannot regenerate missing source/audio/movie bytes.

**Retention/escrow limit:** These native artifacts were uploaded with a
**7-day** GitHub retention period on Oct 16, not a permanent archive; their
availability ends around Oct 23, subject to GitHub retention and deletion.
If `gh run download` cannot retrieve one, return
`HOLD: SOURCE ARTIFACT EXPIRED OR UNAVAILABLE`. Do not silently substitute
Lane 1's other archived movie, a modified scene, the older CID-bound film, or
an entirely new expensive render. If a prior separately retained physical
copy exists, independently check both entire archive hashes, member paths,
MP4/environment SHA pins and receiver validation; never rely on a filename.
Do not upload third-party protected reference clips or credentials to the
repository. This guide and the SHA ledger preserve traceability **but not
the inaccessible WAV, raw source or physical video bytes**.

**What the operator actually does next:** When Lane 3 delivers its *revised
complete film plus sidecars*, route it through the distinct Lane 6 intake
and Lane 4 exact-film phone checks. That changed movie cannot inherit this
older original's decoded-media receipt or academic/source/art verdicts.
Qualified source/voice/phonetic reviews, actual iPhone playback, calibrated
human comprehension and craft, creative first-final attempt identity,
authorized release and true production rollback remain blocked. Excellent
first **0/1**, five diverse consecutive excellent first renders **0/5**,
and posting prohibited.

## Original renderer + narration WAV + film private recovery archive

An explicitly owner-labelled, one-time CI action [source recovery
#38991294207](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/38991294207)
assembled an independently downloaded **more complete** source/input archive,
not a new encoded render. It was independently inspected outside GitHub Actions
using a fresh temporary directory and the actual FFprobe/FFmpeg decoders.
Unlike the older *film-only* A/B ZIP above, this archive also contains the
original pinned narrator WAV bytes, 11 historical exact renderer source files,
eight archived native PNG pixel references, original alignment JSON and
source-render receipt, and the two exact original source-to-stdin/encoder
research receipts.

**Physical portable ZIP (file itself, NOT GitHub's outer artifact wrapper):**
`EvidenceMotion_Original_Source_WAV_Film_Research_HOLD_20261016.zip`,
SHA-256
`dfce925fb2474c46da975ce94b46437e371a8fcac4758326515363cf21146c8d`,
7,093,290 bytes. Its parent GitHub Actions artifact ID **12084799185**
only offers temporary 7-day retrieval, but a separately retained physical
copy can be restored without paying a media generation service. Only trust
this recorded ZIP hash after checking the physical bytes independently; a
self-contained SHA manifest by itself cannot establish provenance.

```bash
set -euo pipefail
bundle=/path/to/EvidenceMotion_Original_Source_WAV_Film_Research_HOLD_20261016.zip
printf '%s  %s\n' \
  'dfce925fb2474c46da975ce94b46437e371a8fcac4758326515363cf21146c8d' \
  "$bundle" | sha256sum -c -
unzip -tq "$bundle"
mkdir -p /tmp/em-original-complete-recovery
unzip -q "$bundle" -d /tmp/em-original-complete-recovery
cd /tmp/em-original-complete-recovery
sha256sum -c RECOVERED-FILES-SHA256SUMS
printf '%s  %s\n' \
  '9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435' \
  original-inputs/voice/narration.wav | sha256sum -c -
for label in a b; do
  film="film-$label/specimen_NEW_RESEARCH_CANDIDATE.mp4"
  printf '%s  %s\n' \
    'c100779c2c6c15005fdef9c5166da957c8dd6f51226d45f7c2264f0a89206322' \
    "$film" | sha256sum -c -
  ffmpeg -nostdin -v error -xerror -i "$film" \
    -map 0:v:0 -map 0:a:0 -f null -
done
```

**Independent inspection, Oct 16/17:** all 31 manifest entries matched,
all 11 source script pins matched the recorded historical commits, WAV
format was 24,000 Hz mono PCM16 (824,336 samples), both
1,031-frame 1080×1920/30 fps H264/AAC movies decoded fully and were
byte-identical. Each physical encoded film SHA is
`c100779c2c6c15005fdef9c5166da957c8dd6f51226d45f7c2264f0a89206322`;
`environment.json` A/B SHA
`401c5c7eec184d77aeaf16bd55c430e4515106b130d4cdcd0ce39d052cbc7a88`.
The accompanying externally computed research receipt is
`EvidenceMotion_Lane5_Complete_Source_Recovery_Research_Receipt_20261016.json`,
SHA-256
`ca5a7a6eeff6a034dea97bcfbdab5f137b2f68e45c6089d410a70242cb68b753`.

**Important omissions:** This research archive does **not** redistribute
font files (their external installed DejaVu SHA identities remain pinned),
Python/RDKit/Pillow wheel/build provenance, a copy of the historical original
FFmpeg/libx264 binary, executor trust attestation, independent science/voice/
on-device/craft approvals, or the *revised* Lane 3 combined film and sidecars.
The fixed control-plane code is a research draft and cannot grant production
authorization. Archive recovery is **source/input escrow progress**, not
complete deployable/release escrow or excellent-first/master acceptance.
`mayPublish=false`, first excellent 0/1, five varied first renders 0/5,
and EM-046 remains OPEN until its remaining criteria are independently met.

## First-render attempt history: externally pinned append-only proof

When an **actual new topic is produced**, record *every* first attempt,
failure, HOLD and rerender in the existing versioned research register.
`five_render_attempt_guard.py` can verify a candidate against a previous
register **whose exact whole-file SHA-256 was recorded independently before
the new attempt**. An updated current file and a freshly recomputed hash
of a rewritten previous file are NOT independent history. Keep the
previous register read-only and store that prior SHA in an owner/controller
record independent of the candidate.

For one new event, use a **fresh** output name (existing receipts cannot
be overwritten):

```bash
# Run from the exact Lane 5 code checkout. Obtain the OLD SHA from the
# previously saved trusted record, not from a newly edited prior file.
PREVIOUS_SHA="<previously recorded 64-character lowercase SHA256>"
python research/evidencemotion-director/five_render_attempt_guard.py \
  --previous-register /path/to/previous-attempts.json \
  --previous-sha "$PREVIOUS_SHA" \
  --register /path/to/attempts-after-new-render.json \
  --out /path/to/new-attempt-continuity-RESEARCH-HOLD.json
```

The old events must be a **verbatim semantic prefix** of the new list;
removing, editing or reordering a failed first render or revised attempt
fails closed. Duplicate run IDs or film SHA values, mismatched subject
ordinals, missing/unknown keys, duplicate JSON keys, nonfinite numbers,
a true `mayPublish` flag, and a claimed accepted streak are also refused.
At least one new event must have been appended. This is a *research-only*
continuity guard, not proof that the very first snapshot included every
historical attempt. A positive result explicitly retains
`allHistoricalAttemptsProvenPresent=false`,
`independentScienceVoiceCraftHandsetAudienceAndVarietyVerified=false`,
`firstExcellentMasterAccepted=false`,
`fiveRenderMilestoneAccepted=false`, and `mayPublish=false`.
The declared provisional streak is **not** the earned 0/1 or 0/5 count.

Keep the newly verified register and its own independently recorded
SHA (together with actual movie/source hashes and review receipts) for
the next event. If prior bytes or trustworthy external digest are missing,
report `HOLD: UNANCHORED_HISTORY`, do not erase/reseed the ledger just to
make a streak look cleaner. The on-disk output is a private research
receipt; this tool does not post, accept quality, promote to production,
or change the protected 46/1,590 progress ledger.

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
3. **Negative tests:** from repository root run: python -m unittest discover -s research/evidencemotion-director -p test_operator_evidence_rehearsal.py -v. Twenty-five hermetic tests cover altered video/phone hashes, fake approval or human reviewers, missing receipts, altered negative controls, extra unsafe ZIP files, duplicate names, symlinks and path traversal. They also reject a substituted movie despite internally refreshed hashes, wrong source WAV, missing full-decode proof and an extracted AAC stream that differs from the technical receipt. Synthetic probes test contracts only; the unmocked actual-media example above is separate evidence.
4. **Research-only rollback:** the rehearsal simulates a corrupt new research candidate while retaining the known-good research hash. It does not contact production, write deployment state or claim a real-world rollback. Video decode failure requires further actual-player testing; voice failure requires the exact WAV and qualified ear/acoustic ground truth; science mismatch requires new primary-source review; weak craft requires re-edit and independent reference comparison.
5. **Durable escrow:** outside any ephemeral runner retain the original ZIP and source WAV bytes, full renderer/chemical source/lexicon, exact final MP4, all QA/report/reviewer/device data, signed or recorded identities, review/rollback decision and old approved manifests. Re-check SHA on restore. ChatGPT sandbox and GitHub Actions artifacts (7 days for the Lane 5 original receiver) are not permanent storage by themselves.
6. **Actual production promotion and rollback (future):** only after explicit owner authority, real device playback, separate science and craft review, and any established quality streak. Record flag state, old/new asset hashes, operator, timestamp and deployment receipt. If a release fails, revert the approved feature flag in the real authorized controller and verify the old live content; **never** pass a simulated rehearsal as the production rollback.

## Canonical progress accounting

This guide, the standalone byte-level verifier, actual research-bundle rehearsal, and twenty-five safety and rejection tests reduce dependency on this conversation. **Do not mark EvidenceMotion checklist #46 complete** until an authorized canonical release/rollback and durable complete WAV/source escrow are also independently demonstrated. 26/46 is the canonical current completed count; 99% is a research-only metric for a different requirement, not an audience success rate.
