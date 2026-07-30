import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { ALL_TOPIC_GUIDES } from '../topic-guides'

describe('topic guide hub', () => {
  it('links every published topic-guide route exactly once', () => {
    const routeRoot = path.join(process.cwd(), 'app', 'guides', 'other')
    const publishedRoutes = readdirSync(routeRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && existsSync(path.join(routeRoot, entry.name, 'page.tsx')))
      .map((entry) => `/guides/other/${entry.name}/`)
      .sort()
    const hubRoutes = ALL_TOPIC_GUIDES.map((guide) => guide.href).sort()

    expect(new Set(hubRoutes).size).toBe(hubRoutes.length)
    expect(hubRoutes).toEqual(publishedRoutes)
  })

  it('is not shadowed by a legacy redirect override', () => {
    const redirectRoot = path.join(process.cwd(), 'public', 'redirect-overrides')
    const redirects = readdirSync(redirectRoot)
      .filter((file) => file.endsWith('.txt'))
      .flatMap((file) => readFileSync(path.join(redirectRoot, file), 'utf8').split(/\r?\n/))
      .filter((line) => !line.trimStart().startsWith('#'))

    expect(redirects.some((line) => /^\/guides\/other\/?\s/.test(line))).toBe(false)
  })
})
