import { readFileSync } from 'node:fs'
import { readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const APP_DIR = join(process.cwd(), 'app')

function pageFiles(dir: string): string[] {
  const found: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '__tests__' || entry.name === 'node_modules') continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      found.push(...pageFiles(full))
    } else if (/^(page|layout)\.tsx$/.test(entry.name)) {
      found.push(full)
    }
  }
  return found
}

describe('routes that declare openGraph also declare twitter', () => {
  it('has no route emitting openGraph without a twitter block', () => {
    // Next does not inherit the root layout's twitter metadata into a route that
    // declares its own openGraph — it derives one from that openGraph instead,
    // which drops twitter:site because openGraph has no equivalent field. Every
    // route that sets openGraph by hand must therefore set twitter as well,
    // either directly or via buildPageMetadata/buildTwitterMetadata.
    const offenders = pageFiles(APP_DIR)
      .filter((file) => {
        const source = readFileSync(file, 'utf8')
        if (!source.includes('openGraph:')) return false
        if (source.includes('buildPageMetadata')) return false
        return !source.includes('twitter:')
      })
      .map((file) => relative(process.cwd(), file))

    expect(offenders).toEqual([])
  })
})
