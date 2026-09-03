import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const workflow = readFileSync('.github/workflows/enforce-main-protection.yml', 'utf8')

describe('main protection enforcer contract', () => {
  it('never grants the ordinary GITHUB_TOKEN administrative write permission', () => {
    expect(workflow).toContain('permissions:\n  contents: read')
    expect(workflow).not.toMatch(/administration:\s*write/)
    expect(workflow).not.toMatch(/contents:\s*write/)
  })

  it('requires an explicit owner dispatch and dedicated admin secret', () => {
    expect(workflow).toContain('github.actor == github.repository_owner')
    expect(workflow).toContain('secrets.REPO_ADMIN_TOKEN')
    expect(workflow).toContain('PROTECT MAIN')
    expect(workflow).toContain('if [[ -z "${GH_TOKEN:-}" ]]')
  })

  it('enforces the documented universal required checks without scoped conditional checks', () => {
    for (const check of [
      'CI',
      'Site Health Check',
      'Atomic upgrade gate',
      'Production Content Lint',
      'Build quality regression',
    ]) {
      expect(workflow).toContain(`"${check}"`)
    }

    for (const scopedCheck of [
      'Build Check',
      'Lighthouse CI',
      'Schema and Media Governance',
      'Technical SEO Monitor',
      'Crawl Governance',
      'Enrichment Governor',
    ]) {
      expect(workflow).not.toContain(`"${scopedCheck}"`)
    }
  })

  it('requires pull requests and blocks destructive branch mutations', () => {
    expect(workflow).toContain('"required_pull_request_reviews"')
    expect(workflow).toContain('"allow_force_pushes": false')
    expect(workflow).toContain('"allow_deletions": false')
    expect(workflow).toContain('"enforce_admins": true')
  })

  it('verifies live GitHub state after applying protection', () => {
    expect(workflow).toContain('repos/$REPO/branches/main/protection')
    expect(workflow).toContain("jq -e '.protected == true'")
    expect(workflow).toContain("jq -e '.enforce_admins.enabled == true'")
    expect(workflow).toContain("jq -e '.required_pull_request_reviews != null'")
  })
})
