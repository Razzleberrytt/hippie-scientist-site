import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const workflows = [
  '.github/workflows/check.yml',
  '.github/workflows/fast-ui-check.yml',
  '.github/workflows/atomic-upgrade-gate.yml',
  '.github/workflows/schema-media-governance.yml',
  '.github/workflows/related-botanicals-audit.yml',
  '.github/workflows/ai-entity-enrichment-check.yml',
  '.github/workflows/botanical-atlas-coverage.yml',
  '.github/workflows/research-distribution.yml',
  '.github/workflows/backlog-integrity.yml',
  '.github/workflows/experience-backlog-contract.yml',
  '.github/workflows/enrichment-governor.yml',
]

const concurrencyContract = /\nconcurrency:\s*\n\s+group:\s*\$\{\{\s*github\.workflow\s*\}\}-\$\{\{\s*github\.ref\s*\}\}\s*\n\s+cancel-in-progress:\s*true\b/

describe('high-frequency workflow concurrency', () => {
  it.each(workflows)('%s cancels stale runs only within the same workflow/ref', (workflow) => {
    const yaml = fs.readFileSync(path.join(process.cwd(), workflow), 'utf8')
    expect(yaml).toMatch(concurrencyContract)
  })
})
