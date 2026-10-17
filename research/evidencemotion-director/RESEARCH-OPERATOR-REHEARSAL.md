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


## Independent latest Scene4 clean-panel film intake — actual encoded Shot5 HOLD (2026-10-17)

**This is new read-only physical media evidence on the newest Lane3 owner-Library candidate**, not another synthetic renderer fixture, new engine feature, or release approval. Lane5 obtained `EvidenceMotion_Lane3_Scene4_CleanPanel_Actual_Research_20261017.zip` from owner Library and independently verified outer ZIP SHA-256 `28dfa2a793db546e6e39329d1278cad1214b931d6c6b6f929e3754e2242ecb2b`, ZIP CRC, and **all 12/12 packaged file SHA-256 hashes** against its manifest. The current candidate member `film/clean_scene4_full_research.mp4` physically hashes to `3c4e91b37958f1e86b6a04486933bbfc719bf6a196203711d6421eca58b70d31`; older original Shot5 MP4 member hashes `e79e44746e8a8581ecc592e41de20bb67ded7e999042234902ed30b0142a0c9a`.

**Actual FFprobe and independent FFmpeg decode:** the current candidate has 1,031 H264 1080×1920 frames at exactly 30/1 average FPS, plus real 24-kHz AAC; the physical decoded frame scan selects **every frame 773–820 (48/48)** and the crop x720:1079/y830:879 with `crop=360:50:720:830:exact=1`, native BGR24. The existing Lane4 reviewer-qualified critical white-caption mask (each RGB≥160 and R−B<70) in the nominal right 20% unsafe strip x≥864 finds **2,364–2,365 bright caption pixels in each of all 48 frames**. At frame 795, independently extracted and visually inspected `NOT SHOWN` glyphs have native bright-mask bounding box **x739–1019, y839–869**: **156px** past the x864 boundary. For comparison, the package's prior film has **2,367** targeted unsafe pixels per frame in the same 48-frame interval. Minor inter-encode pixel-count differences are *not* clearance; scene4 cleanup has not repositioned Shot5 text.

**Distinct source-binding HOLD:** `source/revised_storyboard.json` matches manifest SHA `70e6bb416bc79c59ebb0d8590801df4494d0112c2fc30b6821506068a3b143f7`, but its internal `encodedH264Sha256` is still **old e79e4474…**, not current **3c4e91b3…**, and `phonePlanSha256=null`. This is a research archive that contains valid payload bytes, **not** a complete authenticated multi-role current-film intake.

**Reproduction/limits:** The scan runs `ffprobe -count_frames` on the extracted current/previous MP4, then `ffmpeg -xerror -i <movie> -vf 'select=between(n\,773\,820),crop=360:50:720:830:exact=1' -vsync 0 -f rawvideo -pix_fmt bgr24 pipe:1`, requiring exactly 48×50×360×3 decoded bytes and counting white-neutral BGR pixels where x>=144 inside the ROI (physical x>=864). A separate single-frame extraction at frame 795 was visually inspected. This is a targeted **negative** caption collision screen, not blanket OCR, a real-app overlay or actual iPhone playback proof. The local independent research JSON receipt is SHA-256 `cb1faacc386fe81ce75cd89aa92122231946288f0dde57956d1ce091cbe328d0`; image crop SHA-256 `eef8fd60862612897cf41b87358e1dc13efd0b5a70fc59eb2f76ffb17cc12cc7`. Both are available as separate conversation artifacts, not yet durable GitHub media, and this Markdown itself does not claim to contain them.

**Owner handoff:** Lane3 should reflow or reposition the meaning-critical `NOT SHOWN` caption left of native x864 for *every* encoded appearance while preserving legibility, science caveat, narration/audio, scene4 fixes and lower app safe area. Then provide a **new exact MP4 SHA, matching source-bound storyboard and non-null source-authenticated phone-plan receipt** via Lane6. Lane4 must independently rerun actual decoded mobile QA on that *new* hash and qualified real-device/voice/science/craft reviewers must still approve independently. Until then: **RESEARCH HOLD; `mayPublish=false`, no new canonical atomic acceptance count, no code/production version modification or PR merge**. No old film's PASS may transfer across hash changes.


## Independent new phone-footnote candidate intake — technical audio PASS, current mobile HOLD (2026-10-17)

