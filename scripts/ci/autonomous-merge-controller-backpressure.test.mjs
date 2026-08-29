import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const workflowPath = path.join(process.cwd(), '.github/workflows/autonomous-merge-controller.yml')
const controllerPath = path.join(process.cwd(), 'scripts/ci/autonomous-merge-controller.mjs')

describe('autonomous merge controller backpressure contract', () => {
  it('bounds pull-request monitor runner residency', () => {
    const workflow = fs.readFileSync(workflowPath, 'utf8')
    const monitorBlock = workflow.split('\n  merge-commit:')[0]

    expect(monitorBlock).toMatch(/timeout-minutes:\s*5\b/)
    expect(monitorBlock).toMatch(/MERGE_MAX_WAIT_MINUTES:\s*'1'/)
    expect(monitorBlock).toMatch(/MERGE_POLL_SECONDS:\s*'30'/)
    expect(monitorBlock).not.toMatch(/MERGE_MAX_WAIT_MINUTES:\s*'165'/)
  })

  it('retains a serialized scheduled fallback owner', () => {
    const workflow = fs.readFileSync(workflowPath, 'utf8')
    const controller = fs.readFileSync(controllerPath, 'utf8')

    expect(workflow).toMatch(/cron:\s*'\*\/10 \* \* \* \*'/)
    expect(workflow).toMatch(/group:\s*autonomous-merge-commit/)
    expect(workflow).toMatch(/SWEEP_OPEN_PRS:\s*'true'/)
    expect(controller).toMatch(/if \(verdict\.action === 'merge'\) \{[\s\S]*?break\n\s*\}/)
    expect(controller).toMatch(/if \(verdict\.action === 'refresh'\) break/)
  })
})
