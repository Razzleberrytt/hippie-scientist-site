import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { describe, it, expect } from 'vitest'

describe('citation quarantine regeneration boundary', () => {
  it('holds stale Tyrosine across every published index while preserving compound:l-tyrosine', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'citation-hold-'))
    const script = path.resolve('scripts/data/quarantine-unverifiable-citations.mjs')
    const write = (file, value) => {
      const target = path.join(root, 'public/data', file)
      mkdirSync(path.dirname(target), { recursive: true })
      writeFileSync(target, JSON.stringify(value))
    }
    const read = file => JSON.parse(readFileSync(path.join(root, 'public/data', file), 'utf8'))
    const findSlug = (value, slug) => {
      if (Array.isArray(value)) {
        for (const entry of value) {
          const found = findSlug(entry, slug)
          if (found) return found
        }
        return null
      }
      if (!value || typeof value !== 'object') return null
      if (value.slug === slug) return value
      for (const child of Object.values(value)) {
        const found = findSlug(child, slug)
        if (found) return found
      }
      return null
    }

    try {
      for (let i = 0; i < 400; i++) write(`herbs-detail/control-${i}.json`, { slug: `control-${i}`, sources: [] })

      const bad = {
        slug: 'tyrosine',
        name: 'L-Tyrosine',
        evidence_grade: 'a',
        evidence_tier: 'Strong Human Evidence',
        robots: 'index,follow',
        sitemap_included: true,
        indexability_status: 'PUBLISH',
        sources: [{ doi: '10.2105/ajph.86.5.717' }],
        claimMap: [{ id: 'held' }],
      }
      const good = {
        slug: 'l-tyrosine',
        entityType: 'compound',
        evidence_grade: 'C+',
        evidence_tier: 'Mechanistic Evidence',
        sources: [{ pmid: '32093203' }],
      }

      write('herbs-detail/tyrosine.json', bad)
      write('compounds-detail/l-tyrosine.json', good)
      write('herbs-summary.json', [bad])
      write('herb-index.json', [bad])
      write('summary-indexes/herbs-summary.json', [bad])
      write('summary-indexes/search-index.json', [{ ...bad, entityType: 'herb' }, good])
      write('summary-indexes/alphabetical-shards.json', { T: [{ ...bad, entityType: 'herb' }, good] })
      write('summary-indexes/entity-shards.json', { herbs: [bad], compounds: [good] })
      write('summary-indexes/alpha-entity-shards.json', { T: { herbs: [bad], compounds: [good] } })
      write('ai-entities/herb/tyrosine.json', {
        '@context': 'https://schema.org',
        '@graph': [{
          '@id': 'https://thehippiescientist.net/herbs/tyrosine/#entity',
          additionalProperty: [
            { '@type': 'PropertyValue', propertyID: 'evidence tier', value: 'Strong Human Evidence' },
            { '@type': 'PropertyValue', propertyID: 'evidence label', value: 'a' },
          ],
          description: 'L-Tyrosine botanical profile with evidence, safety, and practical fit.',
        }],
      })
      write('claims.json', [
        { profile_slug: 'tyrosine', source_url: 'https://pubmed.ncbi.nlm.nih.gov/8629725/' },
        { profile_slug: 'l-tyrosine', pmid: '32093203' },
      ])

      const run = () => execFileSync(process.execPath, [script], { cwd: root, stdio: 'pipe' })
      run()

      const first = read('herbs-detail/tyrosine.json')
      expect(first.sources).toEqual([])
      expect(first.evidence.sourceCount).toBe(0)
      expect(first.evidence.claimCount).toBe(0)
      expect(first.evidence_grade).toBeNull()
      expect(first.indexability_status).toBe('NEEDS_REVIEW')
      expect(first.robots).toBe('noindex,follow')
      expect(first.sitemap_included).toBe(false)

      for (const file of [
        'herbs-summary.json',
        'herb-index.json',
        'summary-indexes/herbs-summary.json',
        'summary-indexes/search-index.json',
        'summary-indexes/alphabetical-shards.json',
        'summary-indexes/entity-shards.json',
        'summary-indexes/alpha-entity-shards.json',
      ]) {
        const held = findSlug(read(file), 'tyrosine')
        expect(held).toBeTruthy()
        expect(held.evidence_grade).toBeNull()
        expect(held.evidence_tier).toBe('Editorial grade not demonstrated by recorded studies')
        expect(held.indexability_status).toBe('NEEDS_REVIEW')
        expect(held.robots).toBe('noindex,follow')
        expect(held.sitemap_included).toBe(false)
      }

      const searchCompound = findSlug(read('summary-indexes/search-index.json'), 'l-tyrosine')
      expect(searchCompound).toEqual(good)
      expect(read('claims.json')).toEqual([{ profile_slug: 'l-tyrosine', pmid: '32093203' }])
      expect(read('compounds-detail/l-tyrosine.json')).toEqual(good)

      const aiEntity = read('ai-entities/herb/tyrosine.json')['@graph'][0]
      expect(aiEntity.additionalProperty.find(p => p.propertyID === 'evidence tier')?.value)
        .toBe('Editorial grade not demonstrated by recorded studies')
      expect(aiEntity.additionalProperty.find(p => p.propertyID === 'evidence label')?.value)
        .toBe('under-review')
      expect(aiEntity.description).toContain('under review')

      const receipt = JSON.parse(readFileSync(path.join(root, 'ops/reports/quarantined-citations.json'), 'utf8'))
      expect(receipt.citations[0].source).toEqual(bad.sources[0])

      run()
      expect(read('herbs-detail/tyrosine.json')).toEqual(first)

      // Reintroduced stale inputs must be contained again, including DOI-only rows
      // and independently publishable indexes.
      write('herbs-detail/tyrosine.json', bad)
      write('herb-index.json', [bad])
      run()
      expect(read('herbs-detail/tyrosine.json')).toEqual(first)
      expect(read('herb-index.json')[0].evidence_grade).toBeNull()
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
