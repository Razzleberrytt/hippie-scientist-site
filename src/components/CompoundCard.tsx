import { motion } from '@/lib/motion'
import { buildCardSummary } from '@/lib/summary'
import { cleanEffectChips, sanitizeSummaryText } from '@/lib/sanitize'
import { normalizeTagList } from '@/lib/tagNormalization'
import { getPrimaryEffects, getProfileStatus, getSummaryQuality, resolveHeroSummary, shouldRenderSummary } from '@/lib/workbookRender'
import { hasPlaceholderText, sanitizeSurfaceText } from '@/lib/summary'

interface HerbRef {
  name: string
}

type Compound = {
  slug?: string
  name: string
  displayName?: string
  description?: string
  mechanism?: string
  mechanisms?: string[]
  effects?: string[] | string
  curatedData?: {
    summary?: string
    keyEffects?: string[]
  }
  rawData?: Record<string, unknown>
}

export interface CompoundWithRefs extends Compound {
  name: string
  herbsFound: HerbRef[]
  effectClass?: string
}

function extractPrimaryEffects(effects: string[], maxItems = 2): string[] {
  return effects
    .map(effect => effect.trim())
    .filter(Boolean)
    .slice(0, maxItems)
}

function calculateCompoundConfidence(input: { mechanism: string; effects: string[]; compounds: string[] }): string {
  const score = [input.mechanism, ...input.effects, ...input.compounds].filter(Boolean).length
  if (score >= 5) return 'high'
  if (score >= 3) return 'medium'
  return 'low'
}

function formatBrowseTitle(value: string, maxLength = 60): string {
  const title = value.trim()
  if (title.length <= maxLength) return title
  return `${title.slice(0, Math.max(0, maxLength - 1)).trim()}…`
}

function getMechanism(compound: CompoundWithRefs): string {
  const rawRecord = compound.rawData as Record<string, unknown> | undefined
  const workbookMechanism = String(rawRecord?.mechanisms || rawRecord?.mechanism || '').trim()
  if (workbookMechanism) return workbookMechanism

  if (typeof compound.mechanism === 'string' && compound.mechanism.trim()) {
    return compound.mechanism
  }

  if (Array.isArray(compound.mechanisms) && compound.mechanisms.length > 0) {
    return compound.mechanisms.filter(Boolean).join('; ')
  }

  return ''
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
  const summaryCandidate = sanitizeSurfaceText(
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
  )
  const summary =
    summaryCandidate && !hasPlaceholderText(summaryCandidate)
      ? summaryCandidate
      : 'Profile pending review'
  const sourceLine =
    visibleHerbs.length > 0
      ? `Found in ${visibleHerbs.map(h => h.name).join(', ')}${hiddenHerbCount > 0 ? ` +${hiddenHerbCount}` : ''}`
      : 'Source mapping in progress'

  return (
    <motion.article
      whileHover={{ scale: 1.003 }}
      title={compound.herbsFound.map(h => h.name).join(', ')}
      className='group relative flex h-full flex-col gap-2.5 rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.03] p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-white/16 hover:bg-white/[0.055] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
    >
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 rounded-[var(--radius-lg)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 shadow-[inset_0_0_0_1px_rgba(14,207,179,0.12)]'
      />
      <h2
        title={isTitleTruncated ? compound.name : undefined}
        className='line-clamp-2 min-h-[2.2rem] break-all text-[0.95rem] font-semibold leading-tight text-white sm:text-base'
      >
        {title}
      </h2>
      {showSummary ? <p className='line-clamp-2 text-xs leading-[1.45] text-white/76'>{summary}</p> : null}
      <div className='flex flex-wrap gap-1'>
        <span className='inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[0.68rem] font-medium text-white/55'>
          {normalizeTagList(confidence, { caseStyle: 'title', maxItems: 1 })[0] || confidence}
        </span>
        {primaryEffects[0] && (
          <span className='inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[0.68rem] font-medium text-white/55'>
            {primaryEffects[0]}
          </span>
        )}
      </div>
      {!isMinimal && <p className='line-clamp-1 text-[11px] text-white/56'>{sourceLine}</p>}
      <div className='mt-auto' />
    </motion.article>
  )
}
