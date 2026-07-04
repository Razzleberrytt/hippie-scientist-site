import { describe, it, expect } from 'vitest'
import { buildSafetyNarratives, buildSafetyNarrativeSummary } from '../../../lib/safety-narratives'

describe('safety-narratives', () => {
  it('maps a safety classification label to its conservative narrative text', () => {
    const record = { safetyNotes: 'This herb carries a drug interaction risk with SSRI medication.' }
    const narratives = buildSafetyNarratives(record)

    expect(narratives).toHaveLength(1)
    expect(narratives[0].label).toBe('Interaction-Aware')
    expect(narratives[0].narrative).toMatch(/medication-adjacent context/)
  })

  it('frames anticoagulant caution as a signal rather than a verified individual prediction', () => {
    const record = { interactions: 'Caution with warfarin and other blood thinners.' }
    const narratives = buildSafetyNarratives(record)

    expect(narratives[0].label).toBe('Anticoagulant Caution')
    expect(narratives[0].narrative).toMatch(/caution signal rather than a prediction of individual risk/)
  })

  it('returns an empty array when there is no caution language', () => {
    const record = { summary: 'A well-studied adaptogen.' }
    expect(buildSafetyNarratives(record)).toEqual([])
  })

  it('respects the limit parameter', () => {
    const record = {
      warnings:
        'Interacts with medications, hepatotoxic in rare cases, affects thyroid hormone, stimulant-like jitters.',
    }
    expect(buildSafetyNarratives(record, 1)).toHaveLength(1)
  })

  it('builds a joined summary string capped at two narratives', () => {
    const record = {
      warnings: 'Interacts with medications and affects thyroid hormone and caffeine-like jitters.',
    }
    const summary = buildSafetyNarrativeSummary(record)
    const narratives = buildSafetyNarratives(record, 2)

    expect(summary).toBe(narratives.map(n => n.narrative).join(' '))
  })

  it('returns an empty string summary when there is nothing to say', () => {
    expect(buildSafetyNarrativeSummary({})).toBe('')
  })
})
