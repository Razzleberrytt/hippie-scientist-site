# Open Findings — 2026-08-21

Investigated during the data-integrity repair, deliberately **not** changed.
Each names the mechanism and the reason it was left alone.

## 1. Indexability has three answers

The single largest open item. Full detail in
[`indexability-governance-2026-08-21.md`](./indexability-governance-2026-08-21.md).

The same corpus reports **352** indexable profiles as committed, **350** after a
full `data:build`, and **91** after the build path the deploy takes. 647 of 856
profiles disagree between the summary index and the detail payload.

Left alone because reconciling changes which pages *exist*, not just which are
indexed: `getRuntimeVisibility` reads the detail copy for `canRender`, and
applying the governance overlay 404s 17 curated comparison guides. Guarded by
`npm run report:indexability-divergence` against a baseline of 647.

## 2. The ecosystem graph runs on inputs that no longer exist

| File | Keys | Relationships | Consumed |
|---|---|---|---|
| `runtime-maps/ecosystem-map.json` | 838 | **0** | Yes — `lib/ecosystem-continuity.ts` |
| `runtime-maps/authority-hubs.json` | 0 | 0 | No |

`buildEcosystemMap` reads `topic_clusters`, `ecosystem_tags`,
`pathway_companions`, `ecosystem_anchors`, `pathway_ecosystems`,
`mechanism_ecosystems` and others. **Every one is absent from all 856 records.**
`buildAuthorityHubs` reads `authority_supernode` / `authority_status` /
`evidence_authority_status` — also absent from all 856.

So ecosystem continuity is a live feature running against 838 slugs each mapped
to `[]`. It is broken rather than dead, and `authority-hubs.json` is dead rather
than broken (`getAuthorityHubsMap` is never called).

**Not repaired.** The inputs do not exist anywhere in the corpus, so
relationships cannot be derived — only invented, which the brief rules out.
A human should decide whether to restore the workbook columns that fed these
signals or retire the feature.

## 3. Stacking is derived from similarity

`comparison-map.json` and `stack-map.json` both come out of the same
signal-overlap scoring in `build-related-runtime-maps.mjs`.

Shared mechanism makes two substances **similar**, which is an argument for
presenting them as alternatives and, by itself, an argument *against* combining
them — two serotonergic compounds overlap exactly where stacking them carries
risk. "Similar" and "safe together" are different claims and the generator does
not distinguish them.

Nothing was changed here. A human should decide whether automated stacking
suggestions are derivable from current data at all, or should be narrowed to
evidence-backed pairs with explicit safety constraints.

## 4. 465 internal links point at redirect sources

`npm run audit:internal-redirect-links` fails on the current build. This
pre-dates the repair (`scripts/ci/audit-internal-redirect-links.mjs` is
untouched by it).

The bulk are generated, not hand-written — scientific-name slugs used where the
canonical page uses the common name:

| Count | Link | Redirects to |
|---|---|---|
| 105 | `/herbs/allium-sativum` | `/herbs/garlic` |
| 78 | `/herbs/ganoderma-lucidum` | `/herbs/reishi` |
| 78 | `/herbs/withania-somnifera` | `/herbs/ashwagandha` |
| 18 | `/herbs/tyrosine` | `/compounds/l-tyrosine` |
| 11 | `/herbs/passiflora-incarnata` | `/herbs/passionflower` |

The fix belongs in link generation — resolve alias slugs to canonical before
emitting a link — rather than in 465 individual references. The redirects
themselves must stay for external and legacy traffic. Left for a focused change
so it is not buried inside an integrity repair.

## 5. Two citations need a human to open them

From [`citation-integrity-2026-08-21.md`](./citation-integrity-2026-08-21.md):

| Profile | PMID | Title | Why unresolved |
|---|---|---|---|
| calendula | 30000869 | Echinacea | LiverTox Bookshelf record; NCBI returns no article metadata |
| caraway | 30000936 | Black Seed | Same |

Both look wrong — a Calendula profile citing an Echinacea monograph — but "the
title names a different herb" is suggestive, not proof, and LiverTox chapters do
discuss related botanicals. Left in place rather than removed on a guess.

Also needing manual sourcing: two withdrawn citations carried real content with
no identifier behind it — `peppermint-oil` ("Meta-analysis of RCTs found benefit
for global IBS symptoms") and `fos` ("Microbiota modulation; GI tolerance
matters"). The claims are plausible; they simply have no source a reader could
check.

## 6. `magnesium-glycinate-vs-citrate` still renders as 404

Its right-hand side, `magnesium-citrate`, is `NEEDS_REVIEW`, so the comparison
resolver drops it and the page calls `notFound()`. There is no alternative
record for magnesium citrate, so restoring the page means either publishing an
unreviewed profile or inventing a substitute. It needs review.

The sibling case, `lions-mane-vs-bacopa`, *was* fixed: `hericium-erinaceus` is
the same organism under its scientific name and is already published, so it was
added as a resolver candidate.

## 7. Six guide pages emit no JSON-LD

Visible now that the structured-data metric measures something real. Coverage is
otherwise healthy — `Organization` and `WebSite` on 97–100% of pages in every
family, `MedicalWebPage` on 98–99% of profiles — so these six are outliers
rather than a systemic gap.

## 8. `CLAUDE.md` documents a rule that does not hold

It states that all runtime JSON in `public/data/**` is generated and disposable.
`{herbs,compounds}-detail/*.json` are not: no pipeline step regenerates them,
and the only two scripts that write them are called by nothing. See
[`data-ownership-2026-08-21.md`](./data-ownership-2026-08-21.md).
