# Lane 6: offline exact-byte artifact handoff

Research owner [#6743](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6743),
[October 16 assignment](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6743#issuecomment-6222511493).
This directory alone is Lane 6 owned. No production imports, workflow changes,
canonical scores, lane branches, renderer or original narration edits.

The concrete gap is transfer of actual bytes between conversations. A film title,
GitHub comment or matching dimensions cannot substitute for the revised MP4.
`artifact_intake.py` accepts an offline directory or ZIP, snapshots its actual
files into private temporary staging, checks externally pinned identities, reuses
`native_source_provenance.validate`, `native_master_audit.verify` (full A/V decode,
actual timestamp grid and AAC ADTS fingerprint), and the phone auditor's shot
coverage checks. It can copy that same verified payload to a fresh directory and
rehash every copied file. Before reporting PASS or a handoff path, it also
rechecks the complete destination inventory and every final file hash; changed
or extra destination bytes reject the transfer. Run intake again at the receiving side with the same
independently obtained pin SHA. No network or paid service is used.

## Current received-candidate disposition

**Received legibility candidate07e; complete intake HOLD.** The single received
candidate/blocker registry is [`CURRENT-HANDOFF.json`](CURRENT-HANDOFF.json), backed
by [`receipts/legibility-candidate-physical-receiver-20261017.json`](receipts/legibility-candidate-physical-receiver-20261017.json).
Actual owner Library archive `EvidenceMotion_Lane3_Autonomous_Legibility_Repair_20261017.zip`
SHA `599d93991475d813ad54aaf8115e42cead76f70e00ea70f7805e9ece6a06984d`,
current received film SHA `07e808e35a82294fe8e1c0006b227f6d9435885dfd16daeb78d318edde027769`.
CRC/12 member hashes, both full A/V decodes,1031 native H264 frames each, original
AAC hash/807 packet records, original WAV/MOL and nine-shot story bindings verified.
The existing native auditor confirms1031 actual monotonic video timestamps on30fps grid.

This is distinct from separately reported camera-spacing film5849dd45 whose exact
e0e83700 archive was not found by Library filename and is not received here. No
alternate archive is substituted for it. Previous received45f/fdece candidates
remain historical in registry, never current fallbacks. Recipient context access
to local shared paths must be independently checked.

Phone plan is null; complete exact-candidate sidecars and current proof still
missing. Story renderReceipt points to priorfdece proof absent from current bundle;
current included07e proof has a different hash. Packaged generator also differs
from selected Git-head source: require explicit producer revision, not silent rebinding.
Prior science opening-label redline and sender-reported footer repair stay separately
scoped pending independent current-SHA review. No science/voice/craft/phone/publication
approval; `mayPublish=false`.

## Deliver, pin, check, transfer

1. Lane 3 supplies the actual conversation ZIP using a shared local file or a
   controller-approved first-party artifact. Keep the original ZIP and its SHA.
   The original reported ZIP need not conform to the bridge's sidecar format:
   copy its **unchanged** media/source bytes into a staging directory and add the
   small records below. Any caption, plan or source receipts missing from that
   ZIP must also be supplied. Never manufacture them from a film title.
2. Independently reconcile the staging inventory with the Lane 3 source receipts
   and exact GitHub source revision. Pin seven distinct relative paths and SHA-256
   values in a separate `trusted-pin.json`. Each role is mandatory: `video`,
   `wav`, `captions`, `shotPlan`, `sourceManifest`, `lineage`, `reviewEvidence`.
   Do not take the pin or its SHA solely from the untrusted delivered bundle.
   The pin is a trust anchor, not a signature or proof of authorship. Review the
   original-WAV/AAC mapping against independent source receipts. Reported original
   WAV identity for this candidate is `9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435`.
3. Use this COMPLETE pin shape after that review (replace placeholders with real
   values; repeat the record for every role):

   ```json
   {
     "schema": "em-lane6-trusted-pin-1",
     "state": "COMPLETE",
     "roles": {
       "video": {"path": "film.mp4", "sha256": "64 lowercase hex characters"}
     },
     "media": {
       "width": 1080, "height": 1920, "fps": 30, "frames": 1031,
       "audioAdtsSha256": "independently pinned AAC ADTS SHA-256"
     }
   }
   ```

4. Keep the existing source-provenance manifest format: `finalNativeMasterPath`,
   `originalFinalSha256`, `notReleasableWithoutFinalQualityReview: true`, and
   `sourceInputs` mapping **all actual required source files** to their hashes.
   It must include the WAV, captions, phone plan, lineage and pending review
   record; the master must not be its own source. Every delivered file must be
   either the pinned source manifest, the final movie, or a hash-bound
   `sourceInputs` entry. Unlisted extra movies, notes and sidecars fail with
   `UNPINNED_BUNDLE_FILE` before a handoff directory is created. To include an
   additional source, bind it in the independently reviewed manifest and update
   the separately trusted manifest pin; do not auto-trust arrival hashes. This manifest and all seven role
   hashes are pinned independently. The plan keeps its native `expectedVideoSha256`
   and `shots` (`id`, `startSec`, `endSec`) from the renderer. No plan regeneration
   or science-text change is performed by intake.
5. Add `lineage.json` with `schema: "em-lane6-lineage-1"`,
   `voiceIdentity: "original-kokoro"`, and `videoSha256`, `wavSha256`,
   `captionsSha256`, `shotPlanSha256` matching the independently pinned bytes.
   Explicitly set **each** of `mayPublish`, `craftApproved`, `scienceApproved`,
   `voiceApproved`, `phonePlaybackApproved`, `releaseApproved`, `ownerApproved`
   to `false`. These declarations do not prove acoustic alignment or quality.
6. Add a pending review record with this exact handoff scope. It records work
   still needed, rather than importing approvals from an older film:

   ```json
   {
     "schema": "em-lane6-review-handoff-1",
     "scope": "pending-lane4-exact-film-review",
     "status": "HOLD",
     "videoSha256": "actual delivered film SHA-256",
     "shotPlanSha256": "actual delivered phone plan SHA-256"
   }
   ```

7. Run the bridge; capture stdout in a new receipt file **outside** the bundle.
   Python 3.10+ and FFmpeg/ffprobe on PATH are required. The destination's parent
   must exist, the destination itself must not exist, and the destination
   must be outside the original source directory. Nested handoff destinations
   fail before staging or copying so transfer cannot modify input evidence. Files use portable
   relative names, at most 256 members / 512 MiB, with no symlinks, junctions,
   absolute paths, traversal, device names, ADS or case aliases. Every parent
   component must keep identical spelling/case throughout the package, including
   explicit or empty ZIP directories. A path cannot be both file and directory;
   ambiguous packages fail before media decoding or delivery.

   ```powershell
   python research/evidencemotion-director/lane6/artifact_intake.py `
     --bundle C:/handoff/lane3-payload.zip `
     --pin C:/trusted/trusted-pin.json `
     --pin-sha256 INDEPENDENTLY_COMMUNICATED_PIN_SHA `
     --handoff C:/handoff/lane4-exact-bytes > C:/handoff/intake-receipt.json
   ```

8. Transfer `lane4-exact-bytes`, the separately reviewed pin and the receipt to
   Lane 4, communicating the pin SHA through the coordination issue. Lane 4 runs
   the same command with `--bundle` pointing at the received directory and no
   `--handoff`. Its `files` map must match the sender's receipt exactly. Lane 4
   then runs its own current exact-film OCR/pixel and muted-comprehension audits
   against the role paths. That includes early/middle/late same-crop ordered
   `STRUCTURE ÃƒÂ¢Ã¢â‚¬Â°Ã‚Â  HUMAN EXPERIENCE`, CIDs, computed/not-filmed caveats and mobile
   reading. The bridge does not invoke or award those independent reviews.

Exit codes: `0 = PASS` for intake only, `1 = FAIL` for malformed/mismatched or
unsafe delivery, `2 = HOLD` for unavailable physical inputs. All approval fields
are always false and new atomic credit is always zero. A partial copy caused by
an I/O failure has no PASS receipt; use a fresh destination on retry. Run offline
with one operator and exclusively owned source/destination parents; this utility
is not a sandbox against a hostile local process concurrently replacing files.

## Verification and limits

```powershell
python -B -m unittest discover -s research/evidencemotion-director/lane6 -p test_artifact_intake.py -v
```

The test suite encodes a tiny synthetic blue H.264/AAC fixture and decodes real
media; it tests directory/ZIP handoff and rejection of hash swaps, stale records,
missing inputs, forged approvals, bad paths, ZIP symlinks, directory junctions,
overwrite, incorrect geometry and incorrect encoded voice identity. This fixture
is not Kokoro, source-science evidence or a test of the missing revised film.

Hash equality establishes identity with an independently trusted pin. It does
not establish the truth of a manifest, qualified science review, the original
WAV-to-AAC encoding relationship, acoustic caption alignment, native semantic
pixels, calibrated viewer comprehension, craft, real-phone playback, excellent
first renders or publication approval. Preserve and review original supporting
receipts separately. An intake PASS cannot upgrade any of these gates.


## Verified owner patch: Windows canonical staged receipt

`patches/lane3-windows-canonical-receipt.patch` is a one-line proposal for Lane 3
source head `12c4bb5cf3f052473c68c01cccbc625eabce3313`. It changes only the staged
receipt producer from platform text mode to exact canonical UTF-8 bytes. Existing
publisher, source hash, no-clobber and false-approval guards remain intact. It is
**not applied to Lane 3 or production** by this PR.

Proof: `receipts/lane3-windows-canonical-patch-proof.json`. On an isolated exact-head
copy, the existing physical Windows synthetic H264/AAC splice test fails before
and passes after patch application, including original AAC and all 60 untouched
frame comparisons plus tamper rejection. No actual revised film is accepted.

The owning lane can retrieve this patch, verify its current source against the
pinned head, run `git apply --check <patch-path>`, apply within its authorized
checkout, and run the focused test:

```powershell
python -B -m unittest discover -s research/evidencemotion-director/lane3 -p test_synthetic_craft_splice.py -v
```

Owner must run its remaining required gates and preserve controller-only merge.
Do not assume this patch applies after owner drift; it adds no permission to edit
another lane's source or grant film/science/voice/phone/publication approval.


Portable path regression tests can run without FFmpeg on Linux:

```sh
cd research/evidencemotion-director/lane6
python3 -B -m unittest -v test_artifact_intake.PortableSnapshotTests
```

The case-distinct directory-source test requires a case-sensitive filesystem and
is explicitly skipped on Windows; the ZIP cases execute on both systems. Retain
both platform results rather than treating the Windows skip as a passing case.

Corrupt DEFLATE or LZMA members return a structured `FAIL` receipt with the stable
`CORRUPT_ZIP_COMPRESSION` error. The CLI exits 1 and does not create a handoff
directory; this error does not grant any approval or atomic credit.


## Ready owner handoffs and recovered original inputs

`patches/lane5-consistent-stat-surfaces.patch` is an inert Lane5 proposal pinned to
0da9c00f. It fixes observed Windows path-vs-descriptor ctime false rejection while
retaining both metadata guards, plus one streaming confirmation read against the
observed same-size/restored-mtime mutation case. Four synthetic stat cases and one
actual mutation regression join the existing five scorecard tests:10/10 Windows
and10/10 Linux after temporary application. It adds a read pass, does not establish
an atomic snapshot under arbitrary adversarial writes, and requires owner independent
review and required gates before adoption. No Lane5 source was changed. Exact
red/green/apply evidence: `receipts/lane5-windows-stat-patch-proof-20261017.json`.
The existing Lane3 canonical receipt patch still applies to the unchanged selected
producer blob; owner adoption remains separate.

Original audio inputs are now independently recovered at exact code-pinned SHA:
`receipts/original-audio-input-recovery-20261017.json` provides five environment
variables, stable local paths and a portable capsule. Existing acoustic suite now
runs130/130 including all16 formerly missing-original skips. This proves tested
source/excerpt and research-HOLD behavior; never phoneme identity or release approval.
`receipts/exhaustive-integration-and-runtime-20261017.json` records refreshed
six-head serial simulation,307 distinct selected methods across supported runtimes,
initial failures and platform/runtime follow-ups. No all-platform or full-CI claim.
See [`IMPLEMENTATION-HANDOFF.md`](IMPLEMENTATION-HANDOFF.md) for one checkpoint.
