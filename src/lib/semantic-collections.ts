export type SemanticCollection = {
  slug: string
  title: string
  description: string
  intent: 'evidence' | 'mechanism' | 'safety' | 'traditional' | 'ecosystem'
  keywords: string[]
  entityTypes?: Array<'herb' | 'compound'>
}

export const semanticCollections: SemanticCollection[] = [
  {
    slug: 'evidence-forward-adaptogens',
    title: 'Evidence-forward adaptogens',
    description: 'Profiles commonly explored for stress adaptation with stronger evidence, safety, or mechanism context surfaced first.',
    intent: 'evidence',
    keywords: ['adaptogen', 'stress', 'cortisol', 'fatigue', 'resilience'],
    entityTypes: ['herb'],
  },
  {
    slug: 'sleep-and-recovery-systems',
    title: 'Sleep and recovery systems',
    description: 'Botanicals and compounds connected to sleep quality, calming pathways, recovery, circadian context, or restoration.',
    intent: 'ecosystem',
    keywords: ['sleep', 'recovery', 'gaba', 'calm', 'circadian', 'relaxation'],
  },
  {
    slug: 'cognition-and-focus-pathways',
    title: 'Cognition and focus pathways',
    description: 'Profiles connected to attention, memory, neurobiology, mood, and cognitive performance pathways.',
    intent: 'mechanism',
    keywords: ['cognition', 'focus', 'memory', 'dopamine', 'acetylcholine', 'neuroplasticity'],
  },
  {
    slug: 'inflammation-and-recovery-networks',
    title: 'Inflammation and recovery networks',
    description: 'Profiles connected to inflammatory signaling, oxidative stress, repair, and recovery ecosystems.',
    intent: 'mechanism',
    keywords: ['inflammation', 'recovery', 'oxidative', 'pain', 'immune', 'cox', 'nf-kb'],
  },
  {
    slug: 'lower-stimulation-calm-support',
    title: 'Lower-stimulation calm support',
    description: 'Profiles that may fit gentler calming exploration compared with more activating or sedating options.',
    intent: 'safety',
    keywords: ['calm', 'anxiety', 'gentle', 'relaxation', 'gaba', 'non-stimulating'],
  },
  {
    slug: 'mitochondrial-and-metabolic-systems',
    title: 'Mitochondrial and metabolic systems',
    description: 'Compounds and botanicals connected to energy metabolism, mitochondrial function, glucose handling, and oxidative stress.',
    intent: 'ecosystem',
    keywords: ['mitochondria', 'metabolism', 'glucose', 'energy', 'oxidative', 'insulin'],
  },
]

function normalize(value: unknown) {
  return typeof value === 'string' ? value.toLowerCase() : ''
}

function corpus(record: any) {
  return [
    record?.name,
    record?.displayName,
    record?.slug,
    record?.summary,
    record?.description,
    record?.evidence_tier,
    record?.evidenceTier,
    ...(Array.isArray(record?.primary_effects) ? record.primary_effects : []),
    ...(Array.isArray(record?.effects) ? record.effects : []),
    ...(Array.isArray(record?.mechanisms) ? record.mechanisms : []),
    ...(Array.isArray(record?.pathways) ? record.pathways : []),
    ...(Array.isArray(record?.topics) ? record.topics : []),
  ].map(normalize).join(' ')
}

export function scoreRecordForCollection(record: any, collection: SemanticCollection) {
  const text = corpus(record)
  const entityType = record?.entityType === 'compound' ? 'compound' : 'herb'

  if (collection.entityTypes && !collection.entityTypes.includes(entityType)) return 0

  return collection.keywords.reduce((score, keyword) => {
    return text.includes(keyword.toLowerCase()) ? score + 1 : score
  }, 0)
}

export function getCollectionRecords(records: any[], collection: SemanticCollection, limit = 24) {
  return records
    .map((record) => ({ record, score: scoreRecordForCollection(record, collection) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.record)
}

export function getSemanticCollectionBySlug(slug: string) {
  return semanticCollections.find((collection) => collection.slug === slug)
}
