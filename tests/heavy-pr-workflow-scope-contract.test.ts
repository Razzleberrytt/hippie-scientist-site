import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

const PRODUCTION_INPUTS = [
  "- 'app/**'",
  "- 'components/**'",
  "- 'src/**'",
  "- 'lib/**'",
  "- 'public/**'",
  "- 'data/**'",
  "- 'scripts/**'",
  "- 'styles/**'",
  "- 'package.json'",
  "- 'package-lock.json'",
  "- 'next.config.*'",
  "- 'tsconfig*.json'",
]

describe('heavy pull-request workflow path scopes', () => {
  it('keeps Build Check focused on production-build inputs', () => {
    const workflow = read('.github/workflows/build-check.yml')

    expect(workflow).toContain('pull_request:')
    expect(workflow).toContain('paths:')
    for (const input of PRODUCTION_INPUTS) expect(workflow).toContain(input)
    expect(workflow).toContain("- '.github/workflows/build-check.yml'")
    expect(workflow).not.toContain("- 'docs/**'")
    expect(workflow).not.toContain("- '.github/workflows/**'")
  })

  it('keeps Lighthouse focused on measurable site and accessibility inputs', () => {
    const workflow = read('.github/workflows/lighthouse.yml')

    expect(workflow).toContain('push:\n    branches: [main]\n  pull_request:')
    expect(workflow).toContain('paths:')
    for (const input of PRODUCTION_INPUTS) expect(workflow).toContain(input)
    expect(workflow).toContain("- 'tests/**'")
    expect(workflow).toContain("- '**/__tests__/**'")
    expect(workflow).toContain("- '.lighthouserc*.json'")
    expect(workflow).toContain("- '.github/workflows/lighthouse.yml'")
    expect(workflow).not.toContain("- 'docs/**'")
    expect(workflow).not.toContain("- '.github/workflows/**'")
  })
})
