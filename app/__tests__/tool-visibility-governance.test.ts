import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

// These interactive surfaces must consume the central fail-closed visibility
// boundary rather than inventing page-local fallbacks when runtime data is malformed.
const TOOL_PAGES = [
  'app/guides/compare/dynamic/page.tsx',
  'app/info/dosing/page.tsx',
  'app/learn/explorer/page.tsx',
  'app/learn/product-quality/page.tsx',
  'app/safety-checker/page.tsx',
]

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('interactive tool runtime visibility governance', () => {
  it.each(TOOL_PAGES)('%s uses the canonical fail-closed render filter', (relativePath) => {
    const source = read(relativePath)

    expect(source).toContain('filterRenderableRuntimeRecords')
    expect(source).not.toContain('getRuntimeVisibility')
    expect(source).not.toMatch(/catch\s*\{[\s\S]{0,160}?return\s+true/)
  })
})
