import fs from 'node:fs'
import { describe, expect, it } from 'vitest'

const workflow = fs.readFileSync('.github/workflows/metricool-connector-receipt.yml', 'utf8')

describe('Metricool connector receipt workflow contract', () => {
  it('binds ingestion to the exact reserved source run and dispatch SHA', () => {
    expect(workflow).toContain("run-id: ${{ inputs.source_run_id }}")
    expect(workflow).toContain("test \"$(jq -r '.workflowRunId' \"$ENVELOPE\")\" = '${{ inputs.source_run_id }}'")
    expect(workflow).toContain('ref: ${{ steps.dispatch.outputs.dispatch_sha }}')
    expect(workflow).toContain('recordMetricoolConnectorScheduledReceipt')
  })

  it('preserves the downloaded source envelope outside checkout-cleaned workspace', () => {
    expect(workflow).toContain('PRESERVED="$RUNNER_TEMP/metricool-connector-envelope.json"')
    expect(workflow).toContain('cp "$ENVELOPE" "$PRESERVED"')
    expect(workflow).toContain('echo "envelope=$PRESERVED" >> "$GITHUB_OUTPUT"')
  })

  it('requires confirmed provider identity and keeps ingestion evidence durable', () => {
    expect(workflow).toContain('external_id:')
    expect(workflow).toContain('required: true')
    expect(workflow).toContain("schemaVersion: 'metricool-connector-provider-receipt-v1'")
    expect(workflow).toContain("name: metricool-connector-ingestion-${{ inputs.source_run_id }}")
    expect(workflow).toContain('retention-days: 90')
  })

  it('does not receive provider credentials or perform a provider mutation', () => {
    expect(workflow).not.toContain('METRICOOL_TOKEN')
    expect(workflow).not.toContain('METRICOOL_USER_TOKEN')
    expect(workflow).not.toContain('scheduleMetricoolPublication')
  })
})
