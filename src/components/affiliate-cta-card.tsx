import { AFFILIATE_TAGS } from '@/config/affiliate'
import { canRenderAffiliateLinks, extractUrlString, ensureAmazonAffiliateTag } from '@/lib/affiliate'
import { list, text } from '@/lib/display-utils'
import { isRestrictedIngredient } from '@/lib/restricted-ingredients'

type AffiliateCTACardProps = {
  record: any
  displayName: string
  variant?: 'inline' | 'sidebar'
}

function getAffiliateUrl(record: any, displayName: string): string {
  // Compliance gate: records flagged doNotMonetize/doNotPromote must not receive Amazon affiliate links.
  if (!canRenderAffiliateLinks(record) || isRestrictedIngredient(displayName)) return ''

  // Prefer a direct product URL if available
  const rawDirect = extractUrlString(record?.amazon_affiliate_url)
  const direct = ensureAmazonAffiliateTag(rawDirect)
  if (direct && direct.includes('amazon.com/dp/')) return direct

  // Prefer the pre-built affiliate URL if it's an Amazon URL (not a generic search category)
  const rawPrebuilt = extractUrlString(record?.affiliate_url)
  const prebuilt = ensureAmazonAffiliateTag(rawPrebuilt)
  if (prebuilt && prebuilt.includes('amazon.com') && prebuilt.includes('tag=')) {
    return prebuilt
  }

  // Fall back to building a search URL from the affiliate_query or displayName
  const query = text(record?.affiliate_query) || displayName
  if (isRestrictedIngredient(query)) return ''
  const encoded = encodeURIComponent(`${query} supplement third party tested`)
  return `https://www.amazon.com/s?k=${encoded}&tag=${AFFILIATE_TAGS.amazon}`
}

function getAffiliateLabel(record: any): string {
  return text(record?.affiliate_label) || 'Compare sourcing options on Amazon'
}

function getBuyingCriteria(record: any): string[] {
  const raw = record?.buying_criteria
  if (Array.isArray(raw)) return raw.filter((item: unknown) => typeof item === 'string' && item.trim())
  return list(raw).filter((item: string) => item.trim())
}

export default function AffiliateCTACard({
  record,
  displayName,
  variant = 'inline',
}: AffiliateCTACardProps) {
  const affiliateUrl = getAffiliateUrl(record, displayName)
  const affiliateLabel = getAffiliateLabel(record)
  const criteria = getBuyingCriteria(record)

  if (!affiliateUrl) return null

  if (variant === 'sidebar') {
    return (
      <aside className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-muted">
          Sourcing checklist
        </p>

        {criteria.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {criteria.map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs leading-5 text-[#46574d]">
                <span className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-emerald-400/60 bg-emerald-50" />
                {item}
              </li>
            ))}
          </ul>
        ) : null}

        <a
          href={affiliateUrl}
          target="_blank"
          rel="nofollow sponsored noopener noreferrer"
          className="mt-4 block w-full rounded-xl bg-brand-950 px-4 py-2.5 text-center text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-900"
        >
          {affiliateLabel} →
        </a>

        <p className="mt-2 text-center text-[0.65rem] text-muted">
          Affiliate link · We may earn a commission at no cost to you
        </p>
      </aside>
    )
  }

  // inline variant — wide card, used in the Authority & Sourcing tab
  return (
    <section className="rounded-3xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50/60 to-white p-5 sm:p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="eyebrow-label text-emerald-700">Shop with criteria in mind</p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-ink">
            {displayName} · Sourcing guidance
          </h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#46574d]">
            Product quality varies widely. Use the checklist below before purchasing — these signal
            a product worth evaluating.
          </p>
        </div>

        <a
          href={affiliateUrl}
          target="_blank"
          rel="nofollow sponsored noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
        >
          {affiliateLabel}
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
      </div>

      {criteria.length > 0 ? (
        <div className="mt-5 border-t border-emerald-200/60 pt-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
            What to look for when comparing products
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {criteria.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm leading-5 text-[#46574d]">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-4 text-xs text-muted">
        Affiliate disclosure: clicking this link may result in a commission at no extra cost to you.
        We never recommend products based on commission — only based on sourcing transparency criteria.
      </p>
    </section>
  )
}
