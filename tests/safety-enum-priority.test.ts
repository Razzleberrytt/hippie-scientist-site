import { describe, expect, it } from 'vitest'

import { normalizeSafetyEnum } from '../lib/safety-enum'

describe('safety enum priority', () => {
  it('does not let reassuring language override a pending safety review', () => {
    expect(normalizeSafetyEnum('Generally well tolerated; safety review pending').value).toBe('Safety review pending')
    expect(normalizeSafetyEnum('Safe in typical use, but profile pending review').value).toBe('Safety review pending')
  })

  it('keeps explicit risk signals above pending-review language', () => {
    expect(normalizeSafetyEnum('Safety review pending; avoid during pregnancy').value).toBe('Use caution')
    expect(normalizeSafetyEnum('Review needed; potential warfarin interaction').value).toBe('Interaction risk')
    expect(normalizeSafetyEnum('Generally well tolerated, but safety data are limited').value).toBe('Limited safety data')
  })
})