Lane5 retrieved the owner-Library ZIP `EvidenceMotion_Lane3_Phone_Footnotes_AB_Research_20261017.zip` **exact outer SHA256 `ed1f941a9508c34a366fc81542b864a7dec65548fe2172f4eead520b378083be`**, ZIP CRC verified and all **7/7 manifest-listed payload SHA256 hashes** independently compared with physical ZIP members. This is the next Lane3 *opt-in 34px science-footnote candidate*, not the prior clean-panel film and not a released master.

**Film identities, independently received:** unchanged source clip `source/before_clean_scene4.mp4` SHA `3c4e91b37958f1e86b6a04486933bbfc719bf6a196203711d6421eca58b70d31`; newest `candidate/phone_footnotes_34px.mp4` SHA **`7a3440aab731082233cb5f700fd40b030c1de0d4ee3d6b011b38e348a98f47c9`**. Both MP4s independently full-decode without FFmpeg `-xerror` failure, each `ffprobe -count_frames` returns 1031 H264 frames at native 1080×1920, 30/1 average frame rate, and 24kHz AAC. Their copied AAC ADTS byte SHA matches exactly **`f0057c19c9d06b8a2f3c6d8fec948ca4555966114579fd1a48b0bcfccc84aa98`** and all **807/807** AAC packet PTS/DTS/duration triples have equal digest `9b5fc79b57ae4745ab1771561d58bc12265542b613a8f863615d31c59f4745c7`. This is *audio stream byte/timeline identity*, not voice pleasantness/phonetic audition.

**New candidate actual native 48-frame Shot5 screen still fails:** decoded real BGR24 H264 frames 773–820, physical crop `crop=360:50:720:830:exact=1`, independently prequalified critical bright-neutral caption mask (R/G/B≥160 and R−B<70) in the protected x≥864 nominal UI band: **48/48 frames each contain exactly 2363 such unsafe pixels**. Exact native frame 795 still shows the `NOT SHOWN` letters spanning **x739–1019 / y839–869**, **156 native pixels** into x≥864. The prior film gave 2364–2365 unsafe pixels, so re-encode drift is NOT a safe-area repair.

**New candidate actual native Scene4 art screen still fails:** decoded 147 consecutive frames 555–701 with `crop=126:106:864:700:exact=1` and Lane4's independently designated critical scientific-art highlight proxy, `max(R,G,B)≥100` and either `max−min≥20` or `min≥75`. **147/147 positive** in the x864..989 science-art strip, **425–569 highlighted pixels/frame**, including 481 at native frame 630. Old source 147/147 positive (423–575/frame; frame 630 477). This is conservative reviewer-chosen visual *negative screen*, not identification of which particular atoms are obscured by live application UI.

The supplied 375px nine-frame A/B contact was visually inspected: labels have changed but their legibility on an actual phone, timed caption reading load, artistic direction and scientific explanation remain **unapproved**. This ZIP carries source/after films and source/research receipt, **not an authenticated current owner-storyboard SHA, a non-null source-bound phone plan or a physical narration WAV**. Do not promote receiver `COMPLETE` using the previous movie's stale story reference. Separate current-candidate scientific/editorial, voice/ear, human craft/phone, and qualified muted-viewer decisions are all missing.

**Reproducible local research receipt:** `EvidenceMotion_Lane5_Phone_Footnotes_Independent_HOLD_20261017.json` SHA-256 `2adacb43e475335be9d32e0b09b65be0c6882fb1a0a53c553319ad4e13595a93` (4155 bytes) independently captures both film identities, 48+147 decoded physical negative frames, actual full-decode and packet hashes, no approvals. The local file is not itself GitHub-hosted and is not a downstream release artifact.

**Handoff to Lane3/Lane4/Lane6:** preserve the 34px footnote trial and original AAC, but actually recompose BOTH critical molecular art and scientific label into nominal x<864 for **every** computed Scene4 frame, and reflow meaning-critical `NOT SHOWN` entirely left of x864 throughout Shot5 without losing the caveat or reducing phone readability; retain no clipping or caption occlusion. Deliver a genuinely new full-film SHA with matching actual story, non-null authenticated phone plan and true original voice/source sidecars. Lane4 must independently examine the *new film's* decoded whole-shot safe areas and real-device readability; Lane6 must verify copied bytes/source-binding, and owner/qualified science/craft/audio experts retain separate authority. **Existing candidate remains research HOLD, `mayPublish=false`, no extra atomic task completion, no production merge or version lift.**


## Exact third physical film — phone-label border repair verified, composition HOLD persists (2026-10-17)

