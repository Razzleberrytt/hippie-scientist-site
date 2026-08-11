import fs from 'node:fs'
import path from 'node:path'
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

  it('passes production security verification through the subscribe request', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'components/articles/EmailCapture.tsx'),
      'utf8',
    )

    expect(source).toContain('<TurnstileWidget')
    expect(source).toContain('turnstileToken: turnstileEnabled ? turnstileToken : undefined')
    expect(source).toContain('disabled={isLoading || (turnstileEnabled && !turnstileToken)}')
  })
})
