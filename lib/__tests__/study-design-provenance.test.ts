import { describe, expect, it } from 'vitest'
import { designFromPublicationTypes, sourceStudyClass } from '@/lib/research-coverage'
import { normalizeStudyClass } from '@/lib/study-class'

describe('study-design classification provenance', () => {
  it('uses a specific PubMed study type instead of a conflicting manual/AI label', () => {
    expect(sourceStudyClass(
      { pmid: '12345678', studyClass: 'narrative-review', studyType: 'Narrative review' },
      { '12345678': { publicationTypes: ['Journal Article', 'Randomized Controlled Trial'] } },
    )).toBe('rct')
    expect(sourceStudyClass(
      { pmid: '87654321', studyClass: 'rct' },
      { '87654321': { publicationTypes: ['Journal Article', 'Meta-Analysis'] } },
    )).toBe('meta-analysis')
  })

  it('does not confuse generic PubMed indexing with a verified study design', () => {
    expect(designFromPublicationTypes(['Journal Article', 'Review'])).toBe('unclassified')
    expect(sourceStudyClass(
      { pmid: '38817505', studyClass: 'systematic-review' },
      { '38817505': { publicationTypes: ['Journal Article', 'Review'] } },
    )).toBe('systematic-review')
    expect(sourceStudyClass(
      { pmid: '23853635', studyType: 'Randomized controlled trial' },
      { '23853635': { publicationTypes: ['Journal Article'] } },
    )).toBe('rct')
  })

  it('falls back to studyType when a studyClass field is missing or unclassified', () => {
    expect(sourceStudyClass({ studyClass: 'unclassified', studyType: 'systematic review' }, {})).toBe('systematic-review')
    expect(sourceStudyClass({ studyType: 'RCT' }, {})).toBe('rct')
    expect(sourceStudyClass({ studyType: 'needs_classification' }, {})).toBe('unclassified')
  })

  it('keeps umbrella reviews distinct from original pooled meta-analyses', () => {
    expect(normalizeStudyClass('Umbrella review of meta-analyses of osteoarthritis trials')).toBe('systematic-review')
    expect(normalizeStudyClass('Umbrella review, qualitative synthesis')).toBe('systematic-review')
    expect(normalizeStudyClass('Systematic review and meta-analysis of randomized trials')).toBe('meta-analysis')
  })

  it('lets verified systematic-review indexing override an inflated manual trial label', () => {
    expect(sourceStudyClass(
      { pmid: '45678901', studyClass: 'rct', studyType: 'Randomized trial' },
      { '45678901': { publicationTypes: ['Journal Article', 'Systematic Review'] } },
    )).toBe('systematic-review')
    expect(designFromPublicationTypes(['Review'])).toBe('unclassified')
    // Generic PubMed tags may differ in casing and whitespace across exports.
    expect(designFromPublicationTypes(['  JOURNAL ARTICLE ', ' review '])).toBe('unclassified')
  })

  it('does not accept invalid PubMed type payloads as an authoritative classification', () => {
    expect(sourceStudyClass(
      { pmid: '12345678', studyClass: 'controlled-trial' },
      { '12345678': { publicationTypes: ['Journal Article', null, 123] } },
    )).toBe('controlled-trial')
  })
})
