import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { describe, it, expect } from 'vitest'

describe('citation quarantine regeneration boundary', () => {
  it('holds stale profiles and workbook claims idempotently while preserving unrelated sources', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'citation-hold-'))
    const script = path.resolve('scripts/data/quarantine-unverifiable-citations.mjs')
    const write = (file, value) => {
      const target = path.join(root, 'public/data', file)
      mkdirSync(path.dirname(target), { recursive: true })
      writeFileSync(target, JSON.stringify(value))
    }
    const read = file => JSON.parse(readFileSync(path.join(root, 'public/data', file), 'utf8'))
    try {
      for (let i = 0; i < 400; i++) write(`herbs-detail/control-${i}.json`, { slug: `control-${i}`, sources: [] })
      const bad = { slug: 'tyrosine', evidence_grade: 'A', sources: [{ doi: '10.2105/ajph.86.5.717' }], claimMap: [{ id: 'held' }] }
      const good = { slug: 'l-tyrosine', sources: [{ pmid: '32093203' }] }
      write('herbs-detail/tyrosine.json', bad)
      write('compounds-detail/l-tyrosine.json', good)
      write('summary-indexes/herbs-summary.json', [bad])
      write('claims.json', [{ profile_slug: 'tyrosine', source_url: 'https://pubmed.ncbi.nlm.nih.gov/8629725/' }, { profile_slug: 'l-tyrosine', pmid: '32093203' }])
      const run = () => execFileSync(process.execPath, [script], { cwd: root, stdio: 'pipe' })
      run()
      const first = read('herbs-detail/tyrosine.json')
      expect(first.sources).toEqual([])
      expect(first.evidence.sourceCount).toBe(0)
      expect(first.evidence.claimCount).toBe(0)
      expect(read('summary-indexes/herbs-summary.json')[0].evidence_grade).toBeNull()
      expect(read('claims.json')).toEqual([{ profile_slug: 'l-tyrosine', pmid: '32093203' }])
      expect(read('compounds-detail/l-tyrosine.json')).toEqual(good)
      const receipt = JSON.parse(readFileSync(path.join(root, 'ops/reports/quarantined-citations.json'), 'utf8'))
      expect(receipt.citations[0].source).toEqual(bad.sources[0])
      run()
      expect(read('herbs-detail/tyrosine.json')).toEqual(first)
      // Reintroduced stale inputs must be contained again, including DOI-only rows.
      write('herbs-detail/tyrosine.json', bad)
      run()
      expect(read('herbs-detail/tyrosine.json')).toEqual(first)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
