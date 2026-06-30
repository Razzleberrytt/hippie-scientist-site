import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { authorityHomeLinks, bestForSlugs } from '@/app/authority-links'
import { SEO_GUIDE_ROUTES } from '../../src/lib/canonical-routes'

const rootDir = process.cwd()
const redirectsPath = path.join(rootDir, 'public', '_redirects')

function parseRedirects() {
  return fs
    .readFileSync(redirectsPath, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const [source, destination, status] = line.split(/\s+/)
      return { source, destination, status }
    })
}

describe('route consolidation guardrails', () => {
  it('keeps required money and goal routes directly reachable', () => {
    const redirectedSources = new Set(parseRedirects().map((redirect) => redirect.source))

    expect(redirectedSources).not.toContain('/top/sleep')
    expect(redirectedSources).not.toContain('/top/stress')
    expect(redirectedSources).not.toContain('/top/focus')
    expect(redirectedSources).not.toContain('/top/best-supplements-for-brain-fog')
    expect(redirectedSources).not.toContain('/top/best-supplements-for-fatigue')
    expect(redirectedSources).not.toContain('/top/best-herbs-for-overthinking')
    expect(redirectedSources).not.toContain('/goals/:slug')
  })

  it('keeps authority home links on live canonical routes', () => {
    expect(authorityHomeLinks).toEqual([
      { href: '/guides/anxiety', label: 'Stress Goal Hub' },
      { href: '/guides/sleep', label: 'Sleep Goal Hub' },
      { href: SEO_GUIDE_ROUTES.sleep, label: 'Best Supplements for Sleep' },
      { href: SEO_GUIDE_ROUTES.focus, label: 'Best Supplements for Focus' },
      { href: '/guides/compare/rhodiola-vs-ashwagandha', label: 'Rhodiola vs Ashwagandha' },
      { href: '/stacks/sleep-recovery-stack', label: 'Sleep Recovery Stack' },
      { href: '/info/methodology', label: 'Safety Basics' },
    ])
  })

  it('includes expanded best route slugs without redirecting best routes away', () => {
    expect(bestForSlugs).toEqual([
      'sleep',
      'focus',
      'stress',
      'anxiety',
      'energy',
      'inflammation',
    ])

    const redirectedSources = new Set(parseRedirects().map((redirect) => redirect.source))

    expect(redirectedSources).not.toContain('/best/sleep')
    expect(redirectedSources).not.toContain('/best/focus')
    expect(redirectedSources).not.toContain('/best/stress')
    expect(redirectedSources).not.toContain('/best/anxiety')
    expect(redirectedSources).not.toContain('/best/energy')
    expect(redirectedSources).not.toContain('/best/inflammation')
  })
})
