# EvidenceMotion continuous implementation handoff

Updated 2026-10-16. Maintained after every meaningful implementation batch. ChatGPT and Codex both implement, test, debug, maintain PRs and account for progress. Resume from GitHub, not conversation history. Re-read this file and latest remote head before work; never assume this checkpoint remains newest.

## Current checkpoint

- Repository: https://github.com/Razzleberrytt/hippie-scientist-site
- Owning issue: #6743, research-only; existing PR: https://github.com/Razzleberrytt/hippie-scientist-site/pull/6817
- Remote implementation branch: `research/evidencemotion-all-green-operator-integrated-6743`.
- Local isolated branch: `research/evidencemotion-continuous-handoff-20261016`.
- Exact starting remote commit: `cc075f3e098f053c401911343b0c6fca7fb984e1`.
- Batch implementation commit: see the subsequent checkpoint entry below once committed. This initial entry accompanies the implementation; the next documentation commit will pin its exact SHA, avoiding a self-referential commit hash.
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
