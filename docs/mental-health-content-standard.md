# Mental Health Content Standard

Last reviewed: 2026-07-13

## Scope

This standard applies to the OCD and personality-disorder guide cluster under `/guides/mental-health/`.

## Source hierarchy

Prefer sources in this order when they are relevant to the claim:

1. Current official clinical guidance and government health agencies
2. DSM-5-TR and WHO ICD-11 diagnostic materials
3. Systematic reviews and meta-analyses
4. Randomized controlled trials
5. Peer-reviewed clinical reviews
6. Professional reference sources when stronger evidence is unavailable

## Citation requirements

- Every key point, clinical explanation, diagnostic distinction, treatment statement, and FAQ answer must include one or more reference IDs.
- Every cited reference ID must resolve to a full reference on the same page.
- Reference entries must link to an official guideline, government page, publisher, DOI, or PubMed record.
- Source type must be visible to readers.
- Evidence limitations and indirect evidence must be stated plainly.

## Editorial safeguards

- Do not diagnose the reader or an absent third party.
- Do not use personality-disorder labels as synonyms for abusive, evil, manipulative, dangerous, attention-seeking, or untreatable.
- Describe safety risk from current behavior and context rather than diagnosis alone.
- Distinguish OCD from OCPD prominently.
- Do not present supplements, herbs, or affiliate products as treatments for OCD or personality disorders.
- Include cultural, developmental, medical, substance-related, trauma-related, and neurodevelopmental alternatives where relevant.

## Build-time integrity

`lib/mental-health-articles.ts` validates duplicate slugs, duplicate references, unresolved citation IDs, malformed URLs, minimum reference counts, and minimum article depth whenever the content module is imported during the build.

## Review cadence

Recheck official guidance, diagnostic-framework changes, systematic reviews, retractions, and broken reference links at least annually or sooner after a major guideline update.
