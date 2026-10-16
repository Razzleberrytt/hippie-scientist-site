# EvidenceMotion rejection regression matrix — research-only

**Scope:** issue #6743, production freeze ON, no new R-number, no production renderer, no auto-publication. These tests are an engineering readiness prerequisite—not proof that any film is aesthetically excellent.

This bounded PR extends **existing** Python/Node source, visual and media detectors rather than recreating validators. The matrix intentionally reproduces the failure itself and checks that the matching guard returns HOLD or an explicit negative result.

| Rejected failure | Fault actually injected | Guard/reproduction |
|---|---|---|
| 1. Generic poster | Native-source subject remains static for more than 6 seconds; rotating card is proposed as a hero action | `test_decoded_preview.py` generates and decodes a real 8-second still MP4; `preview-proof.mjs`, `hero-action-contract.mjs` |
| 2. Disconnected molecule | Remove a **real RDKit graph bond**, creating two fragments; source identity differs | `test_rejected_graph_faults.py`, `test_validated_7oh_chemistry.py`, `scientific-view-contract.mjs` |
| 3. Mispronounced narrator | Human listening receipt explicitly rejects a named exact-WAV token; missing human reviewer and fake AI approval separately rejected | `exact-voice-ear-verdict.mjs`, nine-class test. **No automatic phonetic detection or owner audition claimed.** |
| 4. Truncated AAC | Generate a REAL 2s H.264/AAC MP4, remux video unchanged but trim and re-encode actual AAC to 0.8s; require the unmocked auditor to HOLD on duration and pinned ADTS mismatch. Also retain independent timestamp/byte negative fixtures. | `test_rejected_real_aac_truncation.py` plus `test_native_master_audit.py` / `test_native_media_research_gate.py` |
| 5. Cropped source | Known full-graph bounding box exceeds shot; actual reference frame graph removed | `scientific-view-contract.mjs` and `test_semantic_negative_visual_audit.py` |
| 6. Fake science | Structure-only claim asserts human clinical effects or unobserved receptor docking | `story-first-gates.mjs` and negative story fixture |
| 7. Unsafe captions | Caption intersects unsafe TikTok/Shorts screen region or contaminates subject motion measurement | `story-first-gates.mjs`, `preview-proof.mjs` |
| 8. Moving confetti | Particles or light flashes are claimed as causal motion; untrusted bright spots are inserted into source image | `hero-action-contract.mjs`, `test_semantic_negative_visual_audit.py` |
| 9. Missing test discovery | Accidentally including Node's native research tests in Vitest or failing to discover source tests | `native-test-isolation.test.mjs`, path-scoped GitHub workflow explicitly executes newly created matrix and source/media cases |

## Strict interpretation

- No invented evidence of **automatic mispronunciation detection**. A flagged bad pronunciation or absent human listening verdict causes HOLD; a human must audition the exact pinned WAV and mastered AAC before any voice PASS.
- Python visual fault tests use **real decoded pixels**, but as synthetic scientific fixtures, not evidence of a premium production film.
- Distinguish **a negative-test pass** from a creative score. The harness cannot identify cheap-looking compositions or rate whether the first second is compelling.
- The CI job exercises unchanged existing source validators. It does not ship a renderer, publish content, call new paid APIs, create a new lane or touch the production source of truth.
- The original 23/46 count remains authoritative **until the exact-head run passes, all review findings close and the PR merges**. At that point, only the named `Add automated regression tests reproducing each rejected failure` engineering box may advance to 24/46, with no movement on 0/1 first excellent video or 0/5 quality streak.
- All final-video claim/voice/phone/visual-quality checks are still open. The owner can request another format or creative direction without triggering this regression gate as a publishing authority.

Verification commands:

```sh
node --test research/evidencemotion-director/rejected-failure-matrix.test.mjs research/evidencemotion-director/native-test-isolation.test.mjs
python -m unittest discover -s research/evidencemotion-director -p test_rejected_graph_faults.py -v
python -m unittest discover -s research/evidencemotion-director -p test_decoded_preview.py -v
python -m unittest discover -s research/evidencemotion-director -p test_semantic_negative_visual_audit.py -v
python -m unittest discover -s research/evidencemotion-director -p test_native_master_audit.py -v
```

All testing is on remote runners. No owner's laptop required.
