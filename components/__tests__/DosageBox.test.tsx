import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import DosageBox from '../DosageBox'

describe('DosageBox', () => {
  it('keeps dosage notes available in an accessible scroll region', () => {
    render(
      <DosageBox
        rows={[
          {
            form: 'Standardized extract',
            range: '200–400 mg',
            notes: 'Take earlier in the day with food.',
          },
        ]}
        disclaimer="General educational range; confirm personal dosing with a clinician."
      />,
    )

    const region = screen.getByRole('region', { name: 'Dosage and form reference' })
    const table = within(region).getByRole('table', { name: 'Dosage and form reference' })

    expect(region).toHaveAttribute('tabindex', '0')
    expect(within(table).getByRole('columnheader', { name: 'Form' })).toHaveAttribute('scope', 'col')
    expect(within(table).getByRole('columnheader', { name: 'Notes' })).toHaveAttribute('scope', 'col')
    expect(within(table).getByRole('rowheader', { name: 'Standardized extract' })).toHaveAttribute(
      'scope',
      'row',
    )
    expect(within(table).getByText('Take earlier in the day with food.')).toBeVisible()
    expect(
      screen.getByText('General educational range; confirm personal dosing with a clinician.'),
    ).toBeVisible()
  })
})
