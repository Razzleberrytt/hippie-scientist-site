import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('EnhancedEmailCapture funnel authority', () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'components/monetization/EnhancedEmailCapture.tsx'),
    'utf8',
  )

  it('delegates subscriptions to the canonical NewsletterSignup implementation', () => {
    expect(source).toContain("import NewsletterSignup from '../NewsletterSignup'")
    expect(source).toContain('<NewsletterSignup')
    expect(source).not.toContain('<form')
  })

  it('does not route users to the removed newsletter confirmation path', () => {
    expect(source).not.toContain('/info/newsletter/confirmed')
  })
})
