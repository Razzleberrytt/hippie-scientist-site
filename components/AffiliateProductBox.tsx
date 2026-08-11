'use client'

import RevenueImpressionTracker from './RevenueImpressionTracker'
import { affiliateRationaleForDisplay } from '../src/lib/affiliate-copy'
import { trackRevenueEvent } from '../src/lib/revenue-tracking'

export interface AffiliateEntry {
  slot: 'budget' | 'overall' | 'premium'
  asin?: string
  brand?: string
  title?: string
  name?: string
  rationale?: string
  affiliateUrl?: string
}

interface Props {
  slug: string
  products: AffiliateEntry[]
  heading?: string
}

const SLOT_LABELS: Record<string, string> = {
  budget: 'Budget example',
  overall: 'Featured example',
  premium: 'Premium example',
}

export default function AffiliateProductBox({ slug, products, heading = 'Product sourcing examples' }: Props) {
  const visible = products.filter((p) => p.affiliateUrl && p.affiliateUrl.startsWith('http'))
  if (visible.length === 0) return null

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-ink">{heading}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((product) => {
          const displayTitle = product.title || product.name || 'Supplement option'
          const displayRationale = affiliateRationaleForDisplay(displayTitle, product.rationale)
          const url = product.affiliateUrl!
          return (
            <RevenueImpressionTracker
              key={product.slot}
              className="h-full"
              location="affiliate-product-box"
              label={displayTitle}
              productSlug={slug}
              productSlot={product.slot}
              productAsin={product.asin}
            >
              <article className="flex h-full flex-col rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">
                  {SLOT_LABELS[product.slot] ?? product.slot}
                </p>
                {product.brand && (
                  <p className="mt-0.5 text-xs font-semibold text-muted">{product.brand}</p>
                )}
                <h3 className="mt-2 text-sm font-semibold text-ink leading-5">{displayTitle}</h3>
                <p className="mt-2 text-xs leading-5 text-muted flex-1">{displayRationale}</p>
                <a
                  href={url}
                  target="_blank"
                  rel="nofollow sponsored noopener noreferrer"
                  data-revenue-tracked="true"
                  data-ingredient={slug}
                  data-product-slot={product.slot}
                  data-product-asin={product.asin || undefined}
                  data-tracking-location="affiliate-product-box"
                  onClick={() => trackRevenueEvent({
                    kind: 'recommendation_click',
                    location: 'affiliate-product-box',
                    label: displayTitle || slug,
                    target: url,
                    productSlug: slug,
                    productSlot: product.slot,
                    productAsin: product.asin,
                  })}
                  className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-full bg-brand-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-900"
                >
                  View on Amazon →
                </a>
              </article>
            </RevenueImpressionTracker>
          )
        })}
      </div>
      <p className="text-xs text-muted">
        Affiliate disclosure: as an Amazon Associate we earn a small commission on qualifying
        purchases at no extra cost to you.
      </p>
    </section>
  )
}
