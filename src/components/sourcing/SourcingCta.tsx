import { AFFILIATE_TAGS } from '@/config/affiliate'
import { text } from '@/lib/display-utils'
import { isRestrictedIngredient, isRestrictedRecord } from '@/lib/restricted-ingredients'

type SourcingCtaProps = {
  record: any
  displayName: string
}

export function SourcingCta({ record, displayName }: SourcingCtaProps) {
  if (isRestrictedRecord(record) || isRestrictedIngredient(displayName)) return null

  // 1. Affiliate-ready detection
  const directUrl = text(record?.amazon_affiliate_url || record?.affiliate_url)
  const affiliateQuery = text(record?.affiliate_query) || displayName

  const isAffiliateReady = !!(directUrl || affiliateQuery)

  // 2. Safe source link display
  const getUrl = () => {
    if (directUrl) {
      // If it is already an Amazon link, make sure it has the affiliate tag
      if (directUrl.includes('amazon.com') && !directUrl.includes('tag=')) {
        const separator = directUrl.includes('?') ? '&' : '?'
        return `${directUrl}${separator}tag=${AFFILIATE_TAGS.amazon}`
      }
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
    <div className="rounded-3xl border border-brand-900/10 bg-white/95 p-5 shadow-sm space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1 min-w-[280px]">
          <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">
            Sourcing Options
          </h4>
          <h3 className="mt-1 text-lg font-semibold text-ink">
            Review available sources for {displayName}
          </h3>
          <p className="mt-1 text-sm leading-6 text-muted">
            Independent database mapping. Sourcing availability is evaluated separately from safety and clinical efficacy scores.
          </p>
        </div>

        {finalUrl ? (
          <a
            href={finalUrl}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#358f52] hover:bg-[#2d7a46] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
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
      <div className="border-t border-brand-900/5 pt-3 text-[11px] leading-relaxed text-muted">
        <p>
          <strong>Affiliate Disclosure:</strong> Clicking verification or shopping links may earn this site a commission at no additional cost to you. Sourcing links are selected strictly based on quality criteria and availability, never based on commission tiers. Safety warnings and evidence ratings remain independent of sourcing.
        </p>
      </div>
    </div>
  )
}
