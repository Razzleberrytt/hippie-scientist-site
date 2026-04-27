import Link from 'next/link'
import { getCompounds } from '@/lib/runtime-data'

export default async function CompoundsPage() {
  const compounds = await getCompounds()

  return (
    <section className='container-page py-10'>
      <h1 className='text-3xl font-semibold text-white'>Compounds</h1>
      <div className='mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        {compounds.map(compound => (
          <Link key={compound.slug} href={`/compounds/${compound.slug}`} className='ds-card block'>
            <h2 className='font-semibold text-white'>{compound.displayName ?? compound.name ?? compound.slug}</h2>
            <p className='mt-2 line-clamp-3 text-sm text-white/70'>
              {compound.summary ?? compound.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}
