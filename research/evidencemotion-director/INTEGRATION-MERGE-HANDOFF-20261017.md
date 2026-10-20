# EvidenceMotion remaining-lane integration handoff - October 17, 2026

Existing research owner #6743. User authorized all current lane merges. Lane6
#6847 merged as 5a2fedcf and Lane2 #6844 merged as 09032fc9; both exact deployment
runs succeeded. This single integration preserves the four remaining lane head
ancestries over main 09032fc9593ff45d76343dc05ab1eac70b769338.

## Source pins and scope

- PR #6845: `1bfb3395afc2b104f37f9fbf56f6ba36c7c86cf7`
- PR #6840: `b30af0ba355509c5ee94dcad51cdad5201285abb`
- PR #6831: `c1f051185805a53dc71eb29c4fd8160b9abd17d9`
- PR #6846: `2b56b51d144d68c540eb9d3098fb972ae430e7f8`

[Machine source/test receipt](INTEGRATION-SOURCE-HEADS-20261017.json) records exact
pins and verification scope. Individual PRs have temporary hold-merge labels to
prevent competing merges during this aggregate check. Their scientific/research
holds remain independent. After controller merge, verify every pinned head is an
ancestor of main and observe each source PR state before claiming it merged.
No force push, direct protected-main write or release-gate relaxation is used.

The 210 inherited changed paths are confined to EvidenceMotion research and its
scoped workflows. Combined sources retain original-WAV, source/claim, caption,
phone, anti-template, native-capture and artifact-integrity guards. Merge-review
repairs are recorded in lane3/MERGE-REVIEW-REPAIRS-20261017.md,
LANE4-ENCODER-SQUARE-PIXELS-20261017.md, LANE5-MERGE-REVIEW-REPAIRS-20261017.md
and the EM00604/EM00705 evidence notes. Reuse the existing sole trusted-main
controller and production/quality/security checks; no new merge system.

## Fresh validation

- Linux isolated visual Python on combined preflight head e919b245: 403 tests,
  402 PASS, one explicit original gut archive input SKIP; no failures/errors,
  structured exit0. The first receipt-wrapper run failed after green tests because
  Linux Git could not parse a Windows worktree pointer. Corrected wrapper received
  the Windows-resolved head explicitly; complete rerun returned exit0.
- Lane5 then advanced only its scorecard source/test to retain AAC anomaly holds and repeated timestamp drift.
  Included that head and reran its affected suite: 21/21 PASS, no skips, exit0.
  This follow-up is separately recorded rather than calling the earlier run an
  execution on the later head. Other preflight-covered source blobs unchanged.
- Node reusable director, previz, story-first and botanical suites: 62/62 PASS,
  no skips, exit0. Documentation links and whitespace checked before commit.
- Every selected lane head is preserved as an ancestor. Native protected full
  CI/build, all applicable research jobs and independent PR review still required
  on the final integration head before controller merge authority exists.

## Unverified boundaries and next gate

Full original-film re-render, actual WAV/acoustic inputs and hosted original
archives are not established by the synthetic/mechanical focused suite. The
optional original gut archive was absent locally. Its skipped case is not PASS.
No qualified human science, phonetic, visual craft, physical handset, first
excellent render, varied-render streak or publishing approval is created.
mayPublish=false; research HOLD and existing accepted score boundaries remain.

Next gate: exact final-head hosted CI/build/research checks and review, then sole
controller merge, source PR reconciliation, and exact deployment receipt. Old
integration PRs #6817/#6825 are outside this selected four-lane snapshot; they are
not silently merged or credited by this handoff. No new normal WIP admission.


## Native integration gate failure and physical OCR replay repair

First integration head 3c4215c2 failed actual original-WAV job 39051581769 at
critical caption OCR: sentence_2 hydroxyl. Retrieved its first-party artifact
12107564530 and verified actual MP4 SHA5028e671d7e0525dc6768d6b93e252fab57cb149affc47e235ae66b397e39d7d
against render receipt b17b9af0224b21096e20faed2ac1b8782cfe674fd170456e0be7a3976c5fea53.
Raw sparse-page OCR split the word or read its final glyph as punctuation.
Bounded font/contrast prototypes and a single-line-only OCR attempt did not
resolve every cue; no renderer edits from those experiments are retained.

