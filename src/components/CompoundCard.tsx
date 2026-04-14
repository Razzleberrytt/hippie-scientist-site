import { motion } from '@/lib/motion'
import type { Compound } from '@/types/compound'
import { buildCardSummary } from '@/lib/summary'
import { extractPrimaryEffects } from '@/utils/extractPrimaryEffects'
import { calculateCompoundConfidence } from '@/utils/calculateConfidence'
import { formatBrowseTitle } from '@/utils/titleDisplay'
import { cleanEffectChips, sanitizeSummaryText } from '@/lib/sanitize'
import { normalizeTagList } from '@/lib/tagNormalization'
import { getPrimaryEffects, getProfileStatus, getSummaryQuality, resolveHeroSummary, shouldRenderSummary } from '@/lib/workbookRender'

interface HerbRef {
  name: string
}

export interface CompoundWithRefs extends Compound {
  name: string
  herbsFound: HerbRef[]
  effectClass?: string
}

function getMechanism(compound: CompoundWithRefs): string {
  const rawRecord = compound.rawData as Record<string, unknown> | undefined
  const workbookMechanism = String(rawRecord?.mechanisms || rawRecord?.mechanism || '').trim()
  if (workbookMechanism) return workbookMechanism

  if (typeof compound.mechanism === 'string' && compound.mechanism.trim()) {
    return compound.mechanism
  }

  const legacyMechanism = (compound as Record<string, unknown>).mechanismOfAction
  return typeof legacyMechanism === 'string' ? legacyMechanism : ''
}

function getWorkbookHero(compound: CompoundWithRefs): string {
  const rawRecord = compound.rawData as Record<string, unknown> | undefined
  return sanitizeSummaryText(
    rawRecord?.hero || rawRecord?.coreInsight || compound.curatedData?.summary || compound.description || '',
    1,
  )
}


export default function CompoundCard({ compound }: { compound: CompoundWithRefs }) {
  const mechanism = getMechanism(compound)
  const rawRecord = (compound.rawData as Record<string, unknown> | undefined) || {}
  const profileStatus = getProfileStatus(rawRecord)
  const summaryQuality = getSummaryQuality(rawRecord)
  const isMinimal = profileStatus === 'minimal'
  const showSummary = shouldRenderSummary(profileStatus, summaryQuality)
  const workbookEffects = cleanEffectChips(
    rawRecord.effects ||
      compound.curatedData?.keyEffects ||
      compound.effects ||
      [],
    4,
  )
  const effects = Array.isArray(workbookEffects) ? workbookEffects : []
  const confidence = calculateCompoundConfidence({
    mechanism,
    effects,
    compounds: compound.herbsFound.map(h => h.name),
  })
  const primaryEffects = normalizeTagList(
    getPrimaryEffects(rawRecord, 2).length ? getPrimaryEffects(rawRecord, 2) : extractPrimaryEffects(effects, 2),
    { caseStyle: 'title', maxItems: 2 },
  )
  const visibleHerbs = compound.herbsFound.slice(0, 2)
  const hiddenHerbCount = Math.max(compound.herbsFound.length - visibleHerbs.length, 0)
  const title = formatBrowseTitle(compound.name, 60)
  const isTitleTruncated = title !== compound.name
  const summary =
    resolveHeroSummary(rawRecord, 1) ||
    getWorkbookHero(compound) ||
    (summaryQuality === 'strong'
      ? buildCardSummary({
          effects,
          mechanism,
          description: compound.description,
          activeCompounds: compound.herbsFound.map(h => h.name),
          maxLen: 120,
        })?.trim()
      : '')
  const sourceLine =
    visibleHerbs.length > 0
      ? `Found in ${visibleHerbs.map(h => h.name).join(', ')}${hiddenHerbCount > 0 ? ` +${hiddenHerbCount}` : ''}`
      : 'Source mapping in progress'

  return (
    <motion.article
      whileHover={{ scale: 1.003 }}
      title={compound.herbsFound.map(h => h.name).join(', ')}
      className='neo-card fade-in-surface ds-card relative flex h-full flex-col gap-2.5 rounded-xl border-white/12 p-3.5 text-left'
    >
      <div aria-hidden className='pointer-events-none absolute -bottom-10 -left-8 h-20 w-20 rounded-full bg-cyan-300/10 blur-2xl' />
      <h2
        title={isTitleTruncated ? compound.name : undefined}
        className='line-clamp-2 min-h-[2.2rem] break-all text-[0.95rem] font-semibold leading-tight text-white sm:text-base'
      >
        {title}
      </h2>
      {showSummary && summary ? <p className='line-clamp-2 text-xs leading-[1.45] text-white/76'>{summary}</p> : null}
      <div className='flex flex-wrap gap-1'>
        <span className='ds-pill neo-pill'>{normalizeTagList(confidence, { caseStyle: 'title', maxItems: 1 })[0] || confidence}</span>
        {primaryEffects[0] && <span className='ds-pill neo-pill'>{primaryEffects[0]}</span>}
      </div>
      {!isMinimal && <p className='line-clamp-1 text-[11px] text-white/56'>{sourceLine}</p>}
      <div className='mt-auto' />
    </motion.article>
  )
}
