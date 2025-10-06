import { Link } from 'react-router-dom'
import type { Herb } from '../types'
import { has, list, bullets, urlish } from '../lib/format'
import { herbName, splitField } from '../utils/herb'

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
  const effectsList = splitField(herb.effects)
  const effectsText = list(effectsList)

  return (
    <article className='glassmorphic-card soft-border-glow relative flex h-full flex-col gap-2 p-4 text-sand'>
      <header>
        <h2 className='text-xl font-semibold text-lime-300'>{title}</h2>
        {has(scientific) && <p className='text-sm italic text-sand/70'>{scientific}</p>}
        {has(intensity) && (
          <p className='mt-1 inline-flex items-center rounded-full bg-white/10 px-2 py-1 text-xs uppercase tracking-wide text-sand/80'>
            Intensity: {intensity}
          </p>
        )}
      </header>

      {has(effectsList) && (
        <p className='text-sm text-sand/90'>
          <strong>Effects:</strong> {effectsText}
        </p>
      )}
      {has(herb.description) && (
        <p className='text-sm text-sand/80'>
          <strong>Description:</strong> {herb.description}
        </p>
      )}

      {has(herb.tags) && (
        <div className='mt-1 flex flex-wrap gap-2'>
          {(herb.tags || []).slice(0, 6).map(tag => (
            <span key={tag} className='rounded-full bg-purple-700/40 px-2 py-1 text-xs'>
              {tag}
            </span>
          ))}
        </div>
      )}

      {has(region) && <p className='mt-1 text-sm text-sand/80'>🌍 {region}</p>}

      {has(herb.compounds) && (
        <p className='mt-1 text-sm text-sand/90'>
          <strong>Active Compounds:</strong> {list(herb.compounds, 3)}
        </p>
      )}

      {has(herb.contraindications) && (
        <p className='mt-1 text-sm text-sand/90'>
          <strong>Contraindications:</strong> {list(herb.contraindications)}
        </p>
      )}

      {has(herb.sources) && (
        <div className='mt-2 text-sm text-sand/90'>
          <strong>Sources:</strong>
          <ul className='mt-1 list-disc pl-5'>
            {bullets(herb.sources).map((source, index) => (
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
        {has(legalStatus) && <span>Legal: {legalStatus}</span>}
        <Link to={detailHref} className='text-sky-300 underline'>
          View details
        </Link>
      </div>
    </article>
  )
}

export default DatabaseHerbCard
