import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SafetyCheckerClient from '../SafetyCheckerClient'

// Mock runtime dependencies
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

  it('scans and alerts for CNS Depressant / GABAergic overlap', async () => {
    render(<SafetyCheckerClient herbs={mockHerbs} compounds={mockCompounds} />)

    // Add Kava
    const input = screen.getByPlaceholderText(/Type herb or compound/i)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Kava' } })
    const kavaBtn = screen.getByText('Kava')
    fireEvent.click(kavaBtn)

    // Add Valerian Root
    fireEvent.change(input, { target: { value: 'Valerian' } })
    const valerianBtn = screen.getByText('Valerian Root')
    fireEvent.click(valerianBtn)

    // Assert Warning is visible
    expect(screen.getByText(/CNS Depressant \/ GABAergic Overlap/i)).toBeInTheDocument()
    expect(screen.getByText(/combining them can significantly compound drowsiness/i)).toBeInTheDocument()
    expect(screen.getByText(/Risk Level: medium/i)).toBeInTheDocument()
  })

  it('scans and alerts for MAOI + Serotonergic/Stimulant contraindications', () => {
    render(<SafetyCheckerClient herbs={mockHerbs} compounds={mockCompounds} />)

    const input = screen.getByPlaceholderText(/Type herb or compound/i)
    fireEvent.focus(input)
    
    // Add Rhodiola (MAOI)
    fireEvent.change(input, { target: { value: 'Rhodiola' } })
    fireEvent.click(screen.getByText('Rhodiola Rosea'))

    // Add Kanna Extract (Serotonergic)
    fireEvent.change(input, { target: { value: 'Kanna' } })
    fireEvent.click(screen.getByText('Kanna Extract'))

    // Assert Severe Contraindication alert is shown
    expect(screen.getByText(/Severe MAOI Contraindication Detected/i)).toBeInTheDocument()
    expect(screen.getByText(/highly contraindicated and can lead to acute hypertensive crises/i)).toBeInTheDocument()
    expect(screen.getByText(/Risk Level: high/i)).toBeInTheDocument()
  })

  it('clears list when clear button is clicked', () => {
    render(<SafetyCheckerClient herbs={mockHerbs} compounds={mockCompounds} />)

    const input = screen.getByPlaceholderText(/Type herb or compound/i)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Kava' } })
    fireEvent.click(screen.getByText('Kava'))

    expect(screen.getByText(/Selected List \(1\)/i)).toBeInTheDocument()

    const clearBtn = screen.getByText(/Clear All/i)
    fireEvent.click(clearBtn)

    expect(screen.getByText(/No items selected/i)).toBeInTheDocument()
  })

  it('scans and alerts for Drug-Supplement SSRI + serotonergic danger overlap', () => {
    render(<SafetyCheckerClient herbs={mockHerbs} compounds={mockCompounds} />)

    // Add Kanna Extract (serotonergic supplement)
    const input = screen.getByPlaceholderText(/Type herb or compound/i)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Kanna' } })
    fireEvent.click(screen.getByText('Kanna Extract'))

    // Add SSRI antidepressant
    const ssriBtn = screen.getByRole('button', { name: /SSRI \/ SNRI Antidepressants/i })
    fireEvent.click(ssriBtn)

    // Assert Warning is visible
    expect(screen.getByText(/Drug-Supplement Serotonin Toxicity Risk/i)).toBeInTheDocument()
    expect(screen.getByText(/Stacking serotonergic medications with serotonergic supplements/i)).toBeInTheDocument()
    expect(screen.getByText(/Risk Level: high/i)).toBeInTheDocument()
  })

  it('action buttons/search are immediately available with disclaimer visible', () => {
    render(<SafetyCheckerClient herbs={mockHerbs} compounds={mockCompounds} />)

    const input = screen.getByPlaceholderText(/Type herb or compound/i)
    expect(input).not.toBeDisabled()

    const ssriBtn = screen.getByRole('button', { name: /SSRI \/ SNRI Antidepressants/i })
    expect(ssriBtn).not.toBeDisabled()

    const maoiBtn = screen.getByRole('button', { name: /MAO Inhibitors \(MAOIs\)/i })
    expect(maoiBtn).not.toBeDisabled()

    const anticoagulantBtn = screen.getByRole('button', { name: /Blood Thinners \/ Anticoagulants/i })
    expect(anticoagulantBtn).not.toBeDisabled()
  })

  it('compact disclaimer remains visible without an acknowledgement checkbox', () => {
    render(<SafetyCheckerClient herbs={mockHerbs} compounds={mockCompounds} />)

    expect(screen.getByText(/Educational safety screen only/i)).toBeInTheDocument()
    expect(screen.getByText(/not medical advice/i)).toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('search input and medication buttons are interactive', () => {
    render(<SafetyCheckerClient herbs={mockHerbs} compounds={mockCompounds} />)

    const input = screen.getByPlaceholderText(/Type herb or compound/i)
    expect(input).not.toBeDisabled()

    const ssriBtn = screen.getByRole('button', { name: /SSRI \/ SNRI Antidepressants/i })
    expect(ssriBtn).not.toBeDisabled()

    const maoiBtn = screen.getByRole('button', { name: /MAO Inhibitors \(MAOIs\)/i })
    expect(maoiBtn).not.toBeDisabled()
  })

  it('scans and alerts for Drug-Supplement MAOI + serotonergic danger overlap', () => {
    render(<SafetyCheckerClient herbs={mockHerbs} compounds={mockCompounds} />)

    // Add Kanna Extract (serotonergic supplement)
    const input = screen.getByPlaceholderText(/Type herb or compound/i)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Kanna' } })
    fireEvent.click(screen.getByText('Kanna Extract'))

    // Add MAO Inhibitors
    const maoiBtn = screen.getByRole('button', { name: /MAO Inhibitors \(MAOIs\)/i })
    fireEvent.click(maoiBtn)

    // Assert Warning is visible
    expect(screen.getByText(/Critical MAOI Drug-Supplement Contraindication/i)).toBeInTheDocument()
    expect(screen.getByText(/matched a Monoamine Oxidase Inhibitor/i)).toBeInTheDocument()
    expect(screen.getByText(/Risk Level: high/i)).toBeInTheDocument()
  })
})
