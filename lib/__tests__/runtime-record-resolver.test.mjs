import { describe, expect, it } from 'vitest'
import {
  normalizeRuntimeList,
  resolveRuntimeRecordLayers,
  resolveTrustValue,
} from '../runtime-record-resolver.mjs'

const canonical = {
  slug: 'cluster-member',
  runtime_export_decision: 'cluster_member_runtime',
  safety: 'Safety evidence: limited human evidence. Uncertainty remains.',
  contraindications: ['Liver disease'],
  interactions: [],
  side_effects: ['Nausea'],
  evidence_tier: 'Limited Human Evidence',
  indexability_status: 'PUBLISH',
  robots: 'index,follow',
  sitemap_included: true,
}

describe('cluster-member runtime record resolver', () => {
  it('inherits valid canonical values and renderer aliases', () => {
    const result = resolveRuntimeRecordLayers(canonical, [{ slug: canonical.slug }])
    expect(result.safety).toBe(canonical.safety)
    expect(result.safetyNotes).toBe(canonical.safety)
    expect(result.runtime_safety).toBe(canonical.safety)
  })

  it('allows a valid explicitly approved local override', () => {
    const result = resolveRuntimeRecordLayers(canonical, [{ slug: canonical.slug, safetyNotes: 'Safety evidence: reviewed local evidence. Local preparation warning.' }], {
      approvedTrustOverrides: ['safety'],
    })
    expect(result.safety).toContain('reviewed local evidence')
  })

  it('does not let empty strings or placeholders suppress inheritance', () => {
    expect(resolveRuntimeRecordLayers(canonical, [{ slug: canonical.slug, safetyNotes: '' }]).safety).toBe(canonical.safety)
    expect(resolveRuntimeRecordLayers(canonical, [{ slug: canonical.slug, safetyNotes: 'Generally well tolerated for most users.' }]).safety).toBe(canonical.safety)
  })

  it('does not let malformed arrays override canonical arrays', () => {
    const result = resolveRuntimeRecordLayers(canonical, [{ slug: canonical.slug, contraindications: 'Liver disease' }], {
      approvedTrustOverrides: ['contraindications'],
    })
    expect(result.contraindications).toEqual(['Liver disease'])
    expect(resolveTrustValue(['Canonical'], ['Local', null], { field: 'contraindications', allowLocal: true })).toEqual(['Canonical'])
  })

  it('fails a missing canonical relationship clearly', () => {
    expect(() => resolveRuntimeRecordLayers(null, [])).toThrow(/canonical core record/i)
    expect(() => resolveRuntimeRecordLayers(canonical, [{ slug: 'other' }])).toThrow(/does not match canonical slug/i)
  })

  it('preserves evidence labels and evidence-limited language', () => {
    const result = resolveRuntimeRecordLayers(canonical, [{ slug: canonical.slug, safetyNotes: 'unknown' }])
    expect(result.safety).toMatch(/^Safety evidence:/)
    expect(result.safety).toContain('Uncertainty remains')
  })

  it('normalizes duplicate values deterministically', () => {
    expect(normalizeRuntimeList(['Nausea', ' nausea ', 'Headache', '', 'unknown'])).toEqual(['Nausea', 'Headache'])
  })
})
