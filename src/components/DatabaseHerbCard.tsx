import { Link } from 'react-router-dom'
import type { Herb } from '../types'
import { isNonEmpty, toArray, firstN, cleanText, urlish } from '../lib/normalize'
import { useFavorites } from '../lib/useFavorites'
import { herbName } from '../utils/herb'

interface Props {
  herb: Herb
}

export function DatabaseHerbCard({ herb }: Props) {
  const title = herbName(herb)
  const scientific = herb.scientific?.trim()
  const detailHref = `/herb/${herb.slug}`
  const intensity = herb.intensity?.trim()
  const region = herb.region?.trim()
  const legalStatus = herb.legalstatus?.trim()
  const { favs, toggle, has } = useFavorites()
  const isFavorite = has(herb.slug)
  return (
    <article
      className='glassmorphic-card soft-border-glow relative flex h-full flex-col gap-2 p-4 text-sand'
      data-favorites-count={favs.length}
    >
      <header>
        <div className='flex items-center'>
          <h2 className='text-xl font-semibold text-lime-300'>{title}</h2>
          <button
            onClick={event => {
              event.stopPropagation()
              toggle(herb.slug)
            }}
            className={`ml-2 text-xl ${isFavorite ? 'text-yellow-400' : 'text-gray-400'}`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={isFavorite}
          >
            ★
          </button>
        </div>
        {isNonEmpty(scientific) && <p className='text-sm italic text-sand/70'>{cleanText(scientific)}</p>}
        {isNonEmpty(intensity) && (
          <p className='mt-1 inline-flex items-center rounded-full bg-white/10 px-2 py-1 text-xs uppercase tracking-wide text-sand/80'>
            Intensity: {cleanText(intensity)}
          </p>
        )}
      </header>

      {isNonEmpty(herb.effects) && (
        <p className='text-sm text-sand/90'>
          <strong>Effects:</strong> {cleanText(herb.effects)}
        </p>
      )}
      {isNonEmpty(herb.description) && (
        <p className='text-sm text-sand/80'>
          <strong>Description:</strong> {cleanText(herb.description)}
        </p>
      )}

      {isNonEmpty(herb.tags) && (
        <div className='mt-1 flex flex-wrap gap-2'>
          {firstN(herb.tags, 6).map(tag => (
            <span key={tag} className='rounded-full bg-purple-700/40 px-2 py-1 text-xs'>
              {tag}
            </span>
          ))}
        </div>
      )}

      {isNonEmpty(region) && <p className='mt-1 text-sm text-sand/80'>🌍 {cleanText(region)}</p>}

      {isNonEmpty(herb.compounds) && (
        <p className='mt-1 text-sm text-sand/90'>
          <strong>Active Compounds:</strong> {firstN(herb.compounds, 3).join(', ')}
        </p>
      )}

      {isNonEmpty(herb.contraindications) && (
        <p className='mt-1 text-sm text-sand/90'>
          <strong>Contraindications:</strong> {toArray(herb.contraindications).join(', ')}
        </p>
      )}

      {isNonEmpty(herb.sources) && (
        <div className='mt-2 text-sm text-sand/90'>
          <strong>Sources:</strong>
          <ul className='mt-1 list-disc pl-5'>
            {toArray(herb.sources).map((source, index) => (
              <li key={`${herb.slug}-source-${index}`}>
                {urlish(source) ? (
                  <a className='underline' href={source} target='_blank' rel='noreferrer'>
                    {source}
                  </a>
                ) : (
                  source
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className='mt-auto flex items-center justify-between pt-2 text-xs text-sand/60'>
        {isNonEmpty(legalStatus) && <span>Legal: {cleanText(legalStatus)}</span>}
        <Link to={detailHref} className='text-sky-300 underline'>
          View details
        </Link>
      </div>
    </article>
  )
}

export default DatabaseHerbCard
