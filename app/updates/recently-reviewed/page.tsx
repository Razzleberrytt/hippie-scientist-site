import type { Metadata } from 'next'
import Link from 'next/link'
import ResearchUpdateList from '@/components/updates/ResearchUpdateList'
import { getRecentlyReviewedUpdates } from '@/lib/research-updates'
import { buildPageMetadata } from '@/src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Recently Reviewed Research Pages',
  description: 'A truthful, append-only feed of pages that received a real editorial or scientific review — not pages that merely rebuilt or redeployed.',
  path: '/updates/recently-reviewed/',
})

export default function RecentlyReviewedPage() {
  const updates = getRecentlyReviewedUpdates()
  return (
    <main className='container-page space-y-7 py-10'>
      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8'>
        <p className='eyebrow-label'>Research updates</p>
        <h1 className='mt-2 text-4xl font-semibold tracking-tight text-ink'>Recently reviewed</h1>
        <p className='mt-4 max-w-3xl text-lg leading-8 text-muted'>Only real recorded review events appear here. Deployments, template edits, and build timestamps do not make a page “recently reviewed.”</p>
        <div className='mt-5 flex flex-wrap gap-3 text-sm font-bold'>
          <a href='/updates/recently-reviewed.xml' className='rounded-full border border-brand-900/15 bg-white px-4 py-2 text-brand-800'>Follow this RSS feed</a>
          <Link href='/updates/evidence-changes/' className='rounded-full border border-brand-900/15 bg-white px-4 py-2 text-brand-800'>Evidence changes</Link>
          <a href='/rss.xml' className='rounded-full border border-brand-900/15 bg-white px-4 py-2 text-brand-800'>All-site RSS</a>
        </div>
      </section>
      <ResearchUpdateList updates={updates} emptyMessage='No real editorial review events have been recorded in the public ledger yet. This empty state is intentional; the site will not manufacture review dates.' />
    </main>
  )
}
