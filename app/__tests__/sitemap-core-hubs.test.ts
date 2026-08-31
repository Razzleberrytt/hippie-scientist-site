import { describe, expect, it } from 'vitest'

import sitemap from '../sitemap'

function normalizePath(value: string): string {
  const pathname = new URL(value).pathname
  return pathname === '/' ? '/' : pathname.replace(/\/+$/, '')
}

describe('core hub sitemap coverage', () => {
  it('advertises the canonical info and evidence directory-root hubs', async () => {
    const entries = await sitemap()
    const paths = new Set(entries.map((entry) => normalizePath(entry.url)))

    expect(paths.has('/info')).toBe(true)
    expect(paths.has('/evidence')).toBe(true)
  })
})
