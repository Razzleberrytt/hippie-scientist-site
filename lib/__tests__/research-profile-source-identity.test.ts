import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { listResearchProfiles } from '../research-coverage'

const roots: string[] = []

afterEach(() => {
  for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true })
})

function fixture(sources: Array<Record<string, unknown>>): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'research-source-id-'))
  roots.push(root)
  const dir = path.join(root, 'public', 'data', 'herbs-detail')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'example.json'), JSON.stringify({ slug: 'example', sources }))
  return root
}

describe('research profile source identity ingestion', () => {
  it('derives stable IDs for legacy DOI/PubMed rows before analysis', () => {
    const root = fixture([
      { pubmedId: '31627309', doi: '10.3390/nu11102494', title: 'Example study' },
      { pmid: '38396766', title: 'PMID-only study' },
    ])

    const [profile] = listResearchProfiles(root)

    expect(profile.record.sources).toEqual([
      expect.objectContaining({ id: 'doi:10.3390/nu11102494', pubmedId: '31627309' }),
      expect.objectContaining({ id: 'pmid:38396766', pmid: '38396766' }),
    ])
  })

  it('does not invent identity for a truly anonymous source row', () => {
    const root = fixture([{ title: 'Unidentified source' }])
    const [profile] = listResearchProfiles(root)

    expect(profile.record.sources?.[0]).not.toHaveProperty('id')
  })
})