Repair reuses the existing OCR backend with constrained segmentation modes.
Caption crop starts at its actual native y1310 field, excludes clipped science
text above it and retains the full five-line region to y1590. Detect line bands
from decoded pixel luminance, choose line/block segmentation from that layout,
and apply the same explicit black/white luminance mask to EVERY sampled caption
before OCR. No expected words, transcript, dictionary, per-word threshold or
answer annotations enter the OCR call. Preserve raw crop and derived-mask SHA.
Source-card OCR retains sparse-page mode11. Exact-token, missing-word and
pre-reveal veto logic is unchanged; scope explicitly requires the specimen
research renderer. This is not an original-color contrast or human-reading pass.

[Physical replay and negatives](INTEGRATION-OCR-REPAIR-20261017.json): SAME immutable
failed MP4, 8/8 critical words, 3/3 pre-reveal absences and both decoded PubChem
identity/CID joins PASS, 12 sampled frames, exit0. No movie/WAV pixels rewritten.
Actual OCR of a synthetic blank mask returned the spurious text So; it still
failed the missing-critical-word check. A synthetic premature not was read by
actual OCR and rejected by the existing pre-reveal gate. No blank-image OCR
infallibility is claimed. These negatives do not constitute new source media.

Focused tests: encoded-caption suite Linux9/9 and Windows9/9 PASS; pixel-recovery
suite Linux16/16 PASS; all exits0. Full final-head CI/build and regenerated native
replay remain required. All-frame OCR=false, independent comprehension=false,
mayPublish=false, qualified science/voice/craft/physical-phone/release HOLD retained.


## Current-main and source-head follow-up

Main advanced with Lane3 PR #6831 as 7882858ebcdd948d37ac00a1b0594c75d7920fe0.
Integrated that actual base without rewriting history. Included current Lane1
be2d4be798c2c66fed5096a725bc20e37831fad3, Lane4
078fcd43b2e49121fc0e6fcebc84517812eaa784 and Lane5
a18034a998b83bb875f286d391f93404ebd0d4ba. Beyond the prior snapshot these changed
only science-package, phone-audit and scorecard source/tests. All merges clean.
Fresh Linux affected suites: phone246/246 PASS; science26 PASS/one optional
original-archive SKIP; scorecard21/21 PASS; exits0. Machine receipt retains
prior snapshots rather than relabeling their earlier tests as final-head proof.
Final hosted CI/build/research validation and protected controller remain pending.


## Exact-base race reconciliation

All applicable c283602da checks passed, including CI39053394527 and repaired
native39053394553. Before controller merge, main advanced via PR #6850 to
4472c696c483fffa2a6344225f1956861d9d5b18 (four research gut-v9 audit files).
Synchronized main normally; no gate or source history bypass. Also included final
Lane4 snapshot4ce9605f883c411f9a906c733da240dc4a947a40: paired 2.5ms source-active
PCM dropout negative screen and honest codec-tail scope, not phonetic acceptance.
Fresh mobile suite Windows33 PASS/one symlink privilege SKIP, Linux34/34 PASS,
exits0. The earlier full CI/native success remains proof of that earlier head,
not final readiness. Current exact-head checks/controller/deployment still needed.

## Lane1 provenance followup

Included source d944ae1e88839c14e038faec6e927d4a4817c5cd after inspection:
only atomic_progress_stall_watch.py and its test changed. Historical artifacts
must match a completed successful GitHub proof workflow and source revision;
reruns of one revision cannot impersonate independent progress checkpoints.
Fresh Windows focused suite: 15/15 PASS, no skips, exit0. Hosted exact-head
CI/build/native checks still required. Research HOLD and mayPublish=false remain.
