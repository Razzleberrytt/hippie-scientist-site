import { describe, it, expect } from 'vitest'
import { normalizeMechanism, getMechanismCluster } from '../../../lib/canonical-mechanisms'

describe('canonical-mechanisms', () => {
  it('normalizes known raw mechanisms to their canonical form', () => {
    expect(normalizeMechanism('inflammatory signaling modulation')).toBe('Inflammatory Signaling')
    expect(normalizeMechanism('NF-kB Modulation')).toBe('Inflammatory Signaling')
    expect(normalizeMechanism('metabolic regulation')).toBe('Metabolic Regulation')
  })

  it('normalizes unknown mechanisms using title case fallback', () => {
    expect(normalizeMechanism('some_custom-mechanism')).toBe('Some Custom Mechanism')
  })

  it('gets the correct cluster items for a mechanism', () => {
    const cluster = getMechanismCluster('nf-kb')
    expect(cluster).toContain('Inflammatory Signaling')
  })
})
