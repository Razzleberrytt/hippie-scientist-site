import AffiliateDisclosure from './AffiliateDisclosure'
import AffiliateProductCard, { type AffiliateProduct } from './AffiliateProductCard'
import RevenueImpressionTracker from './RevenueImpressionTracker'
import WhyWeRecommend from '../src/components/monetization/WhyWeRecommend'
import HorizontalCardRail from './ui/HorizontalCardRail'
import { shouldSuppressProductRecommendation } from '../src/lib/product-lifecycle'
import { revenueProductSets } from '../config/revenue-products'
import { getCompounds, getHerbs } from '../src/lib/runtime-data'
import { canRenderConfiguredRevenueProducts } from '../src/lib/revenue-product-governance'

export type RecommendationSlot = 'budget' | 'overall' | 'premium'

export type RecommendationProduct = AffiliateProduct & {
  slot: RecommendationSlot
}

type RecommendationSectionProps = {
  title?: string
  description?: string
  products: RecommendationProduct[]
  preferredRegion?: string | null
  suppressMonetization?: boolean
  trackingProductSlug?: string
  trackingLocation?: string
}

const slotLabels: Record<RecommendationSlot, string> = {
  budget: 'Budget example',
  overall: 'Featured example',
  premium: 'Premium example',
}

const REVENUE_RUNTIME_SLUG_ALIASES: Record<string, string> = {
  'lions-mane': 'hericium-erinaceus',
}

function isUsableOutboundUrl(value: unknown): value is string {
  return typeof value === 'string' && /^https?:\/\//i.test(value.trim())
}

function hasUsableProductUrl(product: RecommendationProduct): boolean {
  if (product.lifecycle && shouldSuppressProductRecommendation(product.lifecycle)) return false
  if (isUsableOutboundUrl(product.affiliateUrl) || isUsableOutboundUrl(product.url) || isUsableOutboundUrl(product.link)) return true
  if (Object.values(product.regionalUrls ?? {}).some(isUsableOutboundUrl)) return true
  return product.retailerLinks?.some((retailer) => isUsableOutboundUrl(retailer.url) || Object.values(retailer.regionalUrls ?? {}).some(isUsableOutboundUrl)) ?? false
}

function configuredProductSetSlug(products: RecommendationProduct[]) {
  for (const [slug, productSet] of Object.entries(revenueProductSets)) {
    if (productSet.products === products) return slug
  }
  return null
}

async function canRenderRecommendationProducts(
  products: RecommendationProduct[],
  trackingProductSlug?: string,
) {
  const configuredSlug = configuredProductSetSlug(products) || trackingProductSlug
  if (!configuredSlug) return true

  // Restricted slugs fail closed before any runtime-data lookup. For configured
  // catalog sets, this also makes dormant legacy entries (for example kava)
  // impossible to surface through the shared renderer.
  if (!canRenderConfiguredRevenueProducts(configuredSlug)) return false

  const runtimeSlug = REVENUE_RUNTIME_SLUG_ALIASES[configuredSlug] || configuredSlug
  const [herbs, compounds] = await Promise.all([getHerbs(), getCompounds()])
  const record = [...herbs, ...compounds].find((item) => String(item.slug || '') === runtimeSlug)

  // When a catalog/guide slug maps to a live record, the same fail-closed
  // monetization policy used by SourcingCta owns the decision here too.
  return canRenderConfiguredRevenueProducts(configuredSlug, record || null)
}

export default async function RecommendationSection({
  title = 'Product sourcing examples',
  description = 'Use these as sourcing starting points, not medical recommendations. Product quality, dose, and fit still need review.',
  products,
  preferredRegion = null,
  suppressMonetization = false,
  trackingProductSlug,
  trackingLocation = 'recommendation-section',
}: RecommendationSectionProps) {
  if (suppressMonetization) return null
  if (!(await canRenderRecommendationProducts(products, trackingProductSlug))) return null

  const availableProducts = products.filter(hasUsableProductUrl)
  if (availableProducts.length === 0) return null

  const ordered = ['budget', 'overall', 'premium'].flatMap((slot) => availableProducts.filter((product) => product.slot === slot))

  return (
    <section className='card-premium p-4 sm:p-5'>
      <div className='max-w-3xl'>
        <p className='eyebrow-label'>Sourcing options</p>
        <h2 className='mt-1 text-lg font-semibold text-ink'>{title}</h2>
        <p className='mt-1 text-sm leading-6 text-muted'>{description}</p>
        <AffiliateDisclosure variant='compact' className='mt-2' />
      </div>

      <HorizontalCardRail label={`${title} options`}>
        {ordered.map((product) => {
          const productTitle = product.title || product.name || `${slotLabels[product.slot]} option`
          const productSlug = product.trackingProductSlug ?? trackingProductSlug
          const productLocation = product.trackingLocation ?? trackingLocation
          const selectionCriteria = product.selectionCriteria?.length
            ? product.selectionCriteria
            : product.rationale || product.notes
              ? [product.rationale || product.notes || '']
              : []

          return (
            <RevenueImpressionTracker
              key={`${product.slot}-${productTitle}`}
              className='flex h-full flex-col gap-2'
              location={productLocation}
              label={productTitle}
              productSlug={productSlug}
              productSlot={product.trackingSlot ?? product.slot}
              productAsin={product.asin}
            >
              <p className='text-xs font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-200'>{slotLabels[product.slot]}</p>
              <AffiliateProductCard
                product={{
                  ...product,
                  selectionCriteria,
                  preferredRegion: product.preferredRegion ?? preferredRegion,
                  trackingLocation: productLocation,
                  trackingProductSlug: productSlug,
                  trackingSlot: product.trackingSlot ?? product.slot,
                }}
                compact
              />
            </RevenueImpressionTracker>
          )
        })}
      </HorizontalCardRail>

      <WhyWeRecommend className='mt-4' />
    </section>
  )
}
