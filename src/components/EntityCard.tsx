import type { Entity } from '@/lib/data'
import { buildCardSummary } from '@/lib/summary'

export default function EntityCard({ e }: { e: Entity }) {
  const summary = buildCardSummary({
    description: e.summary,
    fallback: 'Profile still being expanded. Review the detail page for currently available data.',
  })

  return (
    <article className='group relative flex h-full flex-col gap-2.5 rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.03] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/16 hover:bg-white/[0.055] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]'>
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 rounded-[var(--radius-lg)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 shadow-[inset_0_0_0_1px_rgba(14,207,179,0.12)]'
      />
      <h3 className='text-xl font-semibold text-white md:text-2xl'>
        {e.name}
      </h3>
      {e.scientificName && <p className='mt-1 italic text-white/60'>{e.scientificName}</p>}
      <p className='mt-3 text-white/80'>{summary}</p>
      {e.tags?.length ? (
        <div className='mt-4 flex flex-wrap gap-2'>
          {e.tags.slice(0, 4).map(tag => (
            <span
              key={tag}
              className='inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[0.68rem] font-medium text-white/55'
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  )
}
