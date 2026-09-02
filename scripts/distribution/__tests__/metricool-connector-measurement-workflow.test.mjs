import fs from 'node:fs'
import { describe, expect, it } from 'vitest'

const workflow = fs.readFileSync('.github/workflows/metricool-connector-measurement.yml', 'utf8')

describe('Metricool connector measurement workflow contract', () => {
  it('binds measurement to exact publication evidence and historical dispatch identity', () => {
    expect(workflow).toMatch(/source_publication_run_id:/)
    expect(workflow).toMatch(/metricool-connector-publication-\*/)
    expect(workflow).toMatch(/\.schemaVersion.*metricool-connector-publication-ingestion-v1/)
    expect(workflow).toMatch(/\.lifecycle\.state.*published/)
    expect(workflow).toMatch(/dispatch_sha=.*\.dispatchSha/)
    expect(workflow).toMatch(/Checkout trusted measurement tools/)
    expect(workflow).toMatch(/path: tools/)
    expect(workflow).toMatch(/Checkout exact historical dispatch source/)
    expect(workflow).toMatch(/path: source/)
    expect(workflow).toMatch(/ref: \$\{\{ steps\.published\.outputs\.dispatch_sha \}\}/)
  })

  it('accepts one provider snapshot payload instead of manually transcribed metric fields', () => {
    expect(workflow).toMatch(/provider_snapshot_json:[\s\S]*?required: true/)
    expect(workflow).toMatch(/PROVIDER_SNAPSHOT_JSON: \$\{\{ inputs\.provider_snapshot_json \}\}/)
    expect(workflow).toMatch(/normalizeMetricoolProviderMeasurementSnapshot/)
    for (const retiredInput of ['asset_views:', 'qualified_visits:', 'completion_rate:', 'save_rate:', 'observed_from:', 'observed_to:', 'captured_at:']) {
      expect(workflow).not.toContain(retiredInput)
    }
    expect(workflow).toMatch(/Missing metrics are never inferred as zero/)
  })

  it('uses current trusted ingestion code against regenerated historical source state', () => {
    expect(workflow).toMatch(/recordMetricoolConnectorMeasuredObservation.*tools\/scripts\/distribution\/metricool-connector-measurement\.mjs/)
    expect(workflow).toMatch(/metricool-provider-measurement-snapshot\.mjs/)
    expect(workflow).toMatch(/working-directory: source[\s\S]*build-research-distribution\.mjs/)
    expect(workflow).toMatch(/opportunity-selection\.json/)
    expect(workflow).toMatch(/bounded-pilot\.json/)
    expect(workflow).toMatch(/identity\.fingerprint !== publicationEvidence\.identityFingerprint/)
  })
})
