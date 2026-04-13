import { motion } from '@/lib/motion'
import type { Compound } from '@/types/compound'
import { buildCardSummary } from '@/lib/summary'
import { extractPrimaryEffects } from '@/utils/extractPrimaryEffects'
import { calculateCompoundConfidence } from '@/utils/calculateConfidence'
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

export default function CompoundCard({ compound }: { compound: CompoundWithRefs }) {
  const mechanism = getMechanism(compound)
  const effects = Array.isArray(compound.effects) ? compound.effects : []
  const confidence = calculateCompoundConfidence({
    mechanism,
    effects,
    compounds: compound.herbsFound.map(h => h.name),
  })
  const primaryEffects = extractPrimaryEffects(effects, 2)
  const visibleHerbs = compound.herbsFound.slice(0, 2)
  const hiddenHerbCount = Math.max(compound.herbsFound.length - visibleHerbs.length, 0)
  const title = formatBrowseTitle(compound.name, 60)
  const isTitleTruncated = title !== compound.name
  const summary =
    buildCardSummary({
      effects,
      mechanism,
      description: compound.description,
      activeCompounds: compound.herbsFound.map(h => h.name),
      maxLen: 120,
    })?.trim() || 'Summary coming soon.'
  const sourceLine =
    visibleHerbs.length > 0
      ? `Found in ${visibleHerbs.map(h => h.name).join(', ')}${hiddenHerbCount > 0 ? ` +${hiddenHerbCount}` : ''}`
      : 'Source mapping in progress'

  return (
    <motion.article
      whileHover={{ scale: 1.003 }}
      title={compound.herbsFound.map(h => h.name).join(', ')}
      className='ds-card relative flex h-full flex-col gap-2 rounded-xl border-white/12 bg-white/[0.02] p-3 text-left'
    >
      <h2
        title={isTitleTruncated ? compound.name : undefined}
        className='line-clamp-2 min-h-[2.2rem] break-all text-[0.95rem] font-semibold leading-tight text-white sm:text-base'
      >
        {title}
      </h2>
      <p className='line-clamp-2 text-xs leading-[1.35] text-white/72'>{summary}</p>
      <div className='flex flex-wrap gap-1'>
        <span className='ds-pill'>{confidence}</span>
        {primaryEffects[0] && <span className='ds-pill'>{primaryEffects[0]}</span>}
      </div>
      <p className='line-clamp-1 text-[11px] text-white/56'>{sourceLine}</p>
      <div className='mt-auto' />
    </motion.article>
  )
}
