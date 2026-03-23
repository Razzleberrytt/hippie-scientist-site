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
      className='ds-card relative flex flex-col rounded-2xl p-4 text-left transition hover:border-white/25'
    >
      <span
        className={`absolute right-4 top-4 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${confidenceBadgeClass(confidence)}`}
      >
        {confidence}
      </span>
      <h2 className='mb-1 text-lg font-semibold text-emerald-200'>{compound.name}</h2>
      <div className='mb-2 flex flex-wrap gap-2 pr-16'>
        <TagBadge label={compound.type ?? compound.category ?? 'compound'} />
        {compound.effectClass && <TagBadge label={compound.effectClass} variant='blue' />}
      </div>
      {primaryEffects.length > 0 && (
        <div className='mb-2 flex flex-wrap gap-1.5'>
          {primaryEffects.map(effect => (
            <span
              key={`${compound.name}-${effect}`}
              className='rounded-full border border-violet-300/35 bg-violet-500/15 px-2.5 py-1 text-[11px] text-violet-100 shadow-[0_0_14px_rgba(139,92,246,0.3)]'
            >
              {effect}
            </span>
          ))}
        </div>
      )}
      <p className='mb-2 line-clamp-2 text-sm text-white/75'>{summary}</p>
      {confidence === 'low' && (
        <p className='mb-2 rounded-lg border border-amber-300/35 bg-amber-500/10 px-2.5 py-1.5 text-xs text-amber-100'>
          ⚠️ This entry is incomplete. Data is still being verified.
        </p>
      )}
      <div className='mt-auto flex flex-wrap gap-1'>
        {compound.herbsFound.map(h =>
          h.slug ? (
            <Link
              key={h.name}
              to={`/herbs/${h.slug}`}
              className='ds-pill text-xs transition hover:border-white/30'
            >
              {h.name}
            </Link>
          ) : (
            <span key={h.name} className='ds-pill text-xs'>
              {h.name}
            </span>
          )
        )}
      </div>
    </motion.article>
  )
}
