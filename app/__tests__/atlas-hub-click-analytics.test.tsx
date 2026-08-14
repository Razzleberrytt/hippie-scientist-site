import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { CONSENT_STORAGE_KEY, type ConsentStatus } from '@/lib/consent'
import { AtlasComparisonCallout } from '@/components/guides/AtlasComparisonCallout'

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8')

function storeConsent(status: ConsentStatus) {
  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ status, ts: Date.now() }))
}

function readDataLayer(): Array<Record<string, unknown>> {
  return (window as Window & { dataLayer?: Array<Record<string, unknown>> }).dataLayer ?? []
}

function renderCallout() {
  render(
    <AtlasComparisonCallout
      title="Compare calming botanicals"
      description="See ashwagandha beside other calming herbs."
      href="/tools/botanical-activity-atlas/calming-botanicals/"
      cta="Compare calming botanicals"
      trackingSource="anxiety_hub"
    />,
  )
}

describe('atlas hub click analytics', () => {
  const calloutSource = readSource('components/guides/AtlasComparisonCallout.tsx')
  const routerSource = readSource('components/guides/DecisionRouter.tsx')

  beforeEach(() => {
    storeConsent('granted')
  })

  afterEach(() => {
    cleanup()
    window.localStorage.removeItem(CONSENT_STORAGE_KEY)
    delete (window as Window & { dataLayer?: unknown }).dataLayer
    delete (window as Window & { gtag?: unknown }).gtag
  })

  it('records a dedicated atlas callout event with source, target, and destination', () => {
    const gtag = vi.fn()
    ;(window as Window & { gtag?: unknown }).gtag = gtag
    renderCallout()

    fireEvent.click(screen.getByRole('link', { name: /Compare calming botanicals/ }))

    expect(readDataLayer()).toEqual([
      {
        event: 'atlas_callout_click',
        atlas_source: 'anxiety_hub',
        atlas_target: 'primary',
        atlas_destination: '/tools/botanical-activity-atlas/calming-botanicals/',
      },
    ])
    expect(gtag).toHaveBeenCalledWith('event', 'atlas_callout_click', {
      source: 'anxiety_hub',
      target: 'primary',
      destination: '/tools/botanical-activity-atlas/calming-botanicals/',
    })
  })

  it('emits nothing before the visitor grants analytics consent', () => {
    storeConsent('denied')
    const gtag = vi.fn()
    ;(window as Window & { gtag?: unknown }).gtag = gtag
    renderCallout()

    fireEvent.click(screen.getByRole('link', { name: /Compare calming botanicals/ }))
    fireEvent.click(screen.getByRole('link', { name: /Open the full atlas/ }))

    expect(readDataLayer()).toEqual([])
    expect(gtag).not.toHaveBeenCalled()
  })

  it('tracks primary and secondary actions separately', () => {
    const gtag = vi.fn()
    ;(window as Window & { gtag?: unknown }).gtag = gtag
    renderCallout()

    fireEvent.click(screen.getByRole('link', { name: /Open the full atlas/ }))

    expect(gtag).toHaveBeenCalledWith('event', 'atlas_callout_click', {
      source: 'anxiety_hub',
      target: 'secondary',
      destination: '/tools/botanical-activity-atlas/',
    })
    expect(calloutSource).toContain('data-atlas-target="primary"')
    expect(calloutSource).toContain('data-atlas-target="secondary"')
  })

  it('labels the three major guide hubs independently', () => {
    expect(routerSource).toContain("trackingSource: 'anxiety_hub'")
    expect(routerSource).toContain("trackingSource: 'sleep_hub'")
    expect(routerSource).toContain("trackingSource: 'focus_hub'")
  })
})
