import { useEffect, useState } from 'react'
import type { Herb } from '../../types'
import { decorateHerbs } from '../../lib/herbs'
import { loadHerbData } from '@/lib/herb-data'

type RawHerb = Record<string, unknown>

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map(v => (typeof v === 'string' ? v.trim() : ''))
      .filter((v): v is string => Boolean(v))
  }
  if (typeof value === 'string') {
    return value
      .split(/[,;|]/)
      .map(v => v.trim())
      .filter(Boolean)
  }
  return []
}

function normalizeHerb(raw: RawHerb): Herb {
  const compounds = toStringArray(raw.compounds)
  const tags = toStringArray(raw.tags)
  const interactions = toStringArray(raw.interactions)
  const contraindications = toStringArray(raw.contraindications)
  const sideeffects = toStringArray(raw.sideeffects)
  const preparations = toStringArray(raw.preparations)
  const regiontags = toStringArray(raw.regiontags)
  const sources = toStringArray(raw.sources)

  const common = typeof raw.common === 'string' ? raw.common : ''
  const scientific = typeof raw.scientific === 'string' ? raw.scientific : ''
  const slug =
    typeof raw.slug === 'string' && raw.slug ? raw.slug : String((raw as { id?: unknown }).id || '')
  const id = String((raw as { id?: unknown }).id || slug)

  const mechanism =
    typeof raw.mechanism === 'string'
      ? raw.mechanism
      : typeof raw.mechanismofaction === 'string'
        ? raw.mechanismofaction
        : ''

  const legalstatus = typeof raw.legalstatus === 'string' ? raw.legalstatus : ''
  const therapeutic = typeof raw.therapeutic === 'string' ? raw.therapeutic : ''
  const safety = typeof raw.safety === 'string' ? raw.safety : ''
  const legalnotes = typeof raw.legalnotes === 'string' ? raw.legalnotes : ''
  const schedule = typeof raw.schedule === 'string' ? raw.schedule : ''
  const subcategory = typeof raw.subcategory === 'string' ? raw.subcategory : ''

  const herb: Herb = {
    id,
    slug,
    common,
    scientific,
    category: typeof raw.category === 'string' ? raw.category : '',
    subcategory,
    category_label:
      typeof raw.category_label === 'string' && raw.category_label
        ? (raw.category_label as string)
        : typeof raw.category === 'string'
          ? raw.category
          : '',
    benefits: typeof raw.benefits === 'string' ? raw.benefits : '',
    intensity: typeof raw.intensity === 'string' ? raw.intensity : '',
    intensityLabel:
      typeof raw.intensityLabel === 'string' && raw.intensityLabel
        ? (raw.intensityLabel as Herb['intensityLabel'])
        : typeof raw.intensity_label === 'string' && raw.intensity_label
          ? (raw.intensity_label as Herb['intensityLabel'])
          : typeof raw.intensityLevel === 'string' && raw.intensityLevel
            ? `${raw.intensityLevel.charAt(0).toUpperCase()}${raw.intensityLevel.slice(1)}`
            : typeof raw.intensity === 'string'
              ? (raw.intensity as Herb['intensityLabel'])
              : null,
    intensityLevel: (() => {
      const candidate =
        (typeof raw.intensityLevel === 'string' && raw.intensityLevel) ||
        (typeof raw.intensity_level === 'string' && raw.intensity_level) ||
        ''
      const normalized = candidate.toLowerCase()
      return ['mild', 'moderate', 'strong', 'variable', 'unknown'].includes(normalized)
        ? (normalized as Herb['intensityLevel'])
        : null
    })(),
    region: typeof raw.region === 'string' ? raw.region : '',
    legalstatus,
    schedule,
    description: typeof raw.description === 'string' ? raw.description : '',
    effects: typeof raw.effects === 'string' ? raw.effects : '',
    mechanism,
    compounds,
    active_compounds:
      Array.isArray(raw.active_compounds) && raw.active_compounds.length
        ? toStringArray(raw.active_compounds)
        : compounds,
    preparations,
    interactions,
    contraindications,
    dosage: typeof raw.dosage === 'string' ? raw.dosage : '',
    therapeutic,
    safety,
    sideeffects,
    toxicity: typeof raw.toxicity === 'string' ? raw.toxicity : '',
    toxicity_ld50: typeof raw.toxicity_ld50 === 'string' ? raw.toxicity_ld50 : '',
    tags,
    regiontags,
    legalnotes,
    sources,
    image: typeof raw.image === 'string' ? raw.image : '',
    name: typeof raw.name === 'string' && raw.name ? raw.name : common || scientific || id,
    nameNorm:
      typeof raw.nameNorm === 'string' && raw.nameNorm ? raw.nameNorm : common || scientific || id,
    commonnames: typeof raw.commonnames === 'string' && raw.commonnames ? raw.commonnames : common,
    scientificname:
      typeof raw.scientificname === 'string' && raw.scientificname
        ? raw.scientificname
        : scientific,
    mechanismofaction:
      typeof raw.mechanismofaction === 'string' ? raw.mechanismofaction : mechanism,
    mechanismOfAction:
      typeof raw.mechanismOfAction === 'string' ? (raw.mechanismOfAction as string) : mechanism,
    legalStatus: typeof raw.legalStatus === 'string' ? raw.legalStatus : legalstatus,
    therapeuticUses: typeof raw.therapeuticUses === 'string' ? raw.therapeuticUses : therapeutic,
    sideEffects: typeof raw.sideEffects === 'string' ? raw.sideEffects : sideeffects.join('; '),
    drugInteractions:
      typeof raw.drugInteractions === 'string' && raw.drugInteractions
        ? raw.drugInteractions
        : interactions.join('; '),
    toxicityld50:
      typeof raw.toxicityld50 === 'string' ? raw.toxicityld50 : (raw.toxicity_ld50 as string) || '',
    toxicityLD50:
      typeof raw.toxicityLD50 === 'string' ? raw.toxicityLD50 : (raw.toxicity_ld50 as string) || '',
    compoundsDetailed: Array.isArray(raw.compoundsDetailed)
      ? (raw.compoundsDetailed as string[])
      : compounds,
    activeconstituents: Array.isArray(raw.activeconstituents)
      ? (raw.activeconstituents as string[])
      : compounds,
    activeConstituents: Array.isArray(raw.activeConstituents)
      ? (raw.activeConstituents as { name: string }[])
      : compounds.map(name => ({ name })),
    contraindicationsText:
      typeof raw.contraindicationsText === 'string' && raw.contraindicationsText
        ? raw.contraindicationsText
        : contraindications.join('; '),
    interactionsText:
      typeof raw.interactionsText === 'string' && raw.interactionsText
        ? raw.interactionsText
        : interactions.join('; '),
    preparationsText:
      typeof raw.preparationsText === 'string' && raw.preparationsText
        ? raw.preparationsText
        : preparations.join('; '),
    tagsRaw: typeof raw.tagsRaw === 'string' && raw.tagsRaw ? raw.tagsRaw : tags.join('; '),
    duration: (raw.duration ?? null) as string | null,
    onset: (raw.onset ?? null) as string | null,
    pharmacokinetics: (raw.pharmacokinetics ?? null) as string | null,
    preparation: (raw.preparation ?? null) as string | null,
    regionNotes: (raw.regionNotes ?? null) as string | null,
    safetyrating: (raw.safetyrating ?? null) as string | null,
    dosage_notes: (raw.dosage_notes ?? null) as string | null,
    legalstatusClean: (raw.legalstatusClean ?? null) as string | null,
    intensityClean: (raw.intensityClean ?? null) as string | null,
    effectsSummary: (raw.effectsSummary ?? null) as string | null,
    affiliatelink: (raw.affiliatelink ?? null) as string | null,
    imageCredit: (raw.imageCredit ?? null) as string | null,
  }

  return herb
}

let cachedHerbs: Herb[] | null = null
let herbsPromise: Promise<Herb[]> | null = null

async function resolveHerbs(): Promise<Herb[]> {
  if (cachedHerbs) return cachedHerbs
  if (!herbsPromise) {
    herbsPromise = loadHerbData()
      .then(rawList => {
        const normalized = (rawList as RawHerb[]).map(normalizeHerb)
        const decorated = decorateHerbs(normalized)
        cachedHerbs = decorated
        return decorated
      })
      .catch(error => {
        herbsPromise = null
        throw error
      })
  }

  return herbsPromise
}

export async function loadHerbsFull(): Promise<Herb[]> {
  return resolveHerbs()
}

export function useHerbsFull(): Herb[] {
  const [herbList, setHerbList] = useState<Herb[]>(cachedHerbs ?? [])

  useEffect(() => {
    let alive = true
    resolveHerbs()
      .then(items => {
        if (!alive) return
        setHerbList(items)
      })
      .catch(() => {
        if (!alive) return
        setHerbList([])
      })

    return () => {
      alive = false
    }
  }, [])

  return herbList
}

export function getHerbsSnapshot(): Herb[] {
  return cachedHerbs ?? []
}
