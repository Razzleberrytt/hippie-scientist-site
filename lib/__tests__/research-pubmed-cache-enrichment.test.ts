import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { loadPubmedCache } from '@/lib/research-coverage'

describe('canonical PubMed cache enrichment', () => {
  it('merges abstracts onto metadata records and retains abstract-only PMIDs', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'pubmed-cache-'))
    const cacheDir = path.join(root, 'ops', 'cache')
    mkdirSync(cacheDir, { recursive: true })
    writeFileSync(path.join(cacheDir, 'pubmed-metadata.json'), JSON.stringify({
      records: {
        '111': { title: 'Study one', year: 2024 },
      },
    }))
    writeFileSync(path.join(cacheDir, 'pubmed-abstracts.json'), JSON.stringify({
      abstracts: {
        '111': '  Abstract for study one.  ',
        '222': 'Abstract-only study with NCT01234567.',
      },
    }))

    try {
      const cache = loadPubmedCache(root)
      expect(cache['111']).toMatchObject({
        title: 'Study one',
        year: 2024,
        abstract: 'Abstract for study one.',
      })
      expect(cache['222']).toEqual({ abstract: 'Abstract-only study with NCT01234567.' })
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('does not discard valid metadata when the abstract cache is malformed', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'pubmed-cache-'))
    const cacheDir = path.join(root, 'ops', 'cache')
    mkdirSync(cacheDir, { recursive: true })
    writeFileSync(path.join(cacheDir, 'pubmed-metadata.json'), JSON.stringify({
      records: { '111': { title: 'Study one' } },
    }))
    writeFileSync(path.join(cacheDir, 'pubmed-abstracts.json'), '{not-json')

    try {
      expect(loadPubmedCache(root)['111']).toEqual({ title: 'Study one' })
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
