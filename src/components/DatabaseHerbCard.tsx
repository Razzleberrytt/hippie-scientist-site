import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Herb } from '../types'
import { getText } from '../lib/fields'
import { useFavorites } from '../lib/useFavorites'
import { herbName } from '../utils/herb'
import { pick, tidy, urlish } from '../lib/present'
import { cleanLine, hasVal, joinList, titleCase } from '../lib/pretty'

interface Props {
  herb: Herb
  index?: number
}

export function DatabaseHerbCard({ herb, index = 0 }: Props) {
  const title = herbName(herb)
  const cleanText = (value: any) => cleanLine(tidy(value ?? ''))
  const cleanItems = (values: string[]) =>
    values
      .map(item => cleanText(item))
      .filter(item => hasVal(item))

  const scientific = cleanText(getText(herb, 'scientific', ['botanical', 'latin', 'latinname']))
  const detailHref = `/herb/${herb.slug}`
  const effects = cleanText(pick.effects(herb))
  const description = cleanText(pick.description(herb))
  const intensityRaw = String(herb.intensity || herb.intensity_label || pick.intensity(herb) || '')
  const intensity = intensityRaw.toLowerCase()
  const legal = cleanText(pick.legalstatus(herb))
  const compounds = cleanItems(pick.compounds(herb))
  const contraind = cleanItems(pick.contraind(herb))
  const tags = cleanItems(pick.tags(herb)).slice(0, 6)
  const regionText = cleanText(pick.region(herb) || (herb as any).region || '')
  const regionTags = Array.isArray((herb as any).regiontags)
    ? (herb as any).regiontags.filter(tag => hasVal(tag)).map(tag => cleanLine(String(tag)))
    : []
  const sources = pick
    .sources(herb)
    .map(source => source.replace(/[.;,]\s*$/, '').trim())
    .map(source => (urlish(source) ? source : cleanText(source)))
    .filter(source => hasVal(source))
  const showEffects = hasVal(effects)
  const showDescription = hasVal(description)
  const showLegal = hasVal(legal) && !/^legal$/i.test(legal)
  const showRegion = hasVal(regionText) || regionTags.length > 0
  const showCompounds = compounds.length > 0
  const showContraind = contraind.length > 0
  const canToggle = showEffects || showDescription || showLegal || showCompounds || showContraind || sources.length > 0
  const { favs, toggle, has } = useFavorites()
  const isFavorite = has(herb.slug)
  const [open, setOpen] = useState(false)

  const intensityClass = intensity.includes('strong')
    ? 'bg-red-600/30 text-red-200'
    : intensity.includes('moderate')
      ? 'bg-yellow-600/30 text-yellow-100'
      : intensity.includes('mild')
        ? 'bg-green-700/30 text-green-200'
        : 'bg-white/10 text-white/80'

  if (import.meta.env.MODE !== 'production' && herb && index === 0) {
    // eslint-disable-next-line no-console
    console.log('card item keys:', Object.keys(herb))
  }
  return (
    <article
      className='card relative flex h-full flex-col border border-white/10 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-slate-900/60 p-5 text-sand shadow-lg'
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
        {hasVal(scientific) && <p className='meta text-sm italic text-sand/70'>{scientific}</p>}
        {hasVal(intensity) && (
          <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${intensityClass}`}>
            INTENSITY: {titleCase(intensity)}
          </span>
        )}
      </header>
      <section className='section space-y-3 text-sm text-sand/90'>
        {showEffects && (
          <div>
            <span className='label font-semibold'>Effects:</span>{' '}
            <span className={`${open ? '' : 'clamp-3'} block`}>{effects}</span>
          </div>
        )}

        {showDescription && (
          <div className='text-sand/80'>
            <span className='label font-semibold'>Description:</span>{' '}
            <span className={`${open ? '' : 'clamp-3'} block`}>{description}</span>
          </div>
        )}

        {showLegal && (
          <div>
            <span className='label font-semibold'>Legal:</span>{' '}
            <span className={`${open ? '' : 'clamp-2'} block`}>{legal}</span>
          </div>
        )}
      </section>

      {tags.length > 0 && (
        <div className='section flex flex-wrap gap-2'>
          {tags.map(tag => (
            <span key={tag} className='rounded-full bg-purple-700/40 px-2 py-1 text-xs'>
              {tag}
            </span>
          ))}
        </div>
      )}

      {showRegion && (
        <div className='section flex items-center gap-2 text-sm text-sand/85'>
          <span aria-hidden>🌍</span>
          <span className='opacity-90'>
            {regionText || joinList(regionTags)}
          </span>
        </div>
      )}

      {open && (
        <div className='section space-y-2 text-sm text-sand/90'>
          {showCompounds && (
            <p>
              <strong>Active Compounds:</strong> {joinList(compounds)}
            </p>
          )}
          {showContraind && (
            <p>
              <strong>Contraindications:</strong> {joinList(contraind)}
            </p>
          )}
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

      <div className='mt-3 flex items-center justify-between'>
        {canToggle && (
          <button
            type='button'
            onClick={event => {
              event.stopPropagation()
              setOpen(v => !v)
            }}
            className='toggle-link text-sm'
          >
            {open ? 'Show less' : 'Show more'}
          </button>
        )}
        <Link to={detailHref} className='underline text-sm opacity-90'>
          View details
        </Link>
      </div>
    </article>
  )
}

export default DatabaseHerbCard
