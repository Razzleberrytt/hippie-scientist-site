import { AFFILIATE_TAGS } from '@/config/affiliate'
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
    <div className="rounded-2xl border border-brand-900/10 bg-white/95 p-4 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[280px]">
          <h3 className="text-base font-semibold text-ink">
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
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#358f52] hover:bg-[#2d7a46] px-5 py-3 text-sm font-bold text-white shadow-sm transition motion-safe:hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
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
          <div className="rounded-2xl border border-brand-900/10 bg-brand-50/50 p-4 text-xs text-muted max-w-sm">
            <span className="font-semibold text-ink">No direct source verified.</span> When shopping independently, look for third-party lab testing certificates (COA), GMP facility stamps, and standardized extract specifications.
          </div>
        )}
      </div>

      {/* 4. Clear disclosure language */}
      <div className="border-t border-brand-900/5 pt-2 text-[11px] leading-relaxed text-muted">
        <p>
          <strong>Affiliate Disclosure:</strong> Shopping links may earn this site a commission at no cost to you. Links are chosen on quality and availability, never commission tiers; safety warnings and evidence ratings stay independent.
        </p>
      </div>
    </div>
  )
}
