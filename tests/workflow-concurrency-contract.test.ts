import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const WORKFLOWS = [
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

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('covered workflow concurrency contract', () => {
  it.each(WORKFLOWS)('%s cancels stale runs for the same workflow/ref', (relativePath) => {
    const source = read(relativePath)

    expect(source).toContain('concurrency:')
    expect(source.match(/group: \$\{\{ github\.workflow \}\}-\$\{\{ github\.ref \}\}/g)).toHaveLength(1)
    expect(source.match(/cancel-in-progress:\s*true/g)).toHaveLength(1)
    expect(source).not.toContain('cancel-in-progress: false')
  })
})
