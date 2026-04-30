import type { Metadata } from 'next'
import Link from 'next/link'
import { PUBLIC_ROUTES } from '@/lib/publicRoutes'

export const metadata: Metadata = {
  title: 'Build',
  description: 'Start building a personalized educational blend plan.',
}

export default function BuildPage() {
  return (
    <section className='space-y-6'>
      <h1 className='text-3xl font-semibold tracking-tight'>Build a Blend</h1>
      <p className='max-w-2xl text-white/75'>
        This route is reserved for the blend-building workflow. For now, explore herbs and compounds while this tool is being expanded.
      </p>
      <div className='flex flex-wrap gap-3'>
        <Link href={PUBLIC_ROUTES.herbs} className='rounded-full border border-white/15 px-4 py-2 text-sm hover:bg-white/5'>Browse herbs</Link>
        <Link href={PUBLIC_ROUTES.compounds} className='rounded-full border border-white/15 px-4 py-2 text-sm hover:bg-white/5'>Browse compounds</Link>
      </div>
    </section>
  )
}
