import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { describe, it, expect } from 'vitest'

describe('maca wrong-source regeneration guard', () => {
  it('removes the bad assignment, reconciles counts and resists a second run with no detail source left', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'maca-source-'))
    const script = path.resolve('scripts/data/quarantine-unverifiable-citations.mjs')
    const data = path.join(root, 'public/data')
    const write = (file, value) => {
      const target = path.join(data, file); mkdirSync(path.dirname(target), { recursive: true })
      writeFileSync(target, JSON.stringify(value))
    }
    const read = file => JSON.parse(readFileSync(path.join(data, file), 'utf8'))
    const stale = { id: 'study-row-151', profile_slug: 'maca', pmid: '18072817',
      source_url: 'https://pubmed.ncbi.nlm.nih.gov/18072817/ | https://pubmed.ncbi.nlm.nih.gov/23674952/', evidence_tier: 'RCT' }
    const valid = { id: 'separate', profile_slug: 'maca', pmid: '31951246' }
    try {
      for (let i = 0; i < 400; i++) write(`herbs-detail/control-${i}.json`, { slug: `control-${i}`, sources: [] })
      write('herbs-detail/maca.json', { slug: 'maca', sources: [{ id: 'bad', pmid: '18072817' }, { id: 'good', pubmedId: '31951246' }],
        claimMap: [{ id: 'badclaim', sourceRefIds: ['bad'] }, { id: 'goodclaim', sourceRefIds: ['good'] }],
        evidence: { sourceIds: ['bad', 'good'], sourceCount: 2, claimIds: ['badclaim', 'goodclaim'], claimCount: 2 } })
      for (let run = 0; run < 2; run++) {
        write('claims.json', [stale, valid])
        execFileSync(process.execPath, [script], { cwd: root, stdio: 'pipe' })
        expect(read('claims.json')).toEqual([valid])
        const detail = read('herbs-detail/maca.json')
        expect(detail.sources).toEqual([{ id: 'good', pubmedId: '31951246' }])
        expect(detail.claimMap).toEqual([{ id: 'goodclaim', sourceRefIds: ['good'] }])
        expect(detail.evidence).toEqual({ sourceIds: ['good'], sourceCount: 1, claimIds: ['goodclaim'], claimCount: 1 })
      }
    } finally { rmSync(root, { recursive: true, force: true }) }
  })
})
