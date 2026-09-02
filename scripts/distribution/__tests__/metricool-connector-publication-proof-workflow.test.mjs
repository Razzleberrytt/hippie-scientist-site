import fs from 'node:fs'
import { describe, expect, it } from 'vitest'

const workflow = fs.readFileSync('.github/workflows/metricool-connector-publication-proof.yml', 'utf8')

describe('Metricool connector publication-proof workflow contract', () => {
  it('binds publication proof to durable scheduled evidence and the original dispatch SHA', () => {
    expect(workflow).toContain('run-id: ${{ inputs.source_receipt_run_id }}')
    expect(workflow).toContain("test \"$(jq -r '.lifecycle.state' \"$INGESTION\")\" = 'scheduled'")
    expect(workflow).toContain("test \"$(jq -r '.lifecycle.dryRun' \"$INGESTION\")\" = 'false'")
    expect(workflow).toContain('ref: ${{ steps.scheduled.outputs.dispatch_sha }}')
  })

  it('keeps current proof tooling separate from historical source regeneration', () => {
    expect(workflow).toContain('ref: ${{ github.sha }}')
    expect(workflow).toContain('path: tools')
    expect(workflow).toContain('path: source')
    expect(workflow).toContain("from './tools/scripts/distribution/metricool-connector-publication-proof.mjs'")
    expect(workflow).toContain("source/artifacts/distribution/opportunity-selection.json")
  })

  it('persists publication evidence for downstream measurement without provider credentials', () => {
    expect(workflow).toContain('metricool-connector-publication-${{ inputs.source_receipt_run_id }}')
    expect(workflow).not.toContain('METRICOOL_USER_TOKEN')
    expect(workflow).not.toContain('Authorization:')
  })
})
