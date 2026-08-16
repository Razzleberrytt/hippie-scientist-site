import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

const removedLegacyFiles = [
  'src/lib/curatedProducts.ts',
  'scripts/verify-curated-affiliates.ts',
  'scripts/report-affiliate-inventory.ts',
  'scripts/report-governed-cta-refresh.ts',
]

describe('curated product legacy removal contract', () => {
  it('keeps the orphaned runtime and tooling removed', () => {
    for (const relativePath of removedLegacyFiles) {
      expect(fs.existsSync(path.join(root, relativePath)), relativePath).toBe(false)
    }
  })

  it('does not retain stale exclusions or validator exemptions', () => {
    const tsconfig = fs.readFileSync(path.join(root, 'tsconfig.json'), 'utf8')
    const affiliateValidator = fs.readFileSync(
      path.join(root, 'scripts', 'ci', 'validate-affiliate-links.mjs'),
      'utf8',
    )

    expect(tsconfig).not.toContain('"src/lib/curatedProducts.ts"')
    expect(affiliateValidator).not.toContain("'src/lib/curatedProducts.ts'")
  })

  it('keeps the quarantine tombstone so active code cannot resurrect the legacy path', () => {
    const quarantineValidator = fs.readFileSync(
      path.join(root, 'scripts', 'ci', 'validate-quarantine-imports.mjs'),
      'utf8',
    )

    expect(quarantineValidator).toContain("'@/src/lib/curatedProducts'")
  })
})
