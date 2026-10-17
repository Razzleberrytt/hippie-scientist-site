# Lane 6 bounded handoff verification — October 16, 2026

Base inspected: `ecc249f5f460ca38be8850375b8b4f4a4d98b448` (`origin/main`).
Owner: [issue #6743 October 16 Lane 6 assignment](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6743#issuecomment-6222511493).
Status: research implementation ready for draft review; genuine revised-film
intake remains **HOLD**. No merge, release or runtime admission is asserted.

## Scope and ownership reconciliation

Read the repository authority chain, current sprint, completion checklist,
atomic execution index, relevant media/provenance callers and recent commits.
Inspected live lane PR paths, source/identity-related diffs and handoff comments:

| Lane / open PR | Inspected head |
|---|---|
| 1 / #6840 | `db063a27b1e6708522eaacf750b1cdd94d9ef8d0` |
| 2 / #6844 | `1af89fe992b497ed95af346e2911f20c46ee910c` |
| 3 / #6831 | `147c58c492b0070d3c6e19f4a486525c422d9032` |
| 4 / #6845 | `e9cd9a49030ebd241abc496eb00d6b1cd39f9592` |
| 5 / #6846 | `ecd73533ef18a96c96fe8805cb816e892c64d534` |

These are snapshots, not claims that their CI or artifact bytes passed here.
Lane 6 adds files only inside `research/evidencemotion-director/lane6/`.
The current sprint records normal WIP **2/3**, A #6769 and R #6810; this
research-only integration assignment adds no normal slot or admission.

## Executed checks

Environment: Windows, Python 3.14.5, FFmpeg/ffprobe 8.1.1, Node v24.16.0.

| Command / observation | Actual result |
|---|---|
| `python -B -m unittest discover -s research/evidencemotion-director/lane6 -p test_artifact_intake.py -v` | **32/32 PASS**, zero failures/errors/skips, after final code mutation. Real tiny synthetic H264/AAC encoding, full decode, timestamps, directory/ZIP transfer and adversarial rejection. Not film-quality verification. |
| `python -B -m unittest discover -s research/evidencemotion-director -p test_native_master_audit.py -v` | **16/16 PASS**. Existing auditor regression suite; its test fixtures are separate from the revised film. |
| `python -B -m unittest discover -s research/evidencemotion-director -p test_native_source_provenance.py -v` | **11 PASS, 1 ERROR**. Existing `test_symlink_blocks` fails during Windows symlink creation with WinError 1314, before validator execution. No skip or PASS claimed. Existing lane-owned test unchanged. Lane 6's distinct ZIP-link and real directory-junction rejection tests passed. |
| `node scripts/ci/validate-doc-links.mjs` | **PASS**, 395 Markdown files at execution; rerun after final documentation updates. |
| `git diff --check` / staged check | **PASS** at execution; rerun before final commit. |
| Missing bundle CLI with checked-in reported expectation | **HOLD**, exit **2**, `MISSING_INPUT:BUNDLE_UNAVAILABLE`; all approvals false, zero atomic credit. Actual output retained in `receipts/shot5-missing-bundle-hold.json`. |
| `npm ci --ignore-scripts --no-audit --no-fund` | **PASS**, 917 packages installed in isolated worktree; package manifest/lockfile unchanged. |
| `npm run build` | **PASS, exit 0**. Full production pipeline completed **36 steps in 1,216.84 seconds**, including Next.js compilation/type checking/static generation, export audits and Pagefind (1,604 indexed pages). Production-visible language audit scanned 1,707 HTML pages with zero findings; structured-data regression check passed 9,243 JSON-LD blocks across 1,651 routes. No deployment was attempted. Actual summary retained in `receipts/production-build-summary.json`. |
| GitHub Actions artifact-list lookup | CLI returned `unexpected end of JSON input`; artifact registry availability is **Unknown**. No assertion that an artifact does not exist globally. No film downloaded or inspected through this path. |

The missing-bundle CLI invocation used local expected path
`C:/handoff/EvidenceMotion_Lane3_Shot5_RepoIntegrated_Research_v3.zip` and the
checked-in expectation pin SHA
`ad262cd0b7a6750cab0a69c388b633ba7efcb25c4af85afba94f36ff6d8a70e2`.
This confirms fail-closed behavior for unavailable input at that path, not a
filesystem-wide search or proof of the reported ZIP's contents. That expectation
is INCOMPLETE and cannot approve any delivered bundle.

## Progress reconciliation and remaining proof

The assignment comment reports **802/1,590** provisional coverage = **95**
individually audited + **707** inherited provisional. The inspected main ledger
and a fresh GitHub contents read instead record **768/1,590** = **61 + 707**.
This discrepancy is retained for the authorized ledger owner; neither number is
silently promoted or rewritten. **Lane 6 new verified atomic cards: 0.**
Canonical checklist remains **26/46**, excellent first render **0/1**, varied
first-render streak **0/5**. None changes from handoff administration or synthetic
protocol tests.

Current physical blocker: actual revised movie reported SHA
`e79e44746e8a8581ecc592e41de20bb67ded7e999042234902ed30b0142a0c9a`,
original Kokoro WAV, exact caption/phone-plan sources and sufficient source
receipts have not been supplied to this task. Reported hashes are not measurements
of those inaccessible bytes. No old film is substituted.

Next action: deliver Lane 3's exact archived bytes through an authorized shared
file or controller-approved first-party artifact; reconcile a separate COMPLETE
pin using original source receipts, then run sender and receiver intake as in
`README.md`. Lane 4 must subsequently inspect the actual new-film pixels/OCR,
same-shot inequality, CIDs, caveats, mobile text and muted comprehension. Qualified
science, original voice listening, independent craft, real-phone playback and
publication decisions remain separate HOLDs. No protected merge is attempted.

## Draft and hosted validation snapshot

Implementation commit: `41f656b506906c70fff8f2a865bcd5ac72fbabb3`.
Draft [PR #6847](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6847).
Coordination [receipt](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6743#issuecomment-6222747803).
At that exact source head, hosted [quality comparison](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/38952407027)
and [atomic contract/release-suite workflow](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/38952407126)
returned SUCCESS. Hosted validation/tests/data, production build/output/SEO,
content lint and site-health checks were **SKIPPED**, not executed PASS. No
Lane 6-specific hosted test execution is claimed; its 32-test result is local.
Final documentation-only head still needs its own protected controller review
and current checks; no earlier head is silently relabeled as final-head CI.
The final update changes validation evidence only; implementation/test sources
remain byte-identical to the locally tested source commit.


## Lane 6 continuation — complete delivered-file identity boundary

Starting head `62511b0e7b78fcac0f2e6745eee7ca7cb711de07`, existing draft
[#6847](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6847).
Status: implementation in draft review; local production build PASS, actual-film intake HOLD.

Observed defect: intake checked required role identities but copied every payload
file, allowing an extra unpinned movie or note to accompany a PASS receipt.
Acceptance: reject every unlisted delivered file before creating the destination;
continue allowing additional source files bound through the existing externally
pinned source manifest; verify all those identities again after decoding.
Reuse: extend the existing provenance validator's checked-file inventory, existing
intake/transfer implementation and existing adversarial suite. No second manifest
schema, new dependency, renderer change or other lane-owned edit.

Changed files: `artifact_intake.py`, `test_artifact_intake.py`, this receipt and
`README.md`, all within Lane 6. Four new test methods cover unlisted movies/notes
in directories and ZIPs, positive sender/receiver transfer of a bound extra source,
rejection of changed extra-source bytes, and a controlled mutation after actual
media decoding to check the final rehash. Before the repair the 35-test suite
failed on two unpinned-payload subcases with an actual PASS response and copied
bytes. After repair: **36/36 PASS**, zero errors/skips; native-master auditor
**16/16 PASS**; doc links **PASS** (395 Markdown files); whitespace **PASS**.
Fixtures use real tiny FFmpeg encoding/decoding and are synthetic protocol evidence
only. Revised shot-5 actual media remains **HOLD**, never replaced by a fixture.

Live coordination rechecked: Lane 3 source head
`5727389a57e09483be7c27dacaae300e7182caf0` explicitly reports the current combined
source film still unavailable in [its latest coordination update](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6743#issuecomment-6223780507).
Prior Lane 6 hosted head `62511b0e7` has successful quality/atomic/controller checks,
with generic validation, production build, content and site health skipped; one
superseded release-suite run cancelled and another succeeded. None proves hosted
execution of this continuation. Fresh build result and exact commit follow below.
No new atomic credit or accepted parent; excellent-first 0/1 and streak 0/5 unchanged.
Original Kokoro WAV, actual film review, phone, science, craft, voice and publication
remain outside this repair's proof. `mayPublish=false`. Protected controller only.

Continuation implementation commit: `8199b7de45621c5bd51e5f6fe43775b29c6d8001`,
verified pushed to the existing draft. Hosted exact-head atomic contract,
merge-controller monitor, generated-quality comparison and generator release suite
all **SUCCESS**. Generic hosted tests/build/content/site-health remain **SKIPPED**;
this is not hosted execution of the Lane 6 Python tests. Local production build result follows.


Final continuation build: **PASS, exit 0**, 36 steps in **908.64 seconds**.
Actual local session exit verified. All 1,722 static pages generated; production
language audit 1,708 HTML pages / zero findings; structured-data regressions 9,240
JSON-LD blocks / 1,652 routes; Pagefind 1,605 indexed pages. Machine summary and
raw-log SHA: `receipts/inventory-boundary-build-summary.json`. This supersedes the
pending-build note for the continuation, not the historical original-build receipt.
Tracked build-generated files outside Lane 6 were restored after execution;
pre-existing untracked generated profile files were preserved. Therefore this is
local production-build evidence, not clean-checkout reproducibility or deployment.
Tested intake/test sources remain byte-identical to `8199b7de4`; subsequent changes
are receipt/documentation only. No UI change requiring theme/viewport screenshots.

Next action: Lane 3 delivers the actual combined film and source sidecars; separately
reconcile COMPLETE pin, run sender/receiver intake, then Lane 4 exact-film reviews.
Do not substitute an older movie or accept an unlisted payload to bypass the blocker.
No new atomic cards, independent approval, protected merge or publication.


## Lane 6 continuation — final destination verification

Starting source `95fa2dd98abf184747733fadb50583fd98947ad0`, existing draft #6847.
Status: repair in draft review; focused tests and fresh production build PASS.
No actual revised combined film has become available in latest Lane 3 comments.

Observed defect: destination hashes were checked immediately after each copy;
a later change to an earlier copied file or an unexpected added file could still
produce PASS and `handoffDirectory`. Acceptance: reconcile the complete destination
file inventory and all final hashes before setting that path or reporting PASS.
Reuse existing portable-path/link guards, digest and transfer; no new protocol or
dependency. Research-only, Lane 6-owned files only; no added normal WIP slot.

Two new controlled-mutation regression methods failed against the previous code
(38 discovered, two failures). After the repair **38/38 intake tests PASS**, zero
errors/skips; existing native-master suite **16/16 PASS**. Tiny real synthetic
FFmpeg encoding/decoding establishes protocol behavior only; mutation hooks do
not simulate actual revised-film acceptance. Failed transfers retain no PASS path;
partial directories still require a fresh destination on retry, as documented.

Previous receipt head `95fa2dd98` hosted atomic contract/controller/quality/release
checks SUCCESS (one superseded release run cancelled); generic hosted tests,
production build, content and site-health SKIPPED. Fresh-head results remain
separate. No new actual-film/voice/science/craft/phone acceptance, atomic credit,
excellent first render or varied streak. `mayPublish=false`.


Final destination repair implementation: `071cf4c128b02c42835fecd28b3082cebcea47b2`,
verified pushed to existing draft #6847. Fresh **production build PASS, exit 0**:
36 steps in **877.19 seconds**, 1,722 generated routes, language audit 1,708 HTML
pages / zero findings, structured-data regression 9,240 JSON-LD blocks / 1,652
routes, Pagefind 1,605 pages. Machine summary:
`receipts/final-transfer-build-summary.json`. Tracked build-generated changes were
restored; pre-existing untracked generated profiles preserved. Local build evidence
only, not clean-checkout reproducibility or deployment. Tested source/test bytes
verified unchanged after build. Doc-links/whitespace PASS after final receipt edit.
No user-facing UI or visual/theme change. Next: deliver the real revised combined
film and source sidecars, independently reconcile COMPLETE pin, run sender/receiver
intake and Lane 4 actual-film review. No other lane-owned changes or new credit.

Exact implementation-head hosted checks observed: atomic contract, controller
monitor, generated quality comparison and generator release suite **SUCCESS**.
Generic hosted tests, production build, content and site-health **SKIPPED**;
Lane 6 test execution remains local. Final receipt-only head needs separate hosted
observation; implementation/build results are not relabeled as that head's CI.


## Lane 6 access-only continuation — physical artifact availability

Starting head `c8d199fac148673096913090bd0f330b34bb1d8c`, draft #6847. This is an
**access-only verification operation**, no repository behavior or implementation
change. Acceptance: inspect current lane reports, directly check available media
artifact bytes against the reported revised film identity, record exact findings
and preserve HOLD on mismatch. No new normal WIP slot or checklist credit.

Fresh GitHub state: final receipt head `c8d199fac` atomic/controller/quality/release
checks SUCCESS; generic tests/build/content/site-health SKIPPED; one superseded
release run CANCELLED. No reviews, draft OPEN. Latest Lane 3 head
`861322d0ee3f79e7c9e735cbcb2e3a2588fe9988` still reports combined film undelivered.
Its director run `38976358826` and critic run `38976358833` each expose zero
artifacts. Related successful ASR run `38976358908` exposes three artifacts.
Repository-wide artifact listing again failed `unexpected end of JSON input`;
no global absence conclusion is drawn. The reported local bundle path does not
exist; this is a check of that path only.

Actually downloaded ASR media artifact **12079387576**, **21,897,215 bytes**,
ZIP SHA-256 `eb6b9037a2636c3c62a91d0bdcc6f6a4a17e6b0ab1c96fa9a6ed446d2e2c5b1e`.
ZIP CRC validation **PASS, all 136 members**. Streamed and hashed **all six MP4
members**, without extraction or substitution. **None** equals the requested
revised-film SHA `e79e44746e8a8581ecc592e41de20bb67ded7e999042234902ed30b0142a0c9a`.
The timed-native candidate is instead
`8d7c5e8649a9ba5ce905ae5ac0a968ac6051405547b34109eda75f89cb9ac3eb`.
No WAV member is supplied. Full member paths, sizes and measured media hashes:
`receipts/available-lane3-artifact-inventory.json`.

Disposition: **HOLD_REVISED_FILM_NOT_IN_THIS_ARTIFACT**. No original-WAV identity,
full A/V decode, pixels, science/craft/voice/phone review or final-media acceptance
is asserted from CRC/hash inspection. Existing intake/test bytes remain unchanged;
no production build rerun is required for this explicitly access-only operation
under AGENTS.md rule 10. Documentation/receipt validation runs after mutation.
Next dependency remains Lane 3's actual 4,419,781-byte conversation bundle,
reported ZIP SHA `86d802f3819320c6d645c5a8d93e8880ac82d02ed77de833c1cf5a4d1aaffea9`,
plus original WAV and sufficient caption/plan/source sidecars to independently
reconcile a COMPLETE trusted pin. Owner may provide its shared path or actual
GitHub artifact; do not rebuild or substitute a different film across lane ownership.
New atomic credit 0, first excellent 0/1, varied streak 0/5, `mayPublish=false`.


## Lane 6 access-only continuation — six-lane integration probe

Starting lane6 head `3a285313bf5fb2841ec71cd91f98735982453e51`, main
`ecc249f5f460ca38be8850375b8b4f4a4d98b448`. Access-only source compatibility
verification; no source behavior changed, branch merged, ref updated, protected
controller invoked or other lane-owned file edited. Acceptance: combine the exact
six lane heads in temporary Git tree objects; check shared renderer edits preserve
both caption and reflow contracts and intake remains compatible with latest phone
auditor; retain any failures. No actual-film substitution or new normal WIP slot.

Live path inventory found Lane 1 and Lane 3 both changing
`narration_locked_treatments.py`. Sequential `git merge-tree --write-tree
--name-only` in order lanes 1,2,3,4,5,6 returned exit 0 at each step. Unreferenced
synthetic commits support the next probe only; no checkout/branch/main changed.
Final combined tree `fb11bde189ecc1c69f0aa8e9ef880f3731a52b43`, research-directory
archive SHA `11bd53fc8c89ef617910c370e92d381e53b21762c5d78e058bd682088ba1a5fa`.
Exact per-lane heads/trees, runtime, log hashes and reproduction commands are in
`receipts/six-lane-integration-probe.json`.

Reused the available Python 3.12.14 visual runtime and pinned DejaVu font directory
from the narration-audit worktree. Earlier memory guidance pointed at a different
worktree; paths were checked live and the runtime actually used is recorded.
Fresh actual temporary-snapshot tests:

| Suite | Actual result |
|---|---|
| timed caption windows | **7/7 PASS** |
| narration-locked treatments | **19/19 PASS**, no font/dependency skip |
| phone auditor | **121 PASS + 2 setup ERRORS** out of 123; no skip or PASS waiver |
| native-master auditor | **16/16 PASS** |
| lane6 artifact intake against combined sources | **38/38 PASS** |

Total **203 discovered / 201 PASS / 2 ERRORS / 0 skips**. Both errors are Windows
`WinError 1314` in `ReportOutputAliasSafety` while creating directory symlinks,
before auditor guard execution: `test_symlinked_output_dir_cannot_hide_generated_input_path`
and `test_symlinked_output_directory_cannot_bypass_alias_guard`. These tests were
not edited or excluded. This is not a fully green combined suite. No code failure
was observed in the executed shared-renderer/intake checks, which is a bounded
sampled-compatibility result, not full cross-lane certification. No lane2/5-specific
test suites, workflows, full combined production build or real revised movie were
validated by this probe.

Only this record and the new receipt change. Doc-links/whitespace checks follow.
No repeated production build for this explicitly access-only operation under
AGENTS.md rule 10. Latest lane3 coordination still says revised combined film absent;
original pending location question remains unanswered. Actual film/phone/science/
voice/craft and release HOLD, no new 46/1590 credit, excellent-first 0/1 and varied
streak 0/5 unchanged; `mayPublish=false`. Next: exact owner media delivery and
Linux/symlink-capable execution of the two named tests before claiming all-green
combined validation. Sole protected merge controller retains authority.


## Lane 6 access-only continuation — Linux symlink guard execution

Starting lane6 head `50249e9bb62ad0ab6aac245ded5f9ba256c6f035`. Observable
acceptance: execute both previously setup-blocked tests unchanged in a real
symlink-capable environment against the exact pinned combined source tree, without
editing lane4-owned tests, installing dependencies, or weakening the guards.

Existing Ubuntu WSL environment found; Python **3.12.3**, test temp directory
`/tmp`. No FFmpeg/Pillow/NumPy/RDKit available there, but these two early alias
rejection tests require none of them. Executed unchanged exact methods with
`wsl -d Ubuntu --cd <previous-snapshot-director> --exec python3 -B -m unittest -v`.
Both create real Linux directory symlinks and exercise the alias guards. Actual
result: **2/2 PASS**, zero errors/skips, exit **0**, unittest reported **0.003s**.

Checked `phone_ui_audit.py`, `test_phone_ui_audit.py` and `native_master_audit.py`
byte-for-byte against combined tree `fb11bde189ecc1c69f0aa8e9ef880f3731a52b43`;
all match. Git blobs, SHA-256 values, exact command, environment and test names:
`receipts/linux-symlink-integration-followup.json`. No snapshot/source/test mutation.
The original Windows run remains **201 PASS + 2 setup errors**, not overwritten.
Across Windows and Linux there are now passing executions for **all 203 distinct
focused tests on this pinned prior combined tree**. This is not one all-green
single-environment run, full combined CI/build, or current moving-head acceptance.
Lane heads have since advanced; this result must not be relabeled to those heads.

At previous lane6 receipt head `50249e9bb`, atomic/controller/quality/release hosted
checks SUCCESS; generic unrelated tests/build/content/site-health remain skipped,
no independent review. New receipt-head CI separately pending. Latest lane3 still
requires real revised combined-film delivery. No actual media hash/decode/OCR,
phone playback/science/voice/craft approval or new 46/1590 credit. `mayPublish=false`,
excellent-first 0/1 and varied streak 0/5 unchanged. This record + one receipt only;
access-only operation under AGENTS.md rule 10, no repeated production build.
Doc-links/whitespace checks run after these edits; protected merge remains controller-only.


## Lane 6 access-only continuation — audio/replay integration gaps and Windows findings

Starting lane6 head `3dc392a0b64d9d9fbed396373a4635f03a26dd6a`; main unchanged
`ecc249f5f460ca38be8850375b8b4f4a4d98b448`. Prior receipt-head atomic/controller/
quality/release hosted checks SUCCESS; generic unrelated checks skipped. New lane
heads changed since the previous probe, justifying fresh bounded integration tests.
Acceptance: pin all six heads, combine only in temporary source tree, exercise
previously uncovered Lane2/Lane5 guards plus shared renderer/intake/splice seams,
classify observed failures without editing another lane's owned source or waiving
checks. No new normal WIP slot. Exact heads/intermediate trees/commands/log hashes:
`receipts/audio-replay-integration-probe.json`.

Six sequential merge-tree operations again textually clean; combined tree
`bf1d306d4218ebb7047f8f497bf618cb274a7699`. Research and workflow files exported
to private temp staging; no real branch/ref/owned-source integration. Existing
Python 3.12.14 visual runtime + pinned fonts used for Windows tests.

| Suite | Actual Windows result |
|---|---|
| repeated-term acoustic guard | 68 PASS / 16 source-input SKIP |
| exact-WAV alignment (imports acoustic tests too) | 131 PASS / 17 source-input SKIP |
| native stdin/replay guard | 63 PASS / 13 ERRORS |
| narration treatments | 19/19 PASS |
| caption windows | 7/7 PASS |
| Lane6 intake with latest combined phone auditor | 38/38 PASS |
| physical synthetic full-film splice | 1 ERROR after actual H264/AAC operation |

373 test executions contain 84 imported repeats: **289 distinct tests = 258 PASS,
14 ERRORS, 17 SKIP on Windows**. No duplicate or skipped result becomes credit.
Native replay errors classify as seven Windows symlink privilege errors, four
fixed `/usr/bin/ffmpeg`/ffprobe admission cases unavailable here, one Windows
read-only staging cleanup error, one fixture raw-byte mismatch. Nine of these
cases (seven symlink + cleanup + byte fixture) then **9/9 PASS unchanged on WSL
Linux**, exit 0. Initial local follow-up launcher incorrectly duplicated method
suffixes (nine loader errors, no real tests executed); corrected IDs and reran.
No test exclusion or code change. WSL lacks FFmpeg; four fixed-binary media cases
remain unexecuted in a supported environment by Lane6.

Concrete findings for owning lanes, not silent patches to their source:

1. **Lane3 Windows producer bug:** `splice()` stages JSON using `write_text`,
   which writes CRLF on Windows; its own publisher compares exact LF canonical
   UTF-8 bytes, producing `STAGED_RECEIPT_CONTENT_CHANGED` after real codec work.
   Independent unchanged-publisher unit reproduction: text-write yields CRLF and
   HOLD with no output; canonical-byte write passes the same identity guard.
   The latter uses unit identity bytes, not movie acceptance. Small candidate:
   write exact UTF-8 canonical receipt bytes, retaining finite-JSON/no-clobber and
   exact hash checks. Do not normalize or relax the receiver's byte guard.
2. **Lane5 Windows staging cleanup:** earlier pinned sources are chmod 0444;
   on later unavailable revision the finally `shutil.rmtree(stage)` raises
   WinError5 on that earlier read-only file, masking the original HOLD and leaving
   staging behind. Exact test passes Linux. Owner must preserve safe owned-stage
   cleanup and source/admission constraints in any Windows repair.
3. **Lane5 fixture portability:** `_write_pair_fixture` writes receipt/environment
   text with platform newline conversion but pins canonical encoded bytes.
   Windows positive test fails `PHYSICAL_ENV_FILE_SHA_MISMATCH`, Linux passes.
   Fix fixture writes to exact pinned bytes; preserve strict receiver checking.

No other lane source edited; findings handed to existing #6743 coordination and
#6847 review. New source acceptance is **partial**, not all-green cross-lane CI.
Actual revised film remains undelivered in latest Lane3/Lane5 updates; no film,
voice/science/phone/craft approval or new 46/1590 credit. `mayPublish=false`,
excellent-first 0/1 and varied streak 0/5 unchanged. Only this record + new receipt
change. Access-only testing under AGENTS.md rule 10; no repeated production build.
Doc-links/whitespace validation follows mutation. Next: owners repair their named
platform findings, then rerun affected pinned checks; exact combined movie and
source sidecars are still required for the real handoff. Controller-only merge.


## Lane 6 access-only continuation — Lane5 fixes and real original-input receiver

Starting lane6 `441defdbb567897230e66318f9919515c8a01920`. Observable acceptance:
independently rerun the owner-fixed Windows failures and verify newly available
first-party recovery bytes into a physical receiver copy; keep revised-film and
publication identity boundaries explicit. Scope access-only execution and local
receipt, no other lane-owned source edit/new normal WIP slot or protected merge.

**Lane5 source `0aabf6dd8c66e7ca922d8fd70b60e2f98e68304c`: six targeted Windows
checks PASS**, exit 0, zero errors/skips, unittest 1.137s. Includes original missing
Git-revision cleanup test, read-only cleanup/error preservation, foreign-file
cleanup refusal, canonical-LF fixture, physical positive fixture, CRLF-mutation
negative. Thus the two earlier Lane5 Windows findings are independently verified
fixed at this source. Symlink privileges and fixed `/usr/bin` media-policy limits
are separate. Lane3 inspected `a0b5b370a26afe4023f462ff0161a7ebf0582c98` still uses
`staged_receipt.write_text`; that producer newline finding remains unresolved.

Actually downloaded first-party [artifact 12084799185](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/38991294207/artifacts/12084799185):
outer ZIP **7,090,029 bytes**, SHA
`ef3c3cfecad862ea457d246ade8e7fbf1aa896b6e7a42602824cc0ed50eb2187`;
inner portable ZIP **7,093,290 bytes**, SHA
`dfce925fb2474c46da975ce94b46437e371a8fcac4758326515363cf21146c8d`.
Outer/inner CRC checks PASS. Exact file inventory is 31 hash-manifest entries plus
the manifest and release-HOLD note. All **31/31** entries independently rehashed;
all **11/11 original renderer** files match owner-frozen PINNED constants AND
independently read exact source-Git revisions/bytes (source commit/blob identities
recorded in receipt). No archived executable was run to validate itself.

Original received WAV SHA
`9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435`,
physically opened as **PCM16 mono, 24,000Hz, 824,336 samples**. Both A/B movies
hash `c100779c2c6c15005fdef9c5166da957c8dd6f51226d45f7c2264f0a89206322`;
independent `ffprobe -count_frames` reads exactly one H264 video + one AAC audio,
**1,031 decoded frames, 1080x1920, 30/1fps, yuv420p** each. Separate full FFmpeg
`-xerror` audio+video decodes **exit 0 for each received movie**. The receiver's
local FFmpeg binary is recorded; this does not recover historical encoder bytes.
No new full source render or source/narration modification.

Concrete receiver copy retained OUTSIDE repository checkouts:
`C:/Users/Will/.codex/attachments/lane6-original-recovery-12084799185/` contains
the unchanged portable ZIP and verified `payload/`. This is an available local
copy, not a permanent external escrow guarantee. Complete paths, test command,
log SHA, WAV/movie observations and 31 file identities:
`receipts/lane5-windows-fix-and-original-receiver.json`.

**Revised-film HOLD remains:** neither recovered MP4 has requested revised SHA
`e79e44746e8a8581ecc592e41de20bb67ded7e999042234902ed30b0142a0c9a`.
This historical input recovery package is not the bridge's full revised-film role
bundle; no `artifact_intake.py` PASS is asserted. Exact revised caption/phone-plan/
source sidecars remain necessary, followed by sender/receiver and actual Lane4 QA.
No acoustic WAV-to-AAC equivalence, original-font/encoder escrow, science, real
phone, craft, voice or publication approval. New atomic/parent credit 0,
excellent-first 0/1 and varied streak 0/5 unchanged; `mayPublish=false`.

Only this record + new receipt change; doc-links/whitespace checks follow. No
production build rerun for this explicitly access-only operation under AGENTS.md
rule 10. Prior lane6 receipt-head relevant hosted checks SUCCESS; this new head
requires separate hosted observation. Protected controller remains sole merge path.


## Lane 6 access-only continuation — actual historical movie pause-window scan

Starting lane6 `bee839fe703789d349f0d4a8098298cb23a8c98e`; relevant hosted checks
SUCCESS, generic unrelated site checks skipped. Latest Lane3 source pinned at
`00290fbc4c3c807d29c56702ba0701540a63928a`; its receipt text-write issue remains
unchanged, and exact revised-film delivery remains unavailable. No owner code edited.

New unblocked input: Lane6 now physically possesses historical movie
`c100779c2c6c15005fdef9c5166da957c8dd6f51226d45f7c2264f0a89206322` and original
WAV `9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435`.
Observable acceptance: use existing Lane3 measurement functions on these actual
bytes to inspect every nominal-clock movie frame intersecting the source zero
window, preserve hashes before/after, distinguish historical-film measurements
from the still-blocked exact revised movie/storyboard audit and creative decision.

Copied the exact source-Git `decoded_shot_variety.py` to temporary execution staging,
no source mutation; reused `read_metadata`, `frame_midpoint_lattice_in_zero_run`
and `measure_source_hold_motion`. Original source WAV physically opened and its
pinned **[663600,746160)** sample interval verified all-zero (3.44s at 24kHz),
with nonzero signal found in neighboring 20ms windows. Actual movie frame count
1,031. Integral frame-midpoint mapping selects **104 frames 829–932 inclusive**.
Full linear H264 decode produced all selected body-area ROIs and **103/103 adjacent
comparisons**: mean gray MAE **0.000100/255**, maximum **0.000467/255**, all below
existing diagnostic **0.5/255** threshold; longest low-motion range **[829,933)**,
104 frames. These are measured values, not synthetic examples or an artistic veto.

Independently decoded actual movie AAC to mono PCM16 24kHz: **825,344 samples**
(includes codec/container duration behavior, not asserted sample-equivalent to
824,336-sample WAV). Conservative movie-clock **[28.0,30.8)s** window has
**67,200 samples, all exactly zero**. No audio retiming, trimming or production
caption change. Film and WAV hashes match again after decoding.

Decoded actual movie frame **875** and visually inspected it: visible SOURCE /
PubChem card with mitragynine and 7-OH CID labels. This is one frame review,
not all-frame OCR, science identity approval, handset or audience comprehension.
Sample retained outside the checkout:
`C:/Users/Will/.codex/attachments/lane6-original-motion-c100779c/original-film-frame-0875.png`.
Machine report: `receipts/original-film-source-window-motion.json`, including exact
module Git blob/hash, source input identities, measurements and image SHA.

**Boundary:** the source recovery render receipt names a different encoded movie
identity, so no matched story was forged or relabeled. Full Lane3 `audit()` was
NOT called; only its existing low-level measurement functions were used, with
explicit nominal-clock association. This is a direct historical movie/audio
observation, NOT original+revised story-linked source-hold acceptance. The static
card may intentionally permit source reading. Only owner listening/craft decision
can choose any pacing edit, and a new film/caption/source identity plus full QA
would then be required. No original/revised film rerender, bytes changed or
publication approval. No new atomic/parent credit, excellent-first 0/1 and varied
streak 0/5 unchanged; `mayPublish=false`.

Only this record + new receipt change. Access-only under AGENTS.md rule 10, no
repeat production build; doc-links/whitespace checks follow. New receipt-head CI
separately unverified. Protected controller retains merge authority; actual revised
film and matching story/caption/phone/source sidecars remain the handoff dependency.
