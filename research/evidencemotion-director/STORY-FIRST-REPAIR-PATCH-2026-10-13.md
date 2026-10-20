# EvidenceMotion — story-first repair patch register (2026-10-13)

**Owner direction:** Everything criticized in the rejected 7-OH V4 preview must carry into the next EvidenceMotion patches. The final product must tell a logical, interesting, beginner-friendly scientific story. A mechanically valid animated slideshow is not a successful video.

**V4 creative verdict: REJECTED.** The owner saw weak narrative, missing progression, dull motion, and poor alignment/framing. This supersedes earlier positive descriptions of the V4 experimental visuals. [Research issue #6743](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6743) contains the explicit veto and observed failures. The old silent-film/audio/mechanical checks remain valid only as technical evidence.

**The production/capability freeze remains ON.** This patch is a real, **mandatory research-director code change**; it is not a deployed new R version or production publishing integration. Existing production runtime is not touched. All five-video quality criteria and human authority remain intact.

## Repair ledger — implemented now versus still required

| Owner-observed defect or proposed fix | Implemented in research code now | Still required for real finished footage |
| --- | --- | --- |
| Disconnected scenes/no meaningful answer | Four ordered acts `QUESTION → DISCOVERY → EVIDENCE → ANSWER`, explicit everyday question, answer, why-it-matters and evidence limit; disjoint/audio-mismatched beats HOLD | Write, independently source-check and owner-accept a *complete* new 7-OH story/radio edit before new whole-film rendering |
| No orientation or unexplained science terms | Subject orientation within first 2 seconds; every declared technical term defined no later than its first spoken time | Real beginner-comprehension test; inspect every on-screen and spoken specialist term, not just declared terms |
| Decorative rotating diagrams/no payoff | Every scene requires `viewerLearns`, an evidence-linked visual job and explicit science-serving motion; fake decorative-only motion HOLD | Genuinely directed, source-accurate camera action, memorable hero and earned reveal; inspect decoded shots |
| Template repetition and awkward framing | At least three distinct declared layouts; three nonoverlapping hero/caption/source zones, bounded away from typical phone UI areas | Verify real decoded pixels, clipping, captions and platform UI on iPhone; these metadata boxes are **not** image proof |
| Source/claim ambiguity, implied potency from molecular maps | Every act binds actual claim IDs and image IDs; cannot claim established human effects from STRUCTURE/PRECLINICAL-only declarations; computed model disclosure required; invented molecular bonds and unmeasured binding HOLD | Independent real paper/data/source review and matching illustration labels; actual receptor scene only if evidenced |
| Timing/misaligned voice and effects | Locked original WAV SHA must match director SHA; scene timing follows narration; speech-retimed plan HOLD | Actually audition source WAV, true acoustic word alignment, confirm decoded captions correspond to heard words |
| Two examples were only recolored or relabeled versions of one format | Two-concept comparison requires different story approach, hero, composition family and visual progression, same source and WAV | Owner-selected 3–5 real niche-reference videos, compare two **actually rendered** concepts, owner approves direction |
| Dull lighting/shallow depth and cheap motion | Reject decorative-only motion in preflight; preserve science assets for future visual work | **Not implemented:** premium physically plausible lighting/materials, actual spatial depth, camera choreography, beautiful non-template cinematography |
| Mechanical decoder mistaken for video quality | Story/director return only `PREVIZ_PACKAGE_READY_FOR_PIXEL_AUDIT`; craft/science/iPhone/release self-certification rejected | Independent actual MP4 artifact check, human science and craft scoring; owner release authority |
| Asset library reuse | Existing 63-source-PNG archive/provenance recorded separately in merged PR #6757 | Future production retrieval/versioning only after 1+5 milestone and explicit freeze lift; never reuse wrong molecule |

## Code actually changed

- `story-first-gates.mjs`: enforce source-bound four-act narration-first story, question/answer, first-use teaching, evidence limits, intentional shot goals, composition rectangles and disjoint phone zones, and non-self-certified craft.
- `stage-gates.mjs`: **requires** `pkg.storyFirstPlan` on the existing RESEARCH preview director path; no longer permits technically valid storyless previz package. Cross-checks exact voice/source hashes and duration.
- `story-first-fixture.mjs`, `story-first-gates.test.mjs`, `stage-gates.test.mjs`: synthetic contract proofs and adversarial counterexamples, including unchanged scientific and audio safeguards.
- `.github/workflows/evidencemotion-story-first-research.yml`: path-scoped regression tests on PRs. A green CI does **not** issue cinema or science approval.

## Candidate visual directions — specification, not real new renders

**A — Forensic molecule discovery:** start with a recognizable real chemical question; compare two *complete, pinned* 2D structures, follow the accurate –OH detail, then reveal a labeled **computer-estimated** 3D structure and resolve what the map does/doesn't establish. No imaginary molecular transformation or invented effects. A camera move must aid recognition, not merely rotate a shape.

**B — Evidence-ladder investigation:** start with why people compare the two related chemicals, show what structures can tell us, then move up to real cited experiments/study limitations and finally the honest human relevance/unknowns. No pharmacology claims without independently rechecked original research or implicit animal-to-human promotion.

**Story editing dependency:** An improved full narrative might need **new speech**. The current 7-OH original WAV is not silently rewritten; new narration requires its own immutable WAV, pronunciation audition, word-level timing, fresh video/caption source hashes and separate human approval. Current 34.37s V4 should not be recut into a fake complete story without those assets.

## Acceptance criteria / what this PR DOES NOT do

- All story-first negative cases pass locally and in latest-head CI before research-only merge.
- No new checklist item checked simply for this gate; source master and existing creator approvals unchanged.
- Two creative treatments are **not** considered accepted merely because their metadata differ; only actual decoded videos against owner-curated 3–5 reference shelf qualify for creative consideration.
- Actual layout safety, camera quality, scientific correctness, accessible teaching and excellent 1+5 streak still require real independent evidence.
- No automatic posting, production import, paid creative API, GPU requirement, capability expansion, fabricated scientific claims or owner release.
- Research foundations **23/46**; genuinely excellent approved video **0/1**, additional consecutive first-render streak **0/5**.
