import { useEffect } from 'react'
import { appendAnalyticsEvent } from '@/utils/analytics/eventStorage'
import type { CuratedProductEntityType } from '@/data/curatedProducts'
import { trackAffiliateLinkClick, type AffiliateUseCaseAnchor } from '@/lib/affiliateClickTracking'
import type { RenderableCuratedProduct } from '@/lib/curatedProducts'

type CuratedProductModuleProps = {
  entityType: CuratedProductEntityType
  entitySlug: string
  products: RenderableCuratedProduct[]
  positionContext: string
  pageType?: 'herb_detail' | 'compound_detail' | 'collection_page'
  variantId?: string
  ctaPosition?: string
  preDisclosureGuidance?: string
  useCaseAnchor?: AffiliateUseCaseAnchor
}

function trackProductImpression(params: {
  entityType: CuratedProductEntityType
  entitySlug: string
  productId: string
  positionContext: string
  pageType?: string
  variantId?: string
  ctaPosition?: string
}) {
  appendAnalyticsEvent({
    type: 'curated_product_impression',
    slug: `${params.entityType}:${params.entitySlug}`,
    item: params.productId,
    context: params.positionContext,
    sourceType: 'detail',
    targetType: 'product',
    pageType: params.pageType,
    entitySlug: params.entitySlug,
    ctaType: 'affiliate',
    ctaPosition: params.ctaPosition,
    variantId: params.variantId,
  })
}

function trackProductClick(params: {
  entityType: CuratedProductEntityType
  entitySlug: string
  productId: string
  positionContext: string
  useCaseAnchor?: AffiliateUseCaseAnchor
  pageType?: string
  variantId?: string
  ctaPosition?: string
}) {
  appendAnalyticsEvent({
    type: 'curated_product_click',
    slug: `${params.entityType}:${params.entitySlug}`,
    item: params.productId,
    context: params.positionContext,
    sourceType: 'detail',
    targetType: 'product',
    pageType: params.pageType,
    entitySlug: params.entitySlug,
    useCaseAnchor: params.useCaseAnchor,
    ctaType: 'affiliate',
    ctaPosition: params.ctaPosition,
    variantId: params.variantId,
  })
}

export default function CuratedProductModule({
  entityType,
  entitySlug,
  products,
  positionContext,
  pageType,
  variantId,
  ctaPosition,
  preDisclosureGuidance,
  useCaseAnchor,
}: CuratedProductModuleProps) {
  const hasVisibleAffiliateProduct = products.some(product => {
    const affiliateUrl = product.affiliateUrl.trim()
    if (!affiliateUrl) return false

    try {
      const parsed = new URL(affiliateUrl)
      return parsed.searchParams.has('tag')
    } catch {
      return false
    }
  })

  useEffect(() => {
    products.forEach(product => {
      trackProductImpression({
        entityType,
        entitySlug,
        productId: product.productId,
        positionContext,
        pageType,
        variantId,
        ctaPosition,
      })
    })
  }, [ctaPosition, entitySlug, entityType, pageType, positionContext, products, variantId])

  if (!products.length) return null

  return (
    <section className='rounded-xl border border-white/10 bg-white/[0.03] p-3'>
      {preDisclosureGuidance && (
        <p className='text-xs leading-relaxed text-white/75'>{preDisclosureGuidance}</p>
      )}
      {hasVisibleAffiliateProduct && (
        <p className='mt-1 text-xs leading-relaxed text-white/65'>
          As an Amazon Associate, this site may earn from qualifying purchases.
        </p>
      )}

      <div className='mt-3 space-y-3'>
        <p className='text-[11px] uppercase tracking-[0.12em] text-white/50'>Compare forms</p>
        {products.map((product, index) => (
          <article
            key={`${entityType}-${entitySlug}-${product.productId}`}
            className='rounded-lg border border-white/15 bg-white/[0.02] p-3'
          >
            <div className='flex flex-wrap items-start justify-between gap-2'>
              <p className='text-sm font-semibold text-white'>{product.productTitle}</p>
              <p className='rounded-full border border-emerald-200/20 bg-emerald-200/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-emerald-100/90'>
                Best for: {product.bestFor[0]}
              </p>
            </div>
            <p className='mt-1 text-xs text-white/70'>Brand: {product.brand}</p>
            <p className='mt-1 text-xs text-white/65'>Form: {product.productType}</p>
            {product.formNotes && <p className='mt-1 text-xs text-white/65'>{product.formNotes}</p>}
            <p className='mt-2 text-xs text-emerald-100/90'>Why this product was chosen</p>
            <p className='mt-1 text-xs text-white/75'>{product.rationaleShort}</p>
            <p className='mt-2 text-xs text-white/65'>{product.rationaleLong}</p>

            {product.cautionNotes.length > 0 && (
              <div className='mt-2 rounded-lg border border-rose-300/30 bg-rose-500/10 p-2'>
                <p className='text-xs font-medium text-rose-100'>Caution notes</p>
                <ul className='mt-1 list-disc space-y-1 pl-4 text-xs text-rose-100/90'>
                  {product.cautionNotes.map(item => (
                    <li key={`${product.productId}-caution-${item}`}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {product.avoidIf.length > 0 && (
              <p className='mt-2 text-xs text-amber-100/85'>
                <span className='font-medium text-amber-100'>Avoid if:</span>{' '}
                {product.avoidIf.join(' · ')}
              </p>
            )}

            <div className='mt-2'>
              <p className='text-xs font-medium text-white/80'>Who it may fit</p>
              <ul className='mt-1 list-disc space-y-1 pl-4 text-xs text-white/70'>
                {product.bestFor.map(item => (
                  <li key={`${product.productId}-fit-${item}`}>{item}</li>
                ))}
              </ul>
            </div>

            <p className='mt-2 text-[11px] text-white/50'>
              Reviewed by {product.reviewedBy} on {product.reviewedAt}
            </p>

            <a
              href={product.affiliateUrl}
              target='_blank'
              rel='noreferrer nofollow sponsored'
              className='btn-secondary mt-2 inline-flex text-xs'
              onClick={() => {
                trackProductClick({
                  entityType,
                  entitySlug,
                  productId: product.productId,
                  positionContext,
                  useCaseAnchor,
                  pageType,
                  variantId,
                  ctaPosition,
                })
                if (entityType === 'herb') {
                  trackAffiliateLinkClick({
                    herbSlug: entitySlug,
                    productId: product.productId,
                    position: index === 0 ? 'primary' : 'alternative',
                    useCaseAnchor,
                    source: 'curated_product_module',
                  })
                }
              }}
            >
              Review product fit & disclosure
            </a>
          </article>
        ))}
      </div>
    </section>
  )
}
