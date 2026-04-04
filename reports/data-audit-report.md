# Data Audit Report

- Generated: 2026-04-04T01:42:04.083Z
- Herb list records: 699
- Herb detail records: 677
- Compound records: 390
- Errors: 11715
- Warnings: 0

## Dataset coverage

- `public/data/herbs.json`: 699 records
- `public/data/herbs-detail/*.json`: 677 files
- `public/data/compounds.json`: 390 records

## Issue counts by code

- missing-required-field: 9462
- invalid-field-type: 2188
- placeholder-value: 26
- herb-list-detail-mismatch: 23
- unresolved-active-compound-reference: 10
- duplicate-name: 4
- duplicate-slug: 2

## Issue counts by dataset

- compound: 2061
- herb-detail: 4836
- herb-list: 4818

## Sample findings

- [error] herb-list acacia-confusa (sources): Source entry 0 is missing a url.
- [error] herb-list acacia-confusa (sources): Source entry 1 is missing a url.
- [error] herb-list acacia-confusa (sources): Source entry 2 is missing a url.
- [error] herb-list acacia-maidenii (sources): Source entry 0 is missing a url.
- [error] herb-list acacia-maidenii (sources): Source entry 1 is missing a url.
- [error] herb-list acacia-maidenii (sources): Source entry 2 is missing a url.
- [error] herb-list acacia-nilotica (sources): Missing required field 'sources'.
- [error] herb-list acacia-nilotica (sources): Field 'sources' must not be empty.
- [error] herb-list acacia-phlebophylla (sources): Source entry 0 is missing a url.
- [error] herb-list acacia-phlebophylla (sources): Source entry 1 is missing a title.
- [error] herb-list acacia-phlebophylla (sources): Source entry 1 is missing a url.
- [error] herb-list acmella-oleracea (sources): Source entry 0 is missing a url.
- [error] herb-list acmella-oleracea (sources): Source entry 1 is missing a url.
- [error] herb-list acmella-oleracea (sources): Source entry 2 is missing a url.
- [error] herb-list acmella-oleracea (sources): Source entry 3 is missing a url.
- [error] herb-list acmella-oleracea (sources): Source entry 4 is missing a title.
- [error] herb-list acmella-oleracea (sources): Source entry 4 is missing a url.
- [error] herb-list aconitum-ferox (class): Missing required field 'class'.
- [error] herb-list aconitum-ferox (activeCompounds): Missing required field 'activeCompounds'.
- [error] herb-list aconitum-ferox (contraindications): Missing required field 'contraindications'.
- [error] herb-list aconitum-ferox (class): Field 'class' must be a string, received null.
- [error] herb-list aconitum-ferox (activeCompounds): Field 'activeCompounds' must not be empty.
- [error] herb-list aconitum-ferox (contraindications): Field 'contraindications' must not be empty.
- [error] herb-list aconitum-ferox (sources): Source entry 0 is missing a url.
- [error] herb-list aconitum-ferox (sources): Source entry 1 is missing a title.
- [error] herb-list aconitum-ferox (sources): Source entry 1 is missing a url.
- [error] herb-list aconitum-napellus (sources): Source entry 0 is missing a url.
- [error] herb-list aconitum-napellus (sources): Source entry 1 is missing a title.
- [error] herb-list aconitum-napellus (sources): Source entry 1 is missing a url.
- [error] herb-list acorus-americanus (class): Missing required field 'class'.
- [error] herb-list acorus-americanus (sources): Missing required field 'sources'.
- [error] herb-list acorus-americanus (class): Field 'class' must be a string, received null.
- [error] herb-list acorus-americanus (legalStatus): Field 'legalStatus' must be a string, received null.
- [error] herb-list acorus-americanus (sources): Field 'sources' must not be empty.
- [error] herb-list acorus-calamus (sources): Source entry 0 is missing a url.
- [error] herb-list acorus-calamus (sources): Source entry 1 is missing a url.
- [error] herb-list acorus-calamus (sources): Source entry 2 is missing a url.
- [error] herb-list acorus-calamus (sources): Source entry 3 is missing a url.
- [error] herb-list acorus-calamus (sources): Source entry 4 is missing a title.
- [error] herb-list acorus-calamus (sources): Source entry 4 is missing a url.
