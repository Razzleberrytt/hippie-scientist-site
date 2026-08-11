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
    href: '/tools/botanical-activity-atlas/',
    title: 'Botanical Activity Atlas',
    description:
      'Compare botanicals by active compounds, effects, noticeability, evidence strength, timing, and safety signals.',
  },
]

export default function ToolsPage() {
  return (
    <main className='container-page space-y-8 py-10'>
      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 lg:p-10'>
        <p className='eyebrow-label'>Research tools</p>
        <h1 className='mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl'>Interactive research tools</h1>
        <p className='mt-5 max-w-3xl text-lg leading-8 text-muted'>
          Explore structured, evidence-first tools designed to make compound activity, botanical comparisons, and safety context easier to inspect.
        </p>
      </section>

      <section className='grid gap-5 sm:grid-cols-2'>
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className='card-premium block p-6 transition hover:-translate-y-0.5 hover:border-brand-900/20'
          >
            <h2 className='text-xl font-semibold text-ink'>{tool.title}</h2>
            <p className='mt-3 text-sm leading-7 text-muted'>{tool.description}</p>
            <span className='mt-4 inline-block text-sm font-semibold text-brand-800'>Open tool →</span>
          </Link>
        ))}
      </section>
    </main>
  )
}
