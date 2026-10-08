import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { requiredWorkflowsFor } from './autonomous-merge-controller.mjs'

describe('changed-file workflow reachability', () => {
  it('keeps lib runtime changes behind site, production-content, and visual-proof gates', () => {
    expect(requiredWorkflowsFor('medium', ['lib/analytics.ts'])).toEqual([
      'CI',
      'Atomic upgrade gate',
      'Build quality regression',
      'Site Health Check',
      'Production Content Lint',
      'P0 Visual Proof',
    ])
  })

  it('requires Research rolling gate for research intake, coordination, and source-register changes', () => {
    for (const changedFile of [
      'scripts/research/github-reservation-controller.mjs',
      'ops/research-intake/lane-3-run.json',
      'ops/research-coordinator/reviews/batch-independent-review.json',
      'ops/enrichment-submissions/reconciliation/2026-10-08-enrichment-waves-8001-8500-final-manifest.json',
      'schemas/research-lane-intake.schema.json',
      'lib/research-source-register.ts',
      'app/research/source-register/page.tsx',
    ]) {
      expect(requiredWorkflowsFor('high', [changedFile]), changedFile).toContain('Research rolling gate')
    }
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
