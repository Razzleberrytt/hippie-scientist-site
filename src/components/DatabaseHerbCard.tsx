import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Herb } from '../types'
import { getText } from '../lib/fields'
import { useFavorites } from '../lib/useFavorites'
import { herbName } from '../utils/herb'
import { pick, isNonEmpty, tidy, formatList, urlish } from '../lib/present'

interface Props {
  herb: Herb
  index?: number
}

export function DatabaseHerbCard({ herb, index = 0 }: Props) {
  const title = herbName(herb)
  const scientific = tidy(getText(herb, 'scientific', ['botanical', 'latin', 'latinname']))
  const detailHref = `/herb/${herb.slug}`
  const effects = tidy(pick.effects(herb))
  const description = tidy(pick.description(herb))
  const region = tidy(pick.region(herb))
  const intensity = tidy(pick.intensity(herb))
  const legal = tidy(pick.legalstatus(herb))
  const compounds = pick.compounds(herb).map(tidy).filter(Boolean)
  const contraind = pick.contraind(herb).map(tidy).filter(Boolean)
  const tags = pick.tags(herb).map(tidy).filter(Boolean).slice(0, 6)
  const sources = pick
    .sources(herb)
    .map(source => source.replace(/[.;,]\s*$/, '').trim())
    .map(source => (urlish(source) ? source : tidy(source)))
    .filter(Boolean)
  const showLegal = isNonEmpty(legal) && !/^legal$/i.test(legal)
  const { favs, toggle, has } = useFavorites()
  const isFavorite = has(herb.slug)
  const [open, setOpen] = useState(false)

  if (import.meta.env.MODE !== 'production' && herb && index === 0) {
    // eslint-disable-next-line no-console
    console.log('card item keys:', Object.keys(herb))
  }
  return (
    <article
      className='glassmorphic-card soft-border-glow relative flex h-full flex-col gap-2 rounded-xl border border-white/10 p-4 text-sand'
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
          <p className='mt-1'>
            <span className='inline-block rounded-full bg-gray-700/60 px-2 py-1 text-xs tracking-wide'>
              INTENSITY: {intensity.toUpperCase()}
            </span>
          </p>
        )}
      </header>
      {isNonEmpty(effects) && (
        <p className='mt-2 line-clamp-2 text-sm text-sand/90'>
          <strong>Effects:</strong> {effects}
        </p>
      )}
      {isNonEmpty(description) && (
        <p className='mt-2 line-clamp-3 text-sm text-sand/80'>
          <strong>Description:</strong> {description}
        </p>
      )}

      {tags.length > 0 && (
        <div className='mt-2 flex flex-wrap gap-2'>
          {tags.map(tag => (
            <span key={tag} className='rounded-full bg-purple-700/40 px-2 py-1 text-xs'>
              {tag}
            </span>
          ))}
        </div>
      )}

      {isNonEmpty(region) && <p className='mt-2 text-sm text-sand/80'>🌍 {region}</p>}

      <button
        type='button'
        onClick={event => {
          event.stopPropagation()
          setOpen(v => !v)
        }}
        className='mt-2 text-left text-sm underline opacity-80 transition hover:opacity-100'
      >
        {open ? 'Hide summary' : 'Show more'}
      </button>

      {open && (
        <div className='mt-2 space-y-2 text-sm text-sand/90'>
          {compounds.length > 0 && (
            <p>
              <strong>Active Compounds:</strong> {formatList(compounds, 3)}
            </p>
          )}
          {contraind.length > 0 && (
            <p>
              <strong>Contraindications:</strong> {formatList(contraind)}
            </p>
          )}
          {showLegal && <p className='text-xs opacity-70'>Legal: {legal}</p>}
          {sources.length > 0 && (
            <div>
              <strong>Sources:</strong>
              <ul className='list-disc pl-5'>
                {sources.map((source, sourceIndex) => (
                  <li key={`${herb.slug}-source-${sourceIndex}`}>
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
        </div>
      )}

      <div className='mt-auto flex items-center justify-between pt-2 text-xs text-sand/60'>
        {showLegal && !open && <span>Legal: {legal}</span>}
        <Link to={detailHref} className='text-sky-300 underline'>
          View details
        </Link>
      </div>
    </article>
  )
}

export default DatabaseHerbCard
