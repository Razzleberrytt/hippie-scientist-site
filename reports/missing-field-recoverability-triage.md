# Missing Required Field Recoverability Triage (Herb Data)

Generated: 2026-04-04T02:13:33.455Z

## Scope and Method
- Input audit: `reports/data-audit-report.json`.
- Input datasets: `public/data/herbs.json` and `public/data/herbs-detail/*.json`.
- Filter: herb-only issues where `code = missing-required-field`.
- Each issue is assigned to exactly one recoverability bucket.

## Totals
- Total remaining missing-required-field issues: **7789**
- Recoverable (paired/internal/identity): **5** (0.1%)
- Genuinely missing with no defensible internal source: **7696** (98.8%)
- Ambiguous/conflicting internal sources: **88**

## Counts by Field
| field | count |
| --- | --- |
| activeCompounds | 2056 |
| sources.url | 2012 |
| class | 1110 |
| sources | 976 |
| contraindications | 844 |
| sources.title | 784 |
| slug | 2 |
| name | 2 |
| latin | 2 |
| description | 1 |

## Counts by Recoverability Bucket
| bucket | count |
| --- | --- |
| RECOVERABLE_FROM_PAIRED_RECORD | 3 |
| RECOVERABLE_FROM_EXISTING_INTERNAL_STRUCTURE | 0 |
| INFERABLE_FROM_RECORD_OR_FILE_IDENTITY | 2 |
| GENUINELY_MISSING_NO_DEFENSIBLE_INTERNAL_SOURCE | 7696 |
| AMBIGUOUS_OR_CONFLICTING_INTERNAL_SOURCES | 88 |

## Counts by Field × Recoverability
| field | bucket | count |
| --- | --- | --- |
| activeCompounds | GENUINELY_MISSING_NO_DEFENSIBLE_INTERNAL_SOURCE | 2056 |
| sources.url | GENUINELY_MISSING_NO_DEFENSIBLE_INTERNAL_SOURCE | 2008 |
| class | GENUINELY_MISSING_NO_DEFENSIBLE_INTERNAL_SOURCE | 1110 |
| sources | GENUINELY_MISSING_NO_DEFENSIBLE_INTERNAL_SOURCE | 976 |
| contraindications | GENUINELY_MISSING_NO_DEFENSIBLE_INTERNAL_SOURCE | 844 |
| sources.title | GENUINELY_MISSING_NO_DEFENSIBLE_INTERNAL_SOURCE | 700 |
| sources.title | AMBIGUOUS_OR_CONFLICTING_INTERNAL_SOURCES | 84 |
| sources.url | AMBIGUOUS_OR_CONFLICTING_INTERNAL_SOURCES | 4 |
| latin | GENUINELY_MISSING_NO_DEFENSIBLE_INTERNAL_SOURCE | 2 |
| name | RECOVERABLE_FROM_PAIRED_RECORD | 2 |
| slug | INFERABLE_FROM_RECORD_OR_FILE_IDENTITY | 2 |
| description | RECOVERABLE_FROM_PAIRED_RECORD | 1 |

## Top 50 Herbs with Most Remaining Missing-Required-Field Issues
| slug | missingRequiredCount |
| --- | --- |
| heimia-salicifolia | 22 |
| papaver-somniferum | 20 |
| mescaline | 18 |
| nicotiana-rustica | 18 |
| nymphaea-caerulea | 18 |
| aconitum-ferox | 16 |
| adenium-obesum | 16 |
| agastache-foeniculum | 16 |
| alectra-sessiliflora | 16 |
| aletris-farinosa | 16 |
| allium-sativum | 16 |
| alnus-rubra | 16 |
| aloe-vera | 16 |
| althaea-officinalis | 16 |
| alyxia-stellata | 16 |
| amphipterygium-adstringens | 16 |
| angelica-archangelica | 16 |
| angelica-sinensis | 16 |
| aniseia-martinicensis | 16 |
| anisomeles-indica | 16 |
| anisoptera-thurifera | 16 |
| annona-muricata | 16 |
| apium-graveolens | 16 |
| aquilaria-agallocha | 16 |
| arctium-lappa | 16 |
| aristolochia-grandiflora | 16 |
| armoracia-rusticana | 16 |
| arnica-montana | 16 |
| artemisia-annua | 16 |
| artemisia-glacialis | 16 |
| artemisia-tilesii | 16 |
| asclepias-tuberosa | 16 |
| asparagus-racemosus | 16 |
| aspidosperma-quebracho-blanco | 16 |
| astragalus-membranaceus | 16 |
| atropa-belladonna | 16 |
| azadirachta-indica | 16 |
| baptisia-tinctoria | 16 |
| berberis-vulgaris | 16 |
| bidens-pilosa | 16 |
| boerhavia-diffusa | 16 |
| boophone-disticha | 16 |
| borago-officinalis | 16 |
| boswellia-serrata | 16 |
| bryonia-alba | 16 |
| bupleurum-falcatum | 16 |
| bursera-graveolens | 16 |
| caesalpinia-bonduc | 16 |
| calliandra-haematocephala | 16 |
| calotropis-procera | 16 |

