import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import EvidenceBackingNote from '../EvidenceBackingNote'

describe('EvidenceBackingNote', () => {
  it('says nothing when the grade is backed by the record', () => {
    const { container } = render(<EvidenceBackingNote backed gap={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  // The field is absent on plenty of records. Absent is not the same as
  // "checked and found unsupported", so it must not produce a disclosure —
  // otherwise every incomplete record would accuse itself of overclaiming.
  it.each([undefined, null])('says nothing when backed is %s', (backed) => {
    const { container } = render(<EvidenceBackingNote backed={backed} gap="no-claims-recorded" />)
    expect(container).toBeEmptyDOMElement()
  })

  it.each([
    ['no-claims-recorded', /no studies are recorded/i],
    ['no-human-study-recorded', /no human outcome study is recorded/i],
    ['single-human-study-for-grade-a', /only one human study is recorded/i],
  ])('discloses the %s gap', (gap, expected) => {
    render(<EvidenceBackingNote backed={false} gap={gap} />)
    expect(screen.getByText(expected)).toBeInTheDocument()
  })

  // An unrecognised gap reason is still a gap. Rendering nothing would restore
  // exactly the silence this component exists to remove.
  it('still discloses a gap reason it does not recognise', () => {
    render(<EvidenceBackingNote backed={false} gap="some-future-reason" />)
    expect(screen.getByText(/do not demonstrate this grade/i)).toBeInTheDocument()
  })

  it('discloses even when no gap reason is supplied', () => {
    render(<EvidenceBackingNote backed={false} gap={null} />)
    expect(screen.getByText(/do not demonstrate this grade/i)).toBeInTheDocument()
  })

  it('links to the evidence section so the note leads somewhere', () => {
    render(<EvidenceBackingNote backed={false} gap="no-claims-recorded" href="#evidence" />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '#evidence')
  })
})
