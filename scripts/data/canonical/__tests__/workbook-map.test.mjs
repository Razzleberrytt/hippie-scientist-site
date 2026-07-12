import { describe, it, expect } from 'vitest'
import { mapWorkbook } from '../workbook-map.mjs'
import {
  cleanString,
  splitList,
  parseBoolean,
  dedupeStrings,
  slugify,
  normalizeEvidenceLevel,
} from '../normalize.mjs'

// A tiny synthetic workbook exercising every mapping path.
function fakeWorkbook() {
  return {
    SheetNames: ['Entity_Master', 'Source_Register', 'Evidence_Register', 'Entity_Relationships'],
    Sheets: {
      Entity_Master: [
        { entity_type: 'herb', slug: 'ashwagandha', name: 'Ashwagandha', latin_name: 'Withania somnifera', summary: 'An adaptogen.', primary_effects_or_targets: 'stress relief', mechanism_summary: 'GABAergic', evidence_grade: 'b', safety_notes: 'Generally safe', dosage_or_preferred_form: '300mg', weird_unmapped_col: 'keep me' },
        { entity_type: 'compound', slug: 'withanolide', name: 'Withanolide', mechanism_summary: 'Steroidal lactone', evidence_grade: 'c' },
        { entity_type: 'herb', slug: '', name: '', summary: 'skip me' }, // invalid → skipped
      ],
      Source_Register: [
        { pmid: '12345', doi: '', url: 'https://pubmed.ncbi.nlm.nih.gov/12345/', title: 'A study', author_or_label: 'Smith', year: '2010', journal: 'J', used_for: 'x', citation_or_note: 'cite' },
        { pmid: '12345', title: 'A study (dup by pmid)' }, // duplicate citation → deduped
      ],
      Evidence_Register: [
        { record_id: 'study_1', entity_slug: 'ashwagandha', entity_name: 'Ashwagandha', effect_or_condition: 'anxiety', evidence_type: 'human_rct', study_type: 'RCT', population: 'adults', sample_size: '60', dose_or_duration: '300mg; 8wk', pmid: '12345', supported_claim_language: 'reduced anxiety' },
        { record_id: 'study_2', entity_slug: 'unknownherb', effect_or_condition: 'sleep' }, // unmatched subject
      ],
      Entity_Relationships: [
        { source_slug: 'ashwagandha', target_slug: 'withanolide', relationship_type: 'contains_compound', weight_or_strength: '100' },
        { source_slug: 'ashwagandha', target_slug: 'withanolide', relationship_type: 'contains_compound', weight_or_strength: '100' }, // dup edge → deduped
        { source_slug: 'ashwagandha', target_slug: 'ghost', relationship_type: 'contains_compound' }, // unmatched target
      ],
    },
  }
}

describe('normalize helpers', () => {
  it('cleanString collapses whitespace', () => {
    expect(cleanString('  a   b\n c ')).toBe('a b c')
    expect(cleanString(null)).toBe('')
  })
  it('splitList handles mixed delimiters and dedupes', () => {
    expect(splitList('a; b | a / c')).toEqual(['a', 'b', 'c'])
    expect(splitList('vitamin c (ascorbic acid, buffered), zinc')).toEqual(['vitamin c (ascorbic acid, buffered)', 'zinc'])
  })
  it('parseBoolean recognizes variants and preserves unknowns', () => {
    expect(parseBoolean('Yes')).toBe(true)
    expect(parseBoolean('0')).toBe(false)
    expect(parseBoolean('maybe')).toBeUndefined()
  })
  it('dedupeStrings is case-insensitive, first casing wins', () => {
    expect(dedupeStrings(['Kava', 'kava', 'KAVA', 'Root'])).toEqual(['Kava', 'Root'])
  })
  it('slugify is deterministic', () => {
    expect(slugify("St. John's Wort")).toBe('st-johns-wort')
  })
  it('normalizeEvidenceLevel maps descriptors', () => {
    expect(normalizeEvidenceLevel('human_rct')).toBe('human_rct')
    expect(normalizeEvidenceLevel('in vitro')).toBe('preclinical')
    expect(normalizeEvidenceLevel('')).toBe('none')
  })
})

describe('mapWorkbook', () => {
  const result = mapWorkbook(fakeWorkbook())

  it('maps herbs and compounds, skipping invalid rows', () => {
    const herbs = result.entities.filter((e) => e.entity_type === 'herb')
    const compounds = result.entities.filter((e) => e.entity_type === 'compound')
    expect(herbs).toHaveLength(1)
    expect(compounds).toHaveLength(1)
    expect(herbs[0].canonical_name).toBe('Ashwagandha')
    expect(herbs[0].aliases).toContain('Withania somnifera')
  })

  it('preserves unmapped columns in legacy (never discards)', () => {
    const herb = result.entities.find((e) => e.slug === 'ashwagandha')
    expect(herb.legacy.weird_unmapped_col).toBe('keep me')
    expect(herb.data.primary_effects).toBe('stress relief')
  })

  it('attaches provenance with sheet + row', () => {
    const herb = result.entities.find((e) => e.slug === 'ashwagandha')
    expect(herb.provenance[0].migrated_from.sheet).toBe('Entity_Master')
    expect(herb.provenance[0].migrated_from.row).toBe(1)
  })

  it('creates claims linked to subject + derived effect entity', () => {
    expect(result.claims).toHaveLength(1)
    const claim = result.claims[0]
    const effect = result.entities.find((e) => e.entity_type === 'effect' && e.slug === 'anxiety')
    expect(claim.object_id).toBe(effect.id)
    expect(claim.evidence_level).toBe('human_rct')
    expect(claim.source_ids.length).toBe(1)
  })

  it('records unmatched claim + edge candidates instead of dropping silently', () => {
    expect(result.reports.unmatched.claims).toHaveLength(1)
    expect(result.reports.unmatched.claims[0].entity_slug).toBe('unknownherb')
    expect(result.reports.unmatched.edges).toHaveLength(1)
    expect(result.reports.unmatched.edges[0].target_slug).toBe('ghost')
  })

  it('dedupes duplicate edges and citations deterministically', () => {
    expect(result.edges).toHaveLength(1) // two identical rows collapse to one
    expect(result.edges[0].rel_type).toBe('contains_compound')
    expect(result.edges[0].weight).toBe(100)
    expect(result.sources).toHaveLength(1) // duplicate PMID collapses to one
  })

  it('is a pure function — same input yields identical ids', () => {
    const again = mapWorkbook(fakeWorkbook())
    expect(again.entities.map((e) => e.id).sort()).toEqual(result.entities.map((e) => e.id).sort())
    expect(again.claims.map((c) => c.id)).toEqual(result.claims.map((c) => c.id))
    expect(again.edges.map((e) => e.id)).toEqual(result.edges.map((e) => e.id))
  })
})
