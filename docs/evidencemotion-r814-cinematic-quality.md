# EvidenceMotion R8.14 — Cinematic 2.5D House Style (implementation candidate)

## Creative authority and review hierarchy — OWNER-FIRST (October 12, 2026)

**Willie's original vision takes precedence over V's recommendations.** The leading product requirement is original, exceptional-quality 2D/3D synthesis: cinematic, visually distinctive, memorable, genuinely explanatory science. Do not trade away artistic originality for checklist compliance.

1. **Non-negotiable production safety:** sourced scientific claims, no invented quantities/doses/effect sizes, readable citations/captions, protected safe areas, preserved quality voice, accessible mobile audio and legitimate human approval.
2. **Owner's creative decisions:** unique materials/subjects/cameras/lighting, depth, rhythm, intentional dramatic pauses, authentic science representation, high polish, no filler HUD/footer. These have priority over V's stylistic thresholds.
3. **V's independent audit is a diagnostic input:** warn when static fraction reaches 40%, a beat shows no perceptible change, no midpoint break appears, or a beat lacks a useful key number. Do not auto-reject an intentional hold, an organically timed interruption, or a visual narrative without a spurious number. If a measured symptom is genuinely ugly, repair it; a numeric pass is never a substitute for artistry.
4. **Validation labels:** `V_RECOMMENDED` and `V_TARGET_MET` are not `OWNER_APPROVED` or `V_VERIFIED`. Only a real V re-audit can be represented as V-verified; ChatGPT's own review remains separate.
5. **No premature claims:** vector-rendered depth effects are cinematic 2.5D, not physical 3D, ray tracing, studio-grade VFX or a proven state-of-the-art pipeline. A final video should earn the aesthetic claim through viewed pixels, motion, and sound.

V's October 12 P1 list is **retained**, ranked, and implemented as owner-subordinate quality review:
- Decode final MP4 and measure image change over each beat and overall; target <40% static, identify accidental freezes.
- Prefer a story-motivated visual-register change near midpoint; do not insert generic 2-second effects solely to pass a metric.
- Display an accurate, verified sample size or effect size where it makes an explanation better; zero made-up figures.
- Test recognizable liver/receptor/enzyme shapes at normal phone size; replace unrecognizable blobs. A pixel difference alone does not certify recognizability.
- All visible text, citations and caption layers respect mobile safe zones, not merely hooks.
- R8.10 alignment receipts verify acoustic word times; progressively highlighted **rendered** words require separate pixel verification. Do not claim karaoke highlighting merely because a track is word-aligned.
- Keep P2 voice A/B and Willie-on-camera concepts as experiment proposals, not mandatory additions or silent voice replacements.

**Status:** Codified in a review branch; not a claim of final perceptual acceptance, merge, or production deployment. Applies to the current governed R8.09/R8.10 SVG/FFmpeg runtime; preserves all scientific claims, human approvals, prior creative methods and the original Kokoro ONNX voice. R8.13 remains separately scoped.

## Owner-first creative authority (October 12, 2026)

**The owner's initial and subsequent explicit creative preferences are the controlling artistic brief, even when they differ from V's aesthetic recommendations.** This is a standing project decision for EvidenceMotion, not merely feedback about one mitragynine video.

**Precedence within creative decisions:**
1. Owner's explicit creative direction and previously accepted constraints: distinctive high-end cinematic 2D/3D synthesis, real depth and meaningful motion, visual variety and memorable wow factor; no generic slides, ornamental "Science Signal / Concept / 001" footer or unneeded HUD; natural saved Kokoro voice, accurate readable captions, quiet music and a mobile-video format actually playable on the owner's iPhone.
2. Owner-accepted visual experiments and exact-master human review.
3. V's independent artistic suggestions or preferences, as **optional critique and proposals** that must not silently displace the owner's brief.
4. Generic presets, fallback templates or heuristics.

**Separation of authority:** V or another reviewer may block unsupported scientific claims, altered meaning, unsafe implications, broken citations, distorted outcomes, or failed audiovisual/device checks. Those are evidence and release-integrity constraints—not creative veto power or permission to substitute V's artistic taste. Resolve a genuine conflict by preserving the user's creative direction while correcting scientific or technical risk; if irreconcilable, escalate rather than overriding the owner or bypassing a safety gate.

**Review receipts:** Every R8.14 visual revision should identify (a) the owner preference being satisfied, (b) any V suggestion adopted by the owner versus rejected/deferred, (c) the real rendered visual evidence and caption/audio checks. Never label a preference "V_VERIFIED" scientific verification, and never claim a video was perceptually approved or merged based on tests alone.

