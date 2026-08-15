import { describe, expect, it } from 'vitest'
import { evidenceReportEdition, evidenceReportEditions } from '@/data/editorial/evidence-report-editions'
import { buildResearchUpdateRss } from '@/lib/research-updates'

describe('research update feeds and annual evidence archives', () => {
  it('preserves the 2026 Evidence Report permalink and pinned dataset version', () => {
    expect(evidenceReportEdition(2026)).toMatchObject({
      year: 2026,
      datasetVersion: '2026.08.15',
      permalink: '/evidence/evidence-report/2026/',
    })
  })

  it('keeps annual report years unique and permanent-looking', () => {
    const years = evidenceReportEditions.map(edition => edition.year)
    expect(new Set(years).size).toBe(years.length)
    for (const edition of evidenceReportEditions) {
      expect(edition.permalink).toBe(`/evidence/evidence-report/${edition.year}/`)
      expect(edition.datasetVersion).toMatch(/^\d{4}\.\d{2}\.\d{2}$/)
    }
  })

  it('emits a valid focused RSS shell even before truthful events exist', () => {
    const xml = buildResearchUpdateRss({
      title: 'Research updates',
      description: 'Recorded research updates.',
      selfPath: '/updates/test.xml',
      updates: [],
    })
    expect(xml).toContain('<rss version="2.0"')
    expect(xml).toContain('<channel>')
    expect(xml).toContain('https://thehippiescientist.net/updates/test.xml')
    expect(xml).not.toContain('<item>')
  })
})
