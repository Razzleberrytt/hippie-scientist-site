# Duplicate-organism audit

**27 `latin_name` values are held by more than one entity. 13 of those actually
serve two or more live profiles; 10 more are already resolved by a 301.**

> **Corrected 2026-08-23.** An earlier version of this document said 22, and
> claimed redirected pages were still being indexed. Both were wrong. The 22
> came from reading `runtime_export_decision`, which a redirected entity keeps
> at `full_public_runtime` even though the build emits no page for it. The
> indexing claim came from reading `public/data/indexable-herbs.json` as if it
> were the sitemap — it is not. Checked against `out/sitemap.xml`, **none** of
> the redirect sources is built or listed, and `validate:redirect-indexability`
> (THS-177) already covers that case and reports clean. The audit now derives
> liveness from the route manifest and `public/_redirects`.

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

Two live profiles for the same organism is a duplicate-content problem
regardless of whether the split was deliberate. `audit:duplicates` checks for
duplicate *slugs*; these all have distinct slugs, so nothing existing catches
them.

### Already resolved (10)

These pairs exist in the workbook but only one side is served — a 301 in
`public/_redirects` already sends the other away, and the build emits no page
for it. Nothing to do:
`allium-sativum`→`garlic`, `valeriana-officinalis`→`valerian`,
`silybum-marianum`→`milk-thistle`, `serenoa-repens`→`saw-palmetto`,
`withania-somnifera`→`ashwagandha`, `ganoderma-lucidum`→`reishi`,
`hericium-erinaceus`→`lions-mane`, plus three where one side simply emits no
route.

Every one of the nine herb redirects points the **binomial slug at the
common-name slug**. That is a consistent, established precedent worth reusing.

### Still competing (13)

Most are the same slug-vs-common-name split:

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

## Resolution plan

```bash
npm run enrich:duplicates -- --plan   # proposals + ops/enrichment/reports/duplicate-resolution-plan.json
```

### Four are not duplicates at all

Filtered out automatically — one side is a part, a preparation, or the compound
rather than the source organism:

| value | entities | why |
|-------|----------|-----|
| *Camellia sinensis* | `black-tea`, `camellia-sinensis`, `green-tea-extract` | one plant, three preparations |
| *Schisandra chinensis* | `schisandra`, `schisandra-berry`, `schisandra-chinensis` | `schisandra-berry` is the fruit |
| *Morus alba* | `morus-alba`, `mulberry-leaf` | `mulberry-leaf` is the leaf |
| *Nigella sativa* | `nigella-sativa`, `black-seed` | `black-seed` is the seed |

`curcumin` / `turmeric` belongs in this list too — curcumin is the compound,
turmeric the plant — but `curcumin` is typed `entity_type: herb`, so the type
check cannot see it. It appears as a low-confidence proposal; do not merge it.

### Five where every signal agrees

Precedent and source counts point the same way. Apply these first:

| keep | retire |
|------|--------|
| `saffron` | `crocus-sativus` |
| `gudmar` | `gymnema-sylvestre` |
| `chuanxiong` | `ligusticum-chuanxiong` |
| `noni` | `morinda-citrifolia` |
| `cistanche` | `cistanche-deserticola` |

### Eight where precedent and content disagree

In each of these the *binomial* slug — the side precedent says to retire —
carries **more** sources than the common-name slug that would survive:

| proposed survivor | proposed retire | sources on the retire side |
|-------------------|-----------------|----------------------------|
| `licorice` | `glycyrrhiza-glabra` | 24 |
| `chinese-skullcap` | `scutellaria-baicalensis` | 22 |
| `dong-quai` | `angelica-sinensis` | 11 |
| `mangosteen` | `garcinia-mangostana` | 8 |
| `white-peony` | `paeonia-lactiflora` | 8 |
| `clove` | `syzygium-aromaticum` | 7 |
| `thunder-god-vine` | `tripterygium-wilfordii` | 7 |
| `turmeric` | `curcumin` | not a duplicate — see above |

This is the most useful thing the plan surfaces. The nine redirects already in
place all kept the common-name slug, but the binomial-slug entities generally
carry the richer evidence. Applying the precedent mechanically would retire the
better-sourced page in eight of thirteen cases. **Merge the content first, then
redirect** — that order is safe in either direction.

### Why this is a plan and not a change

Choosing a survivor should be driven by which URL actually receives organic
traffic, and there is no analytics feed in this repository. A 301 consolidates
rather than deletes, so the downside is bounded — but it is still eight
judgement calls made blind, on live indexed pages. The plan carries the exact
redirect lines and workbook edits per pair, so confirming or flipping a row with
Search Console open takes minutes.

### Applying a row

1. Move any sources or evidence worth keeping onto the survivor.
2. Add both redirect lines from the plan to `public/_redirects`, with and
   without the trailing slash, matching the existing style.
3. Set the retired entity to `alias_redirect_only` and `noindex`. Both are
   governance columns that the workbook patch runner refuses by design, so use
   the surgical editor:
   `npm run workbook:edit -- --slug <slug> --column <column> --value <value>`.
4. `npm run enrich:duplicates` — the live-duplicate count should fall.
