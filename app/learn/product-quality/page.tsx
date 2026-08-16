import type { Metadata } from 'next'
import Link from 'next/link'
import { getHerbs, getCompounds } from '../../../src/lib/runtime-data'
import { getRuntimeVisibility } from '../../../lib/runtime-visibility'
import BuyGuideClient from '../../../src/components/sourcing/BuyGuideClient'
import ProductQualityExperimentLayout from '../../../src/components/sourcing/ProductQualityExperimentLayout'
import BuyingQualityPrimer from '@/components/guides/BuyingQualityPrimer'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import { isRestrictedRecord } from '../../../src/lib/restricted-ingredients'
import { toBuyingToolRecord } from '../../../src/lib/tool-page-payloads'
import type { RuntimeRecord } from '../../../src/types/content'
import { buildPageMetadata } from '../../../src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Supplement Product Quality Guide',
  description:
    'Learn how to evaluate supplement labels, standardized extracts, third-party testing, certificates of analysis, and product-quality tradeoffs before buying.',
  path: '/learn/product-quality/',
  openGraphType: 'article',
})

const qualityStartingPoints = [
  {
    title: 'Before buying for sleep',
    href: '/guides/sleep/',
    body: 'Match the product to the sleep bottleneck first: timing, relaxation, stress, or sleep maintenance.',
  },
  {
    title: 'Before buying for stress',
    href: '/guides/anxiety/',
    body: 'Separate acute calm from adaptogen-style support before choosing a standardized extract.',
  },
  {
    title: 'Before buying for focus',
    href: '/guides/focus/',
    body: 'Check stimulant load, caffeine timing, and anxiety or blood-pressure context before comparing nootropics.',
  },
]

export default async function ProductQualityPage() {
  const [rawHerbs, rawCompounds] = await Promise.all([getHerbs(), getCompounds()])

  const herbs: RuntimeRecord[] = rawHerbs.filter((herb: RuntimeRecord) =>
    !isRestrictedRecord(herb) && getRuntimeVisibility(herb).canRender,
  )

  const compounds: RuntimeRecord[] = rawCompounds.filter((compound: RuntimeRecord) =>
    !isRestrictedRecord(compound) && getRuntimeVisibility(compound).canRender,
  )

  const buyGuide = (
    <BuyGuideClient
      herbs={herbs.map((herb) => toBuyingToolRecord(herb, 'herb'))}
      compounds={compounds.map((compound) => toBuyingToolRecord(compound, 'compound'))}
    />
  )

  return (
    <div className='mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-10'>
      <AuthorityJsonLd
        title="Supplement Product Quality Guide"
        description="Evaluate standardized extracts, transparent labels, third-party testing, and quality checklists before purchasing supplements."
        url="https://thehippiescientist.net/learn/product-quality"
        type="MedicalWebPage"
      />

      <section className='space-y-4 rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8'>
        <p className='eyebrow-label'>Product quality before purchase</p>
        <h1 className='mt-2 text-3xl font-bold tracking-tight text-ink sm:text-5xl'>How to judge supplement quality before you buy</h1>
        <p className='mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg'>
          Use this checklist after you have narrowed your goal, compared evidence, and checked safety. Product quality is where standardized extracts, transparent labels, heavy-metal testing, certificates of analysis, and dose clarity determine whether a specific product is worth considering.
        </p>
      </section>

      <section className='grid gap-6 md:grid-cols-3'>
        <div className='space-y-2 rounded-2xl border border-brand-900/10 bg-[var(--surface-card)] p-5 shadow-sm'><div className='flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-sm font-bold text-emerald-800'>1</div><h2 className='text-sm font-bold text-ink'>Verify standardization</h2><p className='text-xs leading-relaxed text-muted'>Prefer labels that name the extract form and marker compounds when those details matter to the cited evidence.</p></div>
        <div className='space-y-2 rounded-2xl border border-brand-900/10 bg-[var(--surface-card)] p-5 shadow-sm'><div className='flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-sm font-bold text-emerald-800'>2</div><h2 className='text-sm font-bold text-ink'>Look for third-party testing</h2><p className='text-xs leading-relaxed text-muted'>Certificates of analysis and independent testing are strongest when the scope, batch, and tested contaminants are actually documented.</p></div>
        <div className='space-y-2 rounded-2xl border border-brand-900/10 bg-[var(--surface-card)] p-5 shadow-sm'><div className='flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-sm font-bold text-emerald-800'>3</div><h2 className='text-sm font-bold text-ink'>Avoid hidden-dose blends</h2><p className='text-xs leading-relaxed text-muted'>Proprietary blends can obscure individual amounts and make studied-dose, interaction, and stacking comparisons harder.</p></div>
      </section>

      <section className='rounded-3xl border border-brand-900/10 bg-white/90 p-5 shadow-sm'>
        <div className='max-w-3xl space-y-2'><p className='eyebrow-label'>Use this page after intent is clear</p><h2 className='text-2xl font-bold tracking-tight text-ink'>Start with the goal, then judge product quality</h2><p className='text-sm leading-6 text-muted'>A clean certificate of analysis does not make the wrong supplement useful. Pick the goal page first, then use this checklist to compare form, dose transparency, third-party testing, and safety context.</p></div>
        <div className='mt-5 grid gap-3 md:grid-cols-3'>{qualityStartingPoints.map((item) => <Link key={item.href} href={item.href} className='rounded-2xl border border-brand-900/10 bg-brand-50/50 p-4 transition hover:border-brand-300 hover:bg-[var(--surface-card)]'><h3 className='text-sm font-bold text-ink'>{item.title}</h3><p className='mt-2 text-xs leading-5 text-muted'>{item.body}</p></Link>)}</div>
      </section>

      <ProductQualityExperimentLayout
        evidenceContent={<BuyingQualityPrimer />}
        commerceContent={buyGuide}
      />

      <section className='rounded-2xl border border-amber-900/15 bg-amber-50/70 p-5 text-xs leading-relaxed text-amber-950'>
        <p className='font-bold'>Disclosure and safety note:</p>
        <p className='mt-1'>Product-quality guidance may include affiliate links that support the site at no additional cost to you. Evidence ratings, safety warnings, and product-quality scores remain independent of commission. Missing testing or formulation data is treated as unverified, not as a positive quality signal. This page is educational and does not replace clinician guidance.</p>
      </section>
    </div>
  )
}
