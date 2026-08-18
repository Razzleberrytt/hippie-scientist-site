import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SafetyCheckerClient from '../SafetyCheckerClient'
import type { SafetyToolItem } from '@/lib/safety-checker-engine'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

const mockHerbs: SafetyToolItem[] = [
  {
    slug: 'kava',
    name: 'Kava',
    type: 'herb',
    safety: 'Caution: Sedative properties. Avoid combining with alcohol or other CNS depressants.',
    mechanism: 'GABA-A positive allosteric modulator.',
  },
  {
    slug: 'valerian-root',
    name: 'Valerian Root',
    type: 'herb',
    safety: 'Caution: May cause drowsiness. High CNS depressant loading in combination.',
    mechanism: 'Enhances GABAergic transmission.',
  },
  {
    slug: 'rhodiola-rosea',
    name: 'Rhodiola Rosea',
    type: 'herb',
    safety: 'Caution: Mild MAOI-like activity. Avoid with strong stimulants or SSRIs.',
    mechanism: 'Inhibits monoamine oxidase (MAOI) enzymes.',
  }
]

const mockCompounds: SafetyToolItem[] = [
  {
    slug: 'caffeine',
    name: 'Caffeine',
    type: 'compound',
    safety: 'Caution: Stimulant. Can cause heart rate increases.',
    mechanism: 'Adenosine receptor antagonist. Stimulant activity.',
  },
  {
    slug: 'kanna-extract',
    name: 'Kanna Extract',
    type: 'compound',
    safety: 'Caution: Serotonergic modulation. Avoid with SSRIs or MAOIs.',
    mechanism: 'Serotonin reuptake inhibitor. 5-HT signaling increase.',
  }
]

