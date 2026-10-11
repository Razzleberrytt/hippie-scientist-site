import { canRenderAffiliateLinks } from './affiliate'
import { isRestrictedIngredient } from './restricted-ingredients'
import { isBatch7SafetyHold } from './batch7-safety-holds'
import { getRevenueProductSet } from '@/config/revenue-products'

export function canRenderConfiguredRevenueProducts(
  configuredSlug: string,
  record?: Record<string, unknown> | null,
): boolean {
  if (!configuredSlug || isRestrictedIngredient(configuredSlug) || isBatch7SafetyHold(configuredSlug)) return false
  // Resolve every configured alias using the canonical catalog mapping before
  // checking a precautionary hold. This prevents newly added aliases from
  // exposing a held ingredient even when callers provide no runtime record.
  const resolvedSet = getRevenueProductSet(configuredSlug)
  if (resolvedSet && isBatch7SafetyHold(resolvedSet.slug)) return false
  if (!record) return true
  return canRenderAffiliateLinks(record)
}
