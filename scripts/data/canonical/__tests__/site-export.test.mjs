import { describe, it, expect } from 'vitest'
import { exportSiteRecords } from '../site-export.mjs'

// Uses the real migrated canonical data on disk. These assertions guard the
// route-contract parity established in Phase 6.
describe('site export adapter', () => {
  const { herbs, compounds } = exportSiteRecords()

  it('emits herb and compound records', () => {
    expect(herbs.length).toBeGreaterThan(250)
    expect(compounds.length).toBeGreaterThan(500)
  })

  it('is sorted by slug (deterministic order)', () => {
    const slugs = herbs.map((h) => h.slug)
    expect(slugs).toEqual([...slugs].sort())
  })

  it('produces the site record shape with array/string fields', () => {
    const h = herbs[0]
    expect(typeof h.slug).toBe('string')
    expect(typeof h.name).toBe('string')
    expect(Array.isArray(h.effects)).toBe(true)
    expect(Array.isArray(h.mechanisms)).toBe(true)
    expect(Array.isArray(h.tags)).toBe(true)
    expect(typeof h.evidence_grade).toBe('string')
  })

  it('emits no wall-clock timestamp (stable last_updated)', () => {
    expect(new Set(herbs.map((h) => h.last_updated)).size).toBe(1)
  })

  it('drops restricted substances but keeps prescription non-controlled drugs', () => {
    const slugs = new Set(compounds.map((c) => c.slug))
    expect(slugs.has('psilocybin')).toBe(false)
    expect(slugs.has('mitragynine')).toBe(false)
    // "not a controlled substance" prose must not cause a drop
    expect(slugs.has('semaglutide')).toBe(true)
    expect(slugs.has('tirzepatide')).toBe(true)
  })

  it('is deterministic across runs (same output)', () => {
    const again = exportSiteRecords()
    expect(again.herbs.map((h) => h.slug)).toEqual(herbs.map((h) => h.slug))
    expect(JSON.stringify(again.herbs[0])).toBe(JSON.stringify(herbs[0]))
  })
})
