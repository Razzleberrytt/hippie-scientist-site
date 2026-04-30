import { notFound } from 'next/navigation'
import Link from 'next/link'
import { seoCollections } from '@/data/seoCollections'
import { getCompounds, getHerbs } from '@/lib/runtime-data'

type Params = { params: Promise<{ slug: string }> }

function textMatchesAny(text: string, filters: string[]) {
  const value = text.toLowerCase()
  return filters.some(filter => value.includes(filter.toLowerCase()))
}

export async function generateStaticParams() {
  return seoCollections.map(collection => ({ slug: collection.slug }))
}

export default async function CollectionPage({ params }: Params) {
  const { slug } = await params
  const collection = seoCollections.find(item => item.slug === slug)
  if (!collection) notFound()

  const herbs = await getHerbs()
  const compounds = await getCompounds()
  const pool = collection.itemType === 'compound' ? compounds : herbs
  const effects = collection.filters.effectsAny ?? []

  const items = pool
    .filter(item => {
      if (effects.length === 0) return true
      const haystack = [item.summary, item.description, ...(item.mechanisms ?? [])]
        .filter(Boolean)
        .join(' ')
      return textMatchesAny(haystack, effects)
    })
    .slice(0, 40)

  return (
    <section className='container-page py-10'>
      <h1 className='text-3xl font-semibold text-white'>{collection.title}</h1>
      <p className='mt-3 max-w-3xl text-white/75'>{collection.description}</p>
      <div className='mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        {items.map(item => {
          const href = collection.itemType === 'compound' ? `/compounds/${item.slug}` : `/herbs/${item.slug}`
          return (
            <Link key={item.slug} href={href} className='ds-card block'>
              <h2 className='font-semibold text-white'>{item.displayName ?? item.name ?? item.slug}</h2>
              <p className='mt-2 line-clamp-3 text-sm text-white/70'>{item.summary ?? item.description}</p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
