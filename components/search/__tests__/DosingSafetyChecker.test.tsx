import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import DosingSafetyChecker from '../DosingSafetyChecker'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

const items = [
  {
    slug: 'ashwagandha',
    name: 'Ashwagandha',
    type: 'Herb' as const,
    dosage: '300–600 mg in selected studies',
    effects: ['stress'],
    evidence: 'moderate',
    avoid_if: ['Pregnancy'],
  },
  {
    slug: 'plain-example',
    name: 'Plain Example',
    type: 'Compound' as const,
    dosage: '100 mg',
    effects: [],
    evidence: 'limited',
  },
]

describe('DosingSafetyChecker', () => {
  it('does not request body weight or emit personalized dose formulas', () => {
    render(<DosingSafetyChecker items={items} />)

    expect(screen.queryByLabelText(/weight/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/weight-scaled/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/loading phase/i)).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/Choose substance/i), { target: { value: 'ashwagandha' } })
    expect(screen.getByText(/300–600 mg in selected studies/i)).toBeInTheDocument()
    expect(screen.getByText(/Pregnancy/i)).toBeInTheDocument()
  })

  it('treats an empty quick-index warning list as missing data rather than reassurance', () => {
    render(<DosingSafetyChecker items={items} />)

    fireEvent.change(screen.getByLabelText(/Choose substance/i), { target: { value: 'plain-example' } })

    expect(screen.getByText(/missing-data state, not evidence that the substance is low risk/i)).toBeInTheDocument()
    expect(screen.queryByText(/standard dietary supplement cautions apply/i)).not.toBeInTheDocument()
  })
})
