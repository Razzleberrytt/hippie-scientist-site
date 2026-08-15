import { describe, expect, it } from 'vitest'

import { generateNavigationSchema } from '@/components/NavigationSchema'
import { mentalHealthMetadata } from '@/components/articles/MentalHealthArticlePage'
import { primaryNavigation } from '@/lib/primary-navigation'
import { SITE_URL } from '@/lib/navigation-config'

describe('mental health navigation discovery', () => {
  it('surfaces the mental health hub under Goals', () => {
    const goals = primaryNavigation.find((item) => item.label === 'Goals')

    expect(goals?.children).toContainEqual(expect.objectContaining({
      label: 'Mental Health',
      href: '/guides/mental-health',
    }))
  })

  it('includes the mental health hub in navigation structured data', () => {
    const schema = generateNavigationSchema()

    expect(schema.hasPart).toContainEqual({
      '@type': 'WebPage',
      name: 'Mental Health',
      url: `${SITE_URL}/guides/mental-health/`,
    })
  })

  it('uses the verified author identity for mental health article metadata', () => {
    const metadata = mentalHealthMetadata('obsessive-compulsive-disorder')

    expect(metadata.authors).toEqual([{
      name: 'Willie B. Randolph III',
      url: `${SITE_URL}/info/author/`,
    }])
    expect(metadata.creator).toBe('Willie B. Randolph III')
  })
})
