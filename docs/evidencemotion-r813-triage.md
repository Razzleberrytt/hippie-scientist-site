# EvidenceMotion R8.13 / Distribution — triaged intake (Oct 11, 2026)

**Status:** Proposed, not implemented. This is not an expansion of the R8.12 release. V's external master backlog reports 39 items; only the substantive details supplied in owner handoffs are restated here. Do not silently mark those 39 items done or claim the external backlog was fetched.

## Immediate QA candidates (ranked)

1. **Pre-publish verification CLI:** one command checking full MP4 and caption receipts, original ONNX voice binary SHA-256, exact MFA word alignment, final EBU R128 integrated loudness and true peak, safe-area rendered frame audit, three hook draft MP4s, source/PMID visibility, output cover image and clip duration. Evidence is allowed to be absent from an *unreleased draft* but not mislabeled production-approved. Fail closed.
2. **Golden-reference regression:** store an owner-approved baseline scene/frame manifest and visually compare V3 against V2 at key frames, protecting source-card PMIDs, scientific caveats, labels and captions. Flag differences as **review-needed**, never judge the latest animation better/worse by a raw pixel hash.
3. **Motion-density metric:** decode sampled frames with local FFmpeg and score meaningful visual changes, distinct from subtle background zoom. Flag **over 40% near-static runtime**; treat false positives (legible source card, essential safety holds) as reviewer exceptions.
4. **Full safe-area expansion:** enforce legibility and contrast of overlays, object labels, on-screen PMIDs, captions and subtitles across all scenes and target crops.
5. **SRT and cover-frame exports:** export the exact governed caption SRT and designated 0-second hook PNG with frame provenance per video. Use the cover as a per-platform upload aid, not an unsupported automatic TikTok thumbnail action.

## Traffic, funnel and reuse candidates

6. **Video transcript → article SEO/accessibility:** canonical narration transcript artifact emitted from verified render receipts; opt-in article-template transcript slot for the matched page, without duplicated or auto-generated clinical claims.
7. **Article ↔ video:** named article URL in video plus a provider-permitted embed on that article after the **actual published video URL** has been verified. Check site embed support and mobile/accessibility first.
8. **One structured, reviewed research packet per topic:** normalized JSON/YAML with claim IDs, real PMIDs and URLs, lab/human evidence tiers, limitations, key numbers, disclaimers and plain-language glossary. Article, narration, carousel and newsletter derive from the same immutable governed packet; changing claims invalidates dependent outputs.
9. **Evidence card as Instagram carousel:** standalone high-resolution citation/limitation PNGs from the same approved source packet, independent text/safety review. No invented counts/attribution.
10. **Multiple aspect ratios:** crop-aware FFmpeg output for 9:16 and selected additional dimensions; test safe areas and annotation clarity before distribution.
11. **URL/UTM attribution:** a video-to-article journey based on verified matching canonical article, tagged link-in-bio links, opt-out-respecting measurement and measured outcomes. No assumed traffic/commission lift.
12. **Kratom-specific lead magnet and link-in-bio page:** research-reviewed safety checklist covering leaf vs extracts, 7-OH and interactions, accessible signup and clear non-medical disclaimer; separate privacy/consent approval before implementation.
13. **Distribution SOP:** TikTok/YouTube Shorts/Instagram Reels upload checklist, caption+hashtag review, cover, bio link, pinned harm-reduction comment and comment moderation. Distinguish **procurement/sourcing requests for substances** from legitimate requests for scientific citations: do not delete good-faith evidence questions.

## Creative craft / series candidates

14. **Loop-cut rendering:** optional ~30-second TikTok cut alongside ~46-second complete YouTube version. Last visual frame must align with first; regenerate narration/captions and undergo fresh scientific scope QA. Do not truncate caveats to get a loop.
15. **Redundant object encoding:** all teal/orange mitragynine/7-OH objects carry their names on/adjacent to actual glyphs, not a detached legend. Support color-vision and low-brightness viewing.
16. **Jargon budget:** warn at >3 undefined scientific terms, define each on first use in ≤6 words (example preferred plain language: “kratom's main active ingredient,” “human liver tissue”); preserve scientifically essential distinctions, and leave already-plain-English narration otherwise unchanged.
17. **Series bible:** EVIDENCE/00N format: 0–2-second curiosity hook, ≤3 meaningful mechanism beats, real PMID/uncertainty cards, ≤5-second named-article CTA and an intentional open loop. The visible corner serial marker is optional and should not compete with content.
18. **Numbers on evidence cards** and **physical hook experiment**: real study numbers only with unit, population, evidence tier and source; do not graft creator talking-head claims or human-presence tests into code without observations.
19. **Caption/hashtag SOP, stitch playbook and series playlists:** independently reviewed publishing playbook without assumed platform algorithms or prohibited material.
20. **New editorial leads** (unverified until separate research review): targeted 7-OH drug testing/LC-MS/MS, 7-OH withdrawal case reports, and the October 9 “100:1” ratio proposal. A topical hook is not proof of accuracy or an invitation to provide drug evasion instructions.

## Publish-day checklist — owner operational decision, not automation proof

- Select the actual first-frame cover; paste approved caption/hashtags; check cross-posting availability for Shorts/Reels on the same day.
- Set bio link to `https://thehippiescientist.net/articles/mitragynine` after verifying canonical URL and provider identity.
- Pin educational-only harm-reduction resource comment. Review and respond to appropriate audience questions rather than assuming a numerical engagement multiplier.
- Queue an editorially appropriate public stitch candidate only if platform rights and identity are verified. **Never** post into someone's account without authorization.
- Flag substance procurement/sourcing requests; moderate under platform policy. Don't hide legitimate scientific-source requests.
- Verify current federal status **only if** claims about scheduling enter the script. Do not inject a regulatory claim into a cut where it is absent.

## Systems / collaboration proposal

- **Handoff inbox:** proposed `ops/evidencemotion-handoffs/` for V-generated findings plus resolved ownership/PR references, allowing ChatGPT to pick up routine findings. **OWNER APPROVAL REQUIRED** before creating an automated relay or changing which assistant has work authority. Until then, keep existing owner-mediated collaboration.
- **Evolution gates:** flywheel expansion requires ~20+ real published-video observations, voice A/B and human-presence experiments require legitimate comparison datasets; mechanism-channel identity can guide creative direction, but must not be described as evidence of achieved conversion lift.
- **Safety:** preserve consent, original sources, credential boundaries, and scientific approval for every derived artifact.

## Release policy
Keep R8.12 small and testable. Implement these as one or more separate focused R8.13/Distribution PRs, beginning with QA (1–5) and high-leverage transcript/article integration (6–8), and verify independent review and exact-head CI before merge.
