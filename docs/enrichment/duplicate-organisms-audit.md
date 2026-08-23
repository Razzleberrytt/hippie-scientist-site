# Duplicate-organism audit

**27 `latin_name` values are held by more than one entity. 22 of those have two
or more publicly exported profiles.**

This is pre-existing and unrelated to enrichment — it was surfaced by the
shared-value guard added in batch 3, then confirmed by sweeping the values that
were already populated before any enrichment ran.

Reproduce with:

```bash
node scripts/enrichment-pipeline/cli.mjs duplicates          # human-readable
node scripts/enrichment-pipeline/cli.mjs duplicates --json   # + ops/enrichment/reports/duplicate-organisms.json
```

---

## Why it matters

Two indexed profiles for the same organism is a duplicate-content problem
regardless of whether the split was deliberate. `audit:duplicates` checks for
duplicate *slugs*; these all have distinct slugs, so nothing existing catches
them.

Most pairs are a slug-vs-common-name split of one organism:

| latin_name | entities (all publicly exported unless noted) |
|------------|-----------------------------------------------|
| *Schisandra chinensis* | `schisandra`, `schisandra-berry`, `schisandra-chinensis` — **three** |
| *Allium sativum* | `allium-sativum`, `garlic` |
| *Withania somnifera* | `ashwagandha`, `withania-somnifera` |
| *Camellia sinensis* | `black-tea`, `camellia-sinensis` (+ `green-tea-extract`, cluster member) |
| *Crocus sativus* | `crocus-sativus`, `saffron` |
| *Valeriana officinalis* | `valerian`, `valeriana-officinalis` |
| *Silybum marianum* | `milk-thistle`, `silybum-marianum` |
| *Serenoa repens* | `saw-palmetto`, `serenoa-repens` |
| *Glycyrrhiza glabra* | `glycyrrhiza-glabra`, `licorice` |
| *Nigella sativa* | `black-seed`, `nigella-sativa` |
| *Syzygium aromaticum* | `clove`, `syzygium-aromaticum` |
| *Artemisia absinthium* | `artemisia-absinthium`, `wormwood` |
| *Capsicum annuum* | `capsicum-annuum`, `cayenne` |
| *Scutellaria baicalensis* | `chinese-skullcap`, `scutellaria-baicalensis` |
| *Ligusticum chuanxiong* | `chuanxiong`, `ligusticum-chuanxiong` |
| *Angelica sinensis* | `angelica-sinensis`, `dong-quai` |
| *Morinda citrifolia* | `morinda-citrifolia`, `noni` |
| *Paeonia lactiflora* | `paeonia-lactiflora`, `white-peony` |
| *Tripterygium wilfordii* | `thunder-god-vine`, `tripterygium-wilfordii` |
| *Hibiscus sabdariffa* | `hibiscus-sabdariffa`, `roselle-seed` |
| *Ocimum tenuiflorum* | `holy-basil`, `holy-basil-purple` |
| *Rehmannia glutinosa* | `rehmannia-glutinosa`, `rehmannia-prepared` |

Five more share a value but publish only one profile, so they are lower priority:
*Terminalia arjuna*, *Curcuma longa*, *Salvia miltiorrhiza*, *Ganoderma
lucidum*, *Hypericum perforatum*.

## Not all of these are mistakes

Some splits are legitimate — a plant part or preparation with its own evidence
base and its own dosing:

- `roselle-seed` vs `hibiscus-sabdariffa` — seed vs calyx
- `rehmannia-prepared` vs `rehmannia-glutinosa` — prepared vs raw, genuinely different in TCM
- `green-tea-extract` vs `camellia-sinensis` — extract vs leaf

Others look like straightforward duplicates that grew from a slug and a common
name being added at different times: `allium-sativum`/`garlic`,
`crocus-sativus`/`saffron`, `valerian`/`valeriana-officinalis`.

Only a human can tell which is which, so the audit reports and does not judge.

## Three found by the guard during batch 3

These were caught while enriching, before any value was written:

| entity being filled | already held by | outcome |
|---------------------|-----------------|---------|
| `lions-mane` | `hericium-erinaceus` | routed to review — **identical display name, "Lion's Mane"** |
| `garcinia-mangostana` | `mangosteen` | routed to review |
| `gudmar` | `gymnema-sylvestre` | routed to review |

Without the guard, all three would have imported cleanly and quietly created
three more duplicate pairs.

## What the pipeline will and will not do

`entity_type`, `slug`, `runtime_export_decision`, `seo_indexing_recommendation`,
and every other publishing control are **prohibited** to the enrichment pipeline
by contract. It cannot merge entities, redirect slugs, or unpublish a profile,
and it should not — those are identity and publishing decisions.

What it does do is refuse to make the problem worse: any `latin_name` that
another entity already holds routes to review instead of importing.

## Suggested resolution

1. For each pair, decide: genuinely distinct (plant part, preparation) or duplicate?
2. For duplicates, pick the surviving slug — prefer the one already ranking — and
   add a redirect in `public/_redirects` for the other. `/herbs/:slug` is a
   stable route contract, so a removal without a redirect breaks links and SEO.
3. Set the retired entity's `runtime_export_decision` to `alias_redirect_only`
   and `seo_indexing_recommendation` to `noindex` in the workbook.
4. Re-run `node scripts/enrichment-pipeline/cli.mjs duplicates` to confirm the
   published-duplicate count falls.

Start with the 22 published pairs; the `schisandra` triple is the largest single
win.
