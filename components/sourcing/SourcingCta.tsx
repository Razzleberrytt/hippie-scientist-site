import { AFFILIATE_TAGS } from '@/config/affiliate'
import { getRevenueProductSet } from '@/config/revenue-products'
import { canRenderAffiliateLinks, extractUrlString, ensureAmazonAffiliateTag } from '../../lib/affiliate'
import { text } from '@/lib/display-utils'
import { isRestrictedIngredient } from '../../lib/restricted-ingredients'

type SourcingCtaProps = {
  record: any
  displayName: string
}

export function SourcingCta({ record, displayName }: SourcingCtaProps) {
  // Compliance gate: never render affiliate CTAs for records flagged doNotMonetize/doNotPromote in source data.
  if (!canRenderAffiliateLinks(record) || isRestrictedIngredient(displayName)) return null

  // Profiles with a governed product set render RecommendationSection immediately
  // below this component. Prefer that curated endpoint instead of showing a generic
  // Amazon search first and making the two CTAs compete with each other.
  const profileSlug = text(record?.slug)
  const curatedSet = getRevenueProductSet(profileSlug || displayName)
  if (curatedSet?.products.some((product) => Boolean(product.affiliateUrl))) return null

  // 1. Affiliate-ready detection
  const rawUrl = extractUrlString(record?.amazon_affiliate_url || record?.affiliate_url)
  const directUrl = ensureAmazonAffiliateTag(rawUrl)
  const affiliateQuery = text(record?.affiliate_query) || displayName

  const _isAffiliateReady = !!(directUrl || affiliateQuery)

  // 2. Safe source link display
  const getUrl = () => {
    if (directUrl) {
      return directUrl
    }

    if (affiliateQuery) {
      const encoded = encodeURIComponent(`${affiliateQuery} supplement third party tested`)
      return `https://www.amazon.com/s?k=${encoded}&tag=${AFFILIATE_TAGS.amazon}`
    }

    return null
  }

  const finalUrl = getUrl()

  return (
    <div className="border-t border-[color:var(--hs-hairline)] pt-3 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="min-w-[15rem] flex-1">
          <h3 className="font-semibold text-ink">
            Review available sources for {displayName}
          </h3>
          <p className="mt-0.5 text-xs leading-5 text-muted">
            Independent database mapping — evaluated separately from safety and efficacy scores.
          </p>
        </div>

        {finalUrl ? (
          <a
            href={finalUrl}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            data-ingredient={profileSlug || undefined}
            data-tracking-location="sourcing-cta-fallback"
            className="button-primary inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
          >
            <span>Check sourcing options</span>
            <svg
              className="h-4 w-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        ) : (
          /* 3. Fallback when no URL exists */
          <p className="max-w-sm text-xs leading-5 text-muted">
            <span className="font-semibold text-ink">No direct source verified.</span> When shopping independently, look for third-party lab testing certificates (COA), GMP facility stamps, and standardized extract specifications.
          </p>
        )}
      </div>

      {/* 4. Clear disclosure language */}
      <p className="text-[11px] leading-relaxed text-muted">
        <strong>Affiliate disclosure:</strong> Shopping links may earn this site a commission at no cost to you. Links are chosen on quality and availability, never commission tiers; safety warnings and evidence ratings stay independent.
      </p>
    </div>
  )
}
