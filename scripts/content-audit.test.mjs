import fs from 'fs'
import os from 'os'
import path from 'path'
import { afterEach, describe, expect, it } from 'vitest'

import { countWords, isMainModule } from './content-audit.mjs'

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
