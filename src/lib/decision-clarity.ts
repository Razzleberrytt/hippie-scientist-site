import { cleanSummary, formatDisplayLabel, list, text } from '@/lib/display-utils'
import { cleanEditorialText, dedupeEditorialItems, isRenderableText } from '@/lib/editorial-rendering'

type EntityType = 'herb' | 'compound'

type DecisionClarityInput = {
  record: Record<string, unknown>
  entityType: EntityType
  relatedRecords?: Record<string, unknown>[]
  effects?: string[]
  mechanisms?: string[]
  summary?: string
}

export type DecisionClarityModel = {
  bestFitFor: string[]
  usuallyNotIdealFor: string[]
  commonMisunderstandings: string[]
  realisticExpectations: string[]
  acuteVsCumulative: string[]
  responderVariability: string[]
  formulationVariability: string[]
  beginnerStartingPoints: string[]
  nextBestSteps: Array<{ label: string; href?: string; note?: string }>
  stackConsiderations: string[]
}

const STIMULANT_PATTERN = /energy|focus|stimul|alert|performance|fatigue|cognition|cognitive/i
const SLEEP_PATTERN = /sleep|calm|relax|stress|anxiety|recovery|gaba/i
const RECOVERY_PATTERN = /recovery|performance|muscle|exercise|mitochond|fatigue|endurance/i
const SAFETY_PATTERN = /pregnan|liver|kidney|bleed|sedat|thyroid|autoimmune|bipolar|ssri|maoi|warfarin|interaction|contraindication/i

