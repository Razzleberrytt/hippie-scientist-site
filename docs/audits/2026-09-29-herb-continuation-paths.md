# Herb continuation-path audit — 2026-09-29

Parent: #6051  
Implementation issue: #6090

## Representative routes

### Ashwagandha

Observed continuation surfaces before this slice:

1. Guides that use Ashwagandha
   - goal guides: stress, anxiety, sleep, testosterone support
   - condition guides: sleep, anxiety, recovery, stress, blood pressure
2. SeeAlsoCluster
   - tracked related botanicals: Lavender, Passionflower, Lemon Balm
   - cluster guide + cluster peers: ADHD & Focus Support; Bacopa, Lion's Mane, Rhodiola, Ginkgo Biloba, Panax Ginseng, Gotu Kola
3. RelatedDiscoveryGroups
   - Related Guides: Anxiety Goal Guide, Stress Goal Guide, Sleep Goal Guide, Ashwagandha vs L-Theanine
   - Related Herbs includes Rhodiola
   - Related Compounds
   - Related Safety Pages
   - Related Articles
4. Compare & Sourcing
   - Continue comparing includes L-Theanine comparison

Exact/functional duplicates identified:
- anxiety goal appears in both the dedicated goal section and generated Related Guides
- stress goal appears in both
- sleep goal appears in both
- Rhodiola appears in SeeAlsoCluster and generated Related Herbs
- the L-Theanine comparison is surfaced through generated Related Guides and the dedicated compare area

Measured continuation links before: 37
- guides/conditions: 9
- SeeAlsoCluster: 10
- generated discovery grid: 17
- compare continuation: 1

Expected after this slice: approximately 21
- guides/conditions + unique contextual reading: 10
- SeeAlsoCluster: 10
- true comparisons: 1

### American Yellow Lotus

Sparse/high-caution control profile.

Observed continuation surfaces before this slice:
- no dedicated goal/condition block
- SeeAlsoCluster related botanicals: Jatamansi, Longan, Ocimum Basilicum
- generated discovery grid with Related Herbs, Related Compounds, Related Guides, Related Articles, and Related Safety Pages
- no visible comparison continuation list

Exact duplicate identified:
- Ocimum Basilicum appears in both tracked Related Botanicals and generated Related Herbs.

Unique generated guide/article destinations exist on this sparse profile. They must not be discarded merely because the broad generated grid is removed.

Measured continuation links before: 20
- SeeAlsoCluster: 3
- generated discovery grid: 17

Expected after this slice:
- SeeAlsoCluster remains the related-profile authority
- unique guide/article/research links move into the existing guides/research-context card
- generic safety links do not create a second continuation module because the page already has Safety + final Safety Checker navigation
- compound links remain available earlier through HerbCompoundLinks

## Implementation decision

Herb profiles use one clear owner per continuation job:

- related profiles: SeeAlsoCluster
- goal / condition / unique guide-research context: the existing guides/context card
- comparisons: Compare & Sourcing
- active compounds: HerbCompoundLinks
- safety: existing Safety section + Safety Checker path

The broad RelatedDiscoveryGroups grid is removed only from herb profiles. Compound profiles remain unchanged.

Generated guide/article/research links are filtered against hrefs already represented by goal, condition, related-herb, and comparison paths before being folded into the context card.

## Safety / publication boundary

No evidence grade, dose, safety language, canonical, publication state, route, affiliate-suppression rule, or compound-profile behavior changes.
