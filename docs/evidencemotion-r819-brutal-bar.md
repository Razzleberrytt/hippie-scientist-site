# EvidenceMotion R8.19 — deterministic art / brutal bar

**Owner directive: October 12, 2026. Implementation status: REVIEW-ONLY CANDIDATE.** Preserve R8.18 scientific truth. 2D/3D is optional; visual originality is not. A score of 90 means competitive with the best science explainers on Shorts/TikTok, NOT better than prior THS videos. Old scores are history, not benchmarks.

## Two independent decisions
- CORRECTNESS: checked sources/PMIDs, bound numbers/denominators, evidence class, honesty labels, decoded source footers, true word alignment, no invented fact visuals, correct audio and separately reviewed exact video.
- CRAFT: hook visual twist, distinguished hero shot, cuts aligned to untouched narration, visual richness, originality and niche reference-shelf comparison. Science passes never upgrade craft.
- The R8.19 release gate emits separate verdicts and cannot publish by itself.

## Four hard KILL criteria — no repair loop for failed creative candidate
1. Generic/static template without a distinctive physically rendered hero beat.
2. Narration slowed or stretched for video pacing; cut picture to narration, never audio to picture.
3. Any interval longer than 6 seconds without meaningful compositional change, measured with caption-excluded scene objects AND decoded pixel evidence.
4. Stock-looking transitions or clip-art-grade illustrations — external reviewer V has the decisive creative veto.

Automatic measurements may reject but cannot certify artistry. Missing/uncertain evidence means HOLD, not a fabricated PASS. On a KILL, start a fresh creative concept, retaining underlying scientific/voice assets without patching the killed candidate.

## Brand identity, everywhere
One curated dark cellular / organic navy-and-teal art direction, restrained amber accents, accessible pale typography, recognizably authored illustrations and prominent honesty labels. Brand lives across video, article hero artwork, social cards and site graphics. Do not use color as the only evidence/safety distinction. Scoped tokens are in styles/ths-cellular-brand.css, initially NOT changing the existing website's display.

Reusable background/texture/illustration assets are static and pinned by SHA256 in the repository or immutable release. AI art is allowed ONLY for NONFACTUAL static images; no AI-generated text, numbers, molecules, statistics, graphs, source labels or clinical claims. Same art bytes plus same deterministic inputs must yield the same video (subject to controlled codec/version settings).

Compositing bottom to top:
1. Art: verified SHA-locked nonfactual static atmospherics.
2. Mechanism: deterministic geometry or carefully reviewed illustrative diagrams synced to narration.
3. Trust: source-bound captions, labels, exact stats/denominators, on-screen PMID footers and uncertainty qualifiers, always topmost.

Hero must be visually distinct and physically rendered. Hook twist moves by 3 seconds. Every N-item segment gets N IDs and actual narration-cued highlights. Retain every R8.18 telemetry, safety and source QA. Final H.264 1080x1920 at 30fps, 44.1k stereo AAC, post-encode -14 plus-or-minus 1 LUFS and at most -1 dBTP.

## Craft shelf and publication
Willie curates THREE TO FIVE real niche references. V independently compares the exact master and may veto craft. No guessed shelf links, invented 90+ scores, or claims of V approval from ChatGPT solo review. Owner native-phone audiovisual approval is separate. Both verdicts must PASS, then publication requires owner authorization.

Source reuse: reviewed research brief -> article -> flagship video -> shorts -> carousel -> owned website/email -> disclosed affiliate. Publishing and growth claims require genuine platform receipts.

## 7-OH proof status
Existing 54-second 1080p prototype overlays deterministic visual changes onto the previously burned review MP4. Audio output meets -14 LUFS target. It is NOT full independent three-layer rendering, nor independently re-reviewed or craft-approved. It is an engineering example only, not an accepted R8.19 flagship or production release.

## Remaining integration requirements
Link storyboard, exact SHA256 art assets, authoritative source/voice/word-alignment receipts and actual native composed scene geometry; produce final decoded pixel comparisons excluding subtitles. Enforce composition and audio release checks on the real artifact, not author-provided booleans alone. Then human/independent video review, repository CI/build and separate owner publication approval.

## Source-bound R8.19 integration continuation (Oct 12)

