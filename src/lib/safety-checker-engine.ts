import { normalizeSafetySignals } from '@/lib/botanical-atlas-taxonomy'
import { canonicalizeProfileHref } from '@/lib/canonical-profile-href'

export type SafetyItemType = 'herb' | 'compound'
export type InteractionEvidenceClass = 'documented' | 'structured-signal' | 'theoretical-additive' | 'unknown'
export type InteractionMechanismClass = 'pharmacokinetic' | 'pharmacodynamic' | 'mixed' | 'unclear'
export type InteractionConfidence = 'higher' | 'moderate' | 'low' | 'unknown'

export interface SafetyToolItem {
  slug: string
  name: string
  type: SafetyItemType
  safety?: string
  safety_flags?: string[]
  mechanism?: string
  mechanisms?: string[]
  interaction_evidence?: string
  interaction_type?: string
  sources?: string[]
  incomplete_safety_data?: boolean
}

/** Remove redirect aliases so the checker presents one selectable record per profile. */
export function canonicalizeSafetyToolItems(items: SafetyToolItem[]): SafetyToolItem[] {
  const byProfile = new Map<string, { item: SafetyToolItem; isCanonical: boolean }>()

  for (const source of items) {
    const sourceHref = `/${source.type === 'herb' ? 'herbs' : 'compounds'}/${source.slug}/`
    const href = canonicalizeProfileHref(sourceHref)
    const match = /^\/(herbs|compounds)\/([^/]+)\/$/.exec(href)
    if (!match) continue

    const item: SafetyToolItem = {
      ...source,
      type: match[1] === 'herbs' ? 'herb' : 'compound',
      slug: match[2],
    }
    const key = `${item.type}:${item.slug}`
    const candidate = { item, isCanonical: href === sourceHref }
    const existing = byProfile.get(key)

    if (!existing || (candidate.isCanonical && !existing.isCanonical)) {
      byProfile.set(key, candidate)
    }
  }

  return Array.from(byProfile.values(), ({ item }) => item)
}

export interface MedicationClass {
  id: string
  name: string
  group: string
  safetyTriggers: string[]
  description: string
}

export const MEDICATION_CLASSES: MedicationClass[] = [
  { id: 'ssri-snri', name: 'SSRI / SNRI antidepressants', group: 'Antidepressants', safetyTriggers: ['Serotonergic'], description: 'Medication class affecting serotonin signaling. Exact drug, dose, and other medicines matter.' },
  { id: 'maoi', name: 'MAO inhibitors (MAOIs)', group: 'Antidepressants', safetyTriggers: ['Serotonergic', 'Stimulation'], description: 'Medication class with substantial interaction restrictions; exact combination review is important.' },
  { id: 'anticoagulant', name: 'Anticoagulants / antiplatelets', group: 'Cardiovascular', safetyTriggers: ['Bleeding'], description: 'Medicines that reduce clotting or platelet activity.' },
  { id: 'sedative', name: 'Sedatives / sleep medicines', group: 'Sleep / anxiety', safetyTriggers: ['Sedation'], description: 'Medicines that can impair alertness or coordination.' },
  { id: 'stimulant', name: 'Prescription stimulants', group: 'ADHD / wakefulness', safetyTriggers: ['Stimulation', 'Cardiovascular'], description: 'Medicines that may affect alertness, heart rate, blood pressure, sleep, or anxiety.' },
  { id: 'blood-pressure', name: 'Blood-pressure medicines', group: 'Cardiovascular', safetyTriggers: ['Cardiovascular'], description: 'Medicines used to alter blood pressure or related cardiovascular function.' },
  { id: 'diabetes', name: 'Glucose-lowering medicines', group: 'Metabolic', safetyTriggers: ['Metabolic'], description: 'Medicines that lower blood glucose; ingredient-specific review is needed.' },
  { id: 'hormonal-contraceptive', name: 'Hormonal contraceptives', group: 'Hormonal', safetyTriggers: ['Drug metabolism'], description: 'Hormonal birth-control medicines whose exposure can be affected by some enzyme-inducing substances.' },
  { id: 'immunosuppressant', name: 'Immunosuppressants', group: 'Immune', safetyTriggers: ['Drug metabolism', 'Immune'], description: 'Medicines where altered exposure or immune effects may be clinically important.' },
]

export interface SafetySignalMatch {
  signal: string
  origin: 'safety-text' | 'structured-flag' | 'mechanism' | 'medication-class'
}

