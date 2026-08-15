import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Research Updates & Feeds',
  description: 'Follow recently reviewed pages, evidence-grade changes, and the main Hippie Scientist research RSS feed.',
  path: '/updates/',
})

const feeds = [
  { title: 'Recently reviewed', body: 'Real human/editorial review events only — never deployment timestamps.', href: '/updates/recently-reviewed/', rss: '/updates/recently-reviewed.xml' },
  { title: 'Evidence changes', body: 'Recorded grade upgrades and downgrades with the reason preserved.', href: '/updates/evidence-changes/', rss: '/updates/evidence-changes.xml' },
  { title: 'All research publishing', body: 'The existing sitewide article and research feed.', href: '/articles/', rss: '/rss.xml' },
] as const

export default function UpdatesPage() {
  return (
    <main className='container-page space-y-8 py-10'>
      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8'>
        <p className='eyebrow-label'>For readers, researchers & journalists</p>
        <h1 className='mt-2 text-4xl font-semibold tracking-tight text-ink'>Follow the research without checking manually</h1>
        <p className='mt-4 max-w-3xl text-lg leading-8 text-muted'>Subscribe only to the update stream you care about. Additional topic feeds will be added when observed demand justifies them rather than multiplying low-value feeds by default.</p>
      </section>
      <section className='grid gap-4 md:grid-cols-3'>
        {feeds.map(feed => (
          <article key={feed.title} className='card-premium p-6'>
            <h2 className='text-xl font-bold text-ink'>{feed.title}</h2>
            <p className='mt-3 text-sm leading-7 text-muted'>{feed.body}</p>
            <div className='mt-5 flex flex-wrap gap-3 text-sm font-bold'>
              <Link href={feed.href} className='text-brand-800 hover:underline'>View feed →</Link>
              <a href={feed.rss} className='text-brand-800 hover:underline'>RSS ↗</a>
            </div>
          </article>
        ))}
      </section>
      <p className='text-sm leading-6 text-muted'>Topic-specific RSS is intentionally demand-gated. Evidence changes already receive their own focused feed because they are a distinct research-following use case; arbitrary ingredient/topic feeds are not generated unless usage demonstrates demand.</p>
    </main>
  )
}
