import Link from 'next/link'
import { AFFILIATE_TAGS } from '@/config/affiliate'

type ConversionAffiliateCardProps = {
  title?: string
  name: string
  slug?: string
  intent?: string
  variant?: 'light' | 'dark'
}

const PRODUCT_INTENT_MAP: Record<string, string> = {
  magnesium: 'magnesium glycinate third party tested',
  glycinate: 'magnesium glycinate third party tested',
  omega: 'omega 3 fish oil triglyceride third party tested',
  fish: 'omega 3 fish oil triglyceride third party tested',
  creatine: 'creatine monohydrate third party tested',
  ashwagandha: 'ashwagandha ksm-66 third party tested',
  ksm: 'ashwagandha ksm-66 third party tested',
  theanine: 'l-theanine third party tested',
  melatonin: 'low dose melatonin third party tested',
  glycine: 'glycine powder third party tested',
  berberine: 'berberine hcl third party tested',
  caffeine: 'caffeine l-theanine supplement third party tested',
  citicoline: 'citicoline supplement third party tested',
  alpha: 'alpha gpc supplement third party tested',
  rhodiola: 'rhodiola rosea extract third party tested',
  curcumin: 'curcumin phytosome third party tested',
  turmeric: 'curcumin phytosome third party tested',
  glucosamine: 'glucosamine sulfate third party tested',
  chondroitin: 'chondroitin sulfate third party tested',
  collagen: 'collagen peptides third party tested',
  psyllium: 'psyllium husk powder third party tested',
  inulin: 'inulin prebiotic fiber third party tested',
  probiotic: 'probiotic supplement third party tested',
  prebiotic: 'prebiotic fiber supplement third party tested',
  zinc: 'zinc supplement third party tested',
}

const clean = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  return String(value).replace(/\s+/g, ' ').trim()
}

const productQueryFor = (label: string, intent?: string): string => {
  const haystack = `${label} ${intent ?? ''}`.toLowerCase()
  const matchedKey = Object.keys(PRODUCT_INTENT_MAP).find(key => haystack.includes(key))
  return matchedKey ? PRODUCT_INTENT_MAP[matchedKey] : `${label} supplement third party tested`
}

export default function ConversionAffiliateCard({
  title = 'Buying checkpoint',
  name,
  slug,
  intent,
  variant = 'light',
}: ConversionAffiliateCardProps) {
  const label = clean(name) || 'this supplement'
  const query = encodeURIComponent(productQueryFor(label, intent))
  const amazonLink = `https://www.amazon.com/s?k=${query}&tag=${AFFILIATE_TAGS.amazon}`
  const compoundHref = slug ? `/compounds/${slug}` : ''
  const isDark = variant === 'dark'

  return (
    <section className={isDark
      ? 'rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.06] p-5 text-white'
      : 'rounded-[1.25rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm dark:border-[var(--border-soft)] dark:bg-[var(--surface-card)]'
    }>
      <p className={isDark
        ? 'text-xs font-bold uppercase tracking-[0.18em] text-white/60'
        : 'eyebrow-label text-brand-700'
      }>{title}</p>

      <h2 className={isDark ? 'mt-2 text-2xl font-bold text-white' : 'mt-2 text-2xl font-bold text-ink'}>
        Before buying {label}
      </h2>

      <p className={isDark
        ? 'mt-2 max-w-3xl text-sm leading-6 text-white/75'
        : 'mt-2 max-w-3xl text-sm leading-6 text-muted'
      }>
        Review evidence, dose, timing, and safety first. Product links should come after the profile fits your goal and risk context{intent ? ` for ${intent}` : ''}.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        {compoundHref ? (
          <Link
            href={compoundHref}
            className={isDark
              ? 'rounded-full bg-white px-4 py-2 text-sm font-bold text-[#07150c] hover:bg-emerald-100'
              : 'button-primary px-4 py-2 text-sm'
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
            ? 'rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/85 hover:bg-white/10'
            : 'button-secondary px-4 py-2 text-sm'
          }
        >
          Compare product options
        </a>
      </div>

      <p className={isDark ? 'mt-3 text-xs text-white/45' : 'mt-3 text-xs text-muted/70'}>
        Affiliate disclosure: we may earn a commission at no extra cost. This never changes evidence or safety language.
      </p>
    </section>
  )
}
