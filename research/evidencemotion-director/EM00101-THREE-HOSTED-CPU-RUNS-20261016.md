# EM-001.01 — three actual hosted CPU run receipts, research-only

**Observed 2026-10-16 UTC; Lane 1 machine audit.** Deliverable: record *three dated, separately completed hosted CPU runs* with GitHub runner image, worker identity, original-source SHA and artifact links. This is an **operating proof**, not three new excellent videos, viewer verdicts, controlled deterministic MP4 equality, three days of testing, clinical review or permission to publish. All cases share one original-WAV identity and a source render algorithm: they are not independent creative variants.

## Frozen acceptance oracle and sources

PASS only when **three distinct** first-party GitHub Actions runs each supply: (a) a **completed SUCCESS** actual-original-WAV CPU job, (b) raw dated job logs recording a different worker ID and identical pinned source WAV SHA, (c) an exact checked-out PR source commit / merge revision and runner OS/image, (d) an actual resulting 1,031-frame native H264 source-film digest and successfully uploaded, uniquely identified artifact with logged ZIP SHA-256. Reject any missing/job-not-finished/date-less/duplicate/failed/synthetic-only run. This oracle is scoped to recording hosted executions only. It does not independently replay ZIP bytes or confer a final video acceptance.

Source narration for all three: SHA-256 `9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435`. Runner environment on all three: **Ubuntu 24.04.5 LTS**, `ubuntu-24.04` image `20261012.334.1`, worker IDs separately logged below. Original 1,031-frame native video log digest in each: `4a36305c08e422d85a006332c4e83d39dac4a8f12c87502ad842cb99b8f874e3`. Matching historical film digests do **not** certify encoded determinism generally or independent scientific correctness.

| Run / first-party job | Dated runner-log and source revision | Recorded original CPU artifact and proof |
|---|---|---|
| [38914069118 / 117016904699](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/38914069118/job/117016904699) | 2026-10-16 **14:14:32–14:20:37 UTC**; worker `d68036b8-2682-44bb-9017-5873139166d8`; checked-out merge `9432793` of original source head `2922020281a2e37007681cc3a1b919cddf9fc17e` | [Artifact 12052645131](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/38914069118/artifacts/12052645131); 21,577,765 bytes; logged ZIP SHA-256 `901c492929dcc9b89d9a5c071f751101c8c212b7ef88d5553aef9cc5b2dfb467`; job SUCCESS |
| [38940259185 / 117105787427](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/38940259185/job/117105787427) | 2026-10-16 **17:30:52–17:37:03 UTC**; worker `756bcbc3-ea20-4592-96b6-efa08af9bcab`; checked-out merge `c151d1a` of source head `53f26d73bd92d4fbc33883633f3a493ffdf9d44a` | [Artifact 12062374841](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/38940259185/artifacts/12062374841); 21,581,317 bytes; logged ZIP SHA-256 `079df9e4c343be3baaefb22ed5689c4f5c841b2268eba29b1f330272eb9cd6f6`; job SUCCESS |
| [38941822580 / 117111086421](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/38941822580/job/117111086421) | 2026-10-16 **17:43:10–17:49:14 UTC**; worker `e251b5a6-94ed-4145-812d-ce81b8f1dd41`; checked-out merge `1def68b` of source head `85a68a4ae29002decff65979faf3b7ea2fea4631` | [Artifact 12062993740](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/38941822580/artifacts/12062993740); 21,581,336 bytes; logged ZIP SHA-256 `b6971aa31210ff548d455626ac8cea14864101c85c007faf14ab1998697c60fb`; job SUCCESS |

**Verification methods:** I fetched the GitHub jobs for all three run IDs, observed each actual-original-WAV-acoustic-alignment job's `status=completed` and `conclusion=success`, read each **raw hosted job log** to verify original source commit, pinned WAV SHA, UTC dates, independent worker IDs, 1,031-frame rendered film and uploaded ZIP hashes, then independently queried the GitHub artifact registry for all three exact unique IDs/byte sizes and confirmed each artifact exists and was not expired when inspected. This is stronger than counting three PR descriptions, but not a fresh download-and-byte-replay of all three ZIPs.

## Six individually audited research-only atomic cards

| Card | Evidence and bounded interpretation |
|---|---|
| `EM-001.01.U` | **VERIFIED_MACHINE_RESEARCH** — three immutable, different hosted CPU run/job pairs recorded above; not three distinct original content variants |
| `EM-001.01.S` | **VERIFIED_MACHINE_RESEARCH** — three source heads/checkouts, original WAV SHA, image version and three worker IDs each read from actual dated GitHub logs |
| `EM-001.01.O` | **VERIFIED_MACHINE_RESEARCH** — declared complete SUCCESS/three unique runs/dated worker/source/artifact oracle; rejects any failed, incomplete or source-less job |
| `EM-001.01.X` | **VERIFIED_MACHINE_RESEARCH** — three actual completed CPU jobs already executed on first-party hosted GitHub Actions; this audit records verified existing executions without rerunning them |
| `EM-001.01.T` | **VERIFIED_MACHINE_RESEARCH** — all three GitHub job statuses independently checked SUCCESS and raw logs/artifact registry linked; ZIP byte re-download is not claimed |
| `EM-001.01.R` | **VERIFIED_MACHINE_RESEARCH** — exact run/job/worker/commit/date/film and artifact ZIP digest ledger here, with original immutable GitHub links and explicit HOLD boundaries |

**Scope limit:** EM-001.01 may be audited for these six process cards; EM-001.02/.03 final reproducibility and iPhone download checks, independent craft/science/phonetic review, excellent-first render and five-varied-first-render acceptance **remain unresolved**. `mayPublish=false`. Existing research-only DRAFT PR #6840 only, no protected-main merge or extra work-in-progress slot.
