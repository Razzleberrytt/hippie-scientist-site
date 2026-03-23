import React from 'react'
import clsx from 'clsx'
import { motion, useReducedMotion } from '@/lib/motion'
import { cleanIntensity, titleCase } from '../lib/text'
import type { Herb } from '../types'
import { getCommonName } from '../lib/herbName'
import { Link } from 'react-router-dom'
import { canonicalSlug } from '@/lib/slug'
import { trackEvent } from '@/lib/growth'
import { CTA } from '@/lib/cta'

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

  const summary = firstNonEmpty(
    typeof herb.summary === 'string' ? herb.summary : undefined,
    typeof herb.description === 'string' ? herb.description : undefined,
    typeof herb.effectsSummary === 'string' ? herb.effectsSummary : undefined,
    typeof herb.effects === 'string' ? herb.effects : undefined
  )
  const activeCompounds = toArray(
    (herb as any).activeCompounds ?? herb.active_compounds ?? herb.compounds
  ).slice(0, 2)
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
    ? 'bg-rose-500/16 text-rose-100 border-rose-300/35'
    : intensityLevel.includes('moderate')
      ? 'bg-amber-500/16 text-amber-100 border-amber-300/35'
      : intensityLevel.includes('mild')
        ? 'bg-emerald-500/16 text-emerald-100 border-emerald-300/35'
        : 'bg-white/6 text-white/90 border-white/20'
  const mechanism = firstNonEmpty((herb as any).mechanismOfAction, herb.mechanism)

  const slug = canonicalSlug(herb.slug, heading, scientificName)
  const detailBase = kind === 'compound' ? '/compounds' : '/herbs'
  const detailPath = `${detailBase}/${encodeURIComponent(slug)}`

  const legal = firstNonEmpty(
    herb.legalStatus as string,
    herb.legalstatus as string,
    herb.legal as string,
    herb.legalnotes as string
  )
  const sources = toArray(herb.sources).slice(0, 2)

  const facts = [
    classification ? { label: 'Class', value: titleCase(classification) } : null,
    intensityLabel ? { label: 'Intensity', value: intensityLabel } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>

  const expandedDetails = [
    legal ? `Legal: ${legal}` : '',
    ...sources.map(source => `Source: ${source}`),
  ].filter(Boolean)

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className='ds-card-lg relative mx-auto flex h-full w-full max-w-5xl flex-col text-white/90'
    >
      <div className='space-y-4'>
        <header className='space-y-1'>
          <h2 className='text-xl font-semibold tracking-tight text-white sm:text-2xl'>{heading}</h2>
          {secondary && <p className='text-sm italic text-white/60'>{secondary}</p>}
        </header>

        {summary && (
          <p className='text-white/78 line-clamp-2 text-sm leading-7 sm:text-base'>{summary}</p>
        )}

        {facts.length > 0 && (
          <div className='flex flex-wrap gap-2'>
            {facts.slice(0, 3).map(fact => (
              <span
                key={fact.label}
                className={clsx(
                  'inline-flex items-center rounded-full border px-3 py-1 text-xs text-white/85',
                  fact.label === 'Intensity' ? intensityTone : 'border-white/15 bg-white/5'
                )}
              >
                <span className='mr-1 font-semibold text-white/70'>{fact.label}:</span>
                <span className='line-clamp-1'>{fact.value}</span>
              </span>
            ))}
          </div>
        )}

        {activeCompounds.length > 0 && (
          <div className='flex flex-wrap gap-2'>
            {activeCompounds.map(compound => (
              <span
                key={compound}
                className='rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100'
              >
                {compound}
              </span>
            ))}
          </div>
        )}

        {open && expandedDetails.length > 0 && (
          <ul className='text-white/72 list-disc space-y-1 pl-5 text-sm'>
            {expandedDetails.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}

        {mechanism && <p className='line-clamp-2 text-sm text-white/75'>{mechanism}</p>}

        <div className='mt-auto flex flex-wrap gap-3'>
          {expandedDetails.length > 0 && (
            <button
              type='button'
              onClick={() => setOpen(value => !value)}
              className='btn-secondary'
              aria-expanded={open}
            >
              {open ? 'Show less' : CTA.primary.learn}
            </button>
          )}
          <Link
            to={detailPath}
            className='btn-primary'
            onClick={() => trackEvent('view_details_click', { kind, slug })}
          >
            {CTA.primary.viewDetails}
          </Link>
        </div>
      </div>
    </motion.article>
  )
}