R8.19 is now an **opt-in pre-encode integrity gate** in the canonical MP4 renderer. Activation requires original R8.10 acoustic lineage, explicit native-separated art/mechanism/trust mode, and final encoded audio R128 metering. Legacy burnt-caption MP4 retrofits cannot self-certify as R8.19.

Preflight uses **verifyR810WordAlignment** with the real original WAV hash, script, raw MFA output, pinned acoustic model/dictionary and independent original-audio audition. Every multi-card event also requires one unique original word index, matching spoken token, matching scene bounds and timing within 0.2 seconds of the validated word start. Hashes alone or manual approximate cue timestamps do not establish word sync.

Art remains byte-pinned AND each beat storyboard requires exact art ID plus asset SHA. The verifier refuses SVG text/scripts and remote images/resources. An additional bridge checks R8.18 renderer/source identity and beat timings before evaluating R8.19 object geometry. Object telemetry is not final decoded-pixel certification.

**Engineering smoke only:** A local 12-second silent 1080x1920/30fps sample composed three independent raster layers: art, mechanism and trust. It rendered 360 full frames and 60 geometry samples. Nine independently recomposited source-layer snapshots exactly matched nine saved final PNGs pixel-for-pixel. This proves native layer separation, NOT high-end craft. The simple sample is still visually templated and has no verified speech word cues. It must not be published or scored 90+.

Original voiced 7-OH flagship and owner-selected niche reference shelf/V craft verdict/owner phone approval remain pending. Green engineering tests do not grant any of those permissions.

## Native three-layer encoder contract (new on this branch)

R8.19 is no longer satisfied by passing a metadata preflight and then encoding the existing baked R8.18 PNGs. The canonical renderer now builds **every frame** from original pinned art, mechanism and trust PNG layers, in that order, then compares decoded RGBA pixel bytes against the corresponding verified R8.18 native frame. Any difference fails before FFmpeg can encode the mismatched frame.

Activate ONLY with:
- `manifest.creativeMethodRelease = "R8.10"` and existing exact MFA + model/dictionary/WAV/human-audition receipt.
- `manifest.r819 = { enabled: true, compositorRelease: "R8.19", renderMode: "native-separated-art-mechanism-trust", storyboard, telemetry, artManifestSha256, layerSequence: { file: "r819-layer-sequence.json", sha256 } }`.
- `manifest.r812.enabled = true` for final MP4 R128 loudness. R8.19 selects `creativeDirection.canonicalStyle = "dark-cellular-organic-v1"`; all older releases continue requiring the old 2.5D style label and are not silently migrated.

The `r819-layer-sequence.json` document must use schema `ths-r819-layer-sequence-v1`, `width=1080`, `height=1920`, `fps=30`, `layerOrder=["art","mechanism","trust"]`, and exactly the same ordered beat IDs/frame counts as `r818-native-frames.json`. Every native frame has `frameIndex` and three exclusive layer metadata entries `{file,sha256}`:

- `art.file="r819-layers/<beat-id>/art-base.png"` (static, reusable inside one beat, generated from pinned approved nonfactual art; it cannot carry labels/claims).
- `mechanism.file="r819-layers/<beat-id>/f00000-mechanism.png"` for local native frame zero (increment the five-digit frame index).
- `trust.file="r819-layers/<beat-id>/f00000-trust.png"` for the same frame index.

Both mechanism and trust PNGs must have real alpha channels, and trust cannot be an entirely transparent empty plane. All files are verified for native dimensions, PNG signatures, exact SHA256, path confinement and inventory continuity. Every rebuilt frame must decode **pixel-identically** to the separately pinned R8.18 native full-frame proof. Final renderer still adds independently MFA-aligned ASS karaoke captions last, above the deterministic art/mechanism/trust frame, then performs existing final video/audio inspections.

**Cost/meaning:** All 30fps images are explicit, inspectable reproducible inputs. The static background can be reused across the beat to reduce storage. This integrity gate proves actual layer usage and image equality, not visual originality. Brand look and audience-level quality still require reference comparison and V's exact-video veto.

**Critical limitation:** The current 7-OH 54s narrated MP4 has baked-in captions and lacks its original reviewed R8.10 source/word-alignment package in the working files. Neither an extracted waveform, assumed transcript timestamps, a silent demonstration, nor an overlay-upscaled video may be substituted for the governed full source package. Complete first-party separated layer source delivery remains required for an accepted full 7-OH R8.19 review master.

