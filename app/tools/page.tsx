import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Research Tools | The Hippie Scientist',
  description: 'Start with the Safety Checker, Evidence Database, Botanical Activity Atlas, Evidence Report, or supplement comparisons.',
  path: '/tools/',
})

const differentiators = [
  {
    href: '/safety-checker/',
    title: 'Safety Checker',
    eyebrow: 'Screen combinations',
    description: 'Find overlapping caution signals across supplements and medication classes, then trace each flag back to the underlying ingredient records.',
    exampleHref: '/safety-checker/?items=herb%3Aashwagandha%2Ccompound%3Amelatonin',
    example: 'Check Ashwagandha + Melatonin',
  },
  {
    href: '/evidence/evidence-checker/',
    title: 'Evidence Database',
    eyebrow: 'Find the strongest evidence',
    description: 'Search the structured supplement library and separate stronger human evidence from preliminary or mechanism-only records.',
    exampleHref: '/evidence/evidence-checker/?grade=A',
    example: 'Show A-grade ingredients',
  },
  {
    href: '/tools/botanical-activity-atlas/',
    title: 'Botanical Activity Atlas',
    eyebrow: 'Explore relationships',
    description: 'Compare botanicals through constituent chemistry, human-evidence context, effects, noticeability, and safety signals without confusing mechanism with clinical benefit.',
    exampleHref: '/tools/botanical-activity-atlas/?q=turmeric',
    example: 'Explore compounds found in Turmeric',
  },
  {
    href: '/evidence/evidence-report/',
    title: 'Evidence Report',
    eyebrow: 'See the big picture',
    description: 'Read the annual state of supplement evidence: what is well supported, what remains preliminary, and where the evidence base has changed.',
    exampleHref: '/evidence/evidence-report/',
    example: 'Open the current Evidence Report',
  },
  {
    href: '/guides/compare/',
    title: 'Comparisons',
    eyebrow: 'Make a decision',
    description: 'Compare two options by evidence strength, safety, studied dose or form, and practical tradeoffs instead of relying on generic “best” lists.',
    exampleHref: '/guides/compare/melatonin-vs-magnesium/',
    example: 'Compare Magnesium vs Melatonin',
  },
] as const

export default function ToolsPage() {
  return (
    <main className='container-page space-y-8 py-10'>
      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 lg:p-10'>
        <p className='eyebrow-label'>Research tools</p>
        <h1 className='mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl'>Five ways to answer a research question</h1>
        <p className='mt-5 max-w-3xl text-lg leading-8 text-muted'>
          Start with the job you need done: screen a combination, find stronger human evidence, explore botanical chemistry, inspect the evidence landscape, or compare two options. Each tool below has a different job, so you do not have to guess where to begin.
        </p>
      </section>

      <section aria-labelledby='research-tool-differentiators' className='space-y-4'>
        <div>
          <p className='eyebrow-label'>Choose by intent</p>
          <h2 id='research-tool-differentiators' className='mt-2 text-2xl font-semibold tracking-tight text-ink'>What each tool is uniquely good at</h2>
        </div>
        <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
          {differentiators.map((tool) => (
            <article key={tool.href} className='card-premium flex h-full flex-col p-6'>
              <p className='text-xs font-bold uppercase tracking-[0.12em] text-brand-700'>{tool.eyebrow}</p>
              <h3 className='mt-2 text-xl font-semibold text-ink'>{tool.title}</h3>
              <p className='mt-3 flex-1 text-sm leading-7 text-muted'>{tool.description}</p>
              <div className='mt-5 flex flex-wrap gap-2'>
                <Link href={tool.href} className='rounded-full bg-brand-800 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700'>
                  Open {tool.title}
                </Link>
                <Link href={tool.exampleHref} className='rounded-full border border-brand-900/15 bg-white px-4 py-2 text-sm font-bold text-brand-800 transition hover:border-brand-700/35 hover:bg-brand-50'>
                  {tool.example} →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className='rounded-2xl border border-brand-900/10 bg-brand-50/55 p-5 text-sm leading-6 text-muted'>
        <strong className='text-ink'>Not sure which one?</strong> Use <Link href='/start/' className='font-bold text-brand-800 underline'>Start Here</Link> for a goal-first path, or <Link href='/search/' className='font-bold text-brand-800 underline'>search the site</Link> when you already know the ingredient or question.
      </section>
    </main>
  )
}