export interface SafetyScreenAlert {
  id: string
  signal: string
  severity: 'review' | 'higher-review'
  title: string
  whyFlagged: string
  evidenceClass: InteractionEvidenceClass
  confidence: InteractionConfidence
  mechanismClass: InteractionMechanismClass
  uncertainty: string
  participants: string[]
  sources: string[]
}

const clean = (value: string) => value.trim().toLowerCase()

function signalPatterns(): Array<[string, RegExp]> {
  return [
    ['Sedation', /sedat|drows|cns depress|sleepiness|gabaergic|gaba-a/],
    ['Stimulation', /stimul|insomnia|agitat|jitter|adrenerg|caffeine|yohimb|ephedr/],
    ['Serotonergic', /seroton|ssri|snri|maoi|monoamine oxidase|5-ht/],
    ['Cardiovascular', /blood pressure|hypertension|hypotension|heart rate|arrhythm|tachy|brady|vasodil|vasoconstr/],
    ['Bleeding', /bleed|anticoagul|antiplatelet|clotting/],
    ['Liver', /liver|hepato/],
    ['Drug metabolism', /cyp\d|cytochrome|p-glycoprotein|p-gp|enzyme induc|enzyme inhibit|drug metabolism/],
    ['Immune', /immunosuppress|immune modulat|immunomod/],
    ['Metabolic', /glucose|hypogly|insulin|blood sugar/],
    ['Pregnancy / breastfeeding', /pregnan|breastfeed|lactation/],
  ]
}

