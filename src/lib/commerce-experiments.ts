import type { RevenueRouteFamily } from '@/lib/revenue-tracking'

export type CommerceModuleDensity = 'single' | 'multiple'
export type CommercePlacement = 'top-commercial-section' | 'post-evidence'
export type CommerceCtaVariant = 'view-details' | 'compare-options'

export interface CommerceExperimentAssignments {
  moduleDensity: CommerceModuleDensity
  placement: CommercePlacement
  ctaVariant: CommerceCtaVariant
  experimentVariant: string
}

const SESSION_KEY = 'ths_commerce_experiments_v1'

const assignmentsFromSeed = (seed: number): CommerceExperimentAssignments => {
  const moduleDensity: CommerceModuleDensity = seed % 2 === 0 ? 'single' : 'multiple'
  const placement: CommercePlacement = Math.floor(seed / 2) % 2 === 0 ? 'top-commercial-section' : 'post-evidence'
  const ctaVariant: CommerceCtaVariant = Math.floor(seed / 4) % 2 === 0 ? 'view-details' : 'compare-options'
  return {
    moduleDensity,
    placement,
    ctaVariant,
    experimentVariant: `density:${moduleDensity}|placement:${placement}|cta:${ctaVariant}`,
  }
}

export function getCommerceExperimentAssignments(): CommerceExperimentAssignments {
  if (typeof window === 'undefined') return assignmentsFromSeed(0)
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY)
    if (existing) return JSON.parse(existing) as CommerceExperimentAssignments
    const seed = Math.floor(Math.random() * 100000)
    const assignments = assignmentsFromSeed(seed)
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(assignments))
    return assignments
  } catch {
    return assignmentsFromSeed(0)
  }
}

export function allowedCommercePlacement(routeFamily: RevenueRouteFamily, assigned: CommercePlacement): CommercePlacement {
  // Evidence-led and research routes never move affiliate modules ahead of evidence.
  if (routeFamily !== 'buy-guide') return 'post-evidence'
  return assigned
}

export function shouldShowCommerceForIntent(routeFamily: RevenueRouteFamily) {
  return routeFamily === 'comparison' || routeFamily === 'best-supplements' || routeFamily === 'buy-guide'
}

export function commerceCtaLabel(variant: CommerceCtaVariant) {
  return variant === 'compare-options' ? 'Compare current sourcing options' : 'View product details'
}
