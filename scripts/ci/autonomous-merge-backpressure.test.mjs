import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const monitorPath = path.join(root, 'scripts/ci/autonomous-merge-monitor.mjs')
const controllerPath = path.join(root, 'scripts/ci/autonomous-merge-controller.mjs')
const workflowPath = path.join(root, '.github/workflows/autonomous-merge-controller.yml')

const monitor = fs.readFileSync(monitorPath, 'utf8')
const controller = fs.readFileSync(controllerPath, 'utf8')
const workflow = fs.readFileSync(workflowPath, 'utf8')
const monitorJob = workflow.match(/  merge-controller:\n([\s\S]*?)\n  merge-commit:/u)?.[1] || ''
const fallbackJob = workflow.match(/  fallback-sweep:\n([\s\S]*)$/u)?.[1] || ''

describe('autonomous merge backpressure contract', () => {
  it('keeps the per-PR monitor single-shot and read-only', () => {
    expect(monitor).toContain("method: 'GET'")
    expect(monitor).not.toContain('/update-branch')
    expect(monitor).not.toContain('/dispatches')
    expect(monitor).not.toMatch(/method:\s*['\"](?:POST|PUT|PATCH|DELETE)['\"]/u)
    expect(monitor).toContain('base drift is owned by the serialized fallback sweep')
    expect(monitor).not.toContain('while (')
  })

  it('does not reserve a runner for the historical 165-minute polling window', () => {
    expect(monitorJob).toContain('timeout-minutes: 5')
    expect(monitorJob).toContain('node scripts/ci/autonomous-merge-monitor.mjs')
    expect(monitorJob).not.toContain('MERGE_MAX_WAIT_MINUTES')
    expect(monitorJob).not.toContain('MERGE_POLL_SECONDS')
  })

  it('restricts per-PR monitor permissions to reads', () => {
    expect(monitorJob).toContain('actions: read')
    expect(monitorJob).toContain('checks: read')
    expect(monitorJob).toContain('contents: read')
    expect(monitorJob).toContain('pull-requests: read')
    expect(monitorJob).not.toContain('actions: write')
    expect(monitorJob).not.toContain('contents: write')
    expect(monitorJob).not.toContain('pull-requests: write')
  })

  it('retains serialized write-capable fallback and merge-time base revalidation', () => {
    expect(fallbackJob).toContain("SWEEP_OPEN_PRS: 'true'")
    expect(fallbackJob).toContain('node scripts/ci/autonomous-merge-controller.mjs')
    expect(workflow).toContain('group: autonomous-merge-commit')
    expect(controller).toMatch(/async function mergeIfStillCurrent[\s\S]*refreshPrAndDispatch/u)
    expect(controller).toMatch(/async function fallbackSweep[\s\S]*evaluateOnce/u)
  })

  it('does not weaken readiness gates in the canonical controller', () => {
    expect(controller).toContain("const CORE_REQUIRED_CHECKS = ['Validation, tests, and data']")
    expect(controller).toContain("'Atomic upgrade gate'")
    expect(controller).toContain("'Build quality regression'")
    expect(controller).toContain("'Site Health Check'")
    expect(controller).toContain("'Production Content Lint'")
  })
})