## Owner's observed failures (October 12, 2026)

- The shipped mitragynine short resembled static presentation slides. The permanent creative goal is **cinematic scientific storytelling**: depth, motivated motion, tactile objects, visual contrast and legibility, rather than a coat of gradients.
- The disposable "SCIENCE / SIGNAL / CONTEXT" and "001 / Evidence" decorations waste precious mobile space. Reject exact redundant footer/serial labels in the canonical SVG renderer **and** MP4 scene verifier. Never strip legitimate source citations or substantive scientific language.
- Original MP4s were inaudible in the owner's iPhone/ChatGPT playback despite audible standalone MP3. The **working** owner-confirmed MP4 (Oct 12) uses **H.264 Constrained Baseline, 720×1280, 44,100 Hz AAC-LC stereo**. Encode new governed 1080×1920 output as baseline-compatible H.264 and 44.1 kHz stereo AAC; probe the *final MP4* and decode/test its actual audio. The 1080 target is a production preference, **not** confirmation that every iPhone player is compatible. Obtain an actual playback acceptance before publish; provide the known-working 720×1280 alternative when needed.

## Visual language — wow through meaning

1. **2D / 3D synthesis:** exactly grounded headings, captions, qualifiers and source cards in a stable 2D text plane. Different, clearly symbolic lit subjects occupy three separately named depth planes: distant atmospheric volumetric halo, middle 3D-like glass objects, near specular/focus plane. Use designed occlusion, shadows, extruded silhouettes, reflections and warm/cool material contrast. `ths-cinematic-2p5d-v1` is a **2.5D synthesized illustration style**, not physically modeled 3D, photoreal footage, molecule simulations or new scientific evidence.
2. **Seven scene-specific visual directions:** human figure; two-entity contrast; explicitly symbolic relationship network; evidence documents and lens; uncertainty prism; safety warning beacon; closing reveal. Not seven repeated rounded-rectangle layouts. Scientific fields remain correct; figures/data cannot be manufactured by visual metaphors.
3. **Narration-owned motion:** pre-cue and post-cue have different geometry, depth offsets, and meaning; render a reveal/contrast only when the spoken anchor arrives. The existing FFmpeg stage movement remains restrained. Do **not** imply the new implementation already has real-time ray tracing or independent continuous multi-layer 3D camera tracking.
4. **Art direction / hierarchy:** 0–2s distinctive subject silhouette and simple hook, one focal concept per shot; high-contrast subtitles (1–2 lines) in the safe intersection; effects away from citations; real PMIDs and evidence tier always win screen space. No vague HUDs, progress trackers, decorative ribbons, arbitrary sequence numbering or badges.
5. **Proof before promotion:** compare true decoded contact sheets at 1× phone size, first/last frames, midpoint/source/limitation frames, caption overlays and actual human listening. Run claim/source and readability review. Require a genuine human visual/auditory verdict; syntactic checks do not prove "wow", scientific semantics, sync, or final mobile playback.

## Repeat-proof pipeline contracts

- Canonical SVG generator and MP4 asset verification both reject the exact known redundant footer/serial text; legitimate evidence text is not rejected by keyword.
- Canonical voice model remains pinned **Kokoro ONNX 0.6.1 + am_michael**; any missing/corrupt voice fails closed, no Flite fallback.
- Prefer the documented working audio format: AAC-LC, 44.1 kHz stereo, 192 kb/s, final MP4 H.264 Baseline Level 4.0, yuv420p, faststart. Verify actual encoded audio stream, decoded signal and R8.12 loudness; block staging if a verified decoded-audio receipt is absent. Device/UI audio acceptance remains separate and cannot be proven by FFprobe.
- Existing R8.10 acoustic word-alignment and science safety/source receipts remain required. Do not mislabel phrase-estimated captions as acoustic word-alignment.
- Add negative/positive regression tests for ornamental footer exclusion, seven different multi-plane actors, semantic pre/post changes, known-working audio profile, invalid silent/mono audio and future manifest drift.
- **Rollback:** revert this bounded renderer enhancement if existing source/claim/voice/caption tests or any protected CI fail. Do not erase historic source/provenance packets or expand publishing authority.

**Release gate:** exact-head CI + independent close-up/perceptual review + one real fully approved MP4 on an iPhone before describing the system as proven or rolling it into automatic publishing. The screenshots and MP4 from the Oct 12 mitragynine short are the **baseline failure reference**, not proof of the new style.
