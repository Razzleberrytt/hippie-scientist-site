import type { Metadata } from 'next'
import Link from 'next/link'
import { LEAD_MAGNETS } from '@/lib/lead-magnets'
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Free Supplement Research Resources',
  description: 'Free evidence, sleep, stress, focus, label-reading, interaction, and supplement-buying research checklists from The Hippie Scientist.',
  path: '/lead-magnets/',
})

export default function LeadMagnetsPage() {
  const resources = Object.values(LEAD_MAGNETS)
  return (
    <main className='mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-10'>
      <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8'>
        <p className='eyebrow-label'>Free research resources</p>
        <h1 className='mt-2 text-3xl font-bold tracking-tight text-ink sm:text-5xl'>Choose the checklist that matches what you are researching</h1>
        <p className='mt-4 max-w-4xl text-base leading-7 text-muted sm:text-lg'>Instead of one generic download on every page, these resources are matched to sleep, stress, focus, safety, label reading, evidence literacy, and buying decisions.</p>
      </section>

      <section className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {resources.map((resource) => (
          <article key={resource.slug} className='flex flex-col rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm'>
            <p className='text-xs font-bold uppercase tracking-wide text-indigo-800'>{resource.eyebrow}</p>
            <h2 className='mt-2 text-xl font-bold text-ink'>{resource.title}</h2>
            <p className='mt-2 flex-1 text-sm leading-6 text-muted'>{resource.description}</p>
            <Link href={`/lead-magnets/${resource.slug}/`} className='mt-4 font-bold text-indigo-800 hover:underline'>Open resource →</Link>
          </article>
        ))}
      </section>
    </main>
  )
}
