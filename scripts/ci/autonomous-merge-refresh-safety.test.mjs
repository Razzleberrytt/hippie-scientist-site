import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { canAutoRefreshPr } from './autonomous-merge-controller.mjs'

const source = fs.readFileSync(path.join(process.cwd(), 'scripts/ci/autonomous-merge-controller.mjs'), 'utf8')
const refreshStart = source.indexOf('async function refreshPrAndDispatch')
const refreshEnd = source.indexOf('\nasync function recoverZeroJobActionRequired', refreshStart)
const refreshFunction = refreshStart >= 0 && refreshEnd > refreshStart
  ? source.slice(refreshStart, refreshEnd)
  : ''

describe('autonomous merge workflow refresh safety', () => {
  it('refuses update-branch for any PR that changes workflow control files', () => {
    expect(canAutoRefreshPr(['.github/workflows/ci.yml'])).toBe(false)
    expect(canAutoRefreshPr(['scripts/ci/helper.mjs', '.github/workflows/deploy.yml'])).toBe(false)
  })

  it('retains canonical update-branch recovery for ordinary PRs', () => {
    expect(canAutoRefreshPr(['app/page.tsx', 'scripts/seo/report.mjs'])).toBe(true)
    expect(canAutoRefreshPr(['.github/ISSUE_TEMPLATE/bug.yml'])).toBe(true)
  })

  it('places the fail-closed guard before every update-branch mutation path', () => {
    expect(refreshFunction).toContain('const changedFiles = await getPrFiles(repo, pr.number)')
    expect(refreshFunction).toContain('if (!canAutoRefreshPr(changedFiles))')
    expect(refreshFunction).toContain('NEEDS_CLEAN_RESTAGE')
    expect(refreshFunction).toContain('workflow-changing PRs may not use bot-authored update-branch')

    const guardIndex = refreshFunction.indexOf('if (!canAutoRefreshPr(changedFiles))')
    const mutationIndex = refreshFunction.indexOf('await syncPrBranch(')
    expect(guardIndex).toBeGreaterThanOrEqual(0)
    expect(mutationIndex).toBeGreaterThan(guardIndex)
  })

  it('keeps the raw update-branch endpoint isolated behind syncPrBranch', () => {
    expect(source.match(/\/update-branch/g) || []).toHaveLength(1)
    expect(source.match(/await syncPrBranch\(/g) || []).toHaveLength(1)
  })
})
