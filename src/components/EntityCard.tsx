import type { Entity } from '@/lib/data'
import { buildCardSummary } from '@/lib/summary'

export default function EntityCard({ e }: { e: Entity }) {
  const summary = buildCardSummary({
    description: e.summary,
    fallback: 'Profile still being expanded. Review detail page for currently verified data.',
  })

  return (
    <article className='ds-card-lg ds-stack'>
      <h3 className='text-xl font-semibold text-white md:text-2xl'>
        {e.commonName ?? e.latinName}
      </h3>
      {e.commonName && <p className='mt-1 italic text-white/60'>{e.latinName}</p>}
      <p className='mt-3 text-white/80'>{summary}</p>
      {e.tags?.length ? (
        <div className='mt-4 flex flex-wrap gap-2'>
          {e.tags.slice(0, 4).map(tag => (
            <span key={tag} className='ds-pill'>
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  )
}
