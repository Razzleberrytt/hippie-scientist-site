import { describe, expect, it } from 'vitest'
import { assertR809InheritedReceiptsApproved } from '../approve-r805-master.mjs'

const approvedLineage = () => ({
  creativeFoundation: { schemaVersion: 'ths-r806-creative-receipt-v1', status: 'approved' },
  creativeVisualFoundation: { schemaVersion: 'ths-r807-creative-receipt-v1', status: 'approved' },
  creativeSilentFoundation: { schemaVersion: 'ths-r808-creative-receipt-v1', status: 'approved' },
  creativeDirection: { schemaVersion: 'ths-r809-creative-receipt-v1', status: 'approved' },
})

describe('R8.09 exact-master final inherited-approval gate', () => {
  it('accepts only a fully approved inherited creative receipt chain', () => {
    expect(assertR809InheritedReceiptsApproved(approvedLineage())).toBe(true)
  })

  for (const [field, release] of [
    ['creativeFoundation', 'R8.06'],
    ['creativeVisualFoundation', 'R8.07'],
    ['creativeSilentFoundation', 'R8.08'],
    ['creativeDirection', 'R8.09'],
  ]) {
    it(`rejects a rejected ${release} receipt even with correct schema`, () => {
      const manifest = approvedLineage()
      manifest[field].status = 'rejected'
      expect(() => assertR809InheritedReceiptsApproved(manifest)).toThrow(
        new RegExp(`requires approved ${release} creative receipt`),
      )
    })

    it(`rejects a missing ${release} approval status`, () => {
      const manifest = approvedLineage()
      delete manifest[field].status
      expect(() => assertR809InheritedReceiptsApproved(manifest)).toThrow(
        new RegExp(`requires approved ${release} creative receipt`),
      )
    })

    it(`rejects a missing ${release} receipt`, () => {
      const manifest = approvedLineage()
      delete manifest[field]
      expect(() => assertR809InheritedReceiptsApproved(manifest)).toThrow(
        new RegExp(`requires approved ${release} creative receipt`),
      )
    })
  }
})