Lane5 independently retrieved the **newest available** owner-Library Lane3 research archive `EvidenceMotion_Lane3_Phone_Labels_Clean_Border_Research_20261017.zip`; exact **outer SHA-256 `37633ce81af34356b7cb529ebe179e4a135f6c4681cc562ea4fb75981eebdfc5`**, ZIP CRC PASS, **8/8 SHA256SUMS payload bytes individually PASS**. It contains three distinct physical encoded movies: original clean-panel `3c4e91b37958f1e86b6a04486933bbfc719bf6a196203711d6421eca58b70d31`, first opt-in phone-footnote `7a3440aab731082233cb5f700fd40b030c1de0d4ee3d6b011b38e348a98f47c9`, and **new border-corrected movie `53cbd9c4d35df96602280d713f6d2f2a1e2ba1bb57a3ec6af593c09d3e83f496`**. Each independently FFprobed to **1,031 H264 native 1080×1920 frames at 30/1** and independently decoded full video+audio via `ffmpeg -xerror ... -map 0:v:0 -map 0:a:0 -f null -` exit 0. Physical AAC ADTS for all three hashes **`f0057c19c9d06b8a2f3c6d8fec948ca4555966114579fd1a48b0bcfccc84aa98`** and the independently extracted full **807 packet PTS:DTS:duration strings hash `e101bbb63f53eec001446107cd2329164aa834c8be87cd0ce100dcec5b164019`** for all three. This proves elementary audio byte/timeline preservation, not human auditory quality or exact spoken-word alignment.

**Actual border improvement verified:** independently decoded native y984–987/x565–949 neutral-bright strip for **all 107 frames 595–701**: before-border-cleanup variant contained **1 neutral-bright pixel per frame (107/107)** in this narrowly preselected strip; new candidate **0/107**, with packaged before/after 375px border crop visually inspected. This supports a real narrow border remnant correction; the original source caveat still appears. It is not OCR or a complete scientific/phone readability approval.

**Current candidate still *fails both independently reproduced* conservative UI negative screens:**

- `NOT SHOWN` Show5 scene: strict native RGB24 `crop=360:50:720:830:exact=1` across **48/48 frames 773–820**; right nominal app-control zone x≥864 contains **2363 neutral-bright caption pixels in each frame**; signoff blocked. At frame 795 the full phone-sized video still places `NOT SHOWN` around x≈255..354 on 375px canvas (rightmost safe-column limit 300px), not a solved composition.
- Calculated 3D scientific art: strict native RGB24 `crop=126:106:864:700:exact=1`, **147/147 frames 555–701** still have **425–569** highlighted art pixels/frame inside nominal x≥864 strip. Its source-side two-column comparison still extends the computed artwork to right native x≈987. A visual two-column example at full film frame 630 was inspected at 375px and confirms limited horizontal space for *both* science displays.

**Production-operation decision / do not waste another full native encode merely on type cleanup:** this 34px border pass should be retained as a useful *partial quality improvement*, but **the next Lane3 creative operation must be a geometry/composition change** (e.g. directed temporally staged full-width molecule → explicit caveat card rather than two equally wide simultaneous panels) and safe reflow of the whole `NOT SHOWN` phrase. Candidate preflight before the expensive full 1,031-frame encode should check representative native stills at computed 3D onset/frame 555, caption onset/frame 773 and middle frames 630/795 against x<864 safe-region and confirm science caveat legibility at 375px. Then **new full candidate media SHA** must pass Lane4's actual *contiguous* 147+48-frame physical screens; do not label a one-frame crop or 375px contact as final phone QA. Require corresponding source-bound current storyboard, non-null owner-reviewed phone-plan, original-WAV identity and independent qualified muted, science, narrator/phoneme, craft and actual handset reviews. Every pending review remains HOLD; this Lane5 operator note confers **no additional 1,590-card acceptance**, no `mayPublish`, no integration/merge.

**Local physical proof:** `EvidenceMotion_Lane5_New_Border_Independent_HOLD_20261017.json` **SHA-256 `71d952a0a63a41c00ccd764ae4dfe3b95ec246ec33f24990b55e4d9682490866`** with per-frame arrays and exact matched movie sources, plus direct encoded preview stills `scene4_630_375.png` SHA `d3a17e9b896c9ced26bacdf6fcb0343ed38deb35e468401577802332f490d88f` and `shot5_795_375.png` SHA `92a5491a4c8a3d206bf18c41d88aabcc4c8ae0f1200fc3069bc9f2c1c88060da`. These are model-conversation research files, not GitHub-hosted/automatic multi-role handoff media.

## Exact sequential Scene4 / Shot5 film — independent Lane5 physical acceptance HOLD (2026-10-17)

