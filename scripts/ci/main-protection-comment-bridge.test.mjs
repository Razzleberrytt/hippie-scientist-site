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
    expect(workflow).toContain("github.event.issue.pull_request == null")
    expect(workflow).toContain("github.event.comment.body == '/protect-main PROTECT MAIN'")
  })

  it('accepts direct repository-owner authority', () => {
    expect(workflow).toContain('github.actor == github.repository_owner')
  })

  it('accepts the trusted connector only when GitHub attributes the comment to the repository owner', () => {
    expect(workflow).toContain("github.actor == 'chatgpt-codex-connector[bot]'")
    expect(workflow).toContain('github.event.comment.user.login == github.repository_owner')
    expect(workflow).toContain("github.event.comment.author_association == 'OWNER'")
    expect(workflow).toContain("github.event.comment.performed_via_github_app.slug == 'chatgpt-codex-connector'")
    expect(workflow).toContain('COMMENT_USER: ${{ github.event.comment.user.login }}')
    expect(workflow).toContain('COMMENT_ASSOCIATION: ${{ github.event.comment.author_association }}')
    expect(workflow).toContain('COMMENT_APP: ${{ github.event.comment.performed_via_github_app.slug }}')
  })

  it('keeps the existing admin-token authority and live verification', () => {
    expect(workflow).toContain('secrets.REPO_ADMIN_TOKEN')
    expect(workflow).toContain('repos/$REPO/branches/main/protection')
    expect(workflow).toContain("jq -e '.protected == true'")
  })
})
