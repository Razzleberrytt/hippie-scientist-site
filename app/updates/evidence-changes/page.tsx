import type { Metadata } from 'next'
import Link from 'next/link'
import ResearchUpdateList from '@/components/updates/ResearchUpdateList'
import { getEvidenceChangeUpdates } from '@/lib/research-updates'
import { buildPageMetadata } from '@/src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Recent Supplement Evidence Changes',
  description: 'An append-only public feed of recorded supplement evidence-grade changes, including the prior grade, new grade, and reason for each change.',
  path: '/updates/evidence-changes/',
})

export default function EvidenceChangesPage() {
  const updates = getEvidenceChangeUpdates()
  return (
    <main className='container-page space-y-7 py-10'>
      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8'>
        <p className='eyebrow-label'>Evidence Change Tracker</p>
        <h1 className='mt-2 text-4xl font-semibold tracking-tight text-ink'>Recent evidence changes</h1>
        <p className='mt-4 max-w-3xl text-lg leading-8 text-muted'>This feed records actual evidence-grade changes and why they happened. It does not infer historical upgrades or downgrades that were never recorded at the time.</p>
        <div className='mt-5 flex flex-wrap gap-3 text-sm font-bold'>
          <a href='/updates/evidence-changes.xml' className='rounded-full border border-brand-900/15 bg-white px-4 py-2 text-brand-800'>Follow this RSS feed</a>
          <Link href='/updates/recently-reviewed/' className='rounded-full border border-brand-900/15 bg-white px-4 py-2 text-brand-800'>Recently reviewed</Link>
          <Link href='/evidence/evidence-report/' className='rounded-full border border-brand-900/15 bg-white px-4 py-2 text-brand-800'>Evidence Report</Link>
        </div>
      </section>
      <ResearchUpdateList updates={updates} emptyMessage='No evidence-grade changes have been recorded in the append-only public ledger yet. The tracker will populate when a real reviewed change occurs.' />
    </main>
  )
}
