import { buildPageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = buildPageMetadata({
  title: 'Best Natural Sleep Aids That Actually Work',
  description: 'A simple guide to herbs commonly discussed for sleep onset, relaxation, and nighttime calm.',
  path: '/guides/best-natural-sleep-aids-that-work/',
})

export default function Page(){
  return (
    <div className='container-page py-10 space-y-8 max-w-3xl'>
      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8'>
        <p className='eyebrow-label'>Guide</p>
        <h1 className='mt-2 text-3xl font-semibold text-ink sm:text-4xl'>Best Natural Sleep Aids That Work</h1>
        <p className='mt-4 text-muted'>Sleep issues are often tied to stress and nervous system activation.</p>
      </section>

      <section className='card-premium p-6'>
        <ul className='list-disc pl-5 mt-2 space-y-2 text-muted'>
          <li><strong className='text-ink'>Valerian:</strong> sleep onset</li>
          <li><strong className='text-ink'>Lemon balm:</strong> calming</li>
          <li><strong className='text-ink'>Passionflower:</strong> relaxation</li>
        </ul>
        <div className='mt-6 flex gap-4 flex-wrap'>
          <Link href='/guides/best-supplements-for-sleep' className='text-sm font-medium text-emerald-700 hover:underline'>Top sleep aids →</Link>
          <Link href='/compare/magnesium-vs-melatonin' className='text-sm font-medium text-emerald-700 hover:underline'>Magnesium vs melatonin →</Link>
        </div>
      </section>
    </div>
  )
}

