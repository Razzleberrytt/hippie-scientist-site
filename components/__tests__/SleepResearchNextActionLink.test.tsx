import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import SleepResearchNextActionLink from '../SleepResearchNextActionLink'

const mocks = vi.hoisted(() => ({
  trackSleepNextActionClick: vi.fn(),
}))

vi.mock('@/lib/analytics', () => ({
  trackSleepNextActionClick: mocks.trackSleepNextActionClick,
}))

afterEach(() => {
  mocks.trackSleepNextActionClick.mockReset()
})

describe('SleepResearchNextActionLink', () => {
  it('binds the selected action, canonical destination, and current source path to the analytics contract', () => {
    render(
      <SleepResearchNextActionLink
        href="/info/newsletter/#research-interests"
        action="newsletter-interest"
        className="min-h-11"
      >
        Follow sleep research
      </SleepResearchNextActionLink>,
    )

    fireEvent.click(screen.getByRole('link', { name: 'Follow sleep research' }))

    expect(mocks.trackSleepNextActionClick).toHaveBeenCalledTimes(1)
    expect(mocks.trackSleepNextActionClick).toHaveBeenCalledWith({
      action: 'newsletter-interest',
      destination: '/info/newsletter/#research-interests',
      sourcePath: '/',
    })
  })

  it('preserves the link destination instead of replacing navigation with analytics behavior', () => {
    render(
      <SleepResearchNextActionLink href="/guides/sleep/" action="research-hub" className="min-h-11">
        Compare the sleep evidence
      </SleepResearchNextActionLink>,
    )

    expect(screen.getByRole('link', { name: 'Compare the sleep evidence' })).toHaveAttribute('href', '/guides/sleep/')
  })
})
