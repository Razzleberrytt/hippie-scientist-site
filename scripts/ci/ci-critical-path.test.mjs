import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const workflowPath = path.join(process.cwd(), '.github', 'workflows', 'ci.yml')
const workflow = fs.readFileSync(workflowPath, 'utf8')

describe('CI critical path', () => {
  it('keeps validation and build as the only runner-backed CI jobs', () => {
    expect(workflow).toContain('\n  validation:\n')
    expect(workflow).toContain('\n  build-verification:\n')
    expect(workflow).not.toContain('\n  quality-gate:\n')
  })

  it('does not reintroduce a runner-backed aggregate job after the parallel lanes', () => {
    expect(workflow).not.toMatch(/needs:\s*\[validation, build-verification\][\s\S]{0,200}runs-on:/)
  })
})
