# Parallel enrichment submission fragments

Parallel research sessions write **new files only** beneath this directory.

Directory convention:

- `session-a/*.json`
- `session-b/*.json`
- ...
- `session-h/*.json`

Each JSON file must satisfy `schemas/enrichment-session-fragment.schema.json` and every contained `workpackId` must hash to that session's shard according to `ops/research-sessions/session-manifest.json`.

Do not consolidate fragments by hand and do not edit `../enrichment-submissions.json` from a parallel session. The legacy array remains a read-only baseline for duplicate detection and existing review tooling.
