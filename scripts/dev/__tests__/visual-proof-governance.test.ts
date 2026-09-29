import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function source(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('hosted visual proof governance', () => {
  const sweep = source('scripts/dev/visual-sweep.mjs')
  const workflow = source('.github/workflows/visual-proof.yml')
  const dependencyGuard = source('scripts/ci/validate-direct-dependencies.mjs')

  it('fails closed on load, overflow, and theme regressions', () => {
    expect(sweep).toContain('const errs = report.filter((r) => r.status)')
    expect(sweep).toContain('const over = report.filter((r) => r.overflow > 0)')
    expect(sweep).toContain('const themeMismatches = report.filter')
    expect(sweep).toContain('if (errs.length || over.length || themeMismatches.length) process.exitCode = 1')
  })

  it('runs the existing sweep in a pinned hosted browser and retains artifacts', () => {
    expect(workflow).toContain('playwright@1.63.0')
    expect(workflow).toContain('RUNTIME_DIR="$RUNNER_TEMP/visual-proof-playwright"')
    expect(workflow).toContain('node_modules/playwright-core')
    expect(workflow).toContain('install --with-deps chromium')
    expect(workflow).toContain('node scripts/dev/visual-sweep.mjs hosted')
    expect(workflow).toContain('actions/upload-artifact@v7')
    expect(workflow).toContain('.visual-sweep/hosted/')
    expect(workflow).toContain('retention-days: 30')
  })

  it('keeps execution bounded and reproducible', () => {
    expect(workflow).toContain('timeout-minutes: 35')
    expect(workflow).toContain('cancel-in-progress: true')
    expect(workflow).toContain('npm ci --no-audit --fund=false')
    expect(workflow).toContain('npm run build:deploy')
  })

  it('keeps Playwright outside production dependencies while documenting hosted use', () => {
    expect(dependencyGuard).toContain("optionalProbes = new Set(['exceljs', 'glob', 'react-plotly.js', 'playwright'])")
    expect(dependencyGuard).toContain('hosted visual-proof workflow installs a pinned transient copy')
  })
})
