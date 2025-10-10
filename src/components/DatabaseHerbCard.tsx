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
    ? 'border-red-400/40 bg-red-500/15 text-red-200'
    : intensity.includes('moderate')
      ? 'border-[rgb(var(--accent))]/40 bg-[rgb(var(--accent))]/15 text-[rgb(var(--fg))]'
      : intensity.includes('mild')
        ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
        : 'border-white/15 bg-white/5 text-[rgb(var(--fg))] opacity-80'

  if (import.meta.env.MODE !== 'production' && herb && index === 0) {
    // eslint-disable-next-line no-console
    console.log('card item keys:', Object.keys(herb))
  }
  return (
    <article
      className='relative flex h-full flex-col rounded-2xl border border-white/10 bg-[rgb(var(--card))]/90 backdrop-blur-sm shadow-sm transition-all hover:shadow-[0_0_15px_-5px_rgb(var(--accent))]'
      data-favorites-count={favs.length}
    >
      <header className='flex items-start justify-between gap-3 p-4'>
        <div className='space-y-1'>
          <h3 className='text-xl font-semibold text-[rgb(var(--accent))]'>{title}</h3>
          {hasVal(scientific) && <p className='text-sm italic text-[rgb(var(--fg))] opacity-70'>{scientific}</p>}
        </div>
        <button
          onClick={event => {
            event.stopPropagation()
            toggle(herb.slug)
          }}
          className={`text-xl transition ${isFavorite ? 'text-[rgb(var(--accent))]' : 'text-[rgb(var(--fg))] opacity-60 hover:opacity-100'}`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={isFavorite}
          type='button'
        >
          ★
        </button>
      </header>

      {hasVal(intensity) && (
        <div className={`mx-4 mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${intensityClass}`}>
          <span>Intensity</span>
          <span>{titleCase(intensity)}</span>
        </div>
      )}

      {(showDescription || showEffects) && (
        <p
          className={`px-4 text-sm text-[rgb(var(--fg))] opacity-80 ${open ? '' : 'line-clamp-3'}`}
        >
          {showDescription ? (
            <>
              <span className='font-semibold text-[rgb(var(--fg))] opacity-90'>Description:</span>{' '}
              {description}
            </>
          ) : (
            <>
              <span className='font-semibold text-[rgb(var(--fg))] opacity-90'>Effects:</span>{' '}
              {effects}
            </>
          )}
        </p>
      )}

      {tags.length > 0 && (
        <div className='px-4 pt-3 flex flex-wrap gap-2'>
          {tags.map(tag => (
            <span key={tag} className='chip text-xs'>
              {tag}
            </span>
          ))}
        </div>
      )}

      {showRegion && (
        <div className='px-4 pt-3 flex items-center gap-2 text-sm text-[rgb(var(--fg))] opacity-70'>
          <span aria-hidden>🌍</span>
          <span>{regionText || joinList(regionTags)}</span>
        </div>
      )}

      <div className='mt-auto px-4 pb-4 pt-6 flex items-center justify-between text-sm text-[rgb(var(--fg))]'>
        {canToggle ? (
          <button
            type='button'
            onClick={event => {
              event.stopPropagation()
              setOpen(v => !v)
            }}
            className='underline transition hover:text-[rgb(var(--accent))]'
          >
            {open ? 'Show less' : 'Show more'}
          </button>
        ) : (
          <span />
        )}
        <Link to={detailHref} className='underline transition hover:text-[rgb(var(--accent))]'>
          View details
        </Link>
      </div>

      {open && (
        <div className='border-t border-white/10 px-4 py-5 text-sm text-[rgb(var(--fg))] opacity-80 space-y-3'>
          {showEffects && (
            <p>
              <strong>Effects:</strong> {effects}
            </p>
          )}
          {showDescription && (
            <p>
              <strong>Description:</strong> {description}
            </p>
          )}
          {showLegal && (
            <p>
              <strong>Legal:</strong> {legal}
            </p>
          )}
          {showRegion && (
            <p>
              <strong>Region:</strong> {regionText || joinList(regionTags)}
            </p>
          )}
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
              <ul className='mt-1 list-disc pl-5 space-y-1'>
                {sources.map((source, sourceIndex) => (
                  <li key={`${herb.slug}-source-${sourceIndex}`}>
                    {urlish(source) ? (
                      <a className='text-[rgb(var(--accent))] underline' href={source} target='_blank' rel='noreferrer'>
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
    </article>
  )
}

export default DatabaseHerbCard
