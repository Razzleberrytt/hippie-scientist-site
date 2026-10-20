# Algorithm Observatory — Phase 0 Existing-System and Metric-Coverage Audit

**Investigated:** 2026-10-15 · **Status:** Research / integration-readiness analysis only, **not** implemented, admitted, merged code, production-certified or evidence of algorithm reconstruction.
**Parent specification:** [THS Algorithm Observatory 1.0](THS_ALGORITHM_OBSERVATORY_V1_SPEC.md).
**Next gated owner candidate:** [#6810](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6810).
**Related implementations:** [R8.10 flywheel](evidencemotion-r810-flywheel.md) (#6654; PR #6658) and [R8.11 governed experiments](evidencemotion-r811-production.md) (#6659; PR #6660).

## Executive finding

**Reuse existing code.** The technical foundation of Observatory 1.0 already exists on `main`, but there is no verified end-to-end join from a **Publisher-confirmed PUBLISHED post** to a **source-timestamped platform observation** in the R8.10 flywheel. The first proposed deliverable must be that read-only, fail-closed join, not a second analytics platform, another model, or autonomous publishing.

The source inspection listed below is an architectural/code inspection; it does **not** independently reproduce a complete real-platform campaign, run all tests or prove provider credential availability.

## Existing ownership / verified source-file locations

| Boundary | Existing owner and source | Already present | Limitation / integration need |
|---|---|---|---|
| Official THS publication identity and lifecycle | `scripts/distribution/social-publisher-core.mjs`; `docs/ths-publisher-v0.1.md` | `buildPublicationIdentity` derives `publicationId` from experiment/media SHA/platform/time; `markPublicationPublished` requires verified external ID and publishes from a permitted state | Consume read-only canonical `PUBLISHED` job + provider receipt. Do not reinterpret unverified dispatch/draft as published |
| R8.10 video learning registry | `scripts/distribution/evidencemotion-flywheel.mjs` (`registerFlywheelVideo`, `registerFlywheelFromPackage`) | Immutable exact-media and source-manifest SHA records, first-3-second hook from genuinely aligned audio where available, own local video ID and optional R8.11 experiment identity | Registration currently accepts owner-entered `publishedUrl`/attestation and hashes without independently requiring canonical Publisher `publicationId`, `PUBLISHED` state or provider video ID. Do not migrate old identities automatically |
| Performance observations and insights | Same R8.10 module (`appendFlywheelObservation`, `flywheelInsights`, `renderFlywheelLearningReport`) and CLI | Append-only per-video observations, explicit first-72h/7d/28d/lifetime windows, UTC timing checks, null-as-Unknown, provider-export receipt hash when claimed, cautious top-quartile hook signal and future-only proposals | Missing provider-native metric-definition/denominator provenance and canonical Publisher link for the proposed cross-platform analysis. Do not treat top-quartile small samples as causal effects |
| R8.11 experiments | `scripts/distribution/r811-learning-operations.mjs`, `docs/evidencemotion-r811-production.md` | Three-arm same-platform source/plan-bound hook comparison, fixed age scope and minimum four-hour slot separation, candidate report with no automatic causal promotion | Requires three actually published approved arms and true observations; synthetic fixture does not establish field effect. Avoid unnecessary duplicate/spam uploads |
| Experiment memory | `scripts/ci/experiment-learning-ledger.mjs`, `schemas/experiment-learning-entry.schema.json` | Separate durable experiment-history/underpowered/retest decision model (#4414) | Does **not** own raw post receipts. Connect to its governed summary contract only after source-backed valid experiment |
| Media creative features | Governed video master and R8.10/R8.11 manifests, original narration and scene/beat receipts | Hash-bound source/claims/narration; temporal cues, roles, plans; recover actual published creative from immutable reviewed package when available | Phase 0 should specify deterministic feature extraction from the **exact published** artifact, not infer what a private video contained based on topic or description |
| Public-site attribution | Existing governed outcome-ingestion / consent-bound social attribution system (#4407; #6137) | Separate first-party web attribution journey and accepted provider observation semantics | Attribution to qualified visits needs actual GA4/browser receipts and privacy permission; it is **Unknown** until verified |

### Direct code-level gap: two different forms of publication evidence

`social-publisher-core.mjs` maintains a first-party canonical `publicationId` and verified `PUBLISHED` state. In contrast `registerFlywheelVideo` checks the presence/shape of a HTTPS `publishedUrl`, media/manifest SHA values and an asserted `publicationEvidence` value of `manual-owner-attested` or `provider-verified`; it does not presently consume or validate a Publisher job object. These are useful distinct receipts but not yet a trustworthy **joined identity**. This is a *design gap* rather than evidence any particular historic video was falsely labeled published.

A new pilot must either:
1. Build a **read-only bridge** that verifies the existing canonical `PUBLISHED` job, source hashes, time and provider post identity before attaching a flywheel record; or
2. When an old manually published post has no authoritative THS Publisher job, explicitly use a quarantined `legacy-unlinked-manual` observation that cannot silently satisfy the pilot's verified-publisher acceptance.

Do **not** create synthetic Publisher jobs to backfill historic posts, relax state transitions, republish any video, or mutate previously immutable flywheel records.

## Metric interface verification — sources and realistic access

This audit consulted the linked owner's Metricool brand connection read-only and the provider's supported metric catalog. **Do not put personal account IDs, API tokens, raw private reports, URL query parameters, or viewer-level data into GitHub.** Observed provider snapshots are not stored by this documentation change and therefore are not reproducible release receipts.

| Platform / path | Supported or observed fields | First-probe result and caveat |
|---|---|---|
| TikTok via connected Metricool **posts** connector | Post date/time, URL, description, duration, views, likes, comments, shares; catalog also lists full-video-watched rate, total/average watch time, feed-source percentages | Video rows with basic view/engagement measures were returned in the 2026-09-15–10-15 owner probe. Completion, watch-time and traffic-source values were all **null** for the returned set. Field presence in catalog ≠ metric availability |
| YouTube via Metricool **videos published in range** and **all videos** | Available fields include published date, video ID/URL/title, views, watch minutes, average view duration, likes and comments | Both tested reports returned **zero rows** for the examined recent periods. This is `No rows returned`, **not** proof the channel has zero published videos or zero plays. Verify account connection, permissions, time filters and provider freshness before modeling |
| TikTok official Display API `/v2/video/query/` | Authorized user's video ID, create time, title, duration, `view_count`, `like_count`, `comment_count`, `share_count` | Requires account authorization and `video.list`. The documented response does **not** promise retention curves/average-watch-time fields. Source: https://developers.tiktok.com/docs/en/tiktok-api-v2-video-query |
| YouTube Data API `videos.list` | Video-level metadata and basic statistics such as view count and likes | Scope and public/owner access depend on requested parts. **YouTube changed API video view counting from 2026-08-24**; include measure-definition version on longitudinal datasets. Source: https://developers.google.com/youtube/v3/docs/videos |
| YouTube Analytics API | Owner-authorized `averageViewDuration`, `estimatedMinutesWatched`, `averageViewPercentage`, and video-specific `audienceWatchRatio` or `relativeRetentionPerformance` with position dimension | Requires suitable OAuth authorization and a true owning account/video; do not assume Metricool grants YouTube Analytics API consent. Sources: https://developers.google.com/youtube/analytics/metrics and https://developers.google.com/youtube/analytics/reference/reports/query |

**Metric type rules:** `view_count`, `views` and `engagedViews` are not automatically equivalent across platforms or periods; `fullVideoWatchedRate` is not an audience-retention curve; `watchThroughPercent` in the R8.10 schema must not be filled from a different percentage without an explicit definition and unit proof. Provider aggregates, video-level snapshots and cumulative time windows are not interchangeable. Report `null/Unknown` where scope or coverage is absent, never `0` by default.

## Thin pilot contract — proposal only

Minimal read-only, append-only handoff record:

```json
{
  "schemaVersion": "ths-observatory-post-bridge-proposal-v1",
  "publicationId": "<existing Publisher ID>",
  "publisherState": "PUBLISHED",
  "publisherSnapshotSha256": "<actual source hash>",
  "platform": "tiktok",
  "platformPostId": "<verified exact public post ID>",
  "experimentId": "<existing experiment ID>",
  "artifactSha256": "<actual approved MP4 SHA-256>",
  "productionManifestSha256": "<actual manifest SHA-256>",
  "flywheelVideoId": "<existing immutable flywheel video ID>",
  "publishedAt": "<actual ISO-8601 UTC timestamp>",
  "observation": {
    "observedAt": "<actual ISO-8601 UTC timestamp>",
    "metricsThroughAt": "<actual ISO-8601 UTC timestamp>",
    "metricWindow": "first-7d",
    "metricSource": "authorized-export-or-manual-with-receipt",
    "metricDefinitionsVersion": "<platform-specific version>",
    "views": null,
    "watchTimeSeconds": null,
    "completionRatePercent": null
  },
  "status": "RESEARCH_ONLY_NO_PUBLISHING_AUTHORITY"
}
```

The example is **a proposed schema fixture with placeholders**, **not** a real observation. Schema details must be fitted to actual source functions and validations before implementation; maintain source-native metrics in a separate typed sidecar rather than breaking existing immutable `ths-evidencemotion-flywheel-observation-v1` or forcing a migration.

### Admission and safety

- **First narrow task:** exact `PUBLISHED` Publisher job → one existing R8.10 flywheel video + one legitimate, clearly time-windowed observation, no model fitting. Track via [#6810](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6810), not by self-admitting this document.
- **Dependencies:** live owner/source reconciliation, platform/metric provider permission, actual published proof and original MP4 hash, existing experiment history check, current workstream priority.
- **Workstream capacity:** `CURRENT_SPRINT.md` currently records D #6685 and A #6769 as admitted, and normal WIP 2/3 in that snapshot. A numerically free slot does **not** itself authorize a new ticket; real GitHub state and scoring must be checked at admission.
- **Priority constraint:** EvidenceMotion 46-item craft/first-render completion remains the immediate priority. No Observatory feature counts toward those 46.
- **Proof tiers:** T0 fake/tampered/expired fixtures; T1 source-owner/bridge and idempotency negative tests; T2 exact-head CI, required build and security/science/quality gates; T3 main receipt and first truly provider/owner-verified field observation when available.
- **Fail-closed negatives:** `QUEUED`/draft/accepted-but-not-published, incompatible platform, changed hash, unsupported provider metrics, conflicting source timestamp, expired permissions, synthetic-only field demo, duplicate provider ID under another publication, missing/changed owner manual receipt and unverified YouTube video rows.

## Explicit research outcome

**Phase 0 code-source mapping: complete as an inspection.** **Phase 0 empirically reproduced system tests: not executed in this audit.** **Phase 1 Publisher-to-flywheel bridge: unadmitted/not implemented.** **Actual cross-platform predictive discovery, external API access, source-native retention coverage, measured uplift and business ROI: Unknown.**

A statistically credible creative-prediction experiment follows trustworthy identity, authorized metric access, sufficient comparable data and prospectively registered hypotheses. No recommendation or scientific/editorial approval is conferred by this report.
