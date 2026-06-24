import Link from 'next/link'
import type { WhatToBuyFirstEntry, PriceTier } from '@/lib/decision-table-data'
import EvidenceMeter from './EvidenceMeter'

type Props = {
  entries: WhatToBuyFirstEntry[]
  title?: string
  /** Short description shown below the heading */
  description?: string
  /** Goal slug for contextual link (e.g. "focus") */
  goalSlug?: string
}

const PRICE_TIER_LABELS: Record<PriceTier, string> = {
  budget: '$ Budget',
  mid: '$$ Mid',
  premium: '$$$ Premium',
  unknown: '–',
}

const PRICE_TIER_CLASSES: Record<PriceTier, string> = {
  budget: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  mid: 'border-blue-200 bg-blue-50 text-blue-700',
  premium: 'border-amber-200 bg-amber-50 text-amber-700',
  unknown: 'border-slate-200 bg-slate-50 text-slate-600',
}

function PriceBadge({ tier }: { tier: PriceTier }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[0.68rem] font-semibold ${PRICE_TIER_CLASSES[tier]}`}
    >
      {PRICE_TIER_LABELS[tier]}
    </span>
  )
}

function RankBadge({ rank, isFeatured }: { rank: number; isFeatured: boolean }) {
  if (isFeatured) {
    return (
      <span className="inline-flex min-w-[2rem] items-center justify-center rounded-full border border-brand-700/15 bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-800">
        #1
      </span>
    )
  }
  return (
    <span className="inline-flex min-w-[2rem] items-center justify-center rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-2 py-0.5 text-xs font-semibold text-muted dark:border-white/10">
      #{rank}
    </span>
  )
}

export default function WhatToBuyFirst({
  entries,
  title = 'What Should I Buy First?',
  description,
  goalSlug,
}: Props) {
  if (!entries.length) return null

  const defaultDescription =
    'Ranked by evidence strength, safety profile, and practical cost. Review each profile before purchasing.'

  return (
    <section aria-labelledby="wtbf-heading" className="rounded-[1.25rem] border border-brand-900/10 bg-white/90 shadow-sm overflow-hidden dark:border-white/10 dark:bg-[var(--surface-card)]">
      {/* Header */}
      <div className="border-b border-brand-900/10 bg-brand-50/40 px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[0.64rem] font-bold uppercase tracking-[0.09em] text-brand-700">
              Decision guide
            </p>
            <h2
              id="wtbf-heading"
              className="text-lg font-bold leading-snug text-ink sm:text-xl"
            >
              {title}
            </h2>
            <p className="text-sm leading-6 text-muted">
              {description || defaultDescription}
            </p>
          </div>

          {goalSlug && (
            <Link
              href={`/goals/${goalSlug}`}
              className="mt-1 shrink-0 rounded-full border border-brand-700/15 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-800 transition hover:border-brand-700/25 hover:bg-brand-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40"
            >
              Full goal guide →
            </Link>
          )}
        </div>
      </div>

      {/* Card list (mobile-first — collapses to cards on small screens) */}
      <div className="block sm:hidden divide-y divide-brand-900/5">
        {entries.map((entry) => (
          <WhatToBuyCard key={entry.slug} entry={entry} />
        ))}
      </div>

      {/* Table (desktop) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-brand-900/10 bg-brand-50/40 dark:bg-white/5">
              <th scope="col" className="py-3 pl-5 pr-3 text-left text-[0.64rem] font-bold uppercase tracking-[0.09em] text-muted">
                Rank
              </th>
              <th scope="col" className="py-3 px-3 text-left text-[0.64rem] font-bold uppercase tracking-[0.09em] text-muted">
                Option
              </th>
              <th scope="col" className="py-3 px-3 text-left text-[0.64rem] font-bold uppercase tracking-[0.09em] text-muted">
                Evidence
              </th>
              <th scope="col" className="py-3 px-3 text-left text-[0.64rem] font-bold uppercase tracking-[0.09em] text-muted">
                Typical dose
              </th>
              <th scope="col" className="py-3 px-3 text-left text-[0.64rem] font-bold uppercase tracking-[0.09em] text-muted">
                Cost
              </th>
              <th scope="col" className="py-3 pl-3 pr-5 text-left text-[0.64rem] font-bold uppercase tracking-[0.09em] text-muted">
                <span className="sr-only">Affiliate link</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-900/5">
            {entries.map((entry) => (
              <tr
                key={entry.slug}
                className={`align-top transition-colors hover:bg-brand-50/30 ${entry.isFeatured ? 'bg-brand-50/20' : ''}`}
              >
                {/* Rank */}
                <td className="py-4 pl-5 pr-3">
                  <RankBadge rank={entry.rank} isFeatured={entry.isFeatured} />
                </td>

                {/* Name + best-for context */}
                <td className="py-4 px-3 max-w-[200px]">
                  <div className="space-y-0.5">
                    <Link
                      href={entry.href}
                      className="block font-semibold text-ink hover:text-brand-800 hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-700"
                    >
                      {entry.isFeatured && (
                        <span className="mr-1.5 inline-flex items-center rounded border border-brand-700/10 bg-brand-50 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.08em] text-brand-700">
                          Start here
                        </span>
                      )}
                      {entry.name}
                    </Link>
                    {entry.bestFor && (
                      <p className="text-xs text-[#5f6f66] leading-4">{entry.bestFor}</p>
                    )}
                  </div>
                </td>

                {/* Evidence meter */}
                <td className="py-4 px-3">
                  <EvidenceMeter data={entry.evidenceData} compact />
                </td>

                {/* Dose */}
                <td className="py-4 px-3 text-xs text-muted">
                  {entry.typicalDose || <span className="text-muted/60">Varies</span>}
                </td>

                {/* Price tier */}
                <td className="py-4 px-3">
                  <PriceBadge tier={entry.priceTier} />
                </td>

                {/* Affiliate CTA */}
                <td className="py-4 pl-3 pr-5">
                  {entry.affiliateUrl ? (
                    <a
                      href={entry.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow sponsored"
                      aria-label={`${entry.affiliateLabel || 'View on Amazon'} — ${entry.name} (opens in new tab)`}
                      className="inline-flex items-center gap-1 rounded-full border border-brand-700/15 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-800 transition hover:border-brand-700/25 hover:bg-brand-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40"
                    >
                      {entry.affiliateLabel || 'View'}
                      <span aria-hidden="true">↗</span>
                    </a>
                  ) : (
                    <Link
                      href={entry.href}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800 hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-700"
                    >
                      View profile →
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Disclaimer footer */}
      <div className="border-t border-brand-900/10 bg-brand-50/40 px-5 py-3 text-[0.65rem] leading-5 text-muted dark:border-white/10 dark:bg-white/5">
        Rankings are educational starting points. Affiliate links help support this site — we
        only link products we&apos;ve reviewed. Always read the profile and consult a clinician
        before use.{' '}
        <Link
          href="/disclaimer"
          className="font-semibold text-brand-700 hover:text-brand-800 hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-700"
        >
          Full disclaimer →
        </Link>
      </div>
    </section>
  )
}

/** Mobile card view for a single entry */
function WhatToBuyCard({ entry }: { entry: WhatToBuyFirstEntry }) {
  return (
    <article className={`px-4 py-4 ${entry.isFeatured ? 'bg-brand-50/25' : ''}`}>
      <div className="flex items-start gap-3">
        <RankBadge rank={entry.rank} isFeatured={entry.isFeatured} />
        <div className="min-w-0 flex-1 space-y-2">
          <Link
            href={entry.href}
            className="block font-semibold text-ink hover:text-brand-800 focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-700"
          >
            {entry.isFeatured && (
              <span className="mr-1.5 inline-flex items-center rounded border border-brand-700/10 bg-brand-50 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.08em] text-brand-700">
                Start here
              </span>
            )}
            {entry.name}
          </Link>

          {entry.bestFor && (
            <p className="text-xs text-muted">{entry.bestFor}</p>
          )}

          <EvidenceMeter data={entry.evidenceData} compact />

          <div className="flex flex-wrap items-center gap-2">
            {entry.typicalDose && (
              <span className="text-xs text-muted">{entry.typicalDose}</span>
            )}
            <PriceBadge tier={entry.priceTier} />
          </div>

          {entry.affiliateUrl ? (
            <a
              href={entry.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              aria-label={`${entry.affiliateLabel || 'View on Amazon'} — ${entry.name} (opens in new tab)`}
              className="inline-flex items-center gap-1 rounded-full border border-brand-700/15 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-800 transition hover:border-brand-700/25 hover:bg-brand-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40"
            >
              {entry.affiliateLabel || 'View on Amazon'}
              <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <Link
              href={entry.href}
              className="text-xs font-semibold text-brand-700 hover:text-brand-800 hover:underline"
            >
              View profile →
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
