import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCompoundBySlug, getCompounds } from '@/lib/runtime-data'

type Params = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const compounds = await getCompounds()
  return compounds.map(compound => ({ slug: compound.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const compound = await getCompoundBySlug(slug)
  if (!compound) {
    return { title: 'Compound Not Found | The Hippie Scientist' }
  }
  const title = `${compound.displayName ?? compound.name ?? compound.slug} | Compound`
  return {
    title,
    description: compound.summary ?? compound.description,
    alternates: { canonical: `/compounds/${compound.slug}` },
  }
}

export default async function CompoundDetailPage({ params }: Params) {
  const { slug } = await params
  const compound = await getCompoundBySlug(slug)
  if (!compound) notFound()

  return (
    <article className='container-page py-10'>
      <h1 className='text-3xl font-semibold text-white'>{compound.displayName ?? compound.name ?? compound.slug}</h1>
      <p className='mt-3 max-w-3xl text-white/75'>{compound.description ?? compound.summary}</p>
      {compound.compoundClass ? (
        <p className='mt-4 text-sm text-white/60'>Class: {compound.compoundClass}</p>
      ) : null}
      {Array.isArray(compound.mechanisms) && compound.mechanisms.length > 0 ? (
        <section className='mt-8'>
          <h2 className='text-xl font-semibold text-white'>Mechanisms</h2>
          <ul className='mt-3 list-disc space-y-1 pl-5 text-white/75'>
            {compound.mechanisms.map(item => <li key={item}>{item}</li>)}
          </ul>
        </section>
      ) : null}
      {compound.safetyNotes ? (
        <section className='mt-8 ds-card'>
          <h2 className='text-xl font-semibold text-white'>Safety notes</h2>
          <p className='mt-2 text-white/75'>{compound.safetyNotes}</p>
        </section>
      ) : null}
    </article>
  )
}
