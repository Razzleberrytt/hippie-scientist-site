import fs from 'node:fs'

import { describe, expect, it } from 'vitest'

import { mergeSummaryWithDetail } from '../ai-entity-artifacts.mjs'

// Keep this regression on a user-authored head so exact-head Actions execute after automated base refreshes.
describe('AI entity canonical detail precedence', () => {
  it('preserves reviewed detail summary/description over stale list values', () => {
    const summary = {
      slug: 'bpc-157',
      summary: 'stale list summary',
      description: 'stale list description',
      evidence_grade: 'D',
    }
    const detail = {
      slug: 'bpc-157',
      summary: 'reviewed detail summary',
      description: 'reviewed detail description',
      evidence_grade: 'C',
    }

    expect(mergeSummaryWithDetail(summary, detail)).toEqual({
      slug: 'bpc-157',
      summary: 'reviewed detail summary',
      description: 'reviewed detail description',
      evidence_grade: 'D',
    })
  })

  it('falls back to list text when detail text is missing', () => {
    expect(mergeSummaryWithDetail(
      { summary: 'list summary', description: 'list description' },
      { summary: '', description: null },
    )).toEqual({ summary: 'list summary', description: 'list description' })
  })

  it('falls back to substantive list text when detail text is a placeholder or pipeline note', () => {
    expect(mergeSummaryWithDetail(
      { summary: 'Reviewed list summary with substantive evidence context.', description: 'Reviewed list description.' },
      { summary: 'No summary available yet.', description: 'Bulk-ingested support row awaiting editorial review.' },
    )).toEqual({
      summary: 'Reviewed list summary with substantive evidence context.',
      description: 'Reviewed list description.',
    })
  })

  it('projects newer canonical detail review freshness into machine-facing records', () => {
    expect(mergeSummaryWithDetail(
      {
        summary: 'stale list summary',
        description: 'stale list description',
        last_reviewed: '2026-06-30',
      },
      {
        summary: 'reviewed detail summary',
        description: 'reviewed detail description',
        last_regulatory_check: '2026-08-26',
      },
    )).toEqual({
      summary: 'reviewed detail summary',
      description: 'reviewed detail description',
      last_regulatory_check: '2026-08-26',
      last_reviewed: '2026-08-26',
    })
  })

  it('never moves machine review freshness backward when detail provenance is older', () => {
    expect(mergeSummaryWithDetail(
      {
        summary: 'current list summary',
        description: 'current list description',
        last_reviewed: '2026-08-26',
      },
      {
        summary: 'reviewed detail summary',
        description: 'reviewed detail description',
        last_regulatory_check: '2026-06-30',
      },
    )).toEqual({
      summary: 'reviewed detail summary',
      description: 'reviewed detail description',
      last_regulatory_check: '2026-06-30',
      last_reviewed: '2026-08-26',
    })
  })

  it('keeps the committed BPC-157 AI entity synchronized with reviewed detail text and freshness', () => {
    const detail = JSON.parse(fs.readFileSync('public/data/compounds-detail/bpc-157.json', 'utf8'))
    const artifact = JSON.parse(fs.readFileSync('public/data/ai-entities/compound/bpc-157.json', 'utf8'))
    const entityNode = artifact['@graph'].find((node) => node['@id']?.endsWith('/#entity'))
    const evidenceNode = artifact['@graph'].find((node) => node['@id']?.endsWith('/#evidence-data'))

    expect(detail.summary).toContain('five small human clinical studies')
    expect(detail.last_regulatory_check).toBe('2026-08-26')
    expect(entityNode?.description).toBe(detail.summary)
    expect(evidenceNode?.description).toBe(detail.summary)
    expect(evidenceNode?.dateModified).toBe(detail.last_regulatory_check)
    expect(evidenceNode?.dateReviewed).toBe(detail.last_regulatory_check)
    expect(entityNode?.description).not.toMatch(/human clinical trial data is essentially absent/i)
    expect(evidenceNode?.description).not.toMatch(/pending a July 2026 PCAC review/i)
  })
})
