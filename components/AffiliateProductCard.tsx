'use client'

import Image from 'next/image'
import { isOptimizableRemoteImage } from '../src/lib/image-hosts'
import { getOutboundLinkRel, resolveRegionalUrl, type RegionalUrlMap } from '../src/lib/platforms'
import { trackRevenueEvent } from '../src/lib/revenue-tracking'

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
  preferredRegion?: string | null
  trackingLocation?: string
}

type AffiliateProductCardProps = {
  product: AffiliateProduct
  compact?: boolean
}

export default function AffiliateProductCard({ product, compact = false }: AffiliateProductCardProps) {
  const title = product.title || product.name || 'Supplement option'
  const imageUrl = product.imageUrl || product.image
  const rationale = product.rationale || product.notes || 'Review the label, dose, third-party testing, and safety context before buying.'
  const rawUrl = product.affiliateUrl || product.url || product.link
  const resolvedUrl = rawUrl
    ? resolveRegionalUrl({
        defaultUrl: rawUrl,
        regionalUrls: product.regionalUrls,
        preferredRegion: product.preferredRegion,
      })
    : ''
  const isValidUrl = typeof resolvedUrl === 'string' && (resolvedUrl.startsWith('http://') || resolvedUrl.startsWith('https://'))
  const affiliateUrl = isValidUrl ? resolvedUrl : ''
  const ctaLabel = product.ctaLabel || 'Check current price'

  return (
    <article className={`flex h-full flex-col overflow-hidden rounded-2xl border border-brand-900/10 bg-white/80 shadow-sm dark:border-white/10 dark:bg-white/5 ${compact ? 'p-4' : 'p-5'}`}>
      {imageUrl && isOptimizableRemoteImage(imageUrl) ? (
        <div className='mb-4 aspect-[4/3] overflow-hidden rounded-xl border border-brand-900/10 bg-brand-50 dark:border-white/10 dark:bg-white/5'>
          <Image
            src={imageUrl}
            alt={title}
            width={400}
            height={300}
            sizes="(max-width: 768px) 100vw, 33vw"
            quality={85}
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

      <div className='flex flex-1 flex-col'>
        <div>
          {product.brand ? (
            <p className='text-xs font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-200'>{product.brand}</p>
          ) : null}
          <h3 className='mt-2 text-base font-semibold leading-6 text-ink'>{title}</h3>
          <p className='mt-3 text-sm leading-6 text-muted'>{rationale}</p>
        </div>

        {(product.price || product.rating) ? (
          <p className='mt-4 text-xs font-semibold text-muted'>
            {[product.price, product.rating ? `${product.rating.toFixed(1)} rating` : ''].filter(Boolean).join(' / ')}
          </p>
        ) : null}

        {isValidUrl ? (
          <a
            href={affiliateUrl}
            target='_blank'
            rel={getOutboundLinkRel(true)}
            onClick={() => trackRevenueEvent({
              kind: 'recommendation_click',
              location: product.trackingLocation || 'recommendation-section',
              label: title,
              target: affiliateUrl,
            })}
            className='mt-5 inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full bg-brand-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 motion-safe:hover:-translate-y-0.5 hover:bg-brand-900 hover:shadow-md active:translate-y-0 dark:bg-brand-200 dark:text-brand-950 dark:hover:bg-brand-100'
          >
            {ctaLabel} <span aria-hidden="true">→</span>
          </a>
        ) : (
          <span className='mt-5 inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center rounded-full border border-brand-900/10 bg-brand-50 px-4 py-2.5 text-sm font-bold text-muted dark:border-white/10 dark:bg-white/5'>
            Product Unavailable
          </span>
        )}
      </div>
    </article>
  )
}
