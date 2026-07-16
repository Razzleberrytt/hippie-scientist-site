import { describe, expect, it } from 'vitest'
import { GOAL_KEYWORDS, PATHWAY_KEYWORDS, matchFacets } from './build-search-index.mjs'

describe('matchFacets', () => {
  it('does not match a keyword glued as a prefix inside an unrelated word', () => {
    // Production bug (see docs/LOOP_NOTES.md): dendrobium's contraindications
    // clause "risk excessive hypotension" falsely tripped the anxiety facet
    // because "tension" is a substring of "hypotension".
    expect(matchFacets('risk of excessive hypotension at higher doses', GOAL_KEYWORDS)).not.toContain('anxiety')
    expect(matchFacets('uncontrolled hypertension and arrhythmias', GOAL_KEYWORDS)).not.toContain('anxiety')
    expect(matchFacets('tribulus terrestris extract', GOAL_KEYWORDS)).not.toContain('sleep')
    expect(matchFacets('fucoxanthin is a carotenoid', PATHWAY_KEYWORDS)).not.toContain('inflammation')
    expect(matchFacets('oatp and cyp3a4-mediated transport', GOAL_KEYWORDS)).not.toContain('energy')
    expect(matchFacets('papain is a proteolytic enzyme', GOAL_KEYWORDS)).not.toContain('pain')
    expect(matchFacets('iodine imaging or treatment', GOAL_KEYWORDS)).not.toContain('longevity')
  })

  it('still matches real whole-word occurrences', () => {
    expect(matchFacets('may cause anxiety and nervous tension', GOAL_KEYWORDS)).toContain('anxiety')
    expect(matchFacets('supports healthy sleep and rest', GOAL_KEYWORDS)).toContain('sleep')
    expect(matchFacets('cardiovascular and blood pressure support', GOAL_KEYWORDS)).toContain('heart-health')
  })

  it('still matches common inflected/suffixed forms of a real keyword', () => {
    expect(matchFacets('additive sedation with other sedatives', GOAL_KEYWORDS)).toContain('sleep')
    expect(matchFacets('an adaptogenic root used traditionally', GOAL_KEYWORDS)).toContain('stress')
    expect(matchFacets('acts through gabaergic signaling', PATHWAY_KEYWORDS)).toContain('gaba')
    expect(matchFacets('caution with maois and antidepressants', GOAL_KEYWORDS)).toContain('mood')
  })

  it('allows a curated legitimate prefix (auto- for autoimmune)', () => {
    expect(matchFacets('caution in autoimmune thyroid disease', GOAL_KEYWORDS)).toContain('immune')
  })
})
