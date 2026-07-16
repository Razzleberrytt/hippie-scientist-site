import { describe, expect, it } from 'vitest'
import { findFlaggedChanges } from './audit-patch-flagged-slugs.mjs'

describe('findFlaggedChanges', () => {
  it('flags an applied change with requires_human_review: true for a matching slug', () => {
    const patchesByFile = {
      'batch-1.json': {
        id: 'batch-1',
        status: 'applied',
        changes: [
          { slug: 'creatine', column: 'contraindications_or_flags', new_value: '', requires_human_review: true },
        ],
      },
    }
    const hits = findFlaggedChanges(patchesByFile, ['creatine'])
    expect(hits).toHaveLength(1)
    expect(hits[0]).toMatchObject({ file: 'batch-1.json', patchId: 'batch-1', slug: 'creatine', requires_human_review: true })
  })

  it('ignores changes for slugs not in the requested list', () => {
    const patchesByFile = {
      'batch-1.json': {
        status: 'applied',
        changes: [{ slug: 'ashwagandha', column: 'contraindications_or_flags', requires_human_review: true }],
      },
    }
    expect(findFlaggedChanges(patchesByFile, ['creatine'])).toEqual([])
  })

  it('ignores changes from patches that are not status: "applied" (proposal/approved)', () => {
    const patchesByFile = {
      'batch-1.json': {
        status: 'proposal',
        changes: [{ slug: 'creatine', column: 'contraindications_or_flags', requires_human_review: true }],
      },
    }
    expect(findFlaggedChanges(patchesByFile, ['creatine'])).toEqual([])
  })

  it('returns a hit even when requires_human_review is false, so callers can render informational context', () => {
    const patchesByFile = {
      'batch-1.json': {
        status: 'applied',
        changes: [{ slug: 'creatine', column: 'runtime_safety', new_value: 'x', requires_human_review: false }],
      },
    }
    const hits = findFlaggedChanges(patchesByFile, ['creatine'])
    expect(hits).toHaveLength(1)
    expect(hits[0].requires_human_review).toBe(false)
  })

  it('matches across multiple patch files and multiple requested slugs', () => {
    const patchesByFile = {
      'batch-1.json': {
        id: 'batch-1',
        status: 'applied',
        changes: [{ slug: 'creatine-hcl', column: 'contraindications_or_flags', requires_human_review: true }],
      },
      'batch-2.json': {
        id: 'batch-2',
        status: 'applied',
        changes: [{ slug: 'creatine-monohydrate', column: 'runtime_safety', requires_human_review: true }],
      },
    }
    const hits = findFlaggedChanges(patchesByFile, ['creatine-hcl', 'creatine-monohydrate'])
    expect(hits).toHaveLength(2)
    expect(hits.map((h) => h.file).sort()).toEqual(['batch-1.json', 'batch-2.json'])
  })

  it('returns no hits when no patches are present', () => {
    expect(findFlaggedChanges({}, ['creatine'])).toEqual([])
  })
})
