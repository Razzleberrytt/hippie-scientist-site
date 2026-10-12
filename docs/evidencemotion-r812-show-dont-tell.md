# EvidenceMotion R8.12 — Show, Don't Tell (governed pilot)

**Status:** Candidate implementation pending full CI, independent video/auditory QA and V3 acceptance. No claim that the revised V3 MP4 has been released.

**Owner scope:** mechanism animation, voice resilience, word-level caption closure, three rendered A/B/C hooks, and the Oct 11 loudness amendment. R8.13 ideas remain separate.

## Exact pilot: "Your Liver Makes 7-OH?"

- Preserve BOTH evidence boundaries, with on-screen PMIDs: **31263758** (human liver preparation/CYP3A4 *in vitro* conversion) and **38481700** (human pharmacokinetic evidence; itraconazole affects 7-OH formation). Do not imply the liver-prep experiment was a clinical intervention or that concentrate equals kratom leaf.
- Real mechanism diagram: named **Mitragynine** → **CYP3A4 enzyme** → **7-hydroxymitragynine**, with labels visually adjacent to objects as a non-color cue. Before/after states exist in `r812-mechanisms.mjs`; every depicted action must have an approved verb, named input/target/output, evidence-tier qualifier, claim IDs and on-screen PMID identifiers.
- V3 must pass V's **P1-1/P1-2/P1-3** re-audit. The renderer does not manufacture editorial review; only a human reviewer can accept molecular semantics and perceptual motion.
- Break the reported 9-second single evidence hold into independently reviewable shorter beats: each evidence semantic slot is limited to **6 seconds** of natural timing. Cut the CTA to **at most 5 seconds**, with visible destination `https://thehippiescientist.net/articles/mitragynine`. The CTA uses a dedicated neutral article panel, not the red CYP3A4 actor recycled without labeling.
- Named objects, qualifiers and source PMIDs are additive to, never replacements for, the inherited R8.10 scientific source card and source ledger. Preserve R8.10 exactly-reviewed original source text, PMIDs and human vs laboratory wording. Fail rather than shorten a qualifier to fit.

## Voice recovery

The current user-approved voice is **Kokoro ONNX 0.6.1, Kokoro-82M v1 INT8, voice `am_michael`**. The binary voice asset for ONNX is **`voices-v1.0.bin`**, not a standalone `am_michael.pt`; do not claim a `.pt` file when production actually uses the ONNX voicebank. The receipt binds both the model SHA-256 and voicebank SHA-256, their filenames, engine version and immutable Release tag. This identity was restored and independently verified in the persistent Drive/GitHub voice-vault work.

- Run `gh release download ths-kokoro-onnx-am-michael-int8-v1 --repo Razzleberrytt/hippie-scientist-site --dir .cache/ths-voice-vault`.
- Run `python scripts/distribution/voice-vault.py verify .cache/ths-voice-vault`, export `THS_VOICE_VAULT=.cache/ths-voice-vault`, then render. See `docs/voice-model-vault.md`.
- **Delete-cache acceptance:** missing/corrupt model yields `voice model missing, re-fetch` and a nonzero exit; never falls back to FFmpeg Flite, OS TTS or an unrelated Kokoro voice.

## Captions, hooks and sound

- **Word-level** already exists in `r810-local-aligner.mjs` through *local, offline Montreal Forced Aligner*. It requires a pinned acoustic model, pronunciation dictionary and actual narration WAV, and then separately attested human auditory review. `r810-package-qa.mjs` blocks publication unless the exact word-alignment receipt exists. Any unaligned phrase-level SRT is **draft-only**, never labeled word accurate. This closes the R8.10 wording gap without inventing free aligner binaries.
- `r811-hook-preview-mp4.mjs` renders three actual three-second local FFmpeg MP4s from R8.11 draft SVGs. R8.12 gives A/B/C genuinely different graphic approaches — **question**, **contrast**, **reveal** — and retains distinct reviewed narration plans. The generated MP4s are **SILENT WATERMARKED DRAFTS**, not approved voiced A/B posts; converting each to a published video requires separate real Kokoro narration, source qualifiers, alignment and independent QA. Command: `node scripts/distribution/r811-operations-cli.mjs render-hook-clips --package <fully-approved-package-dir>`.
- R8.12 final video audio uses `loudnorm=I=-14:TP=-1:LRA=9`, measures the **encoded final AAC** independently using FFmpeg EBU R128, and fails if integrated loudness differs by more than 1 LU or true peak exceeds -0.5 dBFS. Do not infer successful loudness from mere FFmpeg arguments.
- A full 46-second YouTube cut and shorter ~30-second loopable TikTok cut were proposed later and are **R8.13 follow-ons**. Do not silently truncate evidence or fake the end/start seam. Likewise quiet background music, caption/speech synchronization and final perceptual mixing require separate V3 review and were not completed merely by merging code.

## Human acceptance and exclusions

1. V independently inspects actual V3 animation, scientific labels and P1-1/2/3; compares the new evidence pacing and CTA to the previous V2, including 52% static-runtime finding.
2. V checks missing-cache error, pinned voice hashes, and actual original-voice waveform.
3. V inspects **true aligned** burned captions, source/PMID and qualifier grep, and safe-area text at mobile sizes.
4. V hears final AAC and validates measured -14 LUFS. All three hook draft MP4s exist, have different visual approaches and are clearly non-publishable until separately approved.
5. Neither a passing unit test nor a pass in the archive workflow is evidence of a final V3 video passing perceptual QA.

**Not included:** flywheel rebuild, sonic identity, generic marketing experiments, auto-publishing, social-platform analytics claims, or platform credentials. Scientific review/publication safeguards remain authoritative.
