import type { RecommendationSlot } from '@/components/RecommendationSection'
import type { RegionalUrlMap } from '../src/lib/platforms'

type RegionalRevenueProductKeyInput = {
  setSlug: string
  slot: RecommendationSlot
  title: string
}

export type RegionalRevenueProductOverride = {
  regionalUrls: RegionalUrlMap
  verifiedAt?: string
  notes?: string
}

export type RegionalRevenueProductOverrideMap = Record<string, RegionalRevenueProductOverride>

export const regionalRevenueProductOverrides = {} satisfies RegionalRevenueProductOverrideMap

export function normalizeRegionalRevenueProductTitle(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function makeRegionalRevenueProductKey({ setSlug, slot, title }: RegionalRevenueProductKeyInput) {
  return `${setSlug}:${slot}:${normalizeRegionalRevenueProductTitle(title)}`
}

export function getRegionalRevenueProductOverride(
  input: RegionalRevenueProductKeyInput,
  overrides: RegionalRevenueProductOverrideMap = regionalRevenueProductOverrides,
) {
  return overrides[makeRegionalRevenueProductKey(input)]
}

export function validateRegionalRevenueProductOverrides(
  overrides: RegionalRevenueProductOverrideMap = regionalRevenueProductOverrides,
) {
  const errors: string[] = []

  for (const [key, override] of Object.entries(overrides)) {
    if (!override.regionalUrls.US) {
      errors.push(`${key}: regional override must include an explicit US fallback URL`)
    }

    for (const [region, url] of Object.entries(override.regionalUrls)) {
      if (!url.startsWith('https://')) {
        errors.push(`${key}: ${region} URL must be absolute HTTPS`)
      }
    }
  }

  return errors
}
