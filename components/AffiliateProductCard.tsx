'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { isOptimizableRemoteImage } from '../src/lib/image-hosts'
import {
  getOutboundLinkRel,
  inferPlatformRegionFromLocale,
  resolveRegionalUrl,
  resolveRetailerLinks,
  type RegionalUrlMap,
  type RetailerLink,
} from '../src/lib/platforms'
import { trackRevenueEvent } from '../src/lib/revenue-tracking'
import { affiliateRationaleForDisplay } from '../src/lib/affiliate-copy'
import { evaluateProductLifecycle, type ProductLifecycleMetadata } from '../src/lib/product-lifecycle'

export type AffiliateProduct = {
  asin?: string
  title?: string
  name?: string
  brand?: string
  price?: string
  rating?: number
  imageUrl?: string
  image?: string
  rationale?: string
  notes?: string
  ctaLabel?: string
  affiliateUrl?: string
  url?: string
  link?: string
  regionalUrls?: RegionalUrlMap
  retailerLinks?: RetailerLink[]
  preferredRegion?: string | null
  trackingLocation?: string
  trackingProductSlug?: string
  trackingSlot?: string
  selectionCriteria?: string[]
  lifecycle?: ProductLifecycleMetadata
}

type AffiliateProductCardProps = {
  product: AffiliateProduct
  compact?: boolean
}

export default function AffiliateProductCard({ product, compact = false }: AffiliateProductCardProps) {
  const [browserRegion, setBrowserRegion] = useState<string | null>(product.preferredRegion ?? null)

  useEffect(() => {
    if (product.preferredRegion) return
    setBrowserRegion(inferPlatformRegionFromLocale(navigator.language))
  }, [product.preferredRegion])

  const title = product.title || product.name || 'Supplement option'
  const imageUrl = product.imageUrl || product.image
  const rationale = affiliateRationaleForDisplay(title, product.rationale || product.notes)
  const rawUrl = product.affiliateUrl || product.url || product.link
  const resolvedUrl = rawUrl
    ? resolveRegionalUrl({ defaultUrl: rawUrl, regionalUrls: product.regionalUrls, preferredRegion: browserRegion })
    : ''
  const lifecycle = product.lifecycle ? evaluateProductLifecycle(product.lifecycle) : null
  const lifecycleBlocked = lifecycle?.action === 'block'
  const isValidUrl = !lifecycleBlocked && typeof resolvedUrl === 'string' && /^https?:\/\//i.test(resolvedUrl)
  const affiliateUrl = isValidUrl ? resolvedUrl : ''
  const ctaLabel = product.ctaLabel || 'View product details'
  const trackingLocation = product.trackingLocation || 'recommendation-section'
  const retailerLinks = resolveRetailerLinks(product.retailerLinks, browserRegion)

  return (
    <article className={`flex h-full flex-col overflow-hidden rounded-2xl border border-brand-900/10 bg-white/80 shadow-sm dark:border-white/10 dark:bg-white/5 ${compact ? 'p-4' : 'p-5'}`}>
      {imageUrl && isOptimizableRemoteImage(imageUrl) ? (
        <div className='mb-4 aspect-[4/3] overflow-hidden rounded-xl border border-brand-900/10 bg-brand-50 p-3 dark:border-white/10 dark:bg-white/5'>
          <Image src={imageUrl} alt={title} width={400} height={300} sizes="(max-width: 767px) 272px, (max-width: 1024px) 33vw, 320px" quality={78} decoding="async" className="h-full w-full object-contain" />
        </div>
      ) : null}

      <div className='flex flex-1 flex-col'>
        <div>
          {product.brand ? <p className='text-xs font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-200'>{product.brand}</p> : null}
          <h3 className='mt-2 text-base font-semibold leading-6 text-ink'>{title}</h3>
          <p className='mt-3 text-sm leading-6 text-muted'>{rationale}</p>
        </div>

        {(product.price || product.rating) ? <p className='mt-4 text-xs font-semibold text-muted'>{[product.price, product.rating ? `${product.rating.toFixed(1)} rating` : ''].filter(Boolean).join(' / ')}</p> : null}

        {product.selectionCriteria?.length ? (
          <div className='mt-4 rounded-xl border border-brand-900/10 bg-brand-50/50 p-3'>
            <p className='text-[10px] font-bold uppercase tracking-wider text-muted'>Selection criteria</p>
            <ul className='mt-2 space-y-1 text-xs leading-5 text-muted'>{product.selectionCriteria.slice(0, 4).map((criterion) => <li key={criterion}>• {criterion}</li>)}</ul>
          </div>
        ) : null}

        {lifecycle?.action === 'review' ? <p className='mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900'>Product verification needs refresh: {lifecycle.reasons.join(' ')}</p> : null}
        {lifecycleBlocked ? <p className='mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-900'>Recommendation suppressed: {lifecycle?.reasons.join(' ')}</p> : null}

        {isValidUrl ? (
          <a
            href={affiliateUrl}
            target='_blank'
            rel={getOutboundLinkRel(true)}
            aria-label={`${ctaLabel} for ${title} (opens in a new tab)`}
            data-revenue-tracked="true"
            data-ingredient={product.trackingProductSlug || undefined}
            data-product-slot={product.trackingSlot || undefined}
            data-product-asin={product.asin || undefined}
            data-tracking-location={trackingLocation}
            data-retailer={(() => { try { return new URL(affiliateUrl).hostname.replace(/^www\./, '') } catch { return '' } })()}
            onClick={() => trackRevenueEvent({
              kind: 'recommendation_click',
              location: trackingLocation,
              label: title,
              target: affiliateUrl,
              productSlug: product.trackingProductSlug,
              productSlot: product.trackingSlot,
              productAsin: product.asin,
            })}
            className='mt-5 inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full bg-brand-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 motion-safe:hover:-translate-y-0.5 hover:bg-brand-900 hover:shadow-md active:translate-y-0 dark:bg-brand-200 dark:text-brand-950 dark:hover:bg-brand-100'
          >
            {ctaLabel} <span aria-hidden="true">→</span>
          </a>
        ) : (
          <span className='mt-5 inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center rounded-full border border-brand-900/10 bg-brand-50 px-4 py-2.5 text-sm font-bold text-muted dark:border-white/10 dark:bg-white/5'>
            {lifecycleBlocked ? 'Product recommendation paused' : 'Product unavailable'}
          </span>
        )}

        {retailerLinks.length ? (
          <div className='mt-3 flex flex-wrap gap-2' aria-label={`Other retailers for ${title}`}>
            {retailerLinks.slice(0, 3).map((retailer) => (
              <a
                key={`${retailer.retailer}:${retailer.resolvedUrl}`}
                href={retailer.resolvedUrl}
                target='_blank'
                rel={getOutboundLinkRel(true)}
                data-revenue-tracked='true'
                data-ingredient={product.trackingProductSlug || undefined}
                data-tracking-location={`${trackingLocation}-retailer-diversification`}
                data-retailer={retailer.retailer}
                onClick={() => trackRevenueEvent({ kind: 'affiliate_click', location: `${trackingLocation}-retailer-diversification`, label: `${title} — ${retailer.retailer}`, target: retailer.resolvedUrl, productSlug: product.trackingProductSlug, retailer: retailer.retailer })}
                className='inline-flex min-h-11 items-center rounded-full border border-brand-900/10 px-3 py-2 text-xs font-semibold text-brand-800 transition hover:bg-brand-50 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40 dark:border-white/10 dark:text-brand-200 dark:hover:bg-white/5 dark:hover:text-brand-100'
              >
                {retailer.label || retailer.retailer}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  )
}
