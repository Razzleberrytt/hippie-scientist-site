import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AffiliateDisclosure from '../AffiliateDisclosure'

describe('AffiliateDisclosure', () => {
  it.each(['compact', 'full'] as const)(
    'links the %s disclosure to the full affiliate policy',
    (variant) => {
      render(<AffiliateDisclosure variant={variant} />)

      expect(screen.getByRole('link')).toHaveAttribute(
        'href',
        '/info/affiliate-disclosure',
      )
    },
  )
})
