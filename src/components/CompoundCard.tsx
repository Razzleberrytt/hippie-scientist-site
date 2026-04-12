import React from 'react'
import { motion } from '@/lib/motion'
import { Link } from 'react-router-dom'
import type { Compound } from '@/types/compound'
import TagBadge from './TagBadge'
import { buildCardSummary } from '@/lib/summary'
import { extractPrimaryEffects } from '@/utils/extractPrimaryEffects'
import { calculateCompoundConfidence, type ConfidenceLevel } from '@/utils/calculateConfidence'

interface HerbRef {
  name: string
  slug?: string
}

export interface CompoundWithRefs extends Compound {
  name: string
  herbsFound: HerbRef[]
  effectClass?: string
}

function getMechanism(compound: CompoundWithRefs): string {
  if (typeof compound.mechanism === 'string' && compound.mechanism.trim()) {
    return compound.mechanism
  }

  const legacyMechanism = (compound as Record<string, unknown>).mechanismOfAction
  return typeof legacyMechanism === 'string' ? legacyMechanism : ''
}

function confidenceBadgeClass(level: ConfidenceLevel) {
  if (level === 'high')
    return 'border-emerald-300/50 bg-emerald-500/15 text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.35)]'
  if (level === 'medium')
    return 'border-amber-300/45 bg-amber-500/15 text-amber-100 shadow-[0_0_18px_rgba(245,158,11,0.35)]'
  return 'border-rose-300/50 bg-rose-500/15 text-rose-100 shadow-[0_0_18px_rgba(244,63,94,0.35)]'
}

export default function CompoundCard({ compound }: { compound: CompoundWithRefs }) {
  const mechanism = getMechanism(compound)
  const effects = Array.isArray(compound.effects) ? compound.effects : []

  const confidence = calculateCompoundConfidence({
    mechanism,
    effects,
    compounds: compound.herbsFound.map(h => h.name),
  })
  const primaryEffects = extractPrimaryEffects(effects, 3)
  const visiblePrimaryEffects = primaryEffects.slice(0, 2)
  const visibleHerbs = compound.herbsFound.slice(0, 2)
  const hiddenHerbCount = Math.max(compound.herbsFound.length - visibleHerbs.length, 0)
  const summary = buildCardSummary({
    effects,
    mechanism,
    description: compound.description,
    activeCompounds: compound.herbsFound.map(h => h.name),
    maxLen: 170,
  })

  return (
    <motion.article
      whileHover={{ scale: 1.03 }}
      title={compound.herbsFound.map(h => h.name).join(', ')}
      className='ds-card relative flex flex-col rounded-2xl p-2.5 text-left transition hover:border-white/25'
    >
      <span
        className={`absolute right-2.5 top-2.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${confidenceBadgeClass(confidence)}`}
      >
        {confidence}
      </span>
      <h2 className='mb-0.5 text-base font-semibold leading-tight text-emerald-200'>{compound.name}</h2>
      <div className='mb-1 flex flex-wrap gap-1.5 pr-14'>
        <TagBadge label={compound.type ?? compound.category ?? 'compound'} />
        {compound.effectClass && <TagBadge label={compound.effectClass} variant='blue' />}
      </div>
      {visiblePrimaryEffects.length > 0 && (
        <div className='mb-1 flex flex-wrap gap-1'>
          {visiblePrimaryEffects.map(effect => (
            <span
              key={`${compound.name}-${effect}`}
              className='rounded-full border border-violet-300/35 bg-violet-500/15 px-2 py-0.5 text-[10px] text-violet-100 shadow-[0_0_14px_rgba(139,92,246,0.3)]'
            >
              {effect}
            </span>
          ))}
        </div>
      )}
      <p className='mb-1 line-clamp-2 text-sm leading-tight text-white/75'>{summary}</p>
      {confidence === 'low' && (
        <div className='mb-1 inline-flex items-center gap-1 text-[11px] text-amber-100/90'>
          <span aria-hidden='true'>⚠️</span>
          <span className='truncate'>Entry incomplete, verification in progress.</span>
        </div>
      )}
      <div className='mt-auto flex flex-wrap gap-1'>
        {visibleHerbs.map(h =>
          h.slug ? (
            <Link
              key={h.name}
              to={`/herbs/${h.slug}`}
              className='ds-pill px-2 py-0.5 text-[11px] transition hover:border-white/30'
            >
              {h.name}
            </Link>
          ) : (
            <span key={h.name} className='ds-pill px-2 py-0.5 text-[11px]'>
              {h.name}
            </span>
          )
        )}
        {hiddenHerbCount > 0 && <span className='ds-pill px-2 py-0.5 text-[11px]'>+{hiddenHerbCount}</span>}
      </div>
    </motion.article>
  )
}
