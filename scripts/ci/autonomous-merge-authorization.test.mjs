import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('autonomous merge authorization provenance', () => {
  it('keeps the PR-event monitor read-only while write-capable controller jobs can emit status', () => {
    const workflow = read('.github/workflows/autonomous-merge-controller.yml')
    const monitorBlock = workflow.match(/ {2}merge-controller:\n([\s\S]*?)\n {2}merge-commit:/)?.[1] || ''

    expect(workflow).toContain('statuses: write')
    expect(monitorBlock).toContain('actions: read')
    expect(monitorBlock).toContain('checks: read')
    expect(monitorBlock).toContain('contents: read')
    expect(monitorBlock).toContain('pull-requests: read')
    expect(monitorBlock).not.toContain('statuses: write')
  })

  it('emits event-driven authorization only after serialized revalidation and a confirmed merge', () => {
    const workflow = read('.github/workflows/autonomous-merge-controller.yml')
    const revalidate = workflow.indexOf('- name: Revalidate current base and merge')
    const attest = workflow.indexOf('- name: Attest controller-authorized merge')

    expect(revalidate).toBeGreaterThan(-1)
    expect(attest).toBeGreaterThan(revalidate)
    expect(workflow).toContain('if [ "$merged" != "true" ]')
    expect(workflow).toContain("context='autonomous-merge/authorized'")
    expect(workflow).toContain('statuses/$EXPECTED_HEAD_SHA')
    expect(workflow).toContain('VALIDATED_BASE_SHA: ${{ needs.merge-controller.outputs.base_sha }}')
  })

  it('attests fallback merges only from the controller merge-success log and verifies GitHub merge identity', () => {
    const workflow = read('.github/workflows/autonomous-merge-controller.yml')
    const fallbackBlock = workflow.match(/ {2}fallback-sweep:\n([\s\S]*)$/)?.[1] || ''

    expect(fallbackBlock).toContain("grep -E '^Merged PR #[0-9]+ as [0-9a-f]{40}$'")
    expect(fallbackBlock).toContain("actual_merge_sha=\"$(gh api \"repos/$GITHUB_REPOSITORY/pulls/$pr_number\" --jq '.merge_commit_sha')\"")
    expect(fallbackBlock).toContain('if [ "$actual_merge_sha" != "$merge_sha" ]')
    expect(fallbackBlock).toContain('statuses/$head_sha')
    expect(fallbackBlock).toContain("context='autonomous-merge/authorized'")
  })

  it('does not add merge authorization capability to the read-only monitor implementation', () => {
    const monitor = read('scripts/ci/autonomous-merge-monitor.mjs')

    expect(monitor).not.toContain('autonomous-merge/authorized')
    expect(monitor).not.toContain('/statuses/')
    expect(monitor).not.toMatch(/method:\s*['"]POST['"]/)
  })
})
