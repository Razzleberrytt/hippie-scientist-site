import React from 'react'
import clsx from 'clsx'
import { motion, useReducedMotion } from 'framer-motion'
import { cleanIntensity, titleCase } from '../lib/text'
import type { Herb } from '../types'
import { getCommonName } from '../lib/herbName'
import { Link } from 'react-router-dom'
import { canonicalSlug } from '@/lib/slug'

function toArray(value: unknown): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value.map(entry => String(entry).trim()).filter(Boolean)
  return String(value)
    .split(/[;,|]/)
    .map(entry => entry.trim())
    .filter(Boolean)
}

function firstNonEmpty(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }
  return ''
}

export default function DatabaseHerbCard({
  herb,
  kind = 'herb',
}: {
  herb: Herb
  kind?: 'herb' | 'compound'
}) {
  const [open, setOpen] = React.useState(false)
  const reduceMotion = useReducedMotion()

  const scientificName = firstNonEmpty(
    herb.scientific,
    (herb as any).scientificName,
    (herb as any).binomial,
    (herb as any).name
  )
  const fallbackCommon = firstNonEmpty(
    herb.common,
    (herb as any).displayName,
    (herb as any).display_name,
    herb.name
  )
  const commonName = getCommonName(herb) ?? (fallbackCommon ? titleCase(fallbackCommon) : '')
  const heading =
    commonName || scientificName || (kind === 'compound' ? 'Unknown compound' : 'Unknown herb')
  const secondary =
    scientificName && heading !== scientificName
      ? scientificName
      : firstNonEmpty(
          (herb as any).family,
          (herb as any).category_label,
          toArray((herb as any).category)[0]
        )

  const summary = firstNonEmpty(herb.summary, herb.description, herb.effectsSummary, herb.effects)
  const classification = firstNonEmpty(
    toArray((herb as any).category)[0],
    (herb as any).category_label,
    (herb.compoundClasses || [])[0],
    (herb.pharmCategories || [])[0]
  )

  const intensityLevel = (herb.intensityLevel || (herb as any).intensityLevel || '')
    .toString()
    .toLowerCase()
  const intensityLabel = cleanIntensity(
    firstNonEmpty(
      (herb as any).intensityClean,
      herb.intensityLabel,
      typeof herb.intensity === 'string' ? herb.intensity : ''
    )
  )
  const intensityTone = intensityLevel.includes('strong')
    ? 'bg-rose-500/20 text-rose-100 ring-1 ring-rose-300/40'
    : intensityLevel.includes('moderate')
      ? 'bg-amber-500/20 text-amber-100 ring-1 ring-amber-300/40'
      : intensityLevel.includes('mild')
        ? 'bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-300/40'
        : intensityLevel.includes('variable')
          ? 'bg-sky-500/20 text-sky-100 ring-1 ring-sky-300/40'
          : 'bg-white/6 text-white/90 ring-1 ring-white/15'
  const mechanism = firstNonEmpty(
    (herb as any).mechanismOfAction,
    herb.mechanism,
    herb.benefits as string
  )

  const slug = canonicalSlug(herb.slug, heading, scientificName)
  const detailBase = kind === 'compound' ? '/compounds' : '/herbs'
  const detailPath = `${detailBase}/${encodeURIComponent(slug)}`
  const detailFallbackPath = detailBase

  const legal = firstNonEmpty(
    herb.legalStatus as string,
    herb.legalstatus as string,
    herb.legal as string,
    herb.legalnotes as string
  )
  const sources = toArray(herb.sources).slice(0, 3)

  const sections: Array<{ label: string; content: string | string[] }> = []
  if (summary) sections.push({ label: 'Overview', content: summary })
  if (legal) sections.push({ label: 'Legal', content: legal })
  if (sources.length) sections.push({ label: 'Sources', content: sources })

  const facts = [
    classification ? { label: 'Class', value: titleCase(classification) } : null,
    intensityLabel ? { label: 'Intensity', value: intensityLabel } : null,
    mechanism ? { label: 'Mechanism', value: mechanism } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={clsx(
        'ds-card-lg relative mx-auto w-full max-w-5xl overflow-hidden text-white/90 transition duration-300'
      )}
    >
      <div aria-hidden className='pointer-events-none absolute inset-0 rounded-2xl'>
        <div className='absolute inset-px rounded-[calc(theme(borderRadius.2xl)-1px)] border border-white/10' />
      </div>

      <div className='ds-stack relative'>
        <header className='ds-stack'>
          <h2 className='text-xl font-semibold tracking-tight text-white sm:text-2xl'>{heading}</h2>
          {secondary && <p className='text-white/62 text-sm italic'>{secondary}</p>}

          {facts.length > 0 && (
            <div className='mt-3 flex flex-wrap gap-2'>
              {facts.slice(0, 3).map(fact => (
                <span
                  key={fact.label}
                  className={clsx(
                    'ds-pill bg-white/5 text-white/85 ring-1 ring-white/15',
                    fact.label === 'Intensity' && intensityTone
                  )}
                >
                  <span className='text-[11px] font-semibold uppercase tracking-wide text-white/70'>
                    {fact.label}:
                  </span>{' '}
                  {fact.value}
                </span>
              ))}
            </div>
          )}
        </header>

        {summary && (
          <p
            className={`text-sm leading-relaxed text-white/75 sm:text-base ${open ? '' : 'line-clamp-3'}`}
          >
            {summary}
          </p>
        )}

        {open && sections.length > 0 && (
          <div className='space-y-4'>
            {sections.map((section, index) => (
              <div key={index}>
                <p className='text-xs font-semibold uppercase tracking-wide text-white/55'>
                  {section.label}
                </p>
                {Array.isArray(section.content) ? (
                  <ul className='mt-1 list-inside list-disc space-y-1 text-sm text-white/70'>
                    {section.content.map((item, i) => {
                      const isUrl = /^https?:\/\//i.test(item)
                      return (
                        <li key={i}>
                          {isUrl ? (
                            <a
                              href={item}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='underline decoration-dotted underline-offset-2 transition hover:text-white'
                            >
                              {item}
                            </a>
                          ) : (
                            item
                          )}
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <p className='mt-1 text-sm text-white/70'>{section.content}</p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className='flex flex-wrap gap-3'>
          <button
            type='button'
            onClick={() => setOpen(value => !value)}
            className='btn-secondary'
            aria-expanded={open}
          >
            {open ? 'Show less' : 'Show more'}
          </button>
          <Link to={slug ? detailPath : detailFallbackPath} className='btn-primary'>
            View details
          </Link>
        </div>
      </div>
    </motion.article>
  )
}
