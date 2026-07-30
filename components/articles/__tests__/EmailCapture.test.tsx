import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import EmailCapture from '../EmailCapture'

describe('article EmailCapture', () => {
  it('lets readers preview the public checklist before subscribing', () => {
    render(
      <EmailCapture
        title="Get the ADHD Supplement Starter Checklist"
        description="Track one change at a time."
        ctaLabel="Send me the checklist"
        magnet="adhd-supplement-starter-checklist"
      />,
    )

    expect(screen.getByRole('link', { name: /preview and print the checklist/i })).toHaveAttribute(
      'href',
      '/lead-magnets/adhd-supplement-starter-checklist',
    )
    expect(screen.getByRole('button', { name: /send me the checklist/i })).toBeEnabled()
  })
})