## Explicit Field Family Analysis
### sources.title
- Total remaining issues: **784**
- RECOVERABLE_FROM_PAIRED_RECORD: 0
- RECOVERABLE_FROM_EXISTING_INTERNAL_STRUCTURE: 0
- INFERABLE_FROM_RECORD_OR_FILE_IDENTITY: 0
- GENUINELY_MISSING_NO_DEFENSIBLE_INTERNAL_SOURCE: 700
- AMBIGUOUS_OR_CONFLICTING_INTERNAL_SOURCES: 84

### sources.url
- Total remaining issues: **2012**
- RECOVERABLE_FROM_PAIRED_RECORD: 0
- RECOVERABLE_FROM_EXISTING_INTERNAL_STRUCTURE: 0
- INFERABLE_FROM_RECORD_OR_FILE_IDENTITY: 0
- GENUINELY_MISSING_NO_DEFENSIBLE_INTERNAL_SOURCE: 2008
- AMBIGUOUS_OR_CONFLICTING_INTERNAL_SOURCES: 4

### class
- Total remaining issues: **1110**
- RECOVERABLE_FROM_PAIRED_RECORD: 0
- RECOVERABLE_FROM_EXISTING_INTERNAL_STRUCTURE: 0
- INFERABLE_FROM_RECORD_OR_FILE_IDENTITY: 0
- GENUINELY_MISSING_NO_DEFENSIBLE_INTERNAL_SOURCE: 1110
- AMBIGUOUS_OR_CONFLICTING_INTERNAL_SOURCES: 0

### legalStatus
- Total remaining issues: **0**
- RECOVERABLE_FROM_PAIRED_RECORD: 0
- RECOVERABLE_FROM_EXISTING_INTERNAL_STRUCTURE: 0
- INFERABLE_FROM_RECORD_OR_FILE_IDENTITY: 0
- GENUINELY_MISSING_NO_DEFENSIBLE_INTERNAL_SOURCE: 0
- AMBIGUOUS_OR_CONFLICTING_INTERNAL_SOURCES: 0

### traditionalUse
- Total remaining issues: **0**
- RECOVERABLE_FROM_PAIRED_RECORD: 0
- RECOVERABLE_FROM_EXISTING_INTERNAL_STRUCTURE: 0
- INFERABLE_FROM_RECORD_OR_FILE_IDENTITY: 0
- GENUINELY_MISSING_NO_DEFENSIBLE_INTERNAL_SOURCE: 0
- AMBIGUOUS_OR_CONFLICTING_INTERNAL_SOURCES: 0

### activeCompounds
- Total remaining issues: **2056**
- RECOVERABLE_FROM_PAIRED_RECORD: 0
- RECOVERABLE_FROM_EXISTING_INTERNAL_STRUCTURE: 0
- INFERABLE_FROM_RECORD_OR_FILE_IDENTITY: 0
- GENUINELY_MISSING_NO_DEFENSIBLE_INTERNAL_SOURCE: 2056
- AMBIGUOUS_OR_CONFLICTING_INTERNAL_SOURCES: 0

### safetyNotes
- Total remaining issues: **0**
- RECOVERABLE_FROM_PAIRED_RECORD: 0
- RECOVERABLE_FROM_EXISTING_INTERNAL_STRUCTURE: 0
- INFERABLE_FROM_RECORD_OR_FILE_IDENTITY: 0
- GENUINELY_MISSING_NO_DEFENSIBLE_INTERNAL_SOURCE: 0
- AMBIGUOUS_OR_CONFLICTING_INTERNAL_SOURCES: 0

### interactions
- Total remaining issues: **0**
- RECOVERABLE_FROM_PAIRED_RECORD: 0
- RECOVERABLE_FROM_EXISTING_INTERNAL_STRUCTURE: 0
- INFERABLE_FROM_RECORD_OR_FILE_IDENTITY: 0
- GENUINELY_MISSING_NO_DEFENSIBLE_INTERNAL_SOURCE: 0
- AMBIGUOUS_OR_CONFLICTING_INTERNAL_SOURCES: 0

## Highest-Yield Fields for One More Mechanical Repair Pass
| field | recoverableCount | total | recoverablePct |
| --- | --- | --- | --- |
| name | 2 | 2 | 100 |
| slug | 2 | 2 | 100 |
| description | 1 | 1 | 100 |

## Fields That Should NOT Be Auto-Filled
| field | count |
| --- | --- |
| activeCompounds | 2056 |
| sources.url | 2012 |
| class | 1110 |
| sources | 976 |
| contraindications | 844 |
| sources.title | 784 |
| latin | 2 |

## Opinionated Execution Recommendation
- **Single best next global repair pass:** Run a paired-record propagation pass for herb-list/herb-detail to backfill missing class, activeCompounds, contraindications, and source subfields when an exact or index-matched counterpart value exists.
- **Second-best pass:** Run an internal-structure pass only for sources.title when sources.url exists (derive stable domain-based titles) and for slug/name identity normalization where file or record identity is explicit.
- **Worst time-wasting pass:** Attempting global auto-fill for activeCompounds/class from non-paired heuristics or external guessing; most remaining misses are genuinely absent and would create low-trust data.
- **Exact order for remaining field-family phases:**
  1. sources.title / sources.url (paired-copy first, then limited structural derivation for title)
  2. class (paired-copy only)
  3. activeCompounds (paired-copy only)
  4. contraindications (paired-copy only)
  5. slug/name/latin identity normalization (very small tail)
  6. traditionalUse
  7. legalStatus
  8. safetyNotes
  9. interactions
