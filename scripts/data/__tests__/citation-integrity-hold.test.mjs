import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { describe, it, expect } from 'vitest'

describe('citation quarantine regeneration boundary', () => {
  it('holds legacy herb Tyrosine across public indexes without touching compound L-tyrosine', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'citation-hold-'))
    const script = path.resolve('scripts/data/quarantine-unverifiable-citations.mjs')
    const write = (file, value, pretty = false) => {
      const target = path.join(root, 'public/data', file)
      mkdirSync(path.dirname(target), { recursive: true })
      writeFileSync(target, pretty ? JSON.stringify(value, null, 2) + '\n' : JSON.stringify(value))
    }
    const read = file => JSON.parse(readFileSync(path.join(root, 'public/data', file), 'utf8'))

    try {
      for (let i = 0; i < 400; i++) write(`herbs-detail/control-${i}.json`, { slug: `control-${i}`, sources: [] })

      const bad = {
        slug: 'tyrosine',
        name: 'L-Tyrosine',
        entityType: 'herb',
        evidence_grade: 'a',
        evidence_tier: 'Strong Human Evidence',
        indexability_status: 'PUBLISH',
        robots: 'index,follow',
        sitemap_included: true,
        sources: [{ doi: '10.2105/ajph.86.5.717' }],
        claimMap: [{ id: 'held' }],
      }
      const good = {
        slug: 'l-tyrosine',
        name: 'L-Tyrosine',
        entityType: 'compound',
        evidence_grade: 'C+',
        sources: [{ pmid: '32093203' }],
      }

      write('herbs-detail/tyrosine.json', bad, true)
      write('compounds-detail/l-tyrosine.json', good, true)
      write('herbs.json', [bad])
      write('herbs-summary.json', [bad])
      write('herb-index.json', [bad])
      write('summary-indexes/herbs-summary.json', [bad])
      write('summary-indexes/search-index.json', [bad, good])
      write('summary-indexes/alphabetical-shards.json', { t: [bad], l: [good] })
      write('summary-indexes/entity-shards.json', { herbs: [bad], compounds: [good] })
      write('summary-indexes/alpha-entity-shards.json', { 'herb-t': [bad], 'compound-l': [good] })
      write('claims.json', [
        { profile_slug: 'tyrosine', source_url: 'https://pubmed.ncbi.nlm.nih.gov/8629725/' },
        { profile_slug: 'l-tyrosine', entityType: 'compound', pmid: '32093203' },
      ])
      write('ai-entities/herb/tyrosine.json', {
        '@graph': [{
          description: 'stale',
          additionalProperty: [
            { propertyID: 'evidence tier', value: 'Strong Human Evidence' },
            { propertyID: 'evidence label', value: 'a' },
          ],
        }],
      })
      write('ai-entities/manifest.json', {
        entities: [
          { kind: 'herb', slug: 'tyrosine', evidenceLabel: 'A' },
          { kind: 'compound', slug: 'l-tyrosine', evidenceLabel: 'C+' },
        ],
      })

      const run = () => execFileSync(process.execPath, [script], { cwd: root, stdio: 'pipe' })
      run()

      const assertHeld = row => {
        expect(row.evidence_grade).toBeNull()
        expect(row.indexability_status).toBe('NEEDS_REVIEW')
        expect(row.robots).toBe('noindex,follow')
        expect(row.sitemap_included).toBe(false)
      }

      assertHeld(read('herbs-detail/tyrosine.json'))
      assertHeld(read('herbs.json')[0])
      assertHeld(read('herbs-summary.json')[0])
      assertHeld(read('herb-index.json')[0])
      assertHeld(read('summary-indexes/herbs-summary.json')[0])
      assertHeld(read('summary-indexes/search-index.json')[0])
      assertHeld(read('summary-indexes/alphabetical-shards.json').t[0])
      assertHeld(read('summary-indexes/entity-shards.json').herbs[0])
      assertHeld(read('summary-indexes/alpha-entity-shards.json')['herb-t'][0])

      expect(read('summary-indexes/search-index.json')[1]).toEqual(good)
      expect(read('summary-indexes/entity-shards.json').compounds[0]).toEqual(good)
      expect(read('compounds-detail/l-tyrosine.json')).toEqual(good)
      expect(read('claims.json')).toEqual([{ profile_slug: 'l-tyrosine', entityType: 'compound', pmid: '32093203' }])

      const ai = read('ai-entities/herb/tyrosine.json')['@graph'][0]
      expect(ai.additionalProperty.find(p => p.propertyID === 'evidence tier').value).toBe('Under evidence review')
      expect(ai.additionalProperty.find(p => p.propertyID === 'evidence label').value).toBe('review')
      expect(read('ai-entities/manifest.json').entities[0].evidenceLabel).toBe('review')
      expect(read('ai-entities/manifest.json').entities[1].evidenceLabel).toBe('C+')

      const first = read('herbs-detail/tyrosine.json')
      run()
      expect(read('herbs-detail/tyrosine.json')).toEqual(first)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