describe('SafetyCheckerClient', () => {
  it('renders default empty state and compact disclaimer', () => {
    render(<SafetyCheckerClient herbs={mockHerbs} compounds={mockCompounds} />)

    expect(screen.getByLabelText(/Add an herb, supplement, or compound/i)).toBeInTheDocument()
    // Medication classes are broad educational buckets, and the tool has to keep
    // saying so rather than implying a drug-level interaction database.
    expect(screen.getByText(/not a medication-specific interaction database/i)).toBeInTheDocument()
    expect(screen.getByText(/Add at least two ingredients\/classes/i)).toBeInTheDocument()
  })

  it('keeps interactions available on first render', () => {
    render(<SafetyCheckerClient herbs={mockHerbs} compounds={mockCompounds} />)

    const input = screen.getByLabelText(/Add an herb, supplement, or compound/i)
    expect(input).not.toBeDisabled()

    const ssriBtn = screen.getByRole('button', { name: /SSRI \/ SNRI Antidepressants/i })
    expect(ssriBtn).not.toBeDisabled()
  })

  it('flags sedative overlap without presenting it as a diagnosis', () => {
    render(<SafetyCheckerClient herbs={mockHerbs} compounds={mockCompounds} />)

    const input = screen.getByLabelText(/Add an herb, supplement, or compound/i)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Kava' } })
    fireEvent.click(screen.getByText('Kava'))

    fireEvent.change(input, { target: { value: 'Valerian' } })
    fireEvent.click(screen.getByText('Valerian Root'))

    expect(screen.getByText(/Sedation overlap/i)).toBeInTheDocument()
    expect(screen.getByText(/share a sedation safety, interaction, or mechanism signal/i)).toBeInTheDocument()
    // A flag is a signal, not a diagnosis, and the card must keep saying so.
    expect(screen.getByText(/does not by itself prove a clinical interaction/i)).toBeInTheDocument()
  })

  it('keeps supplement-only MAO mechanism matches as caution flags', () => {
    render(<SafetyCheckerClient herbs={mockHerbs} compounds={mockCompounds} />)

    const input = screen.getByLabelText(/Add an herb, supplement, or compound/i)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Rhodiola' } })
    fireEvent.click(screen.getByText('Rhodiola Rosea'))

    fireEvent.change(input, { target: { value: 'Kanna' } })
    fireEvent.click(screen.getByText('Kanna Extract'))

    // Supplement-only signals are reported as an overlap between ingredients.
    // They must not borrow prescription-MAOI severity language.
    expect(screen.getByText('Serotonergic overlap')).toBeInTheDocument()
    expect(screen.queryByText(/with medication class/i)).not.toBeInTheDocument()
    expect(screen.getByText(/does not by itself prove a clinical interaction/i)).toBeInTheDocument()
    expect(screen.queryByText(/fatal hypertensive/i)).not.toBeInTheDocument()
  })

  it('clears list when clear button is clicked', () => {
    render(<SafetyCheckerClient herbs={mockHerbs} compounds={mockCompounds} />)

    const input = screen.getByLabelText(/Add an herb, supplement, or compound/i)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Kava' } })
    fireEvent.click(screen.getByText('Kava'))

    expect(screen.getByText(/1 selected item/i)).toBeInTheDocument()

    fireEvent.click(screen.getByText(/Clear all/i))
    expect(screen.getByText(/Add at least two ingredients\/classes/i)).toBeInTheDocument()
  })

  it('uses a high-priority flag for an SSRI class plus a serotonergic supplement signal', () => {
    render(<SafetyCheckerClient herbs={mockHerbs} compounds={mockCompounds} />)

    const input = screen.getByLabelText(/Add an herb, supplement, or compound/i)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Kanna' } })
    fireEvent.click(screen.getByText('Kanna Extract'))

    fireEvent.click(screen.getByRole('button', { name: /SSRI \/ SNRI Antidepressants/i }))

    // Adding a prescription class must be visible in the flag itself, so a
    // medication overlap cannot read like a supplement-only one.
    expect(screen.getByText(/Serotonergic overlap with medication class/i)).toBeInTheDocument()
    expect(screen.getByText(/SSRI \/ SNRI antidepressants \(medication class\)/i)).toBeInTheDocument()
    expect(screen.getByText(/does not by itself prove a clinical interaction/i)).toBeInTheDocument()
  })

  it('action buttons and search are immediately available with disclaimer visible', () => {
    render(<SafetyCheckerClient herbs={mockHerbs} compounds={mockCompounds} />)

    expect(screen.getByLabelText(/Add an herb, supplement, or compound/i)).not.toBeDisabled()
    expect(screen.getByRole('button', { name: /SSRI \/ SNRI Antidepressants/i })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: /MAO Inhibitors \(MAOIs\)/i })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: /Anticoagulants \/ antiplatelets/i })).not.toBeDisabled()
  })

  it('says an empty result is not evidence of safety', () => {
    render(<SafetyCheckerClient herbs={mockHerbs} compounds={mockCompounds} />)

    const input = screen.getByLabelText(/Add an herb, supplement, or compound/i)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Caffeine' } })
    fireEvent.click(screen.getByText('Caffeine'))
    fireEvent.change(input, { target: { value: 'Valerian' } })
    fireEvent.click(screen.getByText('Valerian Root'))

    // The dangerous reading of this tool is 'nothing flagged, therefore safe'.
    // Whatever the wording, a clean screen has to say what it does not mean.
    expect(screen.getByText(/No documented overlap found/i)).toBeInTheDocument()
    expect(screen.getByText(/does not mean/i)).toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('uses a high-priority flag when an MAOI medication class overlaps a serotonergic supplement signal', () => {
    render(<SafetyCheckerClient herbs={mockHerbs} compounds={mockCompounds} />)

    const input = screen.getByLabelText(/Add an herb, supplement, or compound/i)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Kanna' } })
    fireEvent.click(screen.getByText('Kanna Extract'))

    fireEvent.click(screen.getByRole('button', { name: /MAO Inhibitors \(MAOIs\)/i }))

    expect(screen.getByText(/overlap with medication class/i)).toBeInTheDocument()
    expect(screen.getByText(/MAO inhibitors \(MAOIs\) \(medication class\)/i)).toBeInTheDocument()
    expect(screen.getByText(/does not by itself prove a clinical interaction/i)).toBeInTheDocument()
  })
})