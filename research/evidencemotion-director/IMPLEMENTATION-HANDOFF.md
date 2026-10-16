# EvidenceMotion continuous implementation handoff

Updated 2026-10-16. Maintained after every meaningful implementation batch. ChatGPT and Codex both implement, test, debug, maintain PRs and account for progress. Resume from GitHub, not conversation history. Re-read this file and latest remote head before work; never assume this checkpoint remains newest.

## Historical checkpoint (latest restage checkpoint below)

- Repository: https://github.com/Razzleberrytt/hippie-scientist-site
- Owning issue: #6743, research-only; existing PR: https://github.com/Razzleberrytt/hippie-scientist-site/pull/6817
- Remote implementation branch: `research/evidencemotion-all-green-operator-integrated-6743`.
- Local isolated branch: `research/evidencemotion-continuous-handoff-20261016`.
- Exact starting remote commit: `cc075f3e098f053c401911343b0c6fca7fb984e1`.
- Exact implementation commit (pushed to existing PR branch): `3e5610d2592f4fcb3dae82d19bc1f90a727d9a45`. This documentation checkpoint is a descendant; resolve its containing commit with `git log -1 -- research/evidencemotion-director/IMPLEMENTATION-HANDOFF.md`.
- Scope/status: packet shot-inventory integrity repair implemented, targeted verification passed, release acceptance pending. No production integration or extra normal WIP slot.

## Batch: exhaustive source-bound blind stimulus

Observed failure before repair: six freshly rehashed, mutually matching phone/story inventories (empty, truncated, duplicated, reversed, unknown shot, missing IDs) passed `verify_sources`. New adversarial regression failed all six cases on original code.

Repair reuses `narration_first_story_map.STORY` to require the exact complete nine-shot order in both receipts. Malformed containers and entries produce an explicit `BLIND_STIMULUS_SHOT_ORDER_CHANGED` hold. Source WAV, film, visual rendering, answer choices and approval flags unchanged.

Changed files in this batch:

- `research/evidencemotion-director/timed_soundoff_review_packet.py`
- `research/evidencemotion-director/test_timed_soundoff_review_packet.py`
- `research/evidencemotion-director/IMPLEMENTATION-HANDOFF.md`
- `docs/CURRENT_SPRINT.md`
- `docs/MASTER_BACKLOG.md`

Completed atomic IDs: **none newly credited**. This repairs the existing `EM-034.12` instrument. Ledger freshly verified as **740/1,590 (46.5409%) provisional coverage**, comprising **33 machine-audited research cards + 707 inherited provisional cards not individually audited**. Audience/calibrated craft/science/handset/voice/release acceptance remains distinct. `mayPublish=false`.

## Fresh validation

Local Python 3.14.5 on Windows, 2026-10-16 (hosted workflows use their pinned Python version):

```powershell
python -m unittest discover -s research/evidencemotion-director -p test_timed_soundoff_review_packet.py -v
# PASS: 8 tests; before repair 6 adversarial subcases failed as expected.
python -m unittest discover -s research/evidencemotion-director -p test_narration_first_story_map.py -v
# PASS: 5 tests.
python -m unittest discover -s research/evidencemotion-director -p test_validate_atomic_proof_ledger.py -v
# PASS: 7 tests.
python research/evidencemotion-director/validate_atomic_proof_ledger.py
# PASS: 5 proof groups; 33 + 707 = 740 / 1590; approval false.
```

Production build: `npm run build` started; bootstrap reported absent dependencies and invoked `npm ci`. Final outcome must be recorded below before treating this gate as passed. No new full native render or real viewer session has been run locally for this repair. Exact-head hosted CI, production build, and protected sole-controller merge remain pending.

## Next executable task

1. Fetch the current remote implementation branch and inspect this file plus `git log`; integrate any newer ChatGPT/Codex work without overwriting it. Never force push.
2. Obtain the current batch's production-build outcome and current-head workflow results, especially `evidencemotion-actual-asr-research.yml`, which already runs the packet tests and builds the actual silent review packet. Prior successful media receipts do not prove this changed head passes.
3. If a gate fails, reproduce and repair that failure in the same #6743 scope, run targeted checks, update this handoff and commit/push the small batch.
4. Once integrity gates pass, continue the existing independent blind sound-off pilot acceptance. The instrument is ready for a real study; no real respondent answers, consent, independent craft evaluation or physical phone review have been supplied. Do not synthesize any. Keep `EM-034.12.T/R` on HOLD until their evidence exists.
5. Protected merge requires current exact-head gates and the existing sole merge controller. No direct merge or publication authority follows from this handoff.

