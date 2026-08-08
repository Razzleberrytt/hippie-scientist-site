import fs from 'fs'
import os from 'os'
import path from 'path'
import { afterEach, describe, expect, it } from 'vitest'

import {
  countWords,
  isMainModule,
  collectPages,
  loadRedirects,
  findDuplicateSlugs,
  checkOrphaned,
} from './content-audit.mjs'

describe('CLI entrypoint detection', () => {
  it('recognizes a relative Windows-compatible script path as the main module', () => {
    expect(isMainModule('scripts/content-audit.mjs')).toBe(true)
    expect(isMainModule('scripts/content-audit.test.mjs')).toBe(false)
    expect(isMainModule(undefined)).toBe(false)
  })
})

describe('countWords', () => {
  it('counts inline JSX text and PROSE_KEYS object-literal values', () => {
    const source = `
      export default function Page() {
        const items = [{ title: 'Alpha beta gamma', description: 'Delta epsilon zeta eta theta' }]
        return <main><p>Some rendered copy right here in the page.</p></main>
      }
    `
    expect(countWords(source)).toBeGreaterThanOrEqual(10)
  })

  describe('cross-file import resolution', () => {
    let tmpDir

    afterEach(() => {
      if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true })
      tmpDir = undefined
    })

    it('counts prose sourced from an imported lib/ data module, not just the page itself', () => {
      const root = path.resolve(import.meta.dirname, '..')
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'content-audit-test-'))
      const libDir = path.join(root, 'lib', `__test_content_audit_${path.basename(tmpDir)}__`)
      fs.mkdirSync(libDir, { recursive: true })
      const dataFile = path.join(libDir, 'articles.ts')
      fs.writeFileSync(
        dataFile,
        `export const articles = [
          { title: 'First article headline here', description: 'A longer sourced description with several distinct words describing the article content in full detail.' },
          { title: 'Second article headline here', description: 'Another longer sourced description with several distinct words describing more article content in full detail.' },
        ]`
      )
      const pageFile = path.join(tmpDir, 'page.tsx')
      // Use a hardcoded leading dot-slash below (not an interpolated ternary)
      // so this fixture's raw text always begins with a dot right where the
      // dependency-boundary validator's static scanner looks for one — an
      // inline conditional in that exact spot can otherwise read as an
      // undeclared bare-specifier import even though this is fixture text,
      // never a real import. A leading dot-slash is a no-op path prefix even
      // when the real relative path already climbs up via dot-dot segments,
      // so this stays correct at runtime.
      const relImport = path.relative(tmpDir, dataFile).replace(/\.ts$/, '').replace(/\\/g, '/')
      fs.writeFileSync(
        pageFile,
        `import { articles } from './${relImport}'
        export default function Hub() {
          return <main>{articles.map(a => <article key={a.title}>{a.title}</article>)}</main>
        }`
      )

      try {
        const pageSource = fs.readFileSync(pageFile, 'utf-8')
        const withoutImportFollow = countWords(pageSource)
        const withImportFollow = countWords(pageSource, pageFile)
        expect(withImportFollow).toBeGreaterThan(withoutImportFollow)
      } finally {
        fs.rmSync(libDir, { recursive: true, force: true })
      }
    })

    it('does not pull in imported prose fields the page never renders (e.g. full FAQ answers behind a card that only shows title/description)', () => {
      const root = path.resolve(import.meta.dirname, '..')
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'content-audit-test-'))
      const libDir = path.join(root, 'lib', `__test_content_audit_${path.basename(tmpDir)}__`)
      fs.mkdirSync(libDir, { recursive: true })
      const dataFile = path.join(libDir, 'articles.ts')
      // Each entry carries a short rendered `title` plus a long `answer` field
      // that the hub below never touches — simulating a full article registry
      // where the hub only renders card summaries, not FAQ/section bodies.
      const unrenderedWord = 'unrenderedfaqcontentxyz'
      fs.writeFileSync(
        dataFile,
        `export const articles = [
          { title: 'Short card title one', answer: '${Array(50).fill(unrenderedWord).join(' ')}' },
        ]`
      )
      const pageFile = path.join(tmpDir, 'page.tsx')
      // See the leading dot-slash note in the previous test — same
      // dependency-boundary static-scan avoidance.
      const relImport = path.relative(tmpDir, dataFile).replace(/\.ts$/, '').replace(/\\/g, '/')
      fs.writeFileSync(
        pageFile,
        `import { articles } from './${relImport}'
        export default function Hub() {
          return <main>{articles.map(a => <article key={a.title}>{a.title}</article>)}</main>
        }`
      )

      try {
        const pageSource = fs.readFileSync(pageFile, 'utf-8')
        const withImportFollow = countWords(pageSource, pageFile)
        // The unrendered `answer` field would alone add 50 words if leaked in;
        // confirm the scoped extraction stays far below that.
        expect(withImportFollow).toBeLessThan(20)
      } finally {
        fs.rmSync(libDir, { recursive: true, force: true })
      }
    })
  })
})

