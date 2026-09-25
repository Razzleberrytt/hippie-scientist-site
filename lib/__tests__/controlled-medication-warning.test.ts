import { describe, expect, it } from 'vitest'
import { getControlledMedicationWarning } from '../controlled-medication-warning'

describe('controlled medication warning', () => {
  it('fails closed for controlled research-only medication records', () => {
    const warning = getControlledMedicationWarning({
      controlled_substance: true,
      legal_status: 'U.S. Schedule II controlled substance',
      profile_status: 'research_only',
    })

    expect(warning).toBeTruthy()
    expect(warning?.title).toMatch(/controlled medication/i)
    expect(warning?.body).toContain('U.S. Schedule II controlled substance')
    expect(warning?.body).toMatch(/blank safety fields must not be interpreted as evidence of safety/i)
    expect(warning?.items.join(' ')).toMatch(/boxed warnings/i)
    expect(warning?.suppressAffiliate).toBe(true)
  })

  it('does not invent a controlled-medication warning for unrestricted records', () => {
    expect(getControlledMedicationWarning({
      controlled_substance: false,
      legal_status: 'Not a controlled substance',
    })).toBeNull()
  })
})
