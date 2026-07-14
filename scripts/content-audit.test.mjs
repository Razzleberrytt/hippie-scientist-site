import fs from 'fs'
import os from 'os'
import path from 'path'
import { afterEach, describe, expect, it } from 'vitest'

import { countWords } from './content-audit.mjs'

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
      const relImport = path.relative(tmpDir, dataFile).replace(/\.ts$/, '').replace(/\\/g, '/')
      fs.writeFileSync(
        pageFile,
        `import { articles } from '${relImport.startsWith('.') ? relImport : `./${relImport}`}'
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
  })
})
