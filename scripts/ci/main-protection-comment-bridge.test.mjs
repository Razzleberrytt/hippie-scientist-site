import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const workflow = fs.readFileSync(
  path.join(process.cwd(), '.github', 'workflows', 'enforce-main-protection.yml'),
  'utf8',
)

describe('main protection owner-only command bridge', () => {
  it('accepts only the exact owner issue command as the comment trigger', () => {
    expect(workflow).toContain('issue_comment:')
    expect(workflow).toContain("github.actor == github.repository_owner")
    expect(workflow).toContain("github.event.issue.pull_request == null")
    expect(workflow).toContain("github.event.comment.body == '/protect-main PROTECT MAIN'")
  })

  it('keeps the existing admin-token authority and live verification', () => {
    expect(workflow).toContain('secrets.REPO_ADMIN_TOKEN')
    expect(workflow).toContain('repos/$REPO/branches/main/protection')
    expect(workflow).toContain("jq -e '.protected == true'")
  })
})
