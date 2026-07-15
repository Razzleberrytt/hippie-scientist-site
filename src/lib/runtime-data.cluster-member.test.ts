import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildCompoundTrustGuidance } from '../../lib/compound-trust'
import { getCompoundBySlug, getHerbBySlug } from './runtime-data'

const herbSlugs = ['green-tea-extract', 'turmeric'] as const
const compoundSlugs = ['green-tea-egcg-isolated', 'green-tea-extract-egcg'] as const

function coreRecord(kind: 'herbs' | 'compounds', slug: string) {
  const records = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public', 'data', `${kind}.json`), 'utf8'))
  return records.find((record: Record<string, unknown>) => record.slug === slug)
}

describe('cluster-member production runtime boundary', () => {
  it.each(herbSlugs)('%s inherits canonical trust fields while preserving detail content', async slug => {
    const record = await getHerbBySlug(slug)
    const core = coreRecord('herbs', slug)

    expect(record).not.toBeNull()
    expect(record?.safety).toBe(core.safety)
    expect(record?.safetyNotes).toBe(core.safety)
    expect(record?.safety).toMatch(/^Safety evidence:/)
    expect(record?.side_effects).toEqual(expect.arrayContaining([expect.any(String)]))
    expect(record?.interactions).toEqual([])
    expect(record?.indexability_status).toBe('PUBLISH')
    expect(record?.robots).toBe('index,follow')
    expect(record?.sitemap_included).toBe(true)
  })

  it.each(compoundSlugs)('%s is renderable with matching build-time and renderer trust values', async slug => {
    const record = await getCompoundBySlug(slug)
    const core = coreRecord('compounds', slug)

    expect(record).not.toBeNull()
    expect(record?.safety).toBe(core.safety)
    expect(record?.safetyNotes).toBe(core.safety)
    expect(record?.safety).toMatch(/^Safety evidence:/)
    expect(record?.contraindications).toEqual(expect.arrayContaining([expect.any(String)]))
    expect(record?.side_effects).toEqual(expect.arrayContaining([expect.any(String)]))
    expect(record?.indexability_status).toBe('PUBLISH')
    expect(record?.robots).toBe('index,follow')
    expect(record?.sitemap_included).toBe(true)

    const guidance = buildCompoundTrustGuidance(record as Record<string, unknown>, record?.contraindications as string[])
    expect(guidance.evidenceLabel).toBeTruthy()
    expect(guidance.safetyDetail).not.toMatch(/generally well tolerated/i)
  })

  it('keeps search safety and flags aligned for all four profiles', () => {
    const search = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public', 'data', 'search-index.json'), 'utf8'))
    const records = search.filter((record: Record<string, unknown>) => [...herbSlugs, ...compoundSlugs].includes(record.slug as never))

    expect(records).toHaveLength(4)
    for (const record of records) {
      expect(record.safety).not.toMatch(/generally well tolerated/i)
      expect(record.safetyFlags).toMatchObject({ hasContraindications: true, hasInteractions: false })
    }
  })
})
