import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SafetyCheckerClient from '../SafetyCheckerClient'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

const herbs = [
  {
    slug: 'rhodiola-rosea',
    name: 'Rhodiola Rosea',
    safety: 'Caution: Mild MAOI-like activity. Avoid with strong stimulants or SSRIs.',
    mechanism: 'Inhibits monoamine oxidase (MAOI) enzymes.',
  },
]

const compounds = [
  {
    slug: 'kanna-extract',
    name: 'Kanna Extract',
    safety: 'Caution: Serotonergic modulation. Avoid with SSRIs or MAOIs.',
    mechanism: 'Serotonin reuptake inhibitor. 5-HT signaling increase.',
  },
]

function addIngredient(name: string) {
  const input = screen.getByPlaceholderText(/Type herb or compound/i)
  fireEvent.focus(input)
  fireEvent.change(input, { target: { value: name } })
  fireEvent.click(screen.getByText(name))
}

describe('SafetyCheckerClient MAO overlap requires a distinct selection', () => {
  it('does not let one MAOI-tagged supplement satisfy both sides of its own overlap rule', () => {
    render(<SafetyCheckerClient herbs={herbs} compounds={compounds} />)

    addIngredient('Rhodiola Rosea')

    expect(screen.queryByText(/MAO-related mechanism flag/i)).not.toBeInTheDocument()
    expect(screen.getByText(/No rule-based overlap flags found/i)).toBeInTheDocument()
    expect(screen.getByText(/Screening: No rule flags/i)).toBeInTheDocument()
  })

  it('still flags a MAO-related supplement when a different selected item has a serotonergic signal', () => {
    render(<SafetyCheckerClient herbs={herbs} compounds={compounds} />)

    addIngredient('Rhodiola Rosea')
    addIngredient('Kanna Extract')

    expect(screen.getByText(/MAO-related mechanism flag/i)).toBeInTheDocument()
    expect(screen.getByText(/alongside another serotonergic or stimulant signal/i)).toBeInTheDocument()
    expect(screen.getByText(/Screening: Caution flags/i)).toBeInTheDocument()
  })
})
