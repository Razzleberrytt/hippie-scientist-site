import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SafetyCheckerClient from '../SafetyCheckerClient'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

const mockHerbs = [
  {
    slug: 'kava',
    name: 'Kava',
    safety: 'Caution: Sedative properties. Avoid combining with alcohol or other CNS depressants.',
    mechanism: 'GABA-A positive allosteric modulator.',
  },
  {
    slug: 'valerian-root',
    name: 'Valerian Root',
    safety: 'Caution: May cause drowsiness. High CNS depressant loading in combination.',
    mechanism: 'Enhances GABAergic transmission.',
  },
  {
    slug: 'rhodiola-rosea',
    name: 'Rhodiola Rosea',
    safety: 'Caution: Mild MAOI-like activity. Avoid with strong stimulants or SSRIs.',
    mechanism: 'Inhibits monoamine oxidase (MAOI) enzymes.',
  }
]

const mockCompounds = [
  {
    slug: 'caffeine',
    name: 'Caffeine',
    safety: 'Caution: Stimulant. Can cause heart rate increases.',
    mechanism: 'Adenosine receptor antagonist. Stimulant activity.',
  },
  {
    slug: 'kanna-extract',
    name: 'Kanna Extract',
    safety: 'Caution: Serotonergic modulation. Avoid with SSRIs or MAOIs.',
    mechanism: 'Serotonin reuptake inhibitor. 5-HT signaling increase.',
  }
]

describe('SafetyCheckerClient', () => {
  it('renders default empty state and compact disclaimer', () => {
    render(<SafetyCheckerClient herbs={mockHerbs} compounds={mockCompounds} />)

    expect(screen.getByText(/Search Ingredients/i)).toBeInTheDocument()
    expect(screen.getByText(/Add items/i)).toBeInTheDocument()
    expect(screen.getByText(/Educational safety screen only/i)).toBeInTheDocument()
  })

  it('keeps interactions available on first render', () => {
    render(<SafetyCheckerClient herbs={mockHerbs} compounds={mockCompounds} />)

    const input = screen.getByPlaceholderText(/Type herb or compound/i)
    expect(input).not.toBeDisabled()

    const ssriBtn = screen.getByRole('button', { name: /SSRI \/ SNRI Antidepressants/i })
    expect(ssriBtn).not.toBeDisabled()
  })

  it('flags sedative overlap without presenting it as a diagnosis', () => {
    render(<SafetyCheckerClient herbs={mockHerbs} compounds={mockCompounds} />)

    const input = screen.getByPlaceholderText(/Type herb or compound/i)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Kava' } })
    fireEvent.click(screen.getByText('Kava'))

    fireEvent.change(input, { target: { value: 'Valerian' } })
    fireEvent.click(screen.getByText('Valerian Root'))

    expect(screen.getByText(/Sedation-related overlap/i)).toBeInTheDocument()
    expect(screen.getByText(/Additive drowsiness or impairment may be possible/i)).toBeInTheDocument()
    expect(screen.getByText(/Screening: Caution flags/i)).toBeInTheDocument()
  })

  it('keeps supplement-only MAO mechanism matches as caution flags', () => {
    render(<SafetyCheckerClient herbs={mockHerbs} compounds={mockCompounds} />)

    const input = screen.getByPlaceholderText(/Type herb or compound/i)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Rhodiola' } })
    fireEvent.click(screen.getByText('Rhodiola Rosea'))

    fireEvent.change(input, { target: { value: 'Kanna' } })
    fireEvent.click(screen.getByText('Kanna Extract'))

    expect(screen.getByText(/MAO-related mechanism flag/i)).toBeInTheDocument()
    expect(screen.getByText(/not equivalent to a prescription MAOI contraindication/i)).toBeInTheDocument()
    expect(screen.getByText(/Screening: Caution flags/i)).toBeInTheDocument()
    expect(screen.queryByText(/fatal hypertensive/i)).not.toBeInTheDocument()
  })

  it('clears list when clear button is clicked', () => {
    render(<SafetyCheckerClient herbs={mockHerbs} compounds={mockCompounds} />)

    const input = screen.getByPlaceholderText(/Type herb or compound/i)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Kava' } })
    fireEvent.click(screen.getByText('Kava'))

    expect(screen.getByText(/Selected List \(1\)/i)).toBeInTheDocument()

    fireEvent.click(screen.getByText(/Clear All/i))
    expect(screen.getByText(/No items selected/i)).toBeInTheDocument()
  })

  it('uses a high-priority flag for an SSRI class plus a serotonergic supplement signal', () => {
    render(<SafetyCheckerClient herbs={mockHerbs} compounds={mockCompounds} />)

    const input = screen.getByPlaceholderText(/Type herb or compound/i)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Kanna' } })
    fireEvent.click(screen.getByText('Kanna Extract'))

    fireEvent.click(screen.getByRole('button', { name: /SSRI \/ SNRI Antidepressants/i }))

    expect(screen.getByText(/Serotonergic overlap — medication review advised/i)).toBeInTheDocument()
    expect(screen.getByText(/mechanism flag alone cannot quantify that risk/i)).toBeInTheDocument()
    expect(screen.getByText(/Screening: High-priority flags/i)).toBeInTheDocument()
  })

  it('action buttons and search are immediately available with disclaimer visible', () => {
    render(<SafetyCheckerClient herbs={mockHerbs} compounds={mockCompounds} />)

    expect(screen.getByPlaceholderText(/Type herb or compound/i)).not.toBeDisabled()
    expect(screen.getByRole('button', { name: /SSRI \/ SNRI Antidepressants/i })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: /MAO Inhibitors \(MAOIs\)/i })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: /Blood Thinners \/ Anticoagulants/i })).not.toBeDisabled()
  })

  it('compact disclaimer says both flags and no-flags have limits', () => {
    render(<SafetyCheckerClient herbs={mockHerbs} compounds={mockCompounds} />)

    expect(screen.getByText(/Educational safety screen only/i)).toBeInTheDocument()
    expect(screen.getByText(/no flag is not proof that a combination is safe/i)).toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('uses a high-priority flag when an MAOI medication class overlaps a serotonergic supplement signal', () => {
    render(<SafetyCheckerClient herbs={mockHerbs} compounds={mockCompounds} />)

    const input = screen.getByPlaceholderText(/Type herb or compound/i)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Kanna' } })
    fireEvent.click(screen.getByText('Kanna Extract'))

    fireEvent.click(screen.getByRole('button', { name: /MAO Inhibitors \(MAOIs\)/i }))

    expect(screen.getByText(/MAOI medication overlap — pharmacist review advised/i)).toBeInTheDocument()
    expect(screen.getByText(/Do not use this screen as clearance/i)).toBeInTheDocument()
    expect(screen.getByText(/Screening: High-priority flags/i)).toBeInTheDocument()
  })
})
