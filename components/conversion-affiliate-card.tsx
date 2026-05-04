import Link from 'next/link'
import { AFFILIATE_TAGS } from '@/config/affiliate'

type ConversionAffiliateCardProps = {
  title?: string
  name: string
  slug?: string
  intent?: string
  variant?: 'light' | 'dark'
}

const clean = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  return String(value).replace(/\s+/g, ' ').trim()
}

export default function ConversionAffiliateCard({
  title = 'Buying checkpoint',
  name,
  slug,
  intent,
  variant = 'light',
}: ConversionAffiliateCardProps) {
  const label = clean(name) || 'this supplement'
  const query = encodeURIComponent(`${label} supplement third party tested`)
  const amazonLink = `https://www.amazon.com/s?k=${query}&tag=${AFFILIATE_TAGS.amazon}`
  const compoundHref = slug ? `/compounds/${slug}` : ''
  const isDark = variant === 'dark'

  return (
    <section className={isDark
      ? 'rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.06] p-5 text-white'
      : 'rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-slate-950 shadow-sm'
    }>
      <p className={isDark
        ? 'text-xs font-black uppercase tracking-[0.18em] text-emerald-200/75'
        : 'text-xs font-black uppercase tracking-[0.18em] text-emerald-800/80'
      }>{title}</p>

      <h2 className={isDark ? 'mt-2 text-2xl font-black text-white' : 'mt-2 text-2xl font-black text-slate-950'}>
        Before buying {label}
      </h2>

      <p className={isDark
        ? 'mt-2 max-w-3xl text-sm leading-6 text-white/75'
        : 'mt-2 max-w-3xl text-sm leading-6 text-slate-700'
      }>
        Review evidence, dose, timing, and safety first. Product links should come after the profile fits your goal and risk context{intent ? ` for ${intent}` : ''}.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        {compoundHref ? (
          <Link
            href={compoundHref}
            className={isDark
              ? 'rounded-full bg-white px-4 py-2 text-sm font-black text-slate-950 hover:bg-emerald-100'
              : 'rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white hover:bg-slate-800'
            }
          >
            Check profile first
          </Link>
        ) : null}

        <a
          href={amazonLink}
          target="_blank"
          rel="sponsored nofollow noopener noreferrer"
          className={isDark
            ? 'rounded-full border border-white/15 px-4 py-2 text-sm font-black text-white/85 hover:bg-white/10'
            : 'rounded-full border border-slate-900/10 bg-white px-4 py-2 text-sm font-black text-slate-800 hover:bg-slate-50'
          }
        >
          Compare product options
        </a>
      </div>

      <p className={isDark ? 'mt-3 text-xs text-white/45' : 'mt-3 text-xs text-slate-500'}>
        Affiliate disclosure: we may earn a commission at no extra cost. This never changes evidence or safety language.
      </p>
    </section>
  )
}
