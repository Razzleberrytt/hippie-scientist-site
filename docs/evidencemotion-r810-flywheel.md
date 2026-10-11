# EvidenceMotion R8.10: First-Class Learning Flywheel

**Status:** Proposed code on PR #6658, stacked on R8.09 PR #6651. Not a production release or evidence of three published videos. Governed scope: issue #6654.

**Purpose:** Performance informs future editorial choices but never substitutes for EvidenceBridge authority, independent R8.05–R8.10 quality gates, or human publication decisions. Manual-first; no provider API keys, paid services or auto-posting.

## Storage and immutability

Default private operational root: `ops/evidencemotion/flywheel`.

- `videos/<video-id>/MANIFEST.json`: immutable SHA-256 bindings to exact published MP4 and original production asset manifest. This is a read-only index, not a replacement for the production manifest.
- `videos/<video-id>/performance-ledger.json`: exactly one immutable identity record per published video: topic, hook actually spoken in the first three seconds, beat-template version, publication URL/date, platform, manual/provider provenance.
- `videos/<video-id>/observations/<utc-time>-<window>.json`: each later metric snapshot is a NEW immutable file. Old views/likes/follows/watched-through/retention and their observation timestamps never get overwritten. Unavailable metrics are `null`, not 0.
- `hook-patterns/<video-id>/<utc-time>-<window>-<hash>.json`: immutable snapshots of reusable actual hooks with stats, performance rank and an explicit science-review requirement.
- `template-proposals/<id>.json`, `template-approvals/<id>.json`, `template-versions/<version>.json`: separate immutable proposal/approval/future-only version lineage.

Reports and pattern rankings are recalculated from the immutable ledger; no mutable dashboard is necessary.

## How to run it

After a real native TikTok upload, create a local file named publication.json with your actual metadata:

```json
{
  "videoId": "kava-video-20261011",
  "platform": "tiktok",
  "topic": "Kava safety",
  "publishedAt": "2026-10-11T20:00:00Z",
  "publishedUrl": "https://www.tiktok.com/@YOUR_ACCOUNT/video/YOUR_REAL_VIDEO_ID",
  "publicationEvidence": "manual-owner-attested"
}
```

With the exact locally rendered, approved R8.10 package still present, run:

```bash
node scripts/distribution/evidencemotion-flywheel-cli.mjs register --input publication.json --package /path/to/approved-video-package
```

The importer hashes the actual MP4 and production manifest and extracts the first-three-second hook from verified local word-alignment receipts. Without a package, registration requires you to supply the exact actual `artifactSha256` and `productionManifestSha256`, `beatTemplateVersion`, and `hookTextFirst3Seconds` manually. Never invent hashes.

Paste real stats into stats.json (example values below are **unknown**, NOT actual platform observations):

```json
{
  "videoId": "kava-video-20261011",
  "observedAt": "2026-10-18T20:00:00Z",
  "metricWindow": "first-7d",
  "source": "manual-owner-entry",
  "metrics": {
    "views": null,
    "likes": null,
    "followsAttributed": null,
    "watchThroughPercent": null,
    "averageRetentionPercent": null
  },
  "note": "Replace nulls only with actual reported platform metrics."
}
```

```bash
node scripts/distribution/evidencemotion-flywheel-cli.mjs observe --input stats.json
node scripts/distribution/evidencemotion-flywheel-cli.mjs report --window first-7d --last 10
node scripts/distribution/evidencemotion-flywheel-cli.mjs hooks --window first-7d
node scripts/distribution/evidencemotion-flywheel-cli.mjs topics --window first-7d
```

Hooks classify into four stable reusable patterns; the top observed quartile in same-platform, same-window results is a candidate when at least three comparable videos with 100+ views exist. All observed hooks enter the library; the library can have three patterns from three real videos even if only one has a winning rank. **Winning by platform stats is not scientifically good, statistically causal, or guaranteed future performance.**

Topic lift uses a comparable same-platform/window median of at least three posts. Overperformers are eligible for proposed deeper dives, myth-vs-fact, and part 2; underperformers are deprioritized but never removed or called false science. Missing attribution or baseline remains Unknown.

## Template proposals and approval

Use `propose --input proposal.json` with an actual before/after video cohort and change type (`hook-structure`, `beat-order`, `caption-style`). The immutable proposal contains measured baseline and after median views, follow conversion when known, real percentage delta, cohort sizes and a warning that the observed difference does not prove causation.

A separate owner/editorial human must explicitly run `approve --input approval.json` containing proposal ID, reviewer ID, role (`owner` or `editorial-science-reviewer`), `decision: approved`, ISO UTC approved date, and a concrete scientific review note. This is *self-attested*, not cryptographically authenticated. `version --proposal ID` writes another immutable future-only template record. This does **not** patch active/in-flight videos, schedule uploads or change science. Existing older versions remain available.

## Acceptance truth

Automated three-video tests use **synthetic fixtures** only; no real video upload or TikTok metrics are claimed. Full acceptance requires three actually published videos with immutable ledger entries, at least three empirically observed hook patterns, a human-approved template proposal with a real measured delta and lineage, and an on-demand report from those real entries.

R8.10 production still additionally requires reliable local acoustic word alignment, encoded MP4 human approval, exact-head CI, protected merge-controller approval, and release receipts. Missing receipts remain **Unknown / blocked**, never PASS.
