import { formatDisplayLabel, list, text } from '@/lib/display-utils'

type PathwayKey =
  | 'sleep-support'
  | 'stress-support'
  | 'cognitive-support'
  | 'recovery-support'

export type BeginnerPathway = {
  slug: PathwayKey
  title: string
  description: string
  signals: string[]
  starterProfiles: string[]
}

const BEGINNER_PATHWAYS: BeginnerPathway[] = [
  {
    slug: 'sleep-support',
    title: 'Starting Sleep Support',
    description:
      'A calmer onboarding path focused on sleep quality, nervous-system decompression, and evening recovery support.',
    signals: [
      'sleep-adjacent',
      'calming',
      'stimulant-sensitive',
      'recovery-oriented',
    ],
    starterProfiles: [
      'glycine',
      'theanine',
      'magnesium-glycinate',
      'ashwagandha',
    ],
  },
  {
    slug: 'stress-support',
    title: 'Starting Stress Support',
    description:
      'A practical comparison path for people exploring stress resilience, tension management, and recovery capacity.',
    signals: [
      'adaptogenic',
      'stress-modulation',
      'recovery-oriented',
      'beginner-friendly',
    ],
    starterProfiles: [
      'ashwagandha',
      'rhodiola',
      'theanine',
      'saffron',
    ],
  },
  {
    slug: 'cognitive-support',
    title: 'Starting Cognitive Support',
    description:
      'A guided cognition pathway balancing calm focus, cumulative support, and sustainable mental performance.',
    signals: [
      'focus-oriented',
      'cumulative',
      'calm-focus',
      'productivity-support',
    ],
    starterProfiles: [
      'creatine',
      'theanine',
      'bacopa',
      'lions-mane',
    ],
  },
  {
    slug: 'recovery-support',
    title: 'Starting Recovery Support',
    description:
      'A recovery-focused onboarding track for training support, nervous-system recovery, and energy sustainability.',
    signals: [
      'performance-support',
      'recovery-oriented',
      'mitochondrial-support',
      'fatigue-aware',
    ],
    starterProfiles: [
      'creatine',
      'taurine',
      'magnesium',
      'rhodiola',
    ],
  },
]

function normalize(value: unknown) {
  return text(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function getBeginnerPathways() {
  return BEGINNER_PATHWAYS
}

export function matchBeginnerPathways(record: any) {
  const slug = normalize(record?.slug || record?.name)

  return BEGINNER_PATHWAYS.filter((pathway) =>
    pathway.starterProfiles.includes(slug),
  )
}

export function inferBeginnerSignals(record: any) {
  const source = [
    text(record?.summary),
    text(record?.description),
    ...list(record?.effects),
    ...list(record?.primary_effects),
  ]
    .map((item) => formatDisplayLabel(item))
    .join(' ')
    .toLowerCase()

  const signals = new Set<string>()

  if (/sleep|calm|relax|stress|recovery/.test(source)) {
    signals.add('sleep-adjacent')
    signals.add('calming')
  }

  if (/focus|cognition|energy|productivity/.test(source)) {
    signals.add('focus-oriented')
  }

  if (/creatine|bacopa|adaptogen|recovery/.test(source)) {
    signals.add('cumulative')
  }

  if (/theanine|glycine|magnesium/.test(source)) {
    signals.add('beginner-friendly')
  }

  return Array.from(signals).slice(0, 5)
}
