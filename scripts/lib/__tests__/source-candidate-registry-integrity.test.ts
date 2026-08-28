import { describe, expect, it } from 'vitest'
import { assessExplicitDuplicateTarget } from '../source-candidate-registry-integrity'

describe('source candidate explicit duplicate target integrity', () => {
  it('does nothing when no explicit duplicate target is declared', () => {
    expect(assessExplicitDuplicateTarget({}, new Map())).toEqual({
      hasExplicitTarget: false,
      targetResolves: false,
      metadataIssue: null,
    })
  })

  it('accepts an explicit target that resolves in the source registry', () => {
    const registryById = new Map([['src_existing', { sourceId: 'src_existing' }]])
    expect(assessExplicitDuplicateTarget({ duplicateOfSourceId: 'src_existing' }, registryById)).toEqual({
      hasExplicitTarget: true,
      targetResolves: true,
      metadataIssue: null,
    })
  })

  it('rejects a stale explicit target that is absent from the source registry', () => {
    expect(assessExplicitDuplicateTarget({ duplicateOfSourceId: 'src_missing' }, new Map())).toEqual({
      hasExplicitTarget: true,
      targetResolves: false,
      metadataIssue: 'duplicateOfSourceId=src_missing not found in source registry.',
    })
  })
})
