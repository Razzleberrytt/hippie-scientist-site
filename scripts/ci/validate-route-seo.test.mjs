import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { afterEach, describe, expect, it } from 'vitest'

let tmpDir

afterEach(() => {
  if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true })
  tmpDir = undefined
})

function write(relativePath, content) {
  const fullPath = path.join(tmpDir, relativePath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, content)
}

describe('validate-route-seo production source scan', () => {
  it('ignores test fixtures while preserving warnings from production source', () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'route-seo-audit-'))

    write('app/page.tsx', 'export default function Page() { return null }')
    write(
      'app/lead-magnets/adhd-supplement-starter-checklist/page.tsx',
      'export default function RequiredRoute() { return null }',
    )
    write(
      'app/real/page.tsx',
      'export default function RealPage() { return <a href="/missing-production/">Missing</a> }',
    )
    write(
      'app/__tests__/route-fixture.test.tsx',
      'export const fixture = <a href="/missing-test-fixture/">Fixture</a>',
    )
    write(
      'components/seo/__tests__/schema-fixture.test.tsx',
      'export const schemaFixture = { href: "/missing-schema-fixture/" }',
    )
    write(
      'lib/helper.spec.ts',
      'export const helperFixture = { href: "/missing-spec-fixture/" }',
    )

    const validator = path.resolve(process.cwd(), 'scripts/ci/validate-route-seo.mjs')
    const result = spawnSync(process.execPath, [validator], {
      cwd: tmpDir,
      encoding: 'utf8',
    })

    expect(result.status).toBe(0)
    expect(result.stdout).toContain('Broken internal href /missing-production/ in app/real/page.tsx')
    expect(result.stdout).not.toContain('/missing-test-fixture/')
    expect(result.stdout).not.toContain('/missing-schema-fixture/')
    expect(result.stdout).not.toContain('/missing-spec-fixture/')
  })
})
