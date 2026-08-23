# Batch 2 — `latin_name` (G14 standing scope)

Run 2026-08-23, immediately after pilot 1. 25 jobs: **17 filled, 8 no-ops.**

Readiness was promoted from the G13 pilot record (10 pinned job ids) to a **G14
standing scope**: `latin_name` only, no pinned ids, batches capped at 25.

---

## 1. Filled (17)

All resolved against the GBIF Backbone Taxonomy with
`status=ACCEPTED`, `matchType=EXACT`, `rank=SPECIES`.

| slug | value | usageKey |
|------|-------|----------|
| `ficus-carica` | Ficus carica | 5361909 |
| `nicotiana-glauca` | Nicotiana glauca | 2928783 |
| `mangifera-indica` | Mangifera indica | 3190638 |
| `garcinia-indica` | Garcinia indica | 3189566 |
| `arjuna` | Terminalia arjuna | 3699548 |
| `artichoke` | Cynara scolymus | 3112361 |
| `oregano` | Origanum vulgare | 2926612 |
| `kudzu` | Pueraria montana | 2977636 |
| `japanese-knotweed` | Reynoutria japonica | 2889173 |
| `luo-han-guo` | Siraitia grosvenorii | 3623059 |
| `guayusa` | Ilex guayusa | 5534620 |
| `fingerroot` | Boesenbergia rotunda | 2758480 |
| `american-yellow-lotus` | Nelumbo lutea | 7503234 |
| `roselle-seed` | Hibiscus sabdariffa | 3152582 |
| `holy-basil-purple` | Ocimum tenuiflorum | 2927100 |
| `rice-bran` | Oryza sativa | 2703459 |
| `honeysuckle` | Lonicera japonica | 5334240 |

Three are recorded at species rank for an entity that names something narrower —
`rice-bran` and `roselle-seed` are plant parts, `holy-basil-purple` is a
cultivar. `latin_name` records the source species in each case.

## 2. No-ops (8)

### 2.1 The important one — `grapefruit`

**GBIF returns `Citrus paradisi` as a SYNONYM of `Citrus aurantium`.**

`Citrus aurantium` is **bitter orange** — a different supplement, with its own
synephrine-related cardiovascular cautions. Writing the backbone's accepted name
onto the grapefruit profile would have conflated two ingredients whose safety
profiles differ.

It would also contradict the workbook's own convention: `citrus-bergamia` and
`citrus-sinensis` are separate entities carrying `Citrus bergamia` and
`Citrus sinensis`, both of which GBIF lumps under `Citrus aurantium` as well.

This is the clearest evidence so far that **a taxonomic authority cannot be
followed mechanically**. The backbone is not wrong — it lumps a hybrid complex —
but its lumping is incompatible with how this site models citrus. Left blank for
a human decision on whether to record `Citrus paradisi`.

### 2.2 Structural

| slug | why |
|------|-----|
| `fraxinus-rhynchophylla` | Synonym whose accepted target is *Fraxinus chinensis rhynchophylla* at **SUBSPECIES** rank. All 209 `latin_name` values are binomials; a trinomial would break the format convention. |
| `epimedium-brevicornum` | **Absent from the GBIF backbone** — strict match returns `matchType=NONE` and a species search returns nothing. Widely used in the horny-goat-weed literature, so it needs IPNI or POWO rather than GBIF. |
| `cordyceps-sinensis` | Clean species-to-species synonym → *Ophiocordyceps sinensis* (2560562). Deliberately not applied — see §3. |

### 2.3 Ambiguous common names

| slug | why |
|------|-----|
| `blueberry` | Several *Vaccinium* species; no context identifies one |
| `coffee-cherry` | *Coffea arabica* vs *C. canephora*; the listed markers (caffeine, trigonelline, cafestol) occur in both |
| `rose-hips` | Several *Rosa* species; the entity describes generic "fruit material" |
| `kuding-tea` | *Ilex kaushue* (Aquifoliaceae) **or** *Ligustrum robustum* (Oleaceae) — different families |

## 3. Open policy question: synonym resolution

Three of this batch's no-ops (`grapefruit`, `fraxinus-rhynchophylla`,
`cordyceps-sinensis`) are synonyms with an accepted target. Resolving them
automatically is tempting, and for `cordyceps-sinensis` it is almost certainly
right — *Ophiocordyceps sinensis* is the current name and every modern authority
uses it.

But `grapefruit` shows the same mechanism producing a harmful result, and
`fraxinus-rhynchophylla` shows it producing a format violation. So the rule
cannot be "always follow the accepted target".

**This batch applies no synonym resolution at all.** A future batch should adopt
an explicit rule, something like: resolve a synonym only when the accepted target
is (a) at species rank, (b) in the same genus *or* a documented generic transfer,
and (c) not already represented by a separate entity in the workbook. That needs
its own readiness decision.

## 4. Verification

| Check | Result |
|-------|--------|
| Dry run | 17 additions, 0 conflicts, workbook byte-unchanged |
| Import | applied atomically in place |
| Re-import | `{"no-op": 17}` — runner not invoked |
| Rescan | gaps 4,762 → 4,745; `latin_name` populated 192 → 209; 17 jobs retired |
| Pending `latin_name` jobs | 97 → 72 |
| Entity content hash | `94385c29ac07cf43` → `abcfcbd247a0f0ab` |
| Entity counts | herb 293 / compound 588 — unchanged |
| Duplicate slugs | 0 |
| `validate-workbook-patches` | PASS, 16 records |
| `guard:source-of-truth` | PASS, parity holds both directions |

`public/data` was not regenerated or committed, per the standing G14 condition.

## 5. Process changes made this round

**`claim` now honours the readiness scope by default.** Pilot 1 found that
`claim` handed out the first N jobs in id order regardless of the approved
scope, and only the import gate caught it — by which point a worker has already
spent effort on work that cannot land. `claim` now filters by the readiness
record's `allowed_fields` and any pinned `pilot_scope.job_ids`;
`--ignore-scope` opts out for research not headed for import.

**Marking a patch `applied` is not optional.** `validate-workbook-patches`
re-checks any non-`applied` patch against the live workbook, so an applied patch
left at `approved` fails CI as stale. Caught here; already documented as step 12
of the runbook.

## 6. Remaining work

72 `latin_name` jobs still pending. The easy binomial-slug cases are largely
done; what is left skews toward common names and genus-level entities, so expect
the fill rate to keep dropping and the no-op rate to rise. That is the correct
behaviour, not a failure.

Recurring themes for a human pass:
- entities typed `entity_type: herb` that are not organisms (`resveratrol`, `tyrosine`, `quercetin`, `phosphatidylserine`)
- genus-level entities (`coptis`, `berberis`, `epimedium`, `phellodendron`)
- plant-part entities where the source species is ambiguous (`orange-peel`)
