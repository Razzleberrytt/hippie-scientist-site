import type { Metadata } from 'next'
import Link from 'next/link'
import SchemaGraphScript from '@/components/seo/SchemaGraphScript'
import BotanicalActivityAtlasClient from '@/components/atlas/BotanicalActivityAtlasClient'
import { getBotanicalAtlasRecords } from '@/lib/botanical-atlas-data'
import { BOTANICAL_ATLAS_CATEGORIES } from '@/lib/botanical-atlas-categories'
import { buildToolPageSchemaGraph } from '@/lib/schema-graph'
import { buildPageMetadata, SITE_URL } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Botanical Activity Atlas – Effects, Compounds & Safety',
  description:
    'Compare pharmacologically active botanicals by effects, active compounds, noticeability, evidence strength, timing, and safety signals.',
  path: '/tools/botanical-activity-atlas',
})

export default async function BotanicalActivityAtlasPage() {
  const herbs = await getBotanicalAtlasRecords()

  const schemaGraph = buildToolPageSchemaGraph({
    path: '/tools/botanical-activity-atlas',
    title: 'Botanical Activity Atlas',
    description:
      'An interactive comparison of active botanicals by constituent chemistry, effect profile, evidence, noticeability, timing, and safety signals.',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Tools', url: `${SITE_URL}/tools/` },
      { name: 'Botanical Activity Atlas', url: `${SITE_URL}/tools/botanical-activity-atlas/` },
    ],
    faqQuestions: [
      {
        question: 'What counts as an active botanical?',
        answer:
          'The atlas includes botanicals with constituents that may produce measurable physiological or psychological effects. Active does not necessarily mean intoxicating, strongly noticeable, effective, or safe.',
      },
      {
        question: 'Does a high noticeability rating mean a botanical works better?',
        answer:
          'No. Noticeability describes how apparent an effect may be, while evidence strength describes how confidently an effect is supported. A noticeable product can still have weak evidence or an unfavorable safety profile.',
      },
      {
        question: 'Can the atlas determine whether a botanical is safe for me?',
        answer:
          'No. It is an educational comparison tool. Medication use, health conditions, pregnancy, product quality, dose, and combinations can substantially change risk.',
      },
    ],
  })

  return (
    <main className='mx-auto max-w-7xl space-y-8 px-4 py-8 sm:py-10'>
      <SchemaGraphScript graph={schemaGraph} />

      <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8'>
        <p className='eyebrow-label'>Interactive Research Tool</p>
        <h1 className='mt-2 text-3xl font-bold tracking-tight text-ink sm:text-5xl'>Botanical Activity Atlas</h1>
        <p className='mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg'>
          Explore which botanicals contain pharmacologically active compounds, what effects they are associated with, how noticeable those effects may be, how strong the evidence is, and which safety signals deserve attention.
        </p>
      </section>

      <section className='grid gap-4 md:grid-cols-3'>
        <article className='rounded-2xl border border-brand-900/10 bg-white/85 p-5 shadow-sm'>
          <h2 className='font-bold text-ink'>Activity is not efficacy</h2>
          <p className='mt-2 text-sm leading-6 text-muted'>A compound can affect a receptor, enzyme, or pathway without producing a useful real-world outcome.</p>
        </article>
        <article className='rounded-2xl border border-brand-900/10 bg-white/85 p-5 shadow-sm'>
          <h2 className='font-bold text-ink'>Noticeability is not quality</h2>
          <p className='mt-2 text-sm leading-6 text-muted'>Strong sensations may reflect stimulation, sedation, toxicity, side effects, or dose—not superior benefits.</p>
        </article>
        <article className='rounded-2xl border border-brand-900/10 bg-white/85 p-5 shadow-sm'>
          <h2 className='font-bold text-ink'>Labels are normalized</h2>
          <p className='mt-2 text-sm leading-6 text-muted'>Related source terms are grouped into consistent effect, evidence, chemistry, noticeability, and safety categories.</p>
        </article>
      </section>

      <section className='space-y-4'>
        <div>
          <p className='eyebrow-label'>Focused Comparisons</p>
          <h2 className='mt-1 text-2xl font-bold text-ink'>Start with a high-interest category</h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-muted'>These curated entry pages use the same atlas data while adding category-specific context and safety framing.</p>
        </div>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {BOTANICAL_ATLAS_CATEGORIES.map((category) => (
            <Link key={category.slug} href={`/tools/botanical-activity-atlas/${category.slug}/`} className='rounded-2xl border border-brand-900/10 bg-white/85 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-800/30'>
              <p className='text-xs font-bold uppercase tracking-wide text-emerald-800'>{category.eyebrow}</p>
              <h3 className='mt-2 font-bold text-ink'>{category.shortTitle}</h3>
              <p className='mt-2 text-sm leading-6 text-muted'>{category.description}</p>
              <span className='mt-3 inline-block text-sm font-semibold text-emerald-800'>Open comparison →</span>
            </Link>
          ))}
        </div>
      </section>

      <BotanicalActivityAtlasClient records={herbs} />

      <section className='rounded-2xl border border-amber-900/15 bg-amber-50/60 p-5 text-xs leading-relaxed text-amber-950'>
        <p className='font-bold'>Educational use only</p>
        <p className='mt-1.5'>This atlas summarizes structured reference data and cannot establish product identity, dose, purity, personal suitability, or clinical safety. Review medication and health-condition interactions with a qualified clinician or pharmacist.</p>
      </section>
    </main>
  )
}