const FLAGSHIP_OVERRIDES: Record<string, Partial<DecisionClarityModel>> = {
  ashwagandha: {
    bestFitFor: [
      'Stress and recovery overlap, especially when tension affects sleep quality.',
      'People who want sleep-adjacent stress support rather than a direct sedative.',
      'Stimulant-sensitive users who want a calmer recovery-oriented option.',
    ],
    usuallyNotIdealFor: [
      'People expecting immediate dramatic changes from the first serving.',
      'Users who feel worse with calming or thyroid-active botanicals.',
      'Anyone trying to mask high stress without fixing sleep, workload, or recovery basics.',
    ],
    commonMisunderstandings: [
      'Ashwagandha is not automatically sedating for everyone.',
      'A stronger extract is not always the better fit.',
      'It is better framed as stress-modulation support than as a universal anxiety fix.',
    ],
    realisticExpectations: [
      'Most people should expect subtle stress-resilience changes, not a dramatic mood shift.',
      'Effects often make more sense after repeated use than from a single acute dose.',
      'Baseline stress, sleep debt, extract type, and dose strongly shape the experience.',
    ],
  },
  creatine: {
    bestFitFor: [
      'Strength, power, and repeat-effort performance support.',
      'Recovery routines where training output and muscle energy matter.',
      'Cognitive energy support when diet, sleep, or workload create higher demand.',
    ],
    usuallyNotIdealFor: [
      'People expecting a stimulant-like feeling after one serving.',
      'Users unwilling to take it consistently enough to saturate stores.',
      'Anyone treating it as a replacement for protein, calories, sleep, or training structure.',
    ],
    commonMisunderstandings: [
      'Creatine is not only for bodybuilders.',
      'Water-weight changes are not the same thing as fat gain.',
      'The basic monohydrate form is often enough; novelty forms are not automatically superior.',
    ],
    realisticExpectations: [
      'Benefits are usually cumulative and consistency-dependent.',
      'The effect is more like improved capacity than a noticeable buzz.',
      'Response can be more obvious in low-creatine diets or high-demand training blocks.',
    ],
  },
  theanine: {
    bestFitFor: [
      'Calm focus without a heavy sedating feel.',
      'Smoothing caffeine for people who get jittery or tense.',
      'Anxiety-prone productivity support when stimulation is still desired.',
    ],
    usuallyNotIdealFor: [
      'People looking for strong sedation or a knockout sleep aid.',
      'Users expecting it to override excessive caffeine.',
      'Situations where anxiety is being driven by unresolved stressors or poor sleep.',
    ],
    commonMisunderstandings: [
      'Theanine is not a stimulant, even when paired with caffeine.',
      'More is not always better for productivity.',
      'It may feel subtle because the main effect can be reduced edge rather than added force.',
    ],
    realisticExpectations: [
      'Acute effects are usually gentle and context-dependent.',
      'It often works best when paired with a clear trigger, such as caffeine sensitivity.',
      'People vary: some feel calm focus, while others barely notice it.',
    ],
  },
  rhodiola: {
    bestFitFor: [
      'Stress-related fatigue where energy and resilience overlap.',
      'People who want an adaptogen with a more activating profile.',
      'Short demanding periods where mental stamina matters.',
    ],
    usuallyNotIdealFor: [
      'Stimulant-sensitive users who already feel wired or edgy.',
      'People expecting a calming sleep-support herb.',
      'Anyone prone to feeling overstimulated from energizing botanicals.',
    ],
    commonMisunderstandings: [
      'Rhodiola can feel stimulating for some users.',
      'It is not interchangeable with calmer adaptogens like ashwagandha.',
      'Extract standardization can materially change the experience.',
    ],
  },
  'lions-mane': {
    usuallyNotIdealFor: [
      'People expecting acute stimulant-like effects.',
      'Users who want a same-day productivity surge.',
      'Anyone who treats early mechanistic promise as settled human-outcome certainty.',
    ],
    commonMisunderstandings: [
      'Lion’s Mane is not best judged like caffeine or a stimulant.',
      'Mushroom fruiting body, mycelium, and extract quality are not interchangeable.',
      'Cognitive support claims should be kept conservative unless the exact evidence supports them.',
    ],
  },
  magnesium: {
    bestFitFor: [
      'Sleep-adjacent relaxation support when intake or form may be limiting.',
      'Muscle tension, recovery, and general mineral adequacy routines.',
      'People comparing forms for digestion, calm, or repletion goals.',
    ],
    commonMisunderstandings: [
      'Magnesium forms behave differently.',
      'A high elemental dose is not automatically better if digestion suffers.',
      'Magnesium is not a single-effect sleep supplement; context and deficiency status matter.',
    ],
    realisticExpectations: [
      'Benefits are often most noticeable when baseline intake is low.',
      'GI tolerance can be the deciding factor for the right form.',
      'Sleep effects are usually supportive rather than forcefully sedating.',
    ],
  },
  bacopa: {
    bestFitFor: [
      'Memory-oriented cognitive support with a cumulative timeline.',
      'People willing to use a supplement consistently before judging results.',
      'Cognition routines where calm persistence matters more than acute stimulation.',
    ],
    usuallyNotIdealFor: [
      'People wanting same-day stimulant-like focus.',
      'Users who dislike calming or GI-sensitive botanicals.',
      'Anyone unwilling to evaluate it over weeks rather than hours.',
    ],
    commonMisunderstandings: [
      'Bacopa is not an acute nootropic in the caffeine sense.',
      'Standardized extracts matter when interpreting research.',
      'More noticeable calm does not always mean better cognitive performance.',
    ],
  },
  glycine: {
    bestFitFor: [
      'Sleep quality routines where relaxation and temperature comfort matter.',
      'Gentle nighttime support without a strong sedative identity.',
      'Recovery-adjacent sleep support for people who tolerate amino acids well.',
    ],
    usuallyNotIdealFor: [
      'Users wanting fast cognitive stimulation.',
      'People expecting it to behave like a sleeping pill.',
      'Situations where poor sleep is mostly driven by caffeine timing, stress, or schedule chaos.',
    ],
    commonMisunderstandings: [
      'Glycine is not primarily a stimulant or classic nootropic.',
      'Subtle sleep support can still be useful even when it is not dramatic.',
      'Nighttime context matters more than treating it as a universal sleep fix.',
    ],
  },
  taurine: {
    bestFitFor: [
      'Calm performance support where nervous-system steadiness matters.',
      'Exercise and recovery contexts with electrolyte or endurance overlap.',
      'People comparing gentler options against more stimulating compounds.',
    ],
    commonMisunderstandings: [
      'Taurine is not the stimulant in energy drinks.',
      'Its effects are usually context-dependent rather than obviously energizing.',
      'It should not be judged only by its association with caffeine formulas.',
    ],
  },
  nac: {
    bestFitFor: [
      'Glutathione-adjacent antioxidant support discussions.',
      'Respiratory and oxidative-stress contexts where evidence boundaries are clear.',
      'People comparing sulfur-containing compounds with conservative expectations.',
    ],
    usuallyNotIdealFor: [
      'People expecting a broad daily wellness cure-all.',
      'Users who need medication-level guidance but are self-experimenting instead.',
      'Anyone ignoring drug interactions, respiratory conditions, or clinician advice.',
    ],
    commonMisunderstandings: [
      'NAC is not just a generic antioxidant buzzword.',
      'Clinical uses do not automatically justify every wellness claim.',
      'More aggressive dosing is not automatically more evidence-based.',
    ],
  },
}

