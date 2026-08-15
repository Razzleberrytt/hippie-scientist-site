import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Public Research Roadmap | The Hippie Scientist',
  description: 'See how The Hippie Scientist prioritizes evidence, safety, tools, and reader-requested research improvements — and submit a public research suggestion.',
  path: '/roadmap/',
})

const lanes = [
  { title: 'Evidence quality', status: 'Continuous', body: 'Verify high-traffic claims, improve source classification, refresh citations, and strengthen outcome-specific evidence summaries before expanding weak pages.' },
  { title: 'Safety and interactions', status: 'Continuous', body: 'Improve interaction provenance, uncertainty labels, safety completeness, and educational pairwise resources without treating missing data as proof of safety.' },
  { title: 'Research tools', status: 'Active', body: 'Expand the Evidence Database, Safety Checker, Botanical Activity Atlas, Citation Explorer, evidence-change tracking, and downloadable original-data resources.' },
  { title: 'High-demand content', status: 'Demand-ranked', body: 'Upgrade pages and comparisons that show measurable search demand, reader demand, or evidence gaps rather than expanding the database evenly by alphabetical order.' },
] as const

const intakeHref = 'https://github.com/Razzleberrytt/hippie-scientist-site/issues/new?template=research-intake.yml'
const openRequestsHref = 'https://github.com/Razzleberrytt/hippie-scientist-site/issues?q=is%3Aissue+is%3Aopen+label%3Aevidence+label%3Aenhancement'

export default function RoadmapPage() {
  return (
    <main className='container-page space-y-8 py-10'>
      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 lg:p-10'>
        <p className='eyebrow-label'>Public roadmap</p>
        <h1 className='mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl'>What gets improved next — and why</h1>
        <p className='mt-5 max-w-3xl text-lg leading-8 text-muted'>Work is prioritized by evidence and safety importance, measurable search demand, reader demand, expected impact, confidence, and implementation effort. Requests can influence the queue, but they do not automatically change scientific conclusions or evidence grades.</p>
        <div className='mt-6 flex flex-wrap gap-3'>
          <a href={intakeHref} rel='noreferrer' className='rounded-full bg-brand-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700'>Suggest research or a correction</a>
          <a href={openRequestsHref} rel='noreferrer' className='rounded-full border border-brand-900/15 bg-white px-5 py-3 text-sm font-bold text-brand-800 transition hover:bg-brand-50'>See open public requests</a>
        </div>
      </section>

      <section aria-labelledby='roadmap-lanes' className='space-y-4'>
        <div><p className='eyebrow-label'>Current lanes</p><h2 id='roadmap-lanes' className='mt-2 text-2xl font-semibold tracking-tight text-ink'>The work streams that stay in view</h2></div>
        <div className='grid gap-4 md:grid-cols-2'>
          {lanes.map((lane) => (
            <article key={lane.title} className='card-premium p-6'>
              <div className='flex items-start justify-between gap-4'><h3 className='text-lg font-bold text-ink'>{lane.title}</h3><span className='rounded-full border border-brand-900/10 bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-800'>{lane.status}</span></div>
              <p className='mt-3 text-sm leading-7 text-muted'>{lane.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className='rounded-2xl border border-brand-900/10 bg-[var(--surface-card)] p-6'>
        <h2 className='text-xl font-bold text-ink'>How reader demand enters the queue</h2>
        <ol className='mt-4 space-y-3 text-sm leading-6 text-muted'>
          <li><strong className='text-ink'>1. Submit a public research request.</strong> Choose ingredient, comparison, missing study, or scientific correction.</li>
          <li><strong className='text-ink'>2. Demand is aggregated.</strong> Public reactions and substantive discussion are counted as demand signals; duplicate requests can be consolidated.</li>
          <li><strong className='text-ink'>3. Demand is not the only score.</strong> Safety importance, evidence availability, search opportunity, expected impact, confidence, and effort can outrank popularity.</li>
          <li><strong className='text-ink'>4. Scientific changes still require review.</strong> A popular request never automatically rewrites a conclusion or evidence grade.</li>
        </ol>
      </section>

      <section className='rounded-2xl border border-amber-900/15 bg-amber-50/60 p-5 text-sm leading-6 text-amber-950'><strong>Privacy:</strong> public requests are for research topics and public sources only. Do not submit symptoms, diagnoses, medication lists, medical records, or other sensitive personal health information.</section>
      <p className='text-sm text-muted'>Looking for the site methodology instead? <Link href='/info/methodology/' className='font-bold text-brand-800 underline'>Read how evidence and safety conclusions are built.</Link></p>
    </main>
  )
}
