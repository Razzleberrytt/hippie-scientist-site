# EM-007.01 — complete frozen spoken-assertion inventory

2026-10-16. Acceptance declared before implementation: enumerate every locked authored word once, assign it to an assertion or nonfactual speech unit, and preserve every negation and computed/provenance qualifier. This is an inventory task, not scientific approval of those assertions.

Actual execution reused `source_check` and `inspect_alignment` against all five original on-disk inputs: WAV, authored transcript, genuine MFA TextGrid, dictionary and acoustic model. Original WAV SHA `9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435`; exact input hashes and alignment revision are in [the frozen output](EM00701-FROZEN-SPOKEN-LEDGER-20261016.json). Original source retrieval/reproduction: [native hosted run 38896105714](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/38896105714), exact source commit `a600bbe35de0cb41ce3a46ed25b97a43e1f275e2`. Local replay checked actual original WAV format and bytes, not a mocked probe.

PASS: **73/73 words**, **8 exhaustive nonoverlapping assertion/question/editorial spans**, **2 explicit negations**, computed-pose limitation and the separate claim of verified chemical provenance. No orphan word. Scientific support of each material assertion remains NOT_REVIEWED_IN_THIS_INVENTORY; source attribution/clinical directness belongs to EM-007.03–08, not this task. Primary source for the existence of each spoken assertion is the pinned WAV/authored transcript; no scientific image is required for this spoken-only inventory.

Output SHA-256: `a63215b6e1a9abcf59b3b49ff1aa33461a59b77e56f49ec75a377b9a70bf78d6`.

Reproduce from the original five-input folder:

```sh
python research/evidencemotion-director/spoken_claim_ledger.py --root ORIGINAL_INPUT_DIRECTORY --manifest ORIGINAL_INPUT_DIRECTORY/alignment-manifest.json --out spoken-ledger.json
python -m unittest discover -s research/evidencemotion-director -p test_spoken_claim_ledger.py -v
```

Tests: **3 PASS**. Negative cases delete words, remove a material negation, substitute foreign WAV identity and introduce invalid timing; all rejected. Timing annotations remain uncalibrated candidate MFA boundaries; no human review, pronunciation, comprehension, clinical/craft/device approval or publication follows.

| Card | Decision | Receipt |
|---|---|---|
| `EM-007.01.U` | VERIFIED_MACHINE_RESEARCH | Eight stable spoken units, each with exact word indices |
| `EM-007.01.S` | VERIFIED_MACHINE_RESEARCH | Original authored speech/WAV and all five supplied input hashes; spoken-only inventory |
| `EM-007.01.O` | VERIFIED_MACHINE_RESEARCH | Predeclared 73-word exhaustive nonoverlapping coverage and qualifier retention rule |
| `EM-007.01.X` | VERIFIED_MACHINE_RESEARCH | Actual five-input/WAV replay produced frozen inventory JSON |
| `EM-007.01.T` | VERIFIED_MACHINE_RESEARCH | Real source bytes verified; 73/73 coverage and all material qualifiers present |
| `EM-007.01.N` | VERIFIED_MACHINE_RESEARCH | Missing/changed words, removed negation, foreign WAV and invalid timing rejected |
| `EM-007.01.R` | VERIFIED_MACHINE_RESEARCH | Frozen output and this source-bound receipt in GitHub, SHA above |

Task EM-007.01 DONE for its inventory acceptance only. Canonical EM-007 scientific acceptance remains OPEN. This task is from an open parent and does not overlap 707 inherited accepted-foundation cards. Adds 7 distinct machine-research cards: 33 → 40; provisional coverage 740 → 747/1590. `mayPublish=false`.
