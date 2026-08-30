# Metricool provider operations

**Status:** Operational supporting contract  
**Owner:** Revenue / Lane 5 publishing  
**Provider:** Metricool  
**Current bounded brand:** The Hippie Scientist (`blogId=6794242`, `userId=5228072`)

## Purpose

The Metricool provider is the bounded live handoff for already-governed distribution assets. It does not create scientific claims, choose evidence, rewrite limitations, approve publication eligibility, or authorize broad autonomous posting.

The current live-capable asset is the governed carousel pilot. Production deployment stages hash-verified PNGs and a provider-ready manifest under `https://thehippiescientist.net/media/distribution/metricool/`. Deployment itself never calls Metricool.

## Credential boundary

Live repository-native scheduling requires the Metricool REST API token in the GitHub production environment secret `METRICOOL_USER_TOKEN`.

- Never commit the token.
- Never pass it through workflow inputs.
- Never print it or include it in provider receipts.
- Missing token fails closed before a provider request.
- `METRICOOL_USER_ID` and `METRICOOL_BLOG_ID` are non-secret provider identifiers; the current workflow binds them to the verified The Hippie Scientist brand.

## Live scheduling

Use the GitHub Actions workflow **Metricool Publication**. It is `workflow_dispatch` only and requires:

- `publication_at`: a future offset-aware ISO timestamp, such as `2026-08-31T14:00:00-04:00`;
- `networks`: explicit comma-separated targets; the current carousel contract allows `facebook` and/or `tiktok`;
- `auto_publish`: whether Metricool should publish automatically at the requested time.

The workflow regenerates the current governed pilot, compares its identity fingerprint with the media manifest already deployed on the canonical site, checks that the media URLs are reachable, and only then calls Metricool.

A successful scheduler response creates a sanitized `metricool-schedule-receipt-v1` artifact and promotes the lifecycle from dry-run scheduled to live scheduled. A schedule request is **not** recorded as published. Publication requires separate confirmed provider evidence.

## Fail-closed cases

Live scheduling stops before an accepted lifecycle transition when any of these are true:

- the deployed media identity is stale relative to the current governed pilot;
- the lifecycle is paused, invalid, or otherwise non-publishable;
- the Metricool token/user/brand configuration is missing;
- no explicit network is supplied;
- the format is unsupported by the requested network;
- a media URL is non-HTTPS, off the canonical host, outside the governed media path, or unreachable;
- the requested publication time is invalid or not in the future;
- Metricool does not return a provider post identifier.

## Current network boundary

- Facebook carousel: enabled by the current bounded provider contract.
- TikTok photo carousel: enabled by the current bounded provider contract.
- YouTube: provider request support is reserved for the governed vertical-video path; the current carousel pilot cannot be sent to YouTube.

Expanding live formats or high-volume scheduling requires separate evidence that channel policy, factual fidelity, lifecycle idempotency, rollback/withdrawal, measurement quality, and marginal efficiency remain acceptable.