describe('page collection', () => {
  const pages = collectPages()
  const routes = new Set(pages.map((p) => p.route))

  // Regression guard: collectPages() used to read only one level deep, so it
  // saw the ~10 cluster hub pages and silently reported an all-clear for the
  // ~155 real guide pages nested underneath them.
  it('recurses past the family root into cluster subdirectories', () => {
    expect(pages.length).toBeGreaterThan(100)
    expect(routes.has('/guides/sleep/magnesium-for-sleep')).toBe(true)
    expect(routes.has('/guides/anxiety/how-to-lower-cortisol-naturally')).toBe(true)
    expect(routes.has('/guides/herbs/turmeric-curcumin')).toBe(true)
  })

  // `stress` is intentionally absent: app/guides/stress holds only a hub
  // page.tsx with no nested children, so it has nothing below the hub to find.
  it('covers every authority cluster that has nested pages, not just the hubs', () => {
    for (const cluster of ['sleep', 'anxiety', 'focus', 'adhd', 'compare', 'herbs']) {
      const inCluster = pages.filter((p) => p.route.startsWith(`/guides/${cluster}/`))
      expect(inCluster.length, `expected nested pages under /guides/${cluster}/`).toBeGreaterThan(0)
    }
  })

  it('builds the route from the full path below the family root', () => {
    const page = pages.find((p) => p.route === '/guides/sleep/magnesium-for-sleep')
    expect(page).toBeDefined()
    expect(page.family).toBe('guides')
    expect(page.slug).toBe('magnesium-for-sleep')
    expect(page.pagePath.endsWith(path.join('app', 'guides', 'sleep', 'magnesium-for-sleep', 'page.tsx'))).toBe(true)
  })

  it('skips dynamic segments and route groups', () => {
    expect(pages.some((p) => p.route.includes('['))).toBe(false)
    expect(pages.some((p) => p.route.includes('('))).toBe(false)
  })
})

describe('redirect awareness', () => {
  it('parses public/_redirects into a from -> to map', () => {
    const redirects = loadRedirects()
    expect(redirects.size).toBeGreaterThan(0)
    // A path served by a 301 is not a dead link; it is reported as a redirect
    // hop so broken_internal_link stays a true 404 worklist.
    expect(redirects.get('/guides/kava')).toBe('/guides/herbs/kava/')
  })

  it('ignores comments and wildcard/param rules', () => {
    for (const from of loadRedirects().keys()) {
      expect(from.startsWith('/')).toBe(true)
      expect(from.includes('*')).toBe(false)
      expect(from.includes(':')).toBe(false)
    }
  })
})

describe('duplicate slug detection', () => {
  it('flags one leaf slug published at two distinct routes', () => {
    const issues = findDuplicateSlugs([
      { slug: 'x', route: '/guides/sleep/x', family: 'guides' },
      { slug: 'x', route: '/guides/compare/x', family: 'guides' },
    ])
    expect(issues).toHaveLength(1)
    expect(issues[0].detail).toContain('/guides/compare/x')
    expect(issues[0].detail).toContain('/guides/sleep/x')
  })

  it('does not flag a single page just because collection now recurses', () => {
    // Both nested pages share the `guides` family, so comparing family names
    // alone would have reported every nested page as a duplicate.
    expect(findDuplicateSlugs([{ slug: 'x', route: '/guides/sleep/x', family: 'guides' }])).toHaveLength(0)
  })
})

describe('orphan detection', () => {
  const ROUTE = '/guides/sleep/foo'
  const OWN = path.resolve('app/guides/sleep/foo/page.tsx')
  const OTHER = path.resolve('app/guides/sleep/page.tsx')

  it('does not count a page citing its own route as an inbound link', () => {
    // Canonical / JSON-LD url / breadcrumb all name the page's own route; if
    // those counted, nothing could ever be reported as orphaned.
    const issues = checkOrphaned(ROUTE, new Map([[ROUTE, new Set([OWN])]]), OWN)
    expect(issues).toHaveLength(1)
    expect(issues[0].type).toBe('orphaned_page')
  })

  it('counts a reference from any other file as an inbound link', () => {
    expect(checkOrphaned(ROUTE, new Map([[ROUTE, new Set([OWN, OTHER])]]), OWN)).toHaveLength(0)
  })

  it('reports pages under a dynamically-linked prefix as undeterminable, not orphaned', () => {
    // Hubs link children as href={`${HUB_PATH}/${article.slug}/`}; a regex
    // source scan cannot resolve those slugs, so calling the page orphaned
    // would be a false positive and calling it linked would be a false
    // all-clear. It is surfaced as its own explicit status instead.
    const issues = checkOrphaned(ROUTE, new Map(), OWN, new Set(['/guides/sleep/']))
    expect(issues).toHaveLength(1)
    expect(issues[0].type).toBe('orphan_undeterminable')
    expect(issues[0].severity).toBe('info')
  })

  it('still reports a real orphan when its prefix is not dynamically linked', () => {
    const issues = checkOrphaned(ROUTE, new Map(), OWN, new Set(['/guides/other/']))
    expect(issues).toHaveLength(1)
    expect(issues[0].type).toBe('orphaned_page')
  })
})
