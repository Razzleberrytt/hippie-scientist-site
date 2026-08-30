import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SafetyCheckerClient from '../SafetyCheckerClient'
import type { SafetyToolItem } from '@/lib/safety-checker-engine'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

const herbs: SafetyToolItem[] = [
  {
    slug: 'rhodiola-rosea',
    name: 'Rhodiola Rosea',
    type: 'herb',
    safety: 'Caution: Mild MAOI-like activity. Avoid with strong stimulants or SSRIs.',
    mechanism: 'Inhibits monoamine oxidase (MAOI) enzymes.',
  },
]

const compounds: SafetyToolItem[] = [
  {
    slug: 'kanna-extract',
    name: 'Kanna Extract',
    type: 'compound',
    safety: 'Caution: Serotonergic modulation. Avoid with SSRIs or MAOIs.',
    mechanism: 'Serotonin reuptake inhibitor. 5-HT signaling increase.',
  },
]

function addIngredient(name: string) {
  const input = screen.getByLabelText(/Add an herb, supplement, or compound/i)
  fireEvent.focus(input)
  fireEvent.change(input, { target: { value: name } })
  fireEvent.click(screen.getByText(name))
}

describe('SafetyCheckerClient MAO overlap requires a distinct selection', () => {
  it('does not let one MAOI-tagged supplement satisfy both sides of its own overlap rule', () => {
    render(<SafetyCheckerClient herbs={herbs} compounds={compounds} />)

    addIngredient('Rhodiola Rosea')

    // One MAOI-tagged supplement must not satisfy both sides of its own overlap
    // rule. Screening does not begin until a second item is present, so no flag
    // can be manufactured from a single selection.
    expect(screen.queryByText(/Serotonergic overlap/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Screening result/i)).not.toBeInTheDocument()
    expect(screen.getByText(/Add at least two ingredients\/classes/i)).toBeInTheDocument()
  })

  it('still flags a MAO-related supplement when a different selected item has a serotonergic signal', () => {
    render(<SafetyCheckerClient herbs={herbs} compounds={compounds} />)

    addIngredient('Rhodiola Rosea')
    addIngredient('Kanna Extract')

    // A second, genuinely distinct serotonergic item does produce the flag.
    expect(screen.getByText(/Serotonergic overlap/i)).toBeInTheDocument()
    expect(screen.getByText(/share a serotonergic safety, interaction, or mechanism signal/i)).toBeInTheDocument()
    expect(screen.getByText(/does not by itself prove a clinical interaction/i)).toBeInTheDocument()
  })
})
