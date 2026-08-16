import { describe, expect, it } from 'vitest'

import { mentalHealthMetadata } from '@/components/articles/MentalHealthArticlePage'
import { SITE_URL } from '@/lib/navigation-config'

describe('mental health article metadata', () => {
  it('uses the verified author identity for mental health article metadata', () => {
    const metadata = mentalHealthMetadata('obsessive-compulsive-disorder')

    expect(metadata.authors).toEqual([{
      name: 'Willie B. Randolph III',
      url: `${SITE_URL}/info/author/`,
    }])
    expect(metadata.creator).toBe('Willie B. Randolph III')
  })
})
