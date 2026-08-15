import type { Metadata } from 'next'
import Link from 'next/link'
import BuyingQualityPrimer from '@/components/guides/BuyingQualityPrimer'
import { BEST_GUIDE_INCLUSION_CRITERIA } from '@/lib/best-guide-framework'
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'How We Rank “Best Supplement” Guides',
  description: 'The evidence-first ranking, exclusion, safety, product-quality, and affiliate-separation rules used for Hippie Scientist best-supplement guides.',
  path: '/guides/best/methodology',
})

export default function BestGuideMethodologyPage() {
  return (
    <main className='mx-auto max-w-5xl space-y-8 px-4 py-8 sm:py-10'>
      <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8'>
        <p className='eyebrow-label'>Ranking methodology</p>
        <h1 className='mt-2 text-3xl font-bold tracking-tight text-ink sm:text-5xl'>“Best” starts with the evidence, not the product carousel</h1>
        <p className='mt-4 max-w-4xl text-base leading-7 text-muted sm:text-lg'>Best-of guides rank ingredient options first. Commercial products are a separate downstream choice after evidence, limitations, studied form, dose context, and safety are visible.</p>
      </section>

      <section className='rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm'>
        <h2 className='text-2xl font-bold text-ink'>Inclusion criteria</h2>
        <ol className='mt-4 space-y-3'>
          {BEST_GUIDE_INCLUSION_CRITERIA.map((criterion, index) => <li key={criterion} className='flex gap-3 rounded-xl bg-brand-50/50 p-3 text-sm leading-6 text-muted'><span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-950 text-xs font-bold text-white'>{index + 1}</span><span>{criterion}</span></li>)}
        </ol>
      </section>

      <section className='grid gap-4 md:grid-cols-3'>
        <article className='rounded-2xl border border-emerald-900/15 bg-emerald-50 p-5'><p className='text-xs font-bold uppercase tracking-wide text-emerald-900'>Best evidence</p><p className='mt-2 text-sm leading-6 text-emerald-950'>The ingredient with the strongest outcome-relevant human evidence among options that pass the inclusion gate. This is not a product brand ranking.</p></article>
        <article className='rounded-2xl border border-sky-900/15 bg-sky-50 p-5'><p className='text-xs font-bold uppercase tracking-wide text-sky-900'>Best safety fit</p><p className='mt-2 text-sm leading-6 text-sky-950'>A comparison category based on the structured safety profile among eligible options. It is not a claim that one ingredient is personally safest for every reader.</p></article>
        <article className='rounded-2xl border border-amber-900/15 bg-amber-50 p-5'><p className='text-xs font-bold uppercase tracking-wide text-amber-900'>Most uncertain</p><p className='mt-2 text-sm leading-6 text-amber-950'>An eligible or popular option with weaker, more indirect, sparse, or less replicated evidence so readers can see uncertainty rather than having it averaged away.</p></article>
      </section>

      <section className='grid gap-4 md:grid-cols-2'>
        <article className='rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm'><h2 className='text-xl font-bold text-ink'>Not recommended / insufficient evidence</h2><p className='mt-2 text-sm leading-6 text-muted'>Popular supplements are not silently dropped when the evidence fails the threshold. They remain visible with the reason they did not qualify—such as mechanism-only evidence, no relevant human trials, unsuitable population evidence, or an unfavorable safety boundary.</p></article>
        <article className='rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm'><h2 className='text-xl font-bold text-ink'>Prescription drugs are out of scope</h2><p className='mt-2 text-sm leading-6 text-muted'>Prescription medicines can be discussed as clinical context, but the ranking engine rejects them as consumer supplement candidates. A supplement list is not allowed to imply that a prescription treatment and a retail supplement are interchangeable shopping choices.</p></article>
      </section>

      <BuyingQualityPrimer />

      <section className='rounded-2xl border border-brand-900/10 bg-brand-50/60 p-5'><h2 className='text-xl font-bold text-ink'>Required page order</h2><p className='mt-2 text-sm leading-6 text-muted'>Direct answer → ingredient evidence table → inclusion/exclusion rationale → safety and studied-form context → product-quality criteria → optional commercial product examples. Affiliate modules never come before the evidence needed to understand why an ingredient belongs on the page.</p><Link href='/guides/best/' className='mt-4 inline-flex font-bold text-indigo-800 hover:underline'>Browse best-supplement guides →</Link></section>
    </main>
  )
}
