import Link from 'next/link'
import type { ResearchUpdate } from '@/lib/research-updates'

export default function ResearchUpdateList({ updates, emptyMessage }: { updates: ResearchUpdate[]; emptyMessage: string }) {
  if (!updates.length) {
    return <div className='rounded-2xl border border-brand-900/10 bg-white p-6 text-sm leading-6 text-muted'>{emptyMessage}</div>
  }

  return (
    <ol className='space-y-4'>
      {updates.map(update => (
        <li key={update.id} id={update.id} className='scroll-mt-24 rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm'>
          <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-[0.08em] text-brand-700'>
            <time dateTime={update.occurredAt}>{new Date(update.occurredAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })}</time>
            <span>{update.kind === 'review' ? 'Editorial review' : 'Evidence grade change'}</span>
          </div>
          <h2 className='mt-2 text-xl font-bold text-ink'>{update.title}</h2>
          <p className='mt-2 text-sm leading-7 text-muted'>{update.summary}</p>
          <Link href={update.path} className='mt-3 inline-block text-sm font-bold text-brand-800 hover:underline'>Open the affected page →</Link>
        </li>
      ))}
    </ol>
  )
}
