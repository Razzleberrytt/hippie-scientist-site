import { describe, expect, it } from 'vitest'

import {
  refreshWorkbookOwnedDetailFields,
  workbookOwnedDetailFields,
} from '../lib/profile-detail-refresh.mjs'

describe('bounded profile detail refresh', () => {
  it('mirrors only workbook-owned compound text and regulatory freshness fields', () => {
    const detail = {
      slug: 'bpc-157',
      summary: 'stale summary',
      description: 'stale description',
      last_regulatory_check: '2026-06-30',
      regulatory_changelog: 'scheduled review',
      evidence_grade: 'D',
      curated_editorial_note: 'preserve me',
    }
    const canonical = {
      slug: 'bpc-157',
      summary: 'approved summary',
      description: 'approved description',
      last_regulatory_check: '2026-08-26',
      regulatory_changelog: 'completed advisory review',
      evidence_grade: 'A',
      curated_editorial_note: 'overwrite attempt',
    }

    const changed = refreshWorkbookOwnedDetailFields(detail, canonical, 'compound')

    expect(changed).toEqual([
      'summary',
      'description',
      'last_regulatory_check',
      'regulatory_changelog',
    ])
    expect(detail).toEqual({
      slug: 'bpc-157',
      summary: 'approved summary',
      description: 'approved description',
      last_regulatory_check: '2026-08-26',
      regulatory_changelog: 'completed advisory review',
      evidence_grade: 'D',
      curated_editorial_note: 'preserve me',
    })
  })

  it('does not give herbs compound-only regulatory ownership', () => {
    expect(workbookOwnedDetailFields('herb')).toEqual(['summary', 'description'])
  })

  it('is a no-op when the detail file already matches canonical workbook-owned fields', () => {
    const detail = { summary: 'same', description: 'same' }
    const canonical = { summary: 'same', description: 'same' }
    expect(refreshWorkbookOwnedDetailFields(detail, canonical, 'herb')).toEqual([])
  })
})
