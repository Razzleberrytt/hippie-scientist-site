import fs from 'node:fs'
import path from 'node:path'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AffiliateDisclosure, { AMAZON_ASSOCIATE_IDENTIFICATION } from '../AffiliateDisclosure'

describe('Amazon Associates disclosure identity', () => {
  it.each(['compact', 'full'] as const)(
    'renders the Amazon identification visibly in the %s disclosure',
    (variant) => {
      render(<AffiliateDisclosure variant={variant} />)
      expect(
        screen.getByText(AMAZON_ASSOCIATE_IDENTIFICATION, { exact: true }),
      ).toBeVisible()
      // The source and canonical site routes use trailing slashes; keep the assertion aligned.
      expect(screen.getByRole('link', { name: variant === 'compact'
        ? 'How we stay independent'
        : 'Read our affiliate and editorial policy',
      })).toHaveAttribute('href', '/info/affiliate-disclosure/')
    },
  )

  it('keeps a plain-language commission explanation beside the compact disclosure', () => {
    render(<AffiliateDisclosure variant='compact' />)
    expect(screen.getByText(/may earn a commission from qualifying links at no extra cost/i)).toBeVisible()
  })

  it('reuses the shared disclosure in legacy product boxes', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'components/AffiliateProductBox.tsx'), 'utf8')
    expect(source).toContain("import AffiliateDisclosure from './AffiliateDisclosure'")
    expect(source).toContain("<AffiliateDisclosure variant='compact' />")
    expect(source).not.toContain('as an Amazon Associate we earn a small commission')
  })
})
