import type { Metadata } from 'next'
import { getHerbs, getCompounds } from '../../../src/lib/runtime-data'
import { getRuntimeVisibility } from '../../../lib/runtime-visibility'
import BuyGuideClient from '../../../src/components/sourcing/BuyGuideClient'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import { isRestrictedRecord } from '../../../src/lib/restricted-ingredients'

export const metadata: Metadata = {
  title: 'Supplement Product Quality Guide',
  description:
    'Learn how to evaluate supplement labels, standardized extracts, third-party testing, certificates of analysis, and product-quality tradeoffs before buying.',
  alternates: { canonical: '/learn/product-quality/' },
}

type RuntimeRecord = Record<string, unknown>
type BuyGuideClientItem = {
  slug: string
  name: string
  displayName: string
  buying_criteria?: string[]
  buyingCriteria?: string[]
  amazon_affiliate_url?: string
  amazonAffiliateUrl?: string
  affiliate_url?: string
  affiliateUrl?: string
  affiliate_query?: string
  affiliateQuery?: string
  affiliate_label?: string
  affiliateLabel?: string
  standardization?: string
  standardized_extract?: string
  active_compounds?: string
  best_for?: string[]
  bestFor?: string[]
}

function asText(value: unknown) {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number') return String(value)
  return ''
}

function firstText(...values: unknown[]) {
  return values.map(asText).find(Boolean) || ''
}

function toTextList(value: unknown) {
  if (Array.isArray(value)) return value.map(asText).filter(Boolean).slice(0, 8)
  const raw = asText(value)
  return raw ? raw.split(/[;,\n]+/).map(item => item.trim()).filter(Boolean).slice(0, 8) : []
}

function canUseRecord(record: RuntimeRecord) {
  if (isRestrictedRecord(record)) return false
  try {
    return getRuntimeVisibility(record).canRender
  } catch {
    return true
  }
}

function toBuyGuideClientItem(record: RuntimeRecord): BuyGuideClientItem {
  const slug = firstText(record.slug)
  const name = firstText(record.displayName, record.name, record.compoundName, slug)
  const buyingCriteria = toTextList(record.buying_criteria).length
    ? toTextList(record.buying_criteria)
    : toTextList(record.buyingCriteria)

  return {
    slug,
    name,
    displayName: name,
    buying_criteria: buyingCriteria,
    buyingCriteria,
    amazon_affiliate_url: firstText(record.amazon_affiliate_url),
    amazonAffiliateUrl: firstText(record.amazonAffiliateUrl),
    affiliate_url: firstText(record.affiliate_url),
    affiliateUrl: firstText(record.affiliateUrl),
    affiliate_query: firstText(record.affiliate_query),
    affiliateQuery: firstText(record.affiliateQuery),
    affiliate_label: firstText(record.affiliate_label),
    affiliateLabel: firstText(record.affiliateLabel),
    standardization: firstText(record.standardization),
    standardized_extract: firstText(record.standardized_extract),
    active_compounds: firstText(record.active_compounds),
    best_for: toTextList(record.best_for),
    bestFor: toTextList(record.bestFor).length ? toTextList(record.bestFor) : toTextList(record.primary_effects),
  }
}

export default async function ProductQualityPage() {
  const [rawHerbs, rawCompounds] = await Promise.all([getHerbs(), getCompounds()])

  const herbs = rawHerbs
    .filter(canUseRecord)
    .map(toBuyGuideClientItem)
    .filter(item => item.slug)

  const compounds = rawCompounds
    .filter(canUseRecord)
    .map(toBuyGuideClientItem)
    .filter(item => item.slug)

  return (
    <div className='mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-10'>
      <AuthorityJsonLd
        title="Supplement Product Quality Guide"
        description="Evaluate standardized extracts, transparent labels, third-party testing, and quality checklists before purchasing supplements."
        url="https://thehippiescientist.net/learn/product-quality/"
        type="MedicalWebPage"
      />

      <section className='space-y-4 rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8'>
        <p className='eyebrow-label'>Product quality before purchase</p>
        <h1 className='mt-2 text-3xl font-bold tracking-tight text-ink sm:text-5xl'>
          How to judge supplement quality before you buy
        </h1>
        <p className='mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg'>
          Use this checklist after you have narrowed your goal, compared evidence, and checked safety.
          Product quality is where standardized extracts, transparent labels, heavy-metal testing,
          certificates of analysis, and dose clarity determine whether a supplement is worth considering.
        </p>
      </section>

      <section className='grid gap-6 md:grid-cols-3'>
        <div className='space-y-2 rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-sm font-bold text-emerald-800'>1</div>
          <h2 className='text-sm font-bold text-slate-800'>Verify standardization</h2>
          <p className='text-xs leading-relaxed text-slate-500'>
            Prefer labels that name the extract form and marker compounds, not vague root, leaf, or proprietary blend language.
          </p>
        </div>
        <div className='space-y-2 rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-sm font-bold text-emerald-800'>2</div>
          <h2 className='text-sm font-bold text-slate-800'>Look for third-party testing</h2>
          <p className='text-xs leading-relaxed text-slate-500'>
            Certificates of analysis and independent testing are strongest when they cover identity, heavy metals, microbes, and solvent residues.
          </p>
        </div>
        <div className='space-y-2 rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-sm font-bold text-emerald-800'>3</div>
          <h2 className='text-sm font-bold text-slate-800'>Avoid hidden-dose blends</h2>
          <p className='text-xs leading-relaxed text-slate-500'>
            Proprietary blends can hide under-dosed or over-stacked formulas. Favor transparent products with clear ingredient amounts.
          </p>
        </div>
      </section>

      <BuyGuideClient herbs={herbs} compounds={compounds} />

      <section className='rounded-2xl border border-amber-900/15 bg-amber-50/70 p-5 text-xs leading-relaxed text-amber-950'>
        <p className='font-bold'>Disclosure and safety note:</p>
        <p className='mt-1'>
          Product-quality guidance may include affiliate links that support the site at no additional cost to you.
          Evidence ratings, safety warnings, and editorial framing should remain independent of commission.
          This page is educational and does not replace clinician guidance.
        </p>
      </section>
    </div>
  )
}
