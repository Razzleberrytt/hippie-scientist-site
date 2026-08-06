import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import SchemaGraphScript from '@/components/seo/SchemaGraphScript'
import BotanicalActivityAtlasClient from '@/components/atlas/BotanicalActivityAtlasClient'
import { getBotanicalAtlasRecords } from '@/lib/botanical-atlas-data'
import {
  BOTANICAL_ATLAS_CATEGORIES,
  getBotanicalAtlasCategory,
} from '@/lib/botanical-atlas-categories'
import { buildToolPageSchemaGraph } from '@/lib/schema-graph'
import { buildPageMetadata, SITE_URL } from '@/lib/seo'

interface PageProps {
  params: Promise<{ category: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return BOTANICAL_ATLAS_CATEGORIES.map(({ slug }) => ({ category: slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: slug } = await params
  const category = getBotanicalAtlasCategory(slug)
  if (!category) return {}

  return buildPageMetadata({
    title: category.title,
    description: category.description,
    path: `/tools/botanical-activity-atlas/${category.slug}`,
  })
}

export default async function BotanicalAtlasCategoryPage({ params }: PageProps) {
  const { category: slug } = await params
  const category = getBotanicalAtlasCategory(slug)
  if (!category) notFound()

  const allRecords = await getBotanicalAtlasRecords()
  const records = allRecords.filter(category.matches)
  const related = BOTANICAL_ATLAS_CATEGORIES.filter((item) => item.slug !== category.slug)

  const path = `/tools/botanical-activity-atlas/${category.slug}`
  const schemaGraph = buildToolPageSchemaGraph({
    path,
    title: category.title,
    description: category.description,
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Tools', url: `${SITE_URL}/tools/` },
      { name: 'Botanical Activity Atlas', url: `${SITE_URL}/tools/botanical-activity-atlas/` },
      { name: category.shortTitle, url: `${SITE_URL}${path}/` },
    ],
    faqQuestions: [
      {
        question: `How were botanicals selected for this ${category.shortTitle.toLowerCase()} comparison?`,
        answer: 'The page filters structured herb records using normalized effect, chemistry, or safety categories. Inclusion does not prove effectiveness, product quality, or personal suitability.',
      },
      {
        question: 'Does stronger noticeability mean stronger evidence?',
        answer: 'No. Noticeability and evidence are separate dimensions. A botanical may produce obvious sensations while having weak clinical evidence, or have useful evidence without feeling immediately noticeable.',
      },
      {
        question: 'Can this comparison replace an interaction check?',
        answer: 'No. It is an educational screening and discovery tool. Medication, health-condition, dose, product, and combination risks require individualized review.',
      },
    ],
  })

  return (
    <main className='mx-auto max-w-7xl space-y-8 px-4 py-8 sm:py-10'>
      <SchemaGraphScript graph={schemaGraph} />

      <nav aria-label='Breadcrumb' className='text-sm text-muted'>
        <Link href='/tools/botanical-activity-atlas/' className='font-semibold text-emerald-800 hover:underline'>Botanical Activity Atlas</Link>
        <span aria-hidden='true' className='mx-2'>/</span>
        <span>{category.shortTitle}</span>
      </nav>

      <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8'>
        <p className='eyebrow-label'>{category.eyebrow}</p>
        <h1 className='mt-2 text-3xl font-bold tracking-tight text-ink sm:text-5xl'>{category.title}</h1>
        <p className='mt-4 max-w-4xl text-base leading-7 text-muted sm:text-lg'>{category.intro}</p>
        <div className='mt-5 flex flex-wrap items-center gap-3 text-sm'>
          <span className='rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-950'>{records.length} matching botanicals</span>
          <Link href='/tools/botanical-activity-atlas/' className='font-semibold text-emerald-800 hover:underline'>Browse the complete atlas →</Link>
        </div>
      </section>

      <section className='rounded-2xl border border-amber-900/15 bg-amber-50/60 p-5 text-sm leading-6 text-amber-950'>
        <h2 className='font-bold'>Important context</h2>
        <p className='mt-1.5'>{category.safetyNote}</p>
      </section>

      <BotanicalActivityAtlasClient records={records} />

      <section className='space-y-4'>
        <h2 className='text-2xl font-bold text-ink'>Explore related atlas guides</h2>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {related.map((item) => (
            <Link key={item.slug} href={`/tools/botanical-activity-atlas/${item.slug}/`} className='rounded-2xl border border-brand-900/10 bg-white/85 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-800/30'>
              <p className='text-xs font-bold uppercase tracking-wide text-emerald-800'>{item.eyebrow}</p>
              <h3 className='mt-2 font-bold text-ink'>{item.shortTitle}</h3>
              <p className='mt-2 text-sm leading-6 text-muted'>{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className='rounded-2xl border border-brand-900/10 bg-white/80 p-5 text-xs leading-relaxed text-muted'>
        <p className='font-bold text-ink'>Educational use only</p>
        <p className='mt-1.5'>These comparisons summarize normalized reference data. They do not verify a commercial product, establish a dose, diagnose a condition, or determine whether a botanical is safe for an individual.</p>
      </section>
    </main>
  )
}
