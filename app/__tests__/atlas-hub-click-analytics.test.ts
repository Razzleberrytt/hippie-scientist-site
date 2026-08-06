import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8')

describe('atlas hub click analytics', () => {
  const calloutSource = readSource('components/guides/AtlasComparisonCallout.tsx')
  const routerSource = readSource('components/guides/DecisionRouter.tsx')

  it('records a dedicated atlas callout event with source, target, and destination', () => {
    expect(calloutSource).toContain("event: 'atlas_callout_click'")
    expect(calloutSource).toContain('atlas_source: source')
    expect(calloutSource).toContain('atlas_target: target')
    expect(calloutSource).toContain('atlas_destination: destination')
    expect(calloutSource).toContain("gtag?.('event', 'atlas_callout_click'")
  })

  it('tracks primary and secondary actions separately', () => {
    expect(calloutSource).toContain("target: 'primary'")
    expect(calloutSource).toContain("target: 'secondary'")
    expect(calloutSource).toContain('data-atlas-target="primary"')
    expect(calloutSource).toContain('data-atlas-target="secondary"')
  })

  it('labels the three major guide hubs independently', () => {
    expect(routerSource).toContain("trackingSource: 'anxiety_hub'")
    expect(routerSource).toContain("trackingSource: 'sleep_hub'")
    expect(routerSource).toContain("trackingSource: 'focus_hub'")
  })
})
