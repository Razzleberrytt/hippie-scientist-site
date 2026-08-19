import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Research Tools | The Hippie Scientist',
  description: 'Interactive research tools for comparing botanicals, evidence, activity, compounds, and safety context.',
  path: '/tools/',
})

const tools = [
  {
    href: '/safety-checker/',
    title: 'Safety Checker',
    description: 'Screen supplement and medication-class combinations for documented, structured, or theoretical caution signals — with the reason each flag appeared.',
    exampleHref: '/safety-checker/?items=herb%3Aashwagandha%2Ccompound%3Amelatonin',
    exampleLabel: 'Check Ashwagandha + Melatonin',
  },
  {
    href: '/evidence/evidence-checker/',
    title: 'Evidence Database',
    description: 'Search the structured ingredient library by evidence strength so strong human evidence does not visually blend into preliminary or mechanistic research.',
    exampleHref: '/evidence/evidence-checker/?tier=a',
    exampleLabel: 'Show A-grade ingredients',
  },
  {
    href: '/tools/botanical-activity-atlas/',
    title: 'Botanical Activity Atlas',
    description: 'Explore botanicals through their compounds, effects, mechanisms, human-evidence counts, noticeability, and safety signals without treating mechanisms as proven outcomes.',
    exampleHref: '/tools/botanical-activity-atlas/?q=turmeric',
    exampleLabel: 'Explore compounds found in Turmeric',
  },
  {
    href: '/evidence/evidence-report/',
    title: 'Evidence Report',
    description: 'See the site-wide evidence picture as original aggregate research: what is well supported, what remains preliminary, and where the evidence mix changes over time.',
    exampleHref: '/evidence/evidence-report/',
    exampleLabel: 'Explore the 2026 Evidence Report',
  },
  {
    href: '/tools/evidence-matrices/',
    title: 'Evidence & Safety Matrices',
    description: 'Read outcomes and ingredients as a grid: which options carry human evidence for a goal, which rest on mechanism, and where safety cautions cluster — without averaging disagreement away.',
    exampleHref: '/tools/evidence-matrices/',
    exampleLabel: 'Open the evidence matrices',
  },
  {
    href: '/guides/compare/',
    title: 'Comparisons',
    description: 'Put two options side by side by evidence, safety, dose, form, timing, and practical tradeoffs instead of collapsing them into a simplistic winner.',
    exampleHref: '/guides/compare/melatonin-vs-magnesium/',
    exampleLabel: 'Compare Magnesium vs Melatonin',
  },
]

export default function ToolsPage() {
  return (
    <main className='container-page space-y-8 py-10'>
      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 lg:p-10'>
        <p className='eyebrow-label'>Research & decision tools</p>
        <h1 className='mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl'>Start with the question, not the database</h1>
        <p className='mt-5 max-w-3xl text-lg leading-8 text-muted'>
          Check safety, filter evidence, explore botanical chemistry, inspect the evidence report, or compare two options. Each tool has one job and a working example so you can see its value immediately.
        </p>
      </section>

      <section aria-labelledby='research-tool-list' className='space-y-4'>
        <div>
          <p className='eyebrow-label'>Five distinct jobs</p>
          <h2 id='research-tool-list' className='mt-1 text-2xl font-semibold text-ink'>Choose the tool that matches your intent</h2>
        </div>
        <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
          {tools.map((tool) => (
            <article key={tool.href} className='card-premium flex h-full flex-col p-6'>
              <h3 className='text-xl font-semibold text-ink'>
                <Link href={tool.href} className='hover:text-brand-800'>{tool.title}</Link>
              </h3>
              <p className='mt-3 flex-1 text-sm leading-7 text-muted'>{tool.description}</p>
              <div className='mt-5 flex flex-wrap gap-2'>
                <Link href={tool.href} className='inline-flex min-h-10 items-center rounded-full border border-brand-900/15 px-4 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-50'>
                  Open {tool.title}
                </Link>
                <Link href={tool.exampleHref} className='inline-flex min-h-10 items-center rounded-full bg-brand-800 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-900'>
                  {tool.exampleLabel} →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
