import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('production deployment handoff contract', () => {
  it('cancels stale Site Health PR heads but preserves the active main validation', () => {
    const workflow = read('.github/workflows/check.yml')

    expect(workflow).toContain("cancel-in-progress: ${{ github.event_name == 'pull_request' }}")
    expect(workflow).toContain('push:')
    expect(workflow).toContain('branches: [ main ]')
    expect(workflow).toContain('run: npm run check:full')
  })

  it('deploys only after successful push-triggered Site Health validation', () => {
    const workflow = read('.github/workflows/deploy.yml')

    expect(workflow).toContain('- Site Health Check')
    expect(workflow).not.toMatch(/workflows:\s*[\s\S]{0,80}?- CI\b/)
    expect(workflow).toContain("github.event.workflow_run.conclusion == 'success'")
    expect(workflow).toContain("github.event.workflow_run.event == 'push'")
    expect(workflow).toContain('branches:')
    expect(workflow).toContain('- main')
  })

  it('lets the active production deploy finish instead of canceling it for a newer head', () => {
    const workflow = read('.github/workflows/deploy.yml')

    expect(workflow).toContain('concurrency:')
    expect(workflow).toContain('group: deploy-${{ github.event.workflow_run.head_branch || github.ref }}')
    expect(workflow).toContain('cancel-in-progress: false')
    expect(workflow).toContain('workflow_dispatch:')
  })
})
