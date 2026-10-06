# Metricool provider operations

**Status:** Frozen for new publication  
**Owner:** Revenue / Lane 5 historical provider evidence  
**Provider:** Metricool

## Current boundary

Metricool is no longer an authorized creation or scheduling path for new THS social posts.

Canonical publication now flows through **THS Publisher**:

`SocialOS decision → governed artifact → publication_id → THS Publisher queue → platform adapter/manual receipt → THS Observer → learning`

The GitHub workflows `.github/workflows/metricool-publication.yml` and `.github/workflows/metricool-connector-publication.yml` are intentionally fail-closed. The executable `scripts/distribution/schedule-metricool-publication.mjs` is also frozen and refuses every scheduling attempt.

## What remains valid

Historical Metricool data is not deleted or rewritten. Existing provider UUIDs, post IDs, public URLs, publication receipts, and post/account analytics may remain useful as historical observations when their identity is already established.

Provider IDs never become canonical THS publication identity. New posts require a first-party `publication_id` derived from the exact experiment, artifact hash, platform, and intended time.

The lower-level Metricool normalization/provider code remains temporarily in the repository for historical fixture coverage, receipt interpretation, and rollback archaeology. Its existence is **not** publication authorization.

## Credentials

Legacy Metricool credentials must remain server-side and must never be committed, printed, copied into receipts, or used to bypass THS Publisher.

No new workflow or operator command should depend on `METRICOOL_USER_TOKEN`. If Metricool is ever reintroduced as a transport, it must be implemented as a replaceable THS Publisher adapter that consumes an existing canonical publication job and returns provider receipts beneath that identity.

## Replacement path

- New TikTok creation: THS Publisher + first-party TikTok draft adapter.
- Facebook/Meta in v0.1: exact governed artifact may be posted manually, then attached to the existing publication job through `/api/publisher/manual`.
- Publication truth: THS Observer / verified public receipt.
- Learning truth: SocialOS workbook and experiment systems only after verified publication.
- Metricool analytics: historical/provider observation only; never sufficient by itself to manufacture first-party site attribution or publication identity.

See `docs/ths-publisher-v0.1.md` for the active architecture.
