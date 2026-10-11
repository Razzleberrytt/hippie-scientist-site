import { canRenderAffiliateLinks } from './affiliate'
import { isRestrictedIngredient } from './restricted-ingredients'
import { isBatch7SafetyHold } from './batch7-safety-holds'

export function canRenderConfiguredRevenueProducts(
  configuredSlug: string,
  record?: Record<string, unknown> | null,
): boolean {
  if (!configuredSlug || isRestrictedIngredient(configuredSlug) || isBatch7SafetyHold(configuredSlug)) return false
  if (!record) return true
  return canRenderAffiliateLinks(record)
}