**Newest actually received full-length film, not a storyboard-only assertion.** Separately materialized the owner Library `EvidenceMotion_Lane3_Scene4_Sequential_Safe_Research_20261017.zip` and rehashed its actual ZIP SHA-256 **`81ac8b662e5f270e0c78370b1992b6e620f12cbc14ad98347459fb64a2bed381`**. ZIP CRC and **all 14/14 `SHA256SUMS` members** agree against independently extracted bytes. New `films/new_Sequential2D_3D_Shot5_safe_research.mp4` SHA **`45f86dad98f82dbe0e7e21f831529a8bc4256a8a053bd74a94c5666d03a5e122`**, prior exactly supplied film SHA `fdece1d9bbd021d514c2510c5bf1e787a2555712f0fd48af8807994ed1816725`, physically recovered original 24kHz mono WAV SHA `9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435`, source MOL SHA `150ccd331963beab2481ad47c36e1e171db6bdd37e4d50746a3d6b4b5be60bcb`. Source-bound new storyboard SHA **`e2fff8be001a692749c47617498f6c9654ef8a50666f223a54c49786d5ad44fb`**, whose `encodedH264Sha256` points to the exact new MP4, but `phonePlanSha256=null`.

**Independent actual physical review, not copied producer-only numbers:** `ffprobe -count_frames` and strict `ffmpeg -xerror` physically accepted **1,031 decoded native 1080×1920 H264 frames at 30fps and mono AAC**; both supplied movies contain **807 AAC packets**, with identical extracted elementary AAC SHA `f0057c19c9d06b8a2f3c6d8fec948ca4555966114579fd1a48b0bcfccc84aa98` and equal complete packet timeline digest. Independent native RGB24 crop per-frame 7OH negative screen at right x≥864/y550..999 for all Scene4 **204 frames 498–701**: prior **147/204 positive**, new **0/204**. Targeted Shot5 x≥864/y680..959, **48 consecutive frames 773–820**: prior 0/48, new **0/48**. Those repairs ARE real improvements of the defined binary pixel screen; this is not a qualified scientific/craft/phone safety judgment.

**Separately ran Lane4's already-authored, UNMODIFIED full-film `whole_film_right_strip_audit.py`** from physical first-party Lane4 ZIP, not a Lane5-generated fake approval JSON, on this newest 45f86d... movie plus its matching e2fff8... storyboard. It strict-decoded the *entire* **1,031/1,031** frame sequence in its own OpenCV code path and independently strict FFmpeg checked both tracks; completed exit 0, research HOLD. Across x≥864, y192..1573: **0/1,031 bright-neutral positive frames**, but **71/1,031 colored/highlight-positive frames** at contiguous indices **702..772 (23.400–25.767 sec)**, entirely in the separate Shot5 opening card region. Lane4 raw unmodified research report SHA **`e76625395ed12235b4094e47601676e49238f491996e662e4e0c7026a77f5b39`**. A separately decoded 375px frame730 inspection shows the cyan *card border* entering the nominal right zone, while the structure drawing and its onscreen text in that frame appear left of x300/375; **this single-frame impression is a *hypothesis*, not semantic clearance of all 71 frames**. Lane4 should independently classify the continuous residual bright-color window and actual app-overlay/legibility intent instead of automatically calling every colored border a critical molecular-meaning failure or falsely ignoring it.

**Bounded Lane5 machine dossier:** `Lane5_ExactCandidate_IndependentMachineScorecard_HOLD_20261017.json`, local/recoverable conversation artifact SHA **`727af6b153a3150e1829290cee7bba92f0fb00b9135a2cb4103c0be010dc7ca9`**, captures both independent physical scans, source identities, narrow improvement, full-film residual flags, withheld authority and next dependency. This dossier is NOT a file in GitHub or a producer-authenticated phone plan. The separate Lane5 scorecard source/test path now on the existing PR is reviewed independently and should be exercised against this same actual video/independent Lane4 JSON; synthetic tests alone are not full-media proof.

**Production acceptance decision:** exact `45f86d...` is a **REPAIRED ITERATION**, ineligible for first-render perfection or a varied first-render streak. `machineReviewed` applies only to the technical+pixel-proxy checks just run. **`externalIndependentReviewed=false`, `physicalPhoneReviewed=false`, `firstExcellentMasterAccepted=false`, `fiveRenderStreakAccepted=false`, `mayPublish=false`.** Required next ownership: Lane4 classify 71 continuous colorful-border frames and verify mobile text/real-device boundary; Lane6 obtain owner-authenticated non-null exact phone plan and re-validate the same candidate with source/WAV/story/claims; Lane1 and Lane2 separately validate exact science and speech. The human/externally qualified and premium-film gates remain HOLD. **Newly accepted atomic workcards: +0; no protected merge, production import, version promotion or publication.**

