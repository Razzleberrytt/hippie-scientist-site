import { describe, expect, it } from 'vitest'
import { evidenceDigestEditions, evidenceDigestProgram } from '@/content/evidenceDigest'

describe('evidence digest program', () => {
  it('uses a retention-oriented weekly or biweekly cadence', () => {
    expect(['weekly', 'biweekly']).toContain(evidenceDigestProgram.cadence)
    expect(evidenceDigestProgram.retentionPromise.length).toBeGreaterThan(80)
  })

  it('never makes a reviewing edition indexable', () => {
    for (const edition of evidenceDigestEditions) {
      if (edition.editorialStatus !== 'verified') {
        expect(edition.indexable).toBe(false)
      }
    }
  })

  it('gives indexable editions meaningful sections and deeper destinations', () => {
    for (const edition of evidenceDigestEditions.filter((item) => item.indexable)) {
      expect(edition.editorialStatus).toBe('verified')
      expect(edition.sections.length).toBeGreaterThanOrEqual(3)
      expect(edition.sections.some((section) => Boolean(section.href))).toBe(true)
    }
  })
})