export function collectSafetySignalMatches(item: SafetyToolItem): SafetySignalMatch[] {
  const directFlags = (item.safety_flags ?? []).flatMap(normalizeSafetySignals)
  const matches: SafetySignalMatch[] = directFlags.map((signal) => ({ signal, origin: 'structured-flag' }))
  const safetyText = clean(item.safety ?? '')
  const mechanismText = clean([item.mechanism ?? '', ...(item.mechanisms ?? [])].join(' '))

  for (const [signal, pattern] of signalPatterns()) {
    if (safetyText && pattern.test(safetyText)) matches.push({ signal, origin: 'safety-text' })
    if (mechanismText && pattern.test(mechanismText)) matches.push({ signal, origin: 'mechanism' })
  }

  const seen = new Set<string>()
  return matches.filter((match) => {
    const key = `${match.signal}:${match.origin}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function explicitEvidenceClass(item: SafetyToolItem): InteractionEvidenceClass | null {
  const value = clean(item.interaction_evidence ?? '')
  if (/documented|known|clinical|confirmed/.test(value)) return 'documented'
  if (/theoretical|mechanistic|possible/.test(value)) return 'theoretical-additive'
  return null
}

function mechanismClass(items: SafetyToolItem[], signal: string): InteractionMechanismClass {
  const explicit = clean(items.map((item) => item.interaction_type ?? '').join(' '))
  const allText = clean(items.flatMap((item) => [item.safety ?? '', item.mechanism ?? '', ...(item.mechanisms ?? [])]).join(' '))
  const pk = /pharmacokinetic|cyp\d|cytochrome|p-glycoprotein|p-gp|enzyme induc|enzyme inhibit|metabolism/.test(`${explicit} ${allText}`)
  const pd = /pharmacodynamic|seroton|sedat|stimul|bleed|blood pressure|heart rate|gaba|platelet/.test(`${explicit} ${allText}`) || signal !== 'Drug metabolism'
  if (pk && pd) return 'mixed'
  if (pk) return 'pharmacokinetic'
  if (pd) return 'pharmacodynamic'
  return 'unclear'
}

function evidenceClass(items: SafetyToolItem[], matches: SafetySignalMatch[]): InteractionEvidenceClass {
  const explicit = items.map(explicitEvidenceClass).filter(Boolean) as InteractionEvidenceClass[]
  if (explicit.includes('documented')) return 'documented'
  if (matches.some((match) => match.origin === 'safety-text' || match.origin === 'structured-flag')) return 'structured-signal'
  if (matches.some((match) => match.origin === 'mechanism')) return 'theoretical-additive'
  return 'unknown'
}

function confidenceFor(evidence: InteractionEvidenceClass, sourceCount: number): InteractionConfidence {
  if (evidence === 'documented' && sourceCount > 0) return 'higher'
  if (evidence === 'documented' || (evidence === 'structured-signal' && sourceCount > 0)) return 'moderate'
  if (evidence === 'structured-signal' || evidence === 'theoretical-additive') return 'low'
  return 'unknown'
}

function sourceList(items: SafetyToolItem[]) {
  return Array.from(new Set(items.flatMap((item) => item.sources ?? []).filter(Boolean))).slice(0, 8)
}

export function screenSafetySelection(items: SafetyToolItem[], medications: MedicationClass[]): SafetyScreenAlert[] {
  const itemMatches = new Map(items.map((item) => [item.slug, collectSafetySignalMatches(item)]))
  const signals = new Set<string>()
  itemMatches.forEach((matches) => matches.forEach((match) => signals.add(match.signal)))
  medications.forEach((medication) => medication.safetyTriggers.forEach((signal) => signals.add(signal)))

  const alerts: SafetyScreenAlert[] = []

  for (const signal of signals) {
    const matchingItems = items.filter((item) => itemMatches.get(item.slug)?.some((match) => match.signal === signal))
    const matchingMeds = medications.filter((medication) => medication.safetyTriggers.includes(signal))
    const participants = [...matchingItems.map((item) => item.name), ...matchingMeds.map((medication) => `${medication.name} (medication class)`)]
    if (participants.length < 2) continue

    const matches = matchingItems.flatMap((item) => itemMatches.get(item.slug)?.filter((match) => match.signal === signal) ?? [])
    if (matchingMeds.length) matches.push(...matchingMeds.map(() => ({ signal, origin: 'medication-class' as const })))
    const sources = sourceList(matchingItems)
    const evidence = evidenceClass(matchingItems, matches)
    const mechanism = mechanismClass(matchingItems, signal)
    const hasMedication = matchingMeds.length > 0

    alerts.push({
      id: `${signal.toLowerCase().replace(/[^a-z0-9]+/g, '-')}:${participants.join('|').toLowerCase()}`,
      signal,
      severity: hasMedication || evidence === 'documented' ? 'higher-review' : 'review',
      title: `${signal} overlap${hasMedication ? ' with medication class' : ''}`,
      whyFlagged: `${participants.join(', ')} share a ${signal.toLowerCase()} safety, interaction, or mechanism signal in the structured dataset.`,
      evidenceClass: evidence,
      confidence: confidenceFor(evidence, sources.length),
      mechanismClass: mechanism,
      uncertainty: evidence === 'documented'
        ? 'The interaction category has documented evidence in the source data, but this screen still cannot determine individual severity, dose dependence, or personal suitability.'
        : evidence === 'structured-signal'
          ? 'The overlap is based on explicit structured safety language or flags; that does not by itself prove a clinical interaction between the selected items.'
          : evidence === 'theoretical-additive'
            ? 'This flag is mechanism-derived. It is a reason to investigate further, not evidence that the combination causes a clinical interaction.'
            : 'The dataset does not contain enough evidence metadata to classify this interaction confidently.',
      participants,
      sources,
    })
  }

  return alerts.sort((a, b) => Number(b.severity === 'higher-review') - Number(a.severity === 'higher-review') || a.signal.localeCompare(b.signal))
}

export function buildSafetyShareSearch(items: SafetyToolItem[], medications: MedicationClass[]): string {
  const params = new URLSearchParams()
  const itemTokens = items.map((item) => `${item.type}:${item.slug}`).sort()
  const medIds = medications.map((medication) => medication.id).sort()
  if (itemTokens.length) params.set('items', itemTokens.join(','))
  if (medIds.length) params.set('meds', medIds.join(','))
  const value = params.toString()
  return value ? `?${value}` : ''
}

export function parseSafetyShareSearch(search: string) {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const items = Array.from(new Set(
    (params.get('items') ?? '')
      .split(',')
      .map((token) => token.trim())
      .filter((token) => /^(herb|compound):[a-z0-9][a-z0-9-]*$/.test(token))
      .map((token) => {
        const [type, slug] = token.split(':')
        const href = canonicalizeProfileHref(`/${type === 'herb' ? 'herbs' : 'compounds'}/${slug}/`)
        const match = /^\/(herbs|compounds)\/([^/]+)\/$/.exec(href)
        return match ? `${match[1] === 'herbs' ? 'herb' : 'compound'}:${match[2]}` : token
      }),
  )).slice(0, 8)
  const meds = (params.get('meds') ?? '').split(',').map((token) => token.trim()).filter((token) => MEDICATION_CLASSES.some((medication) => medication.id === token)).slice(0, 6)
  return { items, meds }
}

export function combinationAnalyticsKey(items: SafetyToolItem[], medications: MedicationClass[]) {
  const tokens = [
    ...items.map((item) => `${item.type}:${item.slug}`),
    ...medications.map((medication) => `med:${medication.id}`),
  ].sort()
  return tokens.join('+')
}