## Latest independent 116-frame full-encoded PubChem large-type response — repaired proxy, publication HOLD (2026-10-17)

**Newer than the source-card gutter/focus experiment**, the first-party owner Library `EvidenceMotion_Lane3_SourceCard_LargeType_AB_Research_20261017.zip` independently materialized as **ZIP SHA-256 `60c9a43539fd128afe89b59cf58862f0febf8b7a0af40652198cfad51fb24b80`** and **28/28 SHA256SUMS members** each independently hashed against actual bytes; ZIP CRC PASS. Its previous full film is `1e336488d39c7e070b7edefbad9e3fead26c4ad9cd86e1e487e717113ca5e8a0`; actual new 1080x1920/30fps/1031-frame H264/AAC encoded candidate `c68a4bff5fd3c5b9af77127abfa441ccae3afc4d96c430d4c30cc51d9069fbf7`. The newly archived storyboard directly binds the current new film by SHA but still lists **`phonePlanSha256=null`** and **`renderReceiptSha256=null`**; a source-bound storyboard by itself is not an approved phone plan or a verified original-renderer receipt.

**Independent real pixel screen (not merely sender report):** FFmpeg extracted native true encoded RGB24 of **all 116 consecutive source frames f822..937** from the exact new H264, within fixed crop native `x120,y600,w690,h816`. A separately implemented fixed color/occupancy scanner (`R≥80,G≥165,B≥148`, at least 8 foreground pixels in a row, at least 8 consecutive rows) found **nine identical decoded source-ink line bands on every 116/116 frame**. The actual native ink heights are **64, 63, 52, 56, 53, 52, 49, 50, 55 px** (min **49 native px = 14.52 projected px at 320-wide**), **0/9 below the explicitly experimental 14px 320-wide glyph-ink proxy**. Raw 116-frame decoded ROI SHA-256 `0944a78fb2f28c0822dff0f5361aba0c407b37deb16aae4b787105de6991319c`. This independently corroborates a *real, materially larger-type composition* over Lane4's verified prior six-band card in which 5/6 were below the same exploratory screen; it is **not OCR, semantic/citation identity validation, calibrated human readability, WCAG compliance or an actual-phone trial**. The scan's conservative threshold produced a 49px observed band where sender used 50px for the wrapped definition line, and both remain above the 14px experimental floor.

**Independent unchanged narration transport:** FFprobe physically enumerated both films' 807 AAC packets with exactly identical ordered PTS/DTS/duration/size tuples and FFmpeg copied both actual original encoded ADTS streams to byte-identical SHA-256 **`f0057c19c9d06b8a2f3c6d8fec948ca4555966114579fd1a48b0bcfccc84aa98`**. Independent `ffprobe -count_frames` returned 1031 native H264 frames for the current film. The already-present producer/Lane3 full strict AV decode is separately documented; **a repeated independent strict full-film H264/AAC decode timed out in this run and is NOT claimed successful here**. Source WAV original SHA `9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435` matches received bytes. Physical phone, qualified independent source-science and pronunciation, complete claim/caption/asset join, actual production craft benchmark and authorized release approval remain HOLD.

**Decision:** The earlier `033583d2...` *focus-only animation* remains STOP (no legibility gain), but newer `c68a4bff...` is **PASS of the narrow independently measured complete-scene type-size proxy**, still an iterative research rerender, **NOT an excellent first render**, nor an acceptance of human comprehension or a five-subject streak. No new provisional or accepted atomic-card credit from this check; `mayPublish=false`, no normal WIP admission, main merge, renderer import, publication or R-version promotion. Current local SHA-pinned 116-frame independent report `Lane5_Independent_LargeType_Reflow_HOLD_20261017.json` SHA **`076f2aafed7d7173d9eaf0e5b18fe8b82cfe9f3c096c3a977ae666148f43fd1b`** is user-retrievable in the conversation working files, NOT GitHub-hosted film. Next dependency: **Lane4 independently checks the new nine-line layout in multiple phone viewports and content correctness; Lane6 supplies complete exact-film receipt and authentic non-null phone plan; Lane1/Lane2 source/audio adjudication stays separate.** The Lane5 six-line comparative receipt checker is intentionally not given this sender-created nine-line story report as if it were an L4 six-line per-frame receipt; don't forge a cross-schema PASS.
