import { motion } from '@/lib/motion'
import type { Compound } from '@/types/compound'
import { buildCardSummary } from '@/lib/summary'
import { extractPrimaryEffects } from '@/utils/extractPrimaryEffects'
import { calculateCompoundConfidence, type ConfidenceLevel } from '@/utils/calculateConfidence'
import { formatBrowseTitle } from '@/utils/titleDisplay'

interface HerbRef {
  name: string
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
  const visibleHerbs = compound.herbsFound.slice(0, 2)
  const hiddenHerbCount = Math.max(compound.herbsFound.length - visibleHerbs.length, 0)
  const title = formatBrowseTitle(compound.name, 60)
  const isTitleTruncated = title !== compound.name
  const generatedSummary = buildCardSummary({
    effects,
    mechanism,
    description: compound.description,
    activeCompounds: compound.herbsFound.map(h => h.name),
    maxLen: 170,
  })
  const summary = generatedSummary?.trim() || 'Summary coming soon.'
  const herbSourceSummary =
    visibleHerbs.length > 0
      ? `Found in ${visibleHerbs.map(h => h.name).join(', ')}${hiddenHerbCount > 0 ? ` +${hiddenHerbCount} more` : ''}.`
      : 'Herb source mapping in progress.'
  const categoryChip = compound.effectClass || compound.type || compound.category || null
  const chipItems = [
    { key: 'confidence', label: confidence, className: confidenceBadgeClass(confidence), uppercase: true },
    categoryChip
      ? {
          key: 'category',
          label: categoryChip,
          className: 'border-sky-300/35 bg-sky-500/12 text-sky-100',
          uppercase: false,
        }
      : null,
  ].filter(Boolean) as Array<{ key: string; label: string; className: string; uppercase: boolean }>

  return (
    <motion.article
      whileHover={{ scale: 1.01 }}
      title={compound.herbsFound.map(h => h.name).join(', ')}
      className='ds-card relative flex flex-col rounded-2xl p-2 text-left transition hover:border-white/25 sm:p-2.5'
    >
      <h2
        title={isTitleTruncated ? compound.name : undefined}
        className='mb-0.5 line-clamp-2 min-h-[2.3rem] break-all pr-10 text-[0.95rem] font-semibold leading-tight text-emerald-200 sm:text-base'
      >
        {title}
      </h2>
      <div className='mb-1 flex flex-wrap gap-1'>
        {chipItems.slice(0, 2).map(chip => (
          <span
            key={`${compound.name}-${chip.key}`}
            className={`inline-flex max-w-full items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${chip.uppercase ? 'uppercase tracking-wide' : ''} ${chip.className}`}
          >
            <span className='truncate'>{chip.label}</span>
          </span>
        ))}
      </div>
      <p className='mb-1 line-clamp-2 text-xs leading-tight text-white/75 sm:text-sm'>{summary}</p>
      {primaryEffects.length > 0 && (
        <p className='mb-1 line-clamp-1 text-[11px] text-violet-100/80'>
          {primaryEffects.slice(0, 2).join(' • ')}
        </p>
      )}
      <p className='mb-1 line-clamp-1 text-[11px] text-white/55'>{herbSourceSummary}</p>
      {confidence === 'low' && (
        <div className='mb-1 inline-flex items-center gap-1 text-[10px] text-amber-100/90'>
          <span aria-hidden='true'>⚠️</span>
          <span className='truncate'>Entry incomplete, verification in progress.</span>
        </div>
      )}
      <div className='mt-auto' />
    </motion.article>
  )
}
