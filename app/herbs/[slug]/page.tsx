import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getHerbBySlug, getHerbs } from '@/lib/runtime-data'

type Params = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const herbs = await getHerbs()
  return herbs.map(herb => ({ slug: herb.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const herb = await getHerbBySlug(slug)
  if (!herb) {
    return { title: 'Herb Not Found | The Hippie Scientist' }
  }
  const title = `${herb.displayName ?? herb.name ?? herb.slug} | Herb`
  return {
    title,
    description: herb.summary ?? herb.description,
    alternates: { canonical: `/herbs/${herb.slug}` },
  }
}

export default async function HerbDetailPage({ params }: Params) {
  const { slug } = await params
  const herb = await getHerbBySlug(slug)
  if (!herb) notFound()

  return (
    <article className='container-page py-10'>
      <h1 className='text-3xl font-semibold text-white'>{herb.displayName ?? herb.name ?? herb.slug}</h1>
      <p className='mt-3 max-w-3xl text-white/75'>{herb.description ?? herb.summary}</p>
      {Array.isArray(herb.mechanisms) && herb.mechanisms.length > 0 ? (
        <section className='mt-8'>
          <h2 className='text-xl font-semibold text-white'>Mechanisms</h2>
          <ul className='mt-3 list-disc space-y-1 pl-5 text-white/75'>
            {herb.mechanisms.map(item => <li key={item}>{item}</li>)}
          </ul>
        </section>
      ) : null}
      {herb.safetyNotes ? (
        <section className='mt-8 ds-card'>
          <h2 className='text-xl font-semibold text-white'>Safety notes</h2>
          <p className='mt-2 text-white/75'>{herb.safetyNotes}</p>
        </section>
      ) : null}
    </article>
  )
}