function normalizeSlug(record: Record<string, unknown>) {
  return text(record?.slug || record?.id || record?.name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function cleanItems(items: unknown[], limit = 4) {
  return dedupeEditorialItems(
    items
      .flatMap((item) => list(item))
      .map(formatDisplayLabel),
    limit,
  )
}

function compactSentence(value: string) {
  const clean = cleanEditorialText(value)
  return clean.endsWith('.') ? clean : `${clean}.`
}

function getName(record: Record<string, unknown>) {
  const name = formatDisplayLabel(record?.displayName || record?.name || record?.slug)
  return isRenderableText(name) ? name : 'This profile'
}

function routeFor(record: Record<string, unknown>, fallbackType: EntityType) {
  const slug = record?.slug
  if (!isRenderableText(slug)) return undefined
  const type = record?.entityType === 'herb' || record?.entityType === 'compound' ? record.entityType : fallbackType
  return `/${type === 'herb' ? 'herbs' : 'compounds'}/${slug}`
}

function inferBestFit(record: Record<string, unknown>, effects: string[], entityType: EntityType) {
  const explicit = cleanItems([
    record?.best_fit_for,
    record?.bestFitFor,
    record?.best_for,
    record?.bestFor,
    effects,
    record?.primary_effects,
    record?.effects,
  ], 3)

  if (explicit.length > 0) {
    return explicit.map((item) => compactSentence(item))
  }

  const source = `${text(record?.summary)} ${effects.join(' ')}`

  if (SLEEP_PATTERN.test(source)) {
    return [
      'People comparing calm, stress, sleep-adjacent, or recovery support options.',
      'Users who want a practical fit check before reading deeper evidence sections.',
      'Situations where baseline stress, sleep quality, and sensitivity may shape response.',
    ]
  }

  if (RECOVERY_PATTERN.test(source)) {
    return [
      'Performance, recovery, or energy-support routines where consistency matters.',
      'People comparing mechanism overlap before choosing a stack direction.',
      'Users who want realistic expectations instead of hype-driven benefit claims.',
    ]
  }

  if (STIMULANT_PATTERN.test(source)) {
    return [
      'Cognition, focus, or mental-energy contexts where the evidence boundaries are visible.',
      'Users comparing acute support against slower cumulative options.',
      'People who want to match the compound to their sensitivity level.',
    ]
  }

  return [
    `${entityType === 'herb' ? 'Botanical' : 'Compound'} research exploration where fit, evidence, and safety need to be weighed together.`,
    'People who want a practical decision lens before going into mechanisms or citations.',
    'Users comparing similar profiles rather than treating one entry as a standalone answer.',
  ]
}

function inferUsuallyNotIdeal(record: Record<string, unknown>, effects: string[]) {
  const explicit = cleanItems([
    record?.usually_not_ideal_for,
    record?.usuallyNotIdealFor,
    record?.not_ideal_for,
    record?.notIdealFor,
    record?.avoid_if,
    record?.avoidIf,
    record?.contraindications,
  ], 3)

  if (explicit.length > 0) return explicit.map(compactSentence)

  const source = `${text(record?.summary)} ${effects.join(' ')} ${text(record?.safetyNotes)} ${text(record?.safety)}`
  const items = [
    'Anyone expecting a guaranteed or dramatic effect from one dose.',
    'People using it to compensate for poor sleep, high stress, or unresolved medical questions.',
  ]

  if (SAFETY_PATTERN.test(source)) {
    items.push('Users with relevant medication, pregnancy, liver, kidney, bleeding, mood, or interaction concerns without clinician guidance.')
  } else {
    items.push('Users who need individualized medical guidance rather than educational decision support.')
  }

  return items.slice(0, 3)
}

function inferMisunderstandings(record: Record<string, unknown>, name: string, effects: string[], mechanisms: string[]) {
  const explicit = cleanItems([
    record?.common_misunderstandings,
    record?.commonMisunderstandings,
    record?.myths,
    record?.misconceptions,
  ], 3)

  if (explicit.length > 0) return explicit.map(compactSentence)

  const source = `${effects.join(' ')} ${mechanisms.join(' ')} ${text(record?.summary)}`
  const items = [
    `${name} is not best understood as a guaranteed outcome; it is a fit-dependent option.`,
    'Evidence strength, form, dose, and baseline status can change how useful it feels.',
  ]

  if (STIMULANT_PATTERN.test(source)) {
    items.push('Energy or focus language does not always mean stimulant-like intensity.')
  } else if (SLEEP_PATTERN.test(source)) {
    items.push('Calm or sleep-adjacent support does not mean it will sedate every user.')
  } else {
    items.push('Mechanism plausibility should not be treated the same as proven human benefit.')
  }

  return items.slice(0, 3)
}

function inferRealisticExpectations(record: Record<string, unknown>) {
  const explicit = cleanItems([
    record?.realistic_expectations,
    record?.realisticExpectations,
    record?.time_to_effect,
    record?.timeToEffect,
    record?.onset,
  ], 3)

  if (explicit.length > 0) return explicit.map(compactSentence)

  return [
    'Expect modest, context-dependent effects before expecting dramatic changes.',
    'Track sleep, stress, training, caffeine, diet, or symptom baseline so changes are interpretable.',
    'Product quality, dose, timing, and consistency can matter as much as the ingredient name.',
  ]
}

function inferAcuteVsCumulative(record: Record<string, unknown>, effects: string[]) {
  const explicit = cleanItems([
    record?.acute_vs_cumulative,
    record?.acuteVsCumulative,
    record?.time_to_effect,
    record?.duration,
  ], 3)

  if (explicit.length > 0) return explicit.map(compactSentence)

  const source = `${text(record?.summary)} ${effects.join(' ')}`
  if (/creatine|bacopa|memory|training|adaptogen|recovery/i.test(source)) {
    return [
      'A single dose may not reveal the main value.',
      'Judge cumulative options over a consistent trial window, not one isolated use.',
    ]
  }

  if (/theanine|caffeine|calm|acute/i.test(source)) {
    return [
      'Some effects may be noticeable acutely, especially when a clear trigger exists.',
      'Even acute-support options can still vary by caffeine use, stress level, and dose.',
    ]
  }

  return [
    'Some signals may be acute, but the more useful judgment is often cumulative and context-aware.',
    'Avoid over-interpreting one good or bad day as proof of the whole profile.',
  ]
}

function inferResponderVariability(record: Record<string, unknown>) {
  const explicit = cleanItems([
    record?.responder_variability,
    record?.responderVariability,
    record?.population_notes,
    record?.populationNotes,
  ], 3)

  if (explicit.length > 0) return explicit.map(compactSentence)

  return [
    'Baseline deficiency, stress load, sleep debt, training demand, diet, and sensitivity can change response.',
    'A non-response does not automatically mean the research is useless; it may mean the fit is wrong.',
  ]
}

function inferFormulationVariability(record: Record<string, unknown>, entityType: EntityType) {
  const explicit = cleanItems([
    record?.formulation_variability,
    record?.formulationVariability,
    record?.standardization,
    record?.form,
    record?.forms,
  ], 3)

  if (explicit.length > 0) return explicit.map(compactSentence)

  return entityType === 'herb'
    ? [
        'Extract ratio, plant part, standardization, and dose can make two products feel meaningfully different.',
        'Be careful comparing research on one extract to a generic retail product with unclear specs.',
      ]
    : [
        'Form, dose, timing, and purity can affect tolerability and usefulness.',
        'Novel forms are not automatically better than well-studied basic forms.',
      ]
}

function inferBeginnerStartingPoints(record: Record<string, unknown>, effects: string[]) {
  const explicit = cleanItems([
    record?.beginner_starting_points,
    record?.beginnerStartingPoints,
    record?.starting_points,
    record?.startingPoints,
  ], 3)

  if (explicit.length > 0) return explicit.map(compactSentence)

  const source = `${effects.join(' ')} ${text(record?.summary)}`
  if (SLEEP_PATTERN.test(source)) {
    return ['Sleep support: compare glycine, magnesium glycinate, and theanine before choosing a direction.']
  }
  if (STIMULANT_PATTERN.test(source)) {
    return ['Cognition support: compare creatine, theanine, and bacopa depending on acute vs cumulative goals.']
  }
  if (/stress|adaptogen|mood|anxiety/i.test(source)) {
    return ['Stress support: compare ashwagandha, rhodiola, saffron, magnesium, and theanine by stimulation level.']
  }

  return ['Start by matching the profile to one goal, one constraint, and one comparison instead of stacking immediately.']
}

function inferStackConsiderations(record: Record<string, unknown>, effects: string[]) {
  const explicit = cleanItems([
    record?.stack_considerations,
    record?.stackConsiderations,
    record?.stack_notes,
    record?.stackNotes,
    record?.synergies,
  ], 3)

  if (explicit.length > 0) return explicit.map(compactSentence)

  const source = `${effects.join(' ')} ${text(record?.summary)} ${text(record?.safetyNotes)}`
  const items = ['Add one variable at a time so benefits and side effects are easier to interpret.']

  if (SLEEP_PATTERN.test(source)) {
    items.push('Avoid combining multiple calming agents before you know how each one affects alertness the next day.')
  } else if (STIMULANT_PATTERN.test(source)) {
    items.push('Be careful stacking with caffeine, stimulants, or other activating compounds if you are anxiety-prone.')
  } else {
    items.push('Use comparisons first; stacking should come after the single-profile fit is clear.')
  }

  return items.slice(0, 2)
}

function inferNextBestSteps(record: Record<string, unknown>, entityType: EntityType, relatedRecords: Record<string, unknown>[]) {
  const explicit = cleanItems([
    record?.next_best_steps,
    record?.nextBestSteps,
    record?.compare_to,
    record?.compareTo,
  ], 3).map((label) => ({ label: compactSentence(label) }))

  const related = relatedRecords
    .filter((item) => isRenderableText(item?.slug))
    .slice(0, 3)
    .map((item) => ({
      label: cleanEditorialText(formatDisplayLabel(item?.name || item?.slug)),
      href: routeFor(item, entityType),
      note: 'Compare fit, timing, and safety before choosing.',
    }))

  const steps = explicit.length > 0
    ? [...explicit, ...related]
    : [
        ...related,
        { label: 'Explore the related ecosystem', note: 'Use the connected profiles to understand adjacent goals and tradeoffs.' },
      ]

  return steps
    .map((step) => ({
      ...step,
      label: cleanEditorialText(step.label),
      note: cleanEditorialText('note' in step ? step.note : ""),
    }))
    .filter((step) => isRenderableText(step.label))
    .slice(0, 4)
}

function mergeOverrides(base: DecisionClarityModel, override: Partial<DecisionClarityModel> | undefined): DecisionClarityModel {
  if (!override) return base

  return {
    bestFitFor: override.bestFitFor || base.bestFitFor,
    usuallyNotIdealFor: override.usuallyNotIdealFor || base.usuallyNotIdealFor,
    commonMisunderstandings: override.commonMisunderstandings || base.commonMisunderstandings,
    realisticExpectations: override.realisticExpectations || base.realisticExpectations,
    acuteVsCumulative: override.acuteVsCumulative || base.acuteVsCumulative,
    responderVariability: override.responderVariability || base.responderVariability,
    formulationVariability: override.formulationVariability || base.formulationVariability,
    beginnerStartingPoints: override.beginnerStartingPoints || base.beginnerStartingPoints,
    nextBestSteps: override.nextBestSteps || base.nextBestSteps,
    stackConsiderations: override.stackConsiderations || base.stackConsiderations,
  }
}


function cleanModel(model: DecisionClarityModel): DecisionClarityModel {
  return {
    bestFitFor: dedupeEditorialItems(model.bestFitFor, 4),
    usuallyNotIdealFor: dedupeEditorialItems(model.usuallyNotIdealFor, 4),
    commonMisunderstandings: dedupeEditorialItems(model.commonMisunderstandings, 4),
    realisticExpectations: dedupeEditorialItems(model.realisticExpectations, 4),
    acuteVsCumulative: dedupeEditorialItems(model.acuteVsCumulative, 4),
    responderVariability: dedupeEditorialItems(model.responderVariability, 4),
    formulationVariability: dedupeEditorialItems(model.formulationVariability, 4),
    beginnerStartingPoints: dedupeEditorialItems(model.beginnerStartingPoints, 4),
    stackConsiderations: dedupeEditorialItems(model.stackConsiderations, 4),
    nextBestSteps: model.nextBestSteps
      .map((step) => ({
        ...step,
        label: cleanEditorialText(step.label),
        note: cleanEditorialText('note' in step ? step.note : ""),
      }))
      .filter((step) => isRenderableText(step.label))
      .slice(0, 4),
  }
}

export function buildDecisionClarity({
  record,
  entityType,
  relatedRecords = [],
  effects = [],
  mechanisms = [],
  summary = '',
}: DecisionClarityInput): DecisionClarityModel {
  const name = getName(record)
  const slug = normalizeSlug(record)
  const profileSummary = cleanSummary(summary || record?.summary || record?.description || '', entityType)
  const normalizedEffects = cleanItems([effects, record?.primary_effects, record?.effects], 8)
  const normalizedMechanisms = cleanItems([mechanisms, record?.mechanisms, record?.pathways], 8)
  const recordForInference = { ...record, summary: profileSummary || record?.summary }

  const base: DecisionClarityModel = {
    bestFitFor: inferBestFit(recordForInference, normalizedEffects, entityType),
    usuallyNotIdealFor: inferUsuallyNotIdeal(recordForInference, normalizedEffects),
    commonMisunderstandings: inferMisunderstandings(recordForInference, name, normalizedEffects, normalizedMechanisms),
    realisticExpectations: inferRealisticExpectations(recordForInference),
    acuteVsCumulative: inferAcuteVsCumulative(recordForInference, normalizedEffects),
    responderVariability: inferResponderVariability(recordForInference),
    formulationVariability: inferFormulationVariability(recordForInference, entityType),
    beginnerStartingPoints: inferBeginnerStartingPoints(recordForInference, normalizedEffects),
    nextBestSteps: inferNextBestSteps(recordForInference, entityType, relatedRecords),
    stackConsiderations: inferStackConsiderations(recordForInference, normalizedEffects),
  }

  return cleanModel(mergeOverrides(base, FLAGSHIP_OVERRIDES[slug]))
}
