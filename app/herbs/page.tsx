import Link from 'next/link'
import { getHerbs } from '@/lib/runtime-data'

export default async function HerbsPage() {
  const herbs = await getHerbs()

  return (
    <section className='container-page py-10'>
      <h1 className='text-3xl font-semibold text-white'>Herbs</h1>
      <div className='mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        {herbs.map(herb => (
          <Link key={herb.slug} href={`/herbs/${herb.slug}`} className='ds-card block'>
            <h2 className='font-semibold text-white'>{herb.displayName ?? herb.name ?? herb.slug}</h2>
            <p className='mt-2 line-clamp-3 text-sm text-white/70'>{herb.summary ?? herb.description}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
