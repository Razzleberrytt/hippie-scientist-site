import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

describe('Explore task launchpad', () => {
  it('keeps one direct entity lookup and four distinct evidence tasks', () => {
    const page = read('app/explore/page.tsx')

    expect(page).toContain("action='/search/'")
    expect(page).toContain("href: '/goals/'")
    expect(page).toContain("href: '/safety-checker/'")
    expect(page).toContain("href: '/guides/compare/'")
    expect(page).toContain("href: '/research/'")
  })

  it('reuses existing entity libraries instead of creating another index', () => {
    const page = read('app/explore/page.tsx')

    expect(page).toContain("href='/herbs/'")
    expect(page).toContain("href='/compounds/'")
    expect(page).not.toContain('ExploreClient')
    expect(page).not.toContain('buildSearchIndex')
  })

  it('keeps the exhaustive library visually and structurally secondary', () => {
    const page = read('app/explore/page.tsx')

    expect(page).toContain('Need everything?')
    expect(page).toContain("href='/library/'")
    expect(page).toContain('Use the exhaustive directory when you already know')
  })

  it('keeps interaction and comparison as separate reader jobs', () => {
    const page = read('app/explore/page.tsx')

    expect(page).toContain("title: 'Check a stack or interaction'")
    expect(page).toContain("title: 'Compare ingredients'")
    expect(page).toContain("title: 'Inspect research & updates'")
    expect(page).toContain("title: 'Browse by goal'")
  })

  it('uses one compact task list instead of a wall of equal cards', () => {
    const page = read('app/explore/page.tsx')

    expect(page).toContain("divide-y divide-brand-900/10")
    expect(page).toContain("min-h-24")
    expect(page).not.toContain("min-h-[12rem]")
    expect(page).toContain('see what changed')
  })


  it('backs the research-and-updates task with a secondary updates handoff', () => {
    const research = read('app/research/page.tsx')

    expect(research).toContain("const secondaryResearchLinks = [")
    expect(research).toContain("label: 'Recent evidence changes'")
    expect(research).toContain("href: '/updates/'")
    expect(research).toContain('Trust & updates')
    expect(research).not.toContain('See recent evidence changes and newly reviewed pages')
  })

})
