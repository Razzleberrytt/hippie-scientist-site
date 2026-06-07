'use client'

import Image from 'next/image'
import { isOptimizableRemoteImage } from '@/lib/image-hosts'
import { trackRevenueEvent } from '@/lib/revenue-tracking'

export type AffiliateProduct = {
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
  const isValidUrl = typeof rawUrl === 'string' && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))
  const affiliateUrl = isValidUrl ? rawUrl : ''
  const ctaLabel = product.ctaLabel || 'Check current price'

  return (
    <article className={`flex h-full flex-col overflow-hidden rounded-2xl border border-brand-900/10 bg-white/85 shadow-sm ${compact ? 'p-4' : 'p-5'}`}>
      {imageUrl && isOptimizableRemoteImage(imageUrl) ? (
        <div className='mb-4 aspect-[4/3] overflow-hidden rounded-xl border border-brand-900/10 bg-brand-50'>
          <Image
            src={imageUrl}
            alt={title}
            width={400}
            height={300}
            sizes="(max-width: 768px) 100vw, 33vw"
            quality={85}
            unoptimized
            decoding="async"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

      <div className='flex flex-1 flex-col'>
        <div>
          {product.brand ? (
            <p className='text-xs font-bold uppercase tracking-[0.16em] text-brand-700'>{product.brand}</p>
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
            rel='noopener noreferrer nofollow sponsored'
            onClick={() => trackRevenueEvent({
              kind: 'recommendation_click',
              location: product.trackingLocation || 'recommendation-section',
              label: title,
              target: affiliateUrl,
            })}
            className='mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-brand-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-900'
          >
            {ctaLabel}
          </a>
        ) : (
          <span className='mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-brand-50 border border-brand-900/10 px-4 py-2.5 text-sm font-bold text-muted cursor-not-allowed'>
            Product Unavailable
          </span>
        )}
      </div>
    </article>
  )
}