**Consolidation:** Duplicate draft #6725 was closed unmerged, history retained. #6726 is the R8.19 implementation candidate; #6724 remains the independent R8.18 long-beat motion quality fix. Green CI only clears engineering tests, not owner/V creative publication gates.

### Repeatable producer inventory authoring

Use `authorR819LayerInventory(packageDir, verifiedR818NativeFrames)` from `scripts/distribution/r819-layer-inventory-writer.mjs` after exporting independent native art/mechanism/trust PNG files for every approved R8.18 frame. The function checks each expected source-layer path, image dimensions, file bounds and SHA256; emits `r819-layer-sequence.json` deterministically, immediately rereads it through the independent verifier, and returns the exact `{file,sha256}` object to insert into the R8.19 package manifest. A previously emitted inventory cannot be silently overwritten or re-signed. Edit source art/graphics only through an intentional versioned package rebuild.

The final MP4 receipt records the complete layer-sequence SHA and a digest of all successful frame pixel-equivalence proofs. Tests exercise the valid render, changed trust pixels (whether or not their SHA is changed), missing trust, immutable inventory writer and absent source layers. This is a production-identity contract, not automatic creative acceptance.

For governed producers, the one-command CLI is:

    node scripts/distribution/author-r819-layers-cli.mjs --package-dir /path/to/governed-package

It verifies the original R8.18 frame-manifest SHA and native video timeline, then creates (never overwrites) the deterministic SHA-256 R8.19 layer inventory. Copy the printed manifestR819LayerSequence object into the parent package's R8.19 section before final encoder QA.

## October 9, 2026: 7-OH federal regulatory freshness hotfix (review-only)

HHS on October 9 recommended a concentration **OR** mitragynine-ratio test for proposed temporary Schedule I control of concentrated 7-hydroxymitragynine and mitragynine pseudoindoxyl: more than **1 mg/g** in solids, more than **1 mg/mL** in liquids, or **mitragynine to 7-OH / MGPI / combined ratio below 100:1**. DOJ reported DEA issuing **new Notices of Intent**, specifically targeting enhanced products while seeking to leave ordinary botanical kratom with trace amounts outside the intended scope. This is not an unconditional statutory exemption for every product labeled kratom. 7-OH itself had **no temporary scheduling order** as of DOJ's October 9 report. Separate existing temporary controls of **MGPI, MGM-15, MGM-16 effective August 26, 2026 remain in force** while new notice proceedings continue.

Primary links:
- HHS October 9: https://www.hhs.gov/press-room/hhs-recommends-thresholds-enhanced-kratom-products-7-oh-mgpi.html
- DOJ October 9: https://www.justice.gov/opa/pr/department-justice-announces-updates-emergency-scheduling-actions-7-oh-and-related-opioid

Never state an effective Nov 13 date, Oct 14 Federal Register publication, or completed 7-OH Schedule I order without newer official evidence. A Notice of Intent is not an order. New 30-day notice process is reported by DOJ but the exact publication/effective dates are not independently established here.

`scripts/distribution/r8-7oh-regulatory-freshness.mjs` adds a narrowly scoped status gate to the R8.09 public brief and R8.19 correctness review. A current proposal must have both authoritative source URLs, exact threshold operators, the Aug 26 derivative distinction, an as-of/publication date match, a named human source review, and **an actually synchronized spoken proposal update**; a screen-only text correction cannot pass the spoken-voice gate. This is a fail-closed *receipt contract*, not a live request to DEA, so editors must check DEA and the Federal Register themselves on publication day and review the decoded master. A new order requires updating the dated status contract rather than mislabeling it as the Oct 9 proposal.

The existing R8.09 7-OH master has a stale "7-OH federal scheduling: pending Oct 11" end-card line. The Oct 9 corrected on-screen candidate reuses its exact original AAC track but **does not contain a newly recorded voice close**. It is REVIEW-ONLY / DO NOT PUBLISH until an accurate voice close is recorded, aligned with the new end-card, and approved against a verified publication-day regulatory source check. Preserve the accurate MGM-15 August 26 stamp.
