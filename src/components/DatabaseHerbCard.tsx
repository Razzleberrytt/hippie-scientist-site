import { Link } from 'react-router-dom'
import type { Herb } from '../types'
import { getText, getList, isNonEmpty, urlish } from '../lib/fields'
import { useFavorites } from '../lib/useFavorites'
import { herbName } from '../utils/herb'

interface Props {
  herb: Herb
  index?: number
}

export function DatabaseHerbCard({ herb, index = 0 }: Props) {
  const title = herbName(herb)
  const scientific = getText(herb, 'scientific', ['botanical', 'latin', 'latinname'])
  const detailHref = `/herb/${herb.slug}`
  const intensity = getText(herb, 'intensity', ['potency', 'strength'])
  const region = getText(herb, 'region', ['regions', 'origin', 'geography'])
  const legalStatus = getText(herb, 'legalstatus', ['legal_status', 'status'])
  const { favs, toggle, has } = useFavorites()
  const isFavorite = has(herb.slug)

  // Robust lookups (cover both old and new keys)
  const effects = getText(herb, 'effects', ['effect'])
  const description = getText(herb, 'description', ['summary', 'overview', 'desc'])
  const tags = getList(herb, 'tags', ['labels', 'keywords'])
  const compounds = getList(herb, 'compounds', ['compound', 'keycompounds', 'actives', 'constituents'])
  const contraindications = getList(herb, 'contraindications', ['contradictions', 'cautions'])
  const sources = getList(herb, 'sources', ['refs', 'references'])

  if (import.meta.env.MODE !== 'production' && herb && index === 0) {
    // eslint-disable-next-line no-console
    console.log('card item keys:', Object.keys(herb))
  }
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
        {isNonEmpty(scientific) && <p className='text-sm italic text-sand/70'>{scientific}</p>}
        {isNonEmpty(intensity) && (
          <p className='mt-1 inline-flex items-center rounded-full bg-white/10 px-2 py-1 text-xs uppercase tracking-wide text-sand/80'>
            Intensity: {intensity}
          </p>
        )}
      </header>

      {isNonEmpty(effects) && (
        <p className='text-sm text-sand/90'>
          <strong>Effects:</strong> {effects}
        </p>
      )}
      {isNonEmpty(description) && (
        <p className='text-sm text-sand/80'>
          <strong>Description:</strong> {description}
        </p>
      )}

      {tags.length > 0 && (
        <div className='mt-1 flex flex-wrap gap-2'>
          {tags.slice(0, 6).map(tag => (
            <span key={tag} className='rounded-full bg-purple-700/40 px-2 py-1 text-xs'>
              {tag}
            </span>
          ))}
        </div>
      )}

      {isNonEmpty(region) && <p className='mt-1 text-sm text-sand/80'>🌍 {region}</p>}

      {compounds.length > 0 && (
        <p className='mt-1 text-sm text-sand/90'>
          <strong>Active Compounds:</strong> {compounds.slice(0, 3).join(', ')}
        </p>
      )}

      {contraindications.length > 0 && (
        <p className='mt-1 text-sm text-sand/90'>
          <strong>Contraindications:</strong> {contraindications.join(', ')}
        </p>
      )}

      {sources.length > 0 && (
        <div className='mt-2 text-sm text-sand/90'>
          <strong>Sources:</strong>
          <ul className='mt-1 list-disc pl-5'>
            {sources.map((source, index) => (
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
        {isNonEmpty(legalStatus) && <span>Legal: {legalStatus}</span>}
        <Link to={detailHref} className='text-sky-300 underline'>
          View details
        </Link>
      </div>
    </article>
  )
}

export default DatabaseHerbCard
