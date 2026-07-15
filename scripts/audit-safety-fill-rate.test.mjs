import { describe, expect, it } from 'vitest'
import { classifyRuntimeTrust } from './audit-safety-fill-rate.mjs'

const historicalSlugs = [
  'green-tea-egcg-isolated',
  'green-tea-extract',
  'green-tea-extract-egcg',
  'turmeric',
]

describe('safety fill-rate runtime classification', () => {
  it.each(historicalSlugs)('%s requires runtime-owned labelled safety', slug => {
    const sourceOnly = classifyRuntimeTrust({
      slug,
      runtime_export_decision: 'cluster_member_runtime',
      safety_notes: 'Source-only narrative.',
      contraindications_or_flags: 'Readable precaution.',
    })
    const complete = classifyRuntimeTrust({
      slug,
      runtime_export_decision: 'cluster_member_runtime',
      runtime_safety: 'Safety evidence: limited human evidence. Uncertainty remains.',
      safety_notes: 'Source narrative.',
      contraindications_or_flags: 'Readable precaution.',
    })

    expect(sourceOnly).toBe('SOURCE_ONLY_NOT_RUNTIME')
    expect(complete).toBe('RUNTIME_TRUST_COMPLETE')
  })

  it('rejects an invalid empty runtime override', () => {
    expect(classifyRuntimeTrust({
      runtime_export_decision: 'cluster_member_runtime',
      runtime_safety: '',
      safety_notes: 'Source narrative.',
    })).toBe('SOURCE_ONLY_NOT_RUNTIME')
  })
})
