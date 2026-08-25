import { canRenderAffiliateLinks } from './affiliate'
import { isRestrictedIngredient } from './restricted-ingredients'

export function canRenderConfiguredRevenueProducts(
  configuredSlug: string,
  record?: Record<string, unknown> | null,
): boolean {
  if (!configuredSlug || isRestrictedIngredient(configuredSlug)) return false
  if (!record) return true
  return canRenderAffiliateLinks(record)
}
