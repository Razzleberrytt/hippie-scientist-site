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

  it('requires explicit platform metrics and never supplies silent zero defaults', () => {
    for (const input of ['asset_views', 'qualified_visits', 'completion_rate', 'save_rate']) {
      expect(workflow).toMatch(new RegExp(`${input}:[\\s\\S]*?required: true`))
    }
    expect(workflow).not.toMatch(/asset_views:[\s\S]*?default:\s*['"]?0/)
    expect(workflow).not.toMatch(/qualified_visits:[\s\S]*?default:\s*['"]?0/)
    expect(workflow).toMatch(/Missing metrics are never inferred as zero/)
  })

  it('uses current trusted ingestion code against regenerated historical source state', () => {
    expect(workflow).toMatch(/recordMetricoolConnectorMeasuredObservation.*tools\/scripts\/distribution\/metricool-connector-measurement\.mjs/)
    expect(workflow).toMatch(/working-directory: source[\s\S]*build-research-distribution\.mjs/)
    expect(workflow).toMatch(/opportunity-selection\.json/)
    expect(workflow).toMatch(/bounded-pilot\.json/)
    expect(workflow).toMatch(/identity\.fingerprint !== publicationEvidence\.identityFingerprint/)
  })
})
