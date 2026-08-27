import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { requiredWorkflowsFor } from './autonomous-merge-controller.mjs'

describe('changed-file workflow reachability', () => {
  it('keeps lib runtime changes behind both site and production-content gates', () => {
    expect(requiredWorkflowsFor('medium', ['lib/analytics.ts'])).toEqual([
      'Atomic upgrade gate',
      'Build quality regression',
      'Site Health Check',
      'Production Content Lint',
    ])
  })

  it('requires Research Distribution for distribution schemas and docs', () => {
    for (const changedFile of [
      'schemas/distribution-pack-v1.schema.json',
      'schemas/distribution/example.schema.json',
      'docs/distribution-engine.md',
    ]) {
      expect(requiredWorkflowsFor('medium', [changedFile]), changedFile).toContain('Research Distribution')
    }
  })

  it('ensures every controller-required distribution surface can trigger Research Distribution', () => {
    const workflow = fs.readFileSync(path.join(process.cwd(), '.github/workflows/research-distribution.yml'), 'utf8')
    expect(workflow).toContain("- 'scripts/distribution/**'")
    expect(workflow).toContain("- 'schemas/distribution*'")
    expect(workflow).toContain("- 'schemas/distribution/**'")
    expect(workflow).toContain("- 'docs/distribution-engine.md'")
  })
})
