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
    ? 'bg-red-500/20 text-red-200'
    : intensity.includes('moderate')
      ? 'bg-[color-mix(in_oklab,rgb(var(--accent))_24%,transparent)] text-[rgb(var(--fg))]'
      : intensity.includes('mild')
        ? 'bg-[color-mix(in_oklab,rgb(var(--accent))_18%,transparent)] text-[rgb(var(--fg))]'
        : 'bg-[color-mix(in_oklab,rgb(var(--accent))_12%,transparent)] text-[rgb(var(--fg))]'

  if (import.meta.env.MODE !== 'production' && herb && index === 0) {
    // eslint-disable-next-line no-console
    console.log('card item keys:', Object.keys(herb))
  }
  return (
    <article
      className='relative flex h-full flex-col gap-4 rounded-2xl border border-[rgb(var(--border))/0.55] bg-[color-mix(in_oklab,rgb(var(--card))_14%,transparent)] p-5 text-[rgb(var(--fg))] shadow-card backdrop-blur'
      data-favorites-count={favs.length}
    >
      <header>
        <div className='flex items-center'>
          <h2 className='text-xl font-semibold text-[rgb(var(--fg))]'>{title}</h2>
          <button
            onClick={event => {
              event.stopPropagation()
              toggle(herb.slug)
            }}
            className={`ml-2 text-xl ${isFavorite ? 'text-[rgb(var(--accent))]' : 'text-sub'}`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={isFavorite}
          >
            ★
          </button>
        </div>
        {hasVal(scientific) && <p className='meta text-sm italic text-sub/80'>{scientific}</p>}
        {hasVal(intensity) && (
          <span className={`mt-2 inline-block rounded-full px-2 py-1 text-xs ${intensityClass}`}>
            INTENSITY: {titleCase(intensity)}
          </span>
        )}
      </header>
      <section className='section space-y-3 text-sm text-sub'>
        {showEffects && (
          <div>
            <span className='label font-semibold'>Effects:</span>{' '}
            <span className={`${open ? '' : 'clamp-3'} block`}>{effects}</span>
          </div>
        )}

        {showDescription && (
          <div className='text-sub/90'>
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
            <span key={tag} className='chip text-xs'>
              {tag}
            </span>
          ))}
        </div>
      )}

      {showRegion && (
        <div className='section flex items-center gap-2 text-sm text-sub'>
          <span aria-hidden>🌍</span>
          <span className='opacity-90'>
            {regionText || joinList(regionTags)}
          </span>
        </div>
      )}

      {open && (
        <div className='section space-y-2 text-sm text-sub'>
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

      <div className='mt-3 flex items-center justify-between'>
        {canToggle && (
          <button
            type='button'
            onClick={event => {
              event.stopPropagation()
              setOpen(v => !v)
            }}
            className='text-sm text-[rgb(var(--accent))] hover:underline'
          >
            {open ? 'Show less' : 'Show more'}
          </button>
        )}
        <Link to={detailHref} className='text-sm text-[rgb(var(--accent))] underline opacity-90'>
          View details
        </Link>
      </div>
    </article>
  )
}

export default DatabaseHerbCard
