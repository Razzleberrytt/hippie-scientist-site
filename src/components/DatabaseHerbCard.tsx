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
  const region = cleanText(pick.region(herb))
  const intensityValue = cleanText(herb.intensity_label ?? pick.intensity(herb))
  const intensity = titleCase(intensityValue.toLowerCase())
  const legal = cleanText(pick.legalstatus(herb))
  const compounds = cleanItems(pick.compounds(herb))
  const contraind = cleanItems(pick.contraind(herb))
  const tags = cleanItems(pick.tags(herb)).slice(0, 6)
  const sources = pick
    .sources(herb)
    .map(source => source.replace(/[.;,]\s*$/, '').trim())
    .map(source => (urlish(source) ? source : cleanText(source)))
    .filter(source => hasVal(source))
  const showEffects = hasVal(effects)
  const showDescription = hasVal(description)
  const showLegal = hasVal(legal) && !/^legal$/i.test(legal)
  const showRegion = hasVal(region)
  const showIntensity = hasVal(intensity)
  const showCompounds = compounds.length > 0
  const showContraind = contraind.length > 0
  const canToggle = showEffects || showDescription || showLegal || showCompounds || showContraind || sources.length > 0
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
        {hasVal(scientific) && <p className='text-sm italic text-sand/70'>{scientific}</p>}
        {showIntensity && (
          <p className='mt-1'>
            <span className='inline-block rounded-full bg-gray-700/60 px-2 py-1 text-xs tracking-wide'>
              INTENSITY: {intensity}
            </span>
          </p>
        )}
      </header>
      <section className='mt-2 space-y-3 text-sm text-sand/90'>
        {showEffects && (
          <div>
            <span className='font-semibold'>Effects:</span>{' '}
            <span className={`${open ? '' : 'clamp-3'} block`}>{effects}</span>
          </div>
        )}

        {showDescription && (
          <div className='text-sand/80'>
            <span className='font-semibold'>Description:</span>{' '}
            <span className={`${open ? '' : 'clamp-3'} block`}>{description}</span>
          </div>
        )}

        {showLegal && (
          <div>
            <span className='font-semibold'>Legal:</span>{' '}
            <span className={`${open ? '' : 'clamp-2'} block`}>{legal}</span>
          </div>
        )}
      </section>

      {tags.length > 0 && (
        <div className='mt-2 flex flex-wrap gap-2'>
          {tags.map(tag => (
            <span key={tag} className='rounded-full bg-purple-700/40 px-2 py-1 text-xs'>
              {tag}
            </span>
          ))}
        </div>
      )}

      {showRegion && <p className='mt-2 text-sm text-sand/80'>🌍 {region}</p>}

      {canToggle && (
        <button
          type='button'
          onClick={event => {
            event.stopPropagation()
            setOpen(v => !v)
          }}
          className='mt-2 text-left text-sm toggle-link transition hover:opacity-100'
        >
          {open ? 'Show less' : 'Show more'}
        </button>
      )}

      {open && (
        <div className='mt-2 space-y-2 text-sm text-sand/90'>
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
