# Batch 3 — `latin_name`, plus three policy decisions

Run 2026-08-23. 26 jobs: **23 filled, 3 routed to review.**
`latin_name` populated 209 → 232; 47 jobs remaining.

This batch resolved the three open questions left by batch 2, and each answer
became code rather than a judgement re-made per entity.

---

## 1. Synonym resolution — adopted, with a mechanical test

`scripts/enrichment-pipeline/lib/taxonomy-policy.mjs`

Batch 2 left this open because a taxonomic authority reports two very different
things through the same `SYNONYM` status:

- **generic transfer** — the same organism moved to a different genus. The
  specific epithet is unchanged. *Cordyceps sinensis* → *Ophiocordyceps
  sinensis*. Resolving is strictly better data.
- **lumping** — a narrower taxon absorbed into a broader one. The epithet
  changes. *Citrus paradisi* → *Citrus aurantium* collapses grapefruit into
  bitter orange. Resolving is actively wrong.

**The epithet test separates them mechanically.** A synonym resolves only when
all three hold:

1. the accepted target is at **SPECIES** rank;
2. the **specific epithet is unchanged** (transfer, not lumping);
3. the accepted name is **not already** another entity's `latin_name`.

Rule 1 exists because the workbook has no subspecies precedent — its only
non-binomial in 232 values is the hybrid `Mentha × piperita`.

Verified against every real case seen so far:

| case | searched → accepted | verdict |
|------|--------------------|---------|
| `cordyceps-sinensis` | *Cordyceps sinensis* → *Ophiocordyceps sinensis* | **resolve** — epithet unchanged |
| `kanna` | *Sceletium tortuosum* → *Mesembryanthemum tortuosum* | **resolve** — epithet unchanged |
| `grapefruit` | *Citrus paradisi* → *Citrus aurantium* | reject — lumping |
| `ocotea-odorifera` | *Ocotea odorifera* → *Mespilodaphne quixos* | reject — lumping |
| `fraxinus-rhynchophylla` | → *Fraxinus chinensis rhynchophylla* | reject — subspecies rank |

Both resolutions were imported in this batch. The three rejections stay blank.

## 2. Genus-level entities — permanent no-op

19 pending entities are named for a bare genus: `coptis`, `berberis`,
`epimedium`, `phellodendron`, `bupleurum`, `atractylodes`, `corydalis`,
`polygala`, `dendrobium`, `cistanche`, `isatis`, `eucalyptus`, `juniper`,
`ophiopogon`, `perilla`, `cissus`, `galangal`, `myrtle`, `agarikon`.

**There is no genus-only precedent: zero of 232 `latin_name` values is a single
word.** Writing `Coptis` would invent a convention, and picking a species would
invent a scope decision the entity never made.

These stay no-ops. Resolving them is editorial, not taxonomic — either adopt a
genus convention, or narrow each entity to the species it actually describes.
Recommend the latter; most of these are one species in practice
(`gastrodia` → *Gastrodia elata* was filled this batch precisely because the
entity meant one species).

## 3. Non-organism entities typed `herb` — report, never fix

`resveratrol`, `tyrosine`, `citicoline` are still pending; `quercetin` and
`phosphatidylserine` were no-ops in pilot 1. None is an organism.

`entity_type` is **prohibited** to the pipeline by contract — it is entity
identity, and changing it re-routes the entity across the whole site. The
pipeline will keep queueing these and keep returning no-ops, which is correct
behaviour for a system that cannot fix the underlying defect.

Note the existing precedent: `curcumin` is typed `herb` and carries
`Curcuma longa` — the source plant. That works for curcumin, which has one
source, but not for quercetin or resveratrol, which have many. A human should
retype these as compounds rather than assign a source plant.

---

## 4. New guard: shared value routes to review

Batch 3 added `shared_value_needs_review` to the contract for `latin_name`, and
a production-integrity check that enforces it.

It paid for itself immediately, catching three entities whose proposed binomial
another entity already held:

| filling | already held by | note |
|---------|-----------------|------|
| `lions-mane` | `hericium-erinaceus` | **identical display name, "Lion's Mane"** |
| `garcinia-mangostana` | `mangosteen` | both publicly exported |
| `gudmar` | `gymnema-sylvestre` | both publicly exported |

Only `lions-mane` was expected. Without the guard all three would have imported
cleanly and created three more duplicate pairs.

Severity is **review, not error**, because sharing a source organism is
sometimes correct — `roselle-seed` and `hibiscus-sabdariffa` are seed and calyx
of the same plant.

Following that thread produced a separate finding worth its own document:
**27 `latin_name` values are already shared.** The first count of how many were
live was wrong (22); measured against the route manifest and `public/_redirects`
rather than the `runtime_export_decision` column it is **13**, with 10 more
already resolved by a 301. See `docs/enrichment/duplicate-organisms-audit.md`
and `npm run enrich:duplicates`.

## 5. Filled (23)

`harpagophytum-procumbens` *Harpagophytum procumbens* ·
`huperzia-serrata` *Huperzia serrata* ·
`lagerstroemia-speciosa` *Lagerstroemia speciosa* ·
`nicotiana-tabacum` *Nicotiana tabacum* ·
`elephantopus-scaber` *Elephantopus scaber* ·
`myristica-fragrans` *Myristica fragrans* ·
`embelia-ribes` *Embelia ribes* ·
`lawsonia-inermis` *Lawsonia inermis* ·
`lithospermum-erythrorhizon` *Lithospermum erythrorhizon* ·
`lobelia-inflata` *Lobelia inflata* ·
`echinacea-purpurea` *Echinacea purpurea* ·
`eschscholzia-californica` *Eschscholzia californica* ·
`goldenseal` *Hydrastis canadensis* ·
`neem` *Azadirachta indica* ·
`guarana` *Paullinia cupana* ·
`gastrodia` *Gastrodia elata* ·
`eucommia` *Eucommia ulmoides* ·
`longan` *Dimocarpus longan* ·
`houttuynia` *Houttuynia cordata* ·
`punarnava` *Boerhavia diffusa* ·
`notoginseng` *Panax notoginseng* ·
**`cordyceps-sinensis` *Ophiocordyceps sinensis*** (synonym-resolved) ·
**`kanna` *Mesembryanthemum tortuosum*** (synonym-resolved)

The kanna literature still uses *Sceletium tortuosum*, so expect that name in
sources even though the accepted name is now *Mesembryanthemum tortuosum*.

## 6. Verification

| Check | Result |
|-------|--------|
| Dry run | 23 additions, 0 conflicts, workbook byte-unchanged |
| Import | applied atomically in place |
| Re-import | `{"no-op": 23}` — runner not invoked |
| Rescan | gaps 4,745 → 4,722; `latin_name` 209 → 232; 23 jobs retired |
| Pending `latin_name` | 72 → 47 |
| Entity content hash | `abcfcbd247a0f0ab` → `6226a3b1bc658f72` |
| Entity counts | herb 293 / compound 588 — unchanged |
| Duplicate slugs | 0 |
| `validate-workbook-patches` | PASS, 17 records |
| `guard:source-of-truth` | PASS |

`public/data` was not regenerated or committed, per the standing G14 condition.

Also confirmed: `cordyceps-sinensis` went `rejected` (batch 2 no-op) → `pending`
→ worked → imported, so a policy change correctly reopens work that was
previously declined.

## 7. What is left

47 `latin_name` jobs. After removing the 19 genus-level and 3 non-organism
entities, roughly **25 are genuinely fillable** — about one more batch. The
remainder need editorial decisions, not research.