## Continuous protocol

Keep batches independently verifiable; commit and push completed work promptly. Update this file after each meaningful batch with branch, exact implementation SHA, changed files, atomic IDs, pending tests, known failures and next executable task. ChatGPT has full implementation responsibility during Codex downtime. Reconcile counts against the current ledger before reporting a new total. Do not rely on uncommitted local files or conversations for continuation.

## Checkpoint receipt after implementation push

- Implementation commit `3e5610d2592f4fcb3dae82d19bc1f90a727d9a45` successfully pushed without force to the existing PR branch; GitHub PR head confirmed equal.
- `git diff --check`: PASS. `node scripts/ci/validate-doc-links.mjs`: PASS, 387 Markdown files, no broken relative links.
- Hosted atomic ledger gate for that commit: [38893845280](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/38893845280), SUCCESS. This receipt applies to that exact implementation SHA, not automatically to later documentation checkpoints.
- Hosted native original-WAV gate: [38893845346](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/38893845346), in progress at observation. Full CI: [38893845263](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/38893845263), in progress at observation. Query latest remote head and exact-head runs on resume; this status is not final acceptance.
- Build bootstrap installed dependencies. Local production build passed article quality, regenerated article/blog data and 261 article social images, then entered image optimization. Outcome pending below; generated build outputs are not part of the implementation batch.
- Known regression failures: original six invalid-inventory cases reproduced before fix; none remain in the 20 targeted tests. Full build/native encoded-media acceptance and genuine viewer/craft/device evidence remain unverified.

## Final local build receipt (2026-10-16)

`npm run build`: **PASS, exit 0**, all **36 steps completed in 1177.89 seconds**. Next.js 15.5.27 compiled, TypeScript checking passed, all 1,721 static pages generated and export completed. Responsive-image samples, production-visible language, structured-data regression (9,243 JSON-LD blocks / 1,651 routes), internal redirect links, sitemap and Pagefind passed. Pagefind indexed 1,604 pages.

Count disagreement retained: build reported 215 governed indexable herbs / 102 compounds versus sitemap categories 208 herbs / 99 compounds (1,093 sitemap URLs total). Sitemap gate passed under its own rules; this scoped batch neither reconciles nor credits that difference.

Build-generated tracked/untracked outputs in this initially clean isolated worktree are disposable and excluded from implementation; restore tracked generated paths to HEAD and remove only newly generated untracked files. Original shared checkout was never edited. Full local build proves repository build acceptance for implementation source, not hosted exact-final-head CI, native-media artifact regeneration, real viewer comprehension, calibration, handset, deployment or merge.

Next executable task remains current-remote-head CI/native packet verification for PR #6817, followed by repairing any observed failures. No new atomic IDs or total increase. This documentation checkpoint is committed and pushed after the implementation; obtain the exact containing SHA from GitHub/file history.

## Continuation batch — registered scoring rubric integrity (2026-10-16)

Branch unchanged: remote `research/evidencemotion-all-green-operator-integrated-6743`, local `research/evidencemotion-continuous-handoff-20261016`. Exact starting remote SHA `a600bbe35de0cb41ce3a46ed25b97a43e1f275e2`; no newer remote implementation was present at resume. Latest implementation SHA is pinned in the checkpoint following this batch.

Observable acceptance: `grade` must evaluate exactly the five registered questions against the registered answers, reject missing/extra/altered keys, reject malformed SHA-256 identifiers, and continue stating that a deterministic comparison is not independent viewing proof. Reused existing `QUESTIONS`, `grade`, tests and native workflow; no alternate scoring system.

Reproduction before fix: a one-question key, altered Q4 answer, and extra Q6 all returned all-critical success; empty key raised division by zero. Two 64-character nonhex identities were accepted. New tests reproduced **5 failures and 1 error** before implementation. After fix: **10/10 packet tests PASS**, **7/7 ledger tests PASS**, ledger CLI PASS at **740/1,590 = 33 audited + 707 inherited provisional**. No atomic IDs newly completed or credited. Film SHA syntax validation does not authenticate a viewing session or establish media provenance by itself.

