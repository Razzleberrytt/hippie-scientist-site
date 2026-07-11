import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SafetyCautionPanel from '../SafetyCautionPanel'

describe('SafetyCautionPanel', () => {
  it('keeps the summary visible and collapses detailed categories by default', () => {
    const { container } = render(
      <SafetyCautionPanel
        summary="Review medications and pregnancy status before use."
        groups={[
          { title: 'Medication interactions', items: ['Sedatives', 'Blood pressure medicines'] },
          { title: 'Pregnancy', items: ['Avoid unless a clinician advises otherwise.'] },
        ]}
      />,
    )

    expect(screen.getByText('Review medications and pregnancy status before use.')).toBeTruthy()
    expect(screen.getByText('Browse 2 safety categories')).toBeTruthy()
    expect(container.querySelector('details')).not.toHaveAttribute('open')
  })

  it('renders horizontally scrollable snap cards with capped vertical content', () => {
    const { container } = render(
      <SafetyCautionPanel
        summary="Use extra caution."
        groups={[{ title: 'Full safety note', items: ['A long safety note.'] }]}
      />,
    )

    const scroller = screen.getByLabelText('Detailed safety categories')
    expect(scroller.className).toContain('overflow-x-auto')
    expect(scroller.className).toContain('snap-x')
    expect(screen.getByText('Full safety note').closest('article')?.className).toContain('snap-start')
    expect(container.querySelector('.max-h-48')).toBeTruthy()
  })

  it('renders the optional safety gauge', () => {
    render(
      <SafetyCautionPanel
        summary="Standard caution."
        score={90}
        scoreLabel="Low caution — well tolerated"
      />,
    )

    expect(screen.getByRole('img', { name: /Safety meter: 90 out of 100/ })).toBeTruthy()
  })
})
