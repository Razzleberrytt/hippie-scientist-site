import { describe, expect, it } from 'vitest'

import { generateNavigationSchema } from '@/components/NavigationSchema'
import { primaryNavigation } from '@/lib/primary-navigation'
import { SITE_URL } from '@/lib/navigation-config'

describe('mental health navigation discovery', () => {
  it('surfaces the mental health hub under Guides', () => {
    const guides = primaryNavigation.find((item) => item.href === '/guides')

    expect(guides?.children).toContainEqual(expect.objectContaining({
      label: 'Mental Health',
      href: '/guides/mental-health',
    }))
  })

  it('includes the mental health hub in navigation structured data', () => {
    const schema = generateNavigationSchema()

    expect(schema.hasPart).toContainEqual({
      '@type': 'WebPage',
      name: 'Mental Health',
      url: `${SITE_URL}/guides/mental-health`,
    })
  })
})