Changed files: `timed_soundoff_review_packet.py`, `test_timed_soundoff_review_packet.py`, this handoff, and the scoped status notes in `docs/CURRENT_SPRINT.md` / `docs/MASTER_BACKLOG.md`. Status: implementation in review, new-head hosted gates pending. No new full render or production build was run locally for this continuation; the previous 36-step local build receipt applies to the preceding implementation, and the current exact-head hosted CI/build remains required before acceptance.

Actual preceding-head evidence independently retrieved this turn:

- Native original-WAV run [38896105714](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/38896105714), SUCCESS for exact head `a600bbe35de0cb41ce3a46ed25b97a43e1f275e2`.
- Artifact **12044415927**, 21,809,986 bytes; GitHub archive digest `bb7a4da88268988a26c54c485e265f462f44361c2e5356a44e2fd9f81f110684`. Downloaded and independently passed current `verify_sources` on actual original movie/render/phone/science/story files.
- Actual film SHA `eb73b6a7c1cd615c5d4f9ac542beb85f098fc56175b5400eeccd285271d61428`; silent stimulus SHA `a6f9b7b53deb14ac9f32308a703952e8e69b0e0b39a2007980b8ce65a0555afd`. Packet reports zero real responses, no comprehension/craft/handset/voice approval, and `mayPublish=false`.
- Artifact source-join hashes: render `69d3a6dead85417bd8ebcccdb63507fedaf969c5c093a621daba9f7eac003b43`; phone `c7b235056ece1d181f20f87cc63ddcc4e5b0166ecc6fe0d909b5bd4535765bdb`; science `0a712011b41853d834c5a5a9e66396b2b6706342855c628509a250769de581f9`; story `b943fdd4482746807f46d87befcf89338616ec9238aef3ca2b2346eed07bd2e0`.
- Prior-head operator, ledger and site-health workflows also SUCCESS; production CI was still in progress at observation. These are bounded old-head receipts, not an approval of this later scorer mutation.
- PR #6822 was merged **into this research branch**, not main, as `3ba203243635fbf04966c4c4abba9b9fa93b5d1d`. Its caption work is historical ancestor context; do not port or duplicate it based on stale memory.

Next executable task: inspect latest remote head and exact-head hosted packet/native/CI/build results; repair any observed failure in #6743. If those pass, obtain genuine blinded viewer evidence under the preregistered method; `EM-034.12.T/R` remain HOLD and no participants may be fabricated. Protected merge stays sole-controller-owned. Do not run another full local render simply to restate unchanged source/media checks.

## Latest exact implementation checkpoint

- Implementation commit: `e6a7f4aee31300e11173ce23ab99966a40fd8756` (registered rubric and malformed SHA rejection).
- Remote branch: `research/evidencemotion-all-green-operator-integrated-6743`; owning PR #6817 / research issue #6743.
- This accompanying handoff-only commit records that exact implementation and is pushed in the same bounded batch. Determine the latest documentation head with GitHub/file history; do not assume the implementation SHA is the branch tip.
- Fresh `node scripts/ci/validate-doc-links.mjs`: PASS, 387 Markdown files. Fresh `git diff --check`: PASS.
- Pending: new-head hosted full CI/production build and native exact-media workflow after push. No current-head hosted completion is claimed in this checkpoint. No new atomic IDs; provisional count stays 740/1590. Known local focused failures after fix: none.

## Clean current-main restage — latest continuation (2026-10-16)

