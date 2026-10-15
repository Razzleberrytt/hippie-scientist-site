# Observatory #6810 — Publisher-to-Flywheel read-only bridge

**State:** Code candidate under issue [#6810](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6810), subject to exact-head CI, protected merge and actual production-field demonstration. This documentation is not a provider/API connection, deployment, successful published-video match or measured performance lift.

## Boundary and scope

Use the existing Publisher job, R8.10 immutable flywheel registry, and R8.10 append-only metric snapshots. The new module `scripts/distribution/observatory-publisher-bridge.mjs` exposes:

- `linkPublishedFlywheelVideo(root, {videoId, publisherJobFile, masterFile, productionManifestFile})` — read-only validation of a **trusted canonical THS Publisher** `PUBLISHED` job snapshot. Verifies recomputed publication identity, public video ID and Publisher publication history, the exact existing Flywheel video, actual encoded media SHA and actual source manifest SHA. Accepts **canonical Publisher manual and reconciled publication receipts** whose external ID is an official TikTok/YouTube HTTPS video URL, even when the manual route has no provider dispatch attempts. For direct platform receipts, a provider-specific ID or official video URL is accepted. Contradictory receipt/public URLs, identity or timestamp evidence fail closed. Writes only an immutable `videos/<video-id>/PUBLISHER_LINK.json` attribution projection. Repeat calls are idempotent; conflicting links or an existing use of the same platform video / publication ID are rejected.
- `appendLinkedFlywheelObservation(root, {publicationId, platform, platformPostId, observation})` — requires the stored linked Publisher identity and sends **manual-owner-entry only** metrics to existing `appendFlywheelObservation`. Existing 72h/7d/28d/total-window checks, UTC dates, immutable revision semantics, nullable metrics and flywheel reports remain authoritative. A missing metric is null / **Unknown**, not zero. Provider-export ingestion needs a separate verified adapter and is deliberately rejected here.
- `videoIdFromPublicUrl(platform, url)` — exact public TikTok/YouTube video-ID extraction from allowed HTTPS hostnames, rejecting unknown hosts and ambiguous URLs.

This does not derive a publication timestamp from `verifiedPublishedAt` (which in a direct provider receipt may represent verification time, while **manual** Publisher receipts record an **owner-attested publication time**). The pre-existing Flywheel `publishedAt` remains the source for age-window comparisons; the bridge enforces it does not postdate the Publisher receipt time, and requires canonical manual `publishedAt` to equal its recorded manual receipt timestamp. Original timestamp evidence may remain owner-attested. Likewise, accepting a locally provided JSON snapshot does not cryptographically prove the snapshot came from production D1; callers must extract the canonical job from an authorized trusted Publisher store and preserve chain of custody. Do not treat a manually fabricated `PUBLISHED` JSON fixture as field proof.

## Operator use (illustrative only)

After a video has **already been published and verified** by the canonical Publisher, and independently registered in the R8.10 Flywheel with its reviewed exact master:

```js
import { linkPublishedFlywheelVideo, appendLinkedFlywheelObservation } from './scripts/distribution/observatory-publisher-bridge.mjs'

const link = linkPublishedFlywheelVideo('ops/evidencemotion/flywheel', {
  videoId: 'your-existing-registered-video-id',
  publisherJobFile: '/private/trusted-canonical-publisher-job.json',
  masterFile: '/private/approved-package/short-video.mp4',
  productionManifestFile: '/private/approved-package/video-asset-manifest.json',
})

// Do this only with genuinely observed and age-windowed owner-entered metrics.
// No publication or data-provider authorization occurs here.
appendLinkedFlywheelObservation('ops/evidencemotion/flywheel', {
  publicationId: link.publicationId,
  platform: link.platform,
  platformPostId: link.platformPostId,
  observation: {
    videoId: link.videoId,
    observedAt: '2026-10-08T12:00:00Z',
    metricsThroughAt: '2026-10-08T12:00:00Z',
    metricWindow: 'first-7d',
    source: 'manual-owner-entry',
    metrics: {
      views: null, likes: null, followsAttributed: null,
      watchThroughPercent: null, averageRetentionPercent: null,
      threeSecondHoldPercent: null,
    },
    note: 'Replace with actual timestamped observations, never a fixture',
  },
})
```

Example timestamps, IDs and null metrics above are **illustrative**. There is no automatic credential access, remote analytics collection, source file upload, publishing, scientific rewriting or template activation. Do not add private Publisher snapshots or raw Metricool exports to the repository.

## Validation and known limitations

Tests: `scripts/distribution/__tests__/observatory-publisher-bridge.test.mjs`. Fixture-only positive/negative checks include canonical identity, exact media/manifest bytes, source / provider video-ID mismatch, non-PUBLISHED states, missing provenance, duplicate posts, append-only conflict, manual observation identity and unknown-as-null. These are not real publishing or analytics events.

The pilot **does not** yet:
1. Read a real D1 publication record from production or independently establish the provenance of a supplied local Publisher job JSON.
2. Automatically read a social platform's retention or metrics; no OAuth scopes are obtained.
3. Claim a full real-video end-to-end source+metric receipt or verified increase in reach, retention, clicks or revenue.
4. Train a predictor, approve experimental winners, modify scientific claims, schedule uploads or count as an EvidenceMotion 46-item completion.

**To close issue #6810:** merge after exact-head relevant CI/build and protected controller approval; then separately produce a true published exact-media job-link demonstration with observation provenance. A synthetic-only unit pass is not field acceptance.
