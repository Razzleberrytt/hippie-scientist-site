import Link from 'next/link'
import { getCompounds, getHerbs } from '@/lib/runtime-data'

export default async function HomePage() {
  const [herbs, compounds] = await Promise.all([getHerbs(), getCompounds()])

  return (
    <section className='container-page py-12'>
      <h1 className='text-3xl font-semibold text-white'>The Hippie Scientist</h1>
      <p className='mt-3 max-w-2xl text-white/75'>
        Next.js App Router migration using generated V3 workbook runtime data.
      </p>
      <div className='mt-8 grid gap-4 sm:grid-cols-2'>
        <Link href='/herbs' className='ds-card block'>
          <p className='text-sm text-white/60'>Herbs</p>
          <p className='mt-1 text-2xl font-semibold text-white'>{herbs.length}</p>
        </Link>
        <Link href='/compounds' className='ds-card block'>
          <p className='text-sm text-white/60'>Compounds</p>
          <p className='mt-1 text-2xl font-semibold text-white'>{compounds.length}</p>
        </Link>
      </div>
    </section>
  )
}