- **Current local and remote branch:** `research/evidencemotion-current-main-restage-6743-20261016`.
- **Exact new base:** `76e02b30259c9e2b375e8e69a64772d184208567` (current main at restage).
- **Exact preserved source:** `2f78112292afd72d7da66d532850551a15ed58cb` from former PR #6817.
- **Owning issue:** #6743, research-only. Replacement PR is resolved with `gh pr view research/evidencemotion-current-main-restage-6743-20261016`; old PR #6817 stays available until replacement passes protected merge. Do not merge both branches or close the old PR as merged without proof.
- **Reason:** old source is 52 main commits behind and changes workflows. Existing `autonomous-merge-controller.mjs` explicitly requires `NEEDS_CLEAN_RESTAGE` rather than bot-authored update-branch. No controller or permission policy was modified.
- **Architecture/reuse evidence:** exactly 57 paths differed from the source merge-base. Only `docs/CURRENT_SPRINT.md` and `docs/MASTER_BACKLOG.md` overlapped intervening main changes. Kept current-main versions and inserted the bounded #6743 status note. All 54 source implementation/test/workflow/evidence blobs except this updated handoff are byte-identical to the exact source commit. `RESTAGE-PROVENANCE-20261016.json` pins their Git blob IDs for independent verification. Main's atomic planning index, 46/243/1590 workmaps, existing D/A/R admission, and unrelated Publisher bridge remain intact.
- **Changed paths:** the 54 exact paths enumerated by the provenance JSON, this handoff, the two manually reconciled governance documents, and the new provenance JSON (58 paths total against main). No new product behavior or media edit beyond the existing reviewed source.
- **Atomic IDs newly completed:** none. Fresh ledger result remains 33 individually machine-audited + 707 inherited provisional = **740/1,590 (46.5409%)**. The 707 are not individually audited and planning-index NOT_AUDITED flags are not silently promoted.

### Restage validation

1. Byte equivalence assertion: **PASS**, 54/54 source blobs match, exact source/base pinned above.
2. Initial broad suite on default Python 3.14: **FAILED** with 15 dependency-related errors and 7 skips (missing NumPy/RDKit and fonts). Not treated as code acceptance.
3. Reused existing Python **3.12.14** visual runtime. First dependency-complete run: 210 tests, 8 font skips. Then set `THS_TEST_FONT_DIR` to existing pinned DejaVu files and reran because those skips were unresolved: **210 tests PASS, zero errors/failures/skips**, across all 21 changed Python test modules, 7.940 seconds. No weakening/skipping to manufacture green.
4. `python research/evidencemotion-director/validate_atomic_proof_ledger.py`: **PASS**, 740/1590, no final approval.
5. `node scripts/ci/validate-doc-links.mjs`: **PASS**, 395 Markdown files.
6. `git diff --check`: **PASS**.
7. Current-restage full production build, exact native render/OCR, operator and repository CI: **PENDING** hosted execution after PR creation. Previous local build/media results remain bounded source evidence, not this new head's release proof. Do not rerun the expensive local renderer or full build merely to duplicate the hosted gates.

### Next executable task

Fetch this branch and current main, inspect latest replacement PR head and exact-head hosted runs. Repair actual failures without changing science, narration, rubric or permission thresholds. If main drifts again, inspect controller policy; never bypass sole-controller main writes. After all protected exact-head gates and merge are actually verified, reconcile/close superseded PR #6817 with the real merge receipt, then update this file and authoritative records. Independent real viewers, craft/science/voice/handset approval, final accepted master, production rollback and publication remain HOLD. `mayPublish=false`.

## Exact restage implementation checkpoint

Restage implementation commit: `3681c287093e5330d1ef19e2fabd47dbd2164588`, on `research/evidencemotion-current-main-restage-6743-20261016`. This handoff-only successor pins that implementation SHA. All 54 provenance-listed blobs remain exact matches; 210 targeted tests and doc-link/diff checks passed as above. Full current-head hosted production/native acceptance remains pending. Resolve replacement PR by current branch name and inspect current remote tip before further changes.

## Atomic implementation batch 1 — EM-007.01 (2026-10-16)

Current branch `research/evidencemotion-current-main-restage-6743-20261016`, PR #6825, starting exact head `b0a3178fe6f84775b6a30f5b362bcc38fb027679`. Owner explicitly directed moving to unfinished atoms instead of more packet refinement.

**EM-007.01 DONE_INVENTORY_ONLY**, all seven U/S/O/X/T/N/R inventory checkpoints passed against original actual WAV and five-input source bundle. `spoken_claim_ledger.py` reuses existing `source_check` and `inspect_alignment`; output `EM00701-FROZEN-SPOKEN-LEDGER-20261016.json` freezes 73 words, 8 speech units, qualifiers and source hashes. Exact output SHA and 7 evidence rows in `EM00701-ATOMIC-SPOKEN-INVENTORY-20261016.md`. Original scientific support/accuracy, calibrated timings and canonical EM-007 remain OPEN; no clinical or independent-review approval.

