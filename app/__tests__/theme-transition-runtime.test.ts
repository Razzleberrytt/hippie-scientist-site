import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8')

describe('theme transition runtime performance', () => {
  it('keeps the universal descendant transition dormant after hydration', () => {
    const provider = read('lib/dark-mode-provider.tsx')
    const globals = read('app/globals.css')

    // The historical CSS rule may remain for now, but nothing in runtime code
    // should activate it. This prevents a universal transition contract from
    // matching every element on large profile DOMs after hydration.
    expect(globals).toContain('html.theme-ready body *')
    expect(provider).not.toContain("classList.add('theme-ready')")
    expect(provider).not.toContain('requestAnimationFrame')
  })

  it('preserves the actual document theme contract', () => {
    const provider = read('lib/dark-mode-provider.tsx')

    expect(provider).toContain("classList.toggle('dark', isDark)")
    expect(provider).toContain("document.documentElement.dataset.theme = isDark ? 'dark' : 'light'")
    expect(provider).toContain("localStorage.setItem(THEME_STORAGE_KEY, preference)")
    expect(provider).toContain("window.matchMedia('(prefers-color-scheme: dark)')")
  })
})
