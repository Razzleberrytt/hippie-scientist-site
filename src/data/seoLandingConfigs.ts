export type SeoLandingKind = 'effect' | 'class' | 'compound' | 'category'
export type SeoLandingEntityType = 'herbs' | 'compounds'

export type SeoLandingConfig = {
  slug: string
  title: string
  description: string
  kind: SeoLandingKind
  target: string
  entityType: SeoLandingEntityType
}

export const seoLandingConfigs: SeoLandingConfig[] = [
  {
    slug: 'herbs-for-relaxation',
    title: 'Herbs for Relaxation',
    description:
      'Browse herbs tagged with calming and relaxation-oriented effects, prioritized by data confidence.',
    kind: 'effect',
    target: 'relaxation',
    entityType: 'herbs',
  },
  {
    slug: 'herbs-for-focus',
    title: 'Herbs for Focus',
    description:
      'Explore herbs associated with focus, attention, and mental clarity based on structured dataset fields.',
    kind: 'effect',
    target: 'focus',
    entityType: 'herbs',
  },
  {
    slug: 'herbs-for-introspection',
    title: 'Herbs for Introspection',
    description:
      'Find herbs commonly linked to introspection, insight, and reflective states in the herb index.',
    kind: 'effect',
    target: 'introspection',
    entityType: 'herbs',
  },
  {
    slug: 'herbs-with-anxiolytic-effects',
    title: 'Herbs with Anxiolytic Effects',
    description:
      'A curated dataset-driven list of herbs associated with anxiolytic or anxiety-supporting effects.',
    kind: 'effect',
    target: 'anxiolytic',
    entityType: 'herbs',
  },
  {
    slug: 'herbs-for-sleep-support',
    title: 'Herbs for Sleep Support',
    description:
      'Browse herbs connected to sleep support, restfulness, and nighttime calming use-cases.',
    kind: 'effect',
    target: 'sleep',
    entityType: 'herbs',
  },
  {
    slug: 'herbs-for-mood-support',
    title: 'Herbs for Mood Support',
    description:
      'Find herbs in the database linked to mood support, emotional balance, or uplifting effects.',
    kind: 'effect',
    target: 'mood',
    entityType: 'herbs',
  },
  {
    slug: 'adaptogenic-herbs',
    title: 'Adaptogenic Herbs',
    description:
      'Discover herbs grouped under adaptogenic categories or related resilience-supporting labels.',
    kind: 'category',
    target: 'adaptogen',
    entityType: 'herbs',
  },
  {
    slug: 'nervine-herbs',
    title: 'Nervine Herbs',
    description:
      'Explore nervine herbs and related category matches from structured herb taxonomy fields.',
    kind: 'category',
    target: 'nervine',
    entityType: 'herbs',
  },
  {
    slug: 'herbs-containing-caffeine',
    title: 'Herbs Containing Caffeine',
    description: 'See herbs whose active compounds include caffeine or direct caffeine references.',
    kind: 'compound',
    target: 'caffeine',
    entityType: 'herbs',
  },
  {
    slug: 'herbs-containing-psilocybin',
    title: 'Herbs Containing Psilocybin',
    description: 'Find entries linked to psilocybin within active compound and constituent fields.',
    kind: 'compound',
    target: 'psilocybin',
    entityType: 'herbs',
  },
  {
    slug: 'herbs-containing-harmine',
    title: 'Herbs Containing Harmine',
    description:
      'Browse herbs that reference harmine or related harmala alkaloid compounds in structured data.',
    kind: 'compound',
    target: 'harmine',
    entityType: 'herbs',
  },
  {
    slug: 'herbs-containing-harmala-alkaloids',
    title: 'Herbs Containing Harmala Alkaloids',
    description:
      'A landing page for herbs containing harmala alkaloids such as harmine and harmaline.',
    kind: 'compound',
    target: 'harmala',
    entityType: 'herbs',
  },
  {
    slug: 'herbs-containing-cbd',
    title: 'Herbs Containing CBD',
    description:
      'Dataset-backed herb entries with CBD listed as an active constituent or compound reference.',
    kind: 'compound',
    target: 'cbd',
    entityType: 'herbs',
  },
  {
    slug: 'psychedelic-compounds',
    title: 'Psychedelic Compounds',
    description: 'Explore compounds categorized under psychedelic classes and related descriptors.',
    kind: 'class',
    target: 'psychedelic',
    entityType: 'compounds',
  },
  {
    slug: 'stimulant-compounds',
    title: 'Stimulant Compounds',
    description:
      'Structured list of stimulant compounds with links back to associated herbs where available.',
    kind: 'class',
    target: 'stimulant',
    entityType: 'compounds',
  },
  {
    slug: 'maoi-compounds',
    title: 'MAOI Compounds',
    description:
      'Compounds linked to monoamine oxidase inhibition (MAOI) from the compound dataset.',
    kind: 'class',
    target: 'maoi',
    entityType: 'compounds',
  },
  {
    slug: 'cannabinoid-compounds',
    title: 'Cannabinoid Compounds',
    description:
      'A focused view of cannabinoid-class compounds and related records in the dataset.',
    kind: 'class',
    target: 'cannabinoid',
    entityType: 'compounds',
  },
  {
    slug: 'tryptamine-compounds',
    title: 'Tryptamine Compounds',
    description: 'Browse compounds tagged as tryptamines, including classic psychedelic examples.',
    kind: 'class',
    target: 'tryptamine',
    entityType: 'compounds',
  },
  {
    slug: 'compounds-with-anxiolytic-effects',
    title: 'Compounds with Anxiolytic Effects',
    description:
      'Find compounds that include anxiolytic-style effects in their structured effects arrays.',
    kind: 'effect',
    target: 'anxiolytic',
    entityType: 'compounds',
  },
  {
    slug: 'compounds-for-focus-support',
    title: 'Compounds for Focus Support',
    description:
      'Compound entries that reference focus, alertness, or concentration-related effects.',
    kind: 'effect',
    target: 'focus',
    entityType: 'compounds',
  },
]

export const seoLandingConfigBySlug = seoLandingConfigs.reduce<Record<string, SeoLandingConfig>>(
  (acc, config) => {
    acc[config.slug] = config
    return acc
  },
  {}
)