Fresh checks: 3 spoken-inventory tests PASS; 7 ledger tests PASS; actual CLI replay PASS 73/73 words. Ledger now 40 machine-research cards +707 inherited = **747/1590**, from 740 (+7 unique open-parent cards). A Windows default-encoding error interrupted a bookkeeping script before doc edits; reran affected edits explicitly as UTF-8. No code/test waiver.

Changed batch files: new spoken inventory module, tests, frozen JSON and proof receipt; atomic workcard and granular-register completion states; bounded ledger source/count additions and counter tests; existing native/ledger workflow path+test wiring; this handoff. Latest exact batch implementation SHA is recorded by the next checkpoint commit. The earlier restage equivalence manifest is historical at its pinned commit, not an assertion that intentional subsequent validator/workflow changes equal old source blobs.

Next executable task: **EM-014.01** isolate every 7-OH/hydroxyl/mitragynine occurrence from the original source WAV, bind candidate MFA windows, extract actual PCM clips and prove exact sample equivalence; do not award pronunciation or boundary calibration. Hosted new-head full CI/production/native gates remain mandatory before protected merge. No new local full render is needed for the inventory operation. No new publication/normal WIP authority.

EM-007.01 exact implementation checkpoint: `5b1efc04f5f51c193d06bcaeccb3b0631a1d35c5` on PR #6825 branch. This handoff-only successor pins the completed inventory batch before moving to EM-014.01.

## Continuation — EM-014.01 exact original PCM term isolation candidate (2026-10-16)

Source checkpoint: 747/1,590 provisional = 40 individually machine-research cards + 707 inherited not individually audited, before this work. **No new proof cards have been credited.** Owning research PR #6825 / issue #6743, no new normal WIP or production import.

- **Review repair committed:** `5b08b910bf83ec7c2827104a5261987fd9f392f2` adds all six imported renderer/native-pixel module and test paths to the actual-media workflow trigger. The P2 review finding is addressed in code; exact-head passing workflow/review resolution remains to be confirmed.
- **EM-014.01 implementation:** `term_pcm_isolation.py` (commit `855c4b292e8ddee2ec8b3d87f99aab2f4346e167`) reuses the existing original five-input `inspect_alignment` importer, 73-word frozen `inventory`, and pinned MFA `term_windows`. It requires exactly five occurrences across 7-OH, hydroxyl, mitragynine (two standalone words) and 7-hydroxymitragynine; isolates 24-kHz 16-bit mono PCM slices without DSP/revoicing, writes lossless exact sample-equivalent WAV clips and SHA-bound JSON, checks the original source WAV again, and leaves pronunciation, naturalness, voice and publication HOLD.
- **Regression tests:** `test_term_pcm_isolation.py` (commit `37ae9d19f5840ad2dcdff70cbd15c7f4b467da54`) includes five unit test cases, including missing/changed terms, foreign input SHA, invalid word windows, truncated/invalid PCM and sample-byte equivalence. These must execute on exact PR head before credit.
- **Actual-source execution wiring:** workflow commit `e17c7dac4cf22342724b3b3842ba2456bf55f68e` runs the tests and extractor *after* original WAV/MFA alignment, fails closed on incorrect instance count or changed PCM, and uploads the original term-window JSON and five clips for research inspection. **Execution at that exact head and its artifact are pending**; never treat committed test code as executed acceptance.
- At initial exact-head check, ledger/operator/atomic/health runs passed; CI and native-original-WAV workflow were still running. Project-control at that head failed because D issue #6685 had just closed but was still present in that old branch's active table. **Separately merged** control PR [#6826](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6826) retired the completed owner on newer main, reducing normal WIP 3/3 to 2/3. Do not duplicate or overwrite #6826; perform a clean, provenance-checked current-main restage according to the sole controller before any merge. This is an existing drift blocker, not an EM-014.01 audio failure.

**Next executable task:** inspect the *latest* PR head, actual native-workflow job and artifact (including these new clips), compare clip hashes and source frame ranges on the actual WAV, run full CI/production build, and only then author source-bound EM-014.01 proof receipt / adjust proof ledger and child checkbox if truly demonstrated. Do not mark EM-014.02 phonetic lexicon, EM-014.03 acoustic evaluation, human listening, premium craft or 1+5 master as passed. Protected merge and publication remain unauthorized; `mayPublish=false`.
