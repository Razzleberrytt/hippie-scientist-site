import { compactMetaTitle } from '../src/lib/seo'

export type GoalCategory = 'sleep' | 'energy' | 'mood' | 'immune' | 'memory'

export type GoalArticleKind = 'cornerstone' | 'satellite' | 'product-guide'

export type GoalArticle = {
  slug: string
  title: string
  seoTitle: string
  description: string
  category: GoalCategory
  kind: GoalArticleKind
  tags: string[]
  readingTime: string
}

export type GoalCluster = {
  category: GoalCategory
  title: string
  description: string
  goalHref: string
  articles: GoalArticle[]
}

const makeArticle = (
  category: GoalCategory,
  kind: GoalArticleKind,
  slug: string,
  title: string,
  description: string,
  tags: string[],
  readingTime = '10 min read',
): GoalArticle => ({
  slug,
  title,
  // Metadata <title> only — keeps the visible H1 (title) intact while capping length.
  seoTitle: compactMetaTitle(title),
  description,
  category,
  kind,
  tags,
  readingTime,
})

export const goalClusters: GoalCluster[] = [
  {
    category: 'sleep',
    title: 'Sleep Supplement Guides',
    description:
      'Evidence-first guides for sleep quality, sleep onset, calming supplements, and conservative stacking decisions.',
    goalHref: '/goals/sleep/',
    articles: [
      makeArticle(
        'sleep',
        'cornerstone',
        'sleep-best-supplements',
        'Best Supplements for Sleep: Evidence-Based Guide',
        'A practical sleep supplement guide comparing magnesium, melatonin, valerian, L-theanine, and behavioral context without overstating weak evidence.',
        ['sleep', 'magnesium', 'melatonin', 'valerian', 'l-theanine'],
        '13 min read',
      ),
      makeArticle(
        'sleep',
        'satellite',
        'magnesium-for-sleep',
        'Magnesium for Sleep: Forms, Timing, and Dosage',
        'How magnesium may support sleep quality, which forms are easiest to tolerate, and where the human evidence is still limited.',
        ['sleep', 'magnesium', 'dosage'],
        '10 min read',
      ),
      makeArticle(
        'sleep',
        'satellite',
        'melatonin-vs-valerian',
        'Melatonin vs Valerian: Which Sleep Aid Fits the Problem?',
        'A cautious comparison of melatonin and valerian for sleep onset, sleep maintenance, next-day grogginess, and evidence quality.',
        ['sleep', 'melatonin', 'valerian', 'comparison'],
        '11 min read',
      ),
      makeArticle(
        'sleep',
        'satellite',
        'l-theanine-for-calm',
        'L-Theanine for Calm: Relaxation Without Heavy Sedation',
        'Where L-theanine fits for evening calm, daytime worry, caffeine smoothing, and sleep-adjacent relaxation.',
        ['sleep', 'l-theanine', 'calm', 'focus'],
        '9 min read',
      ),
      makeArticle(
        'sleep',
        'satellite',
        'sleep-stack-magnesium-melatonin',
        'Sleep Stack: Combining Magnesium and Melatonin Safely',
        'A conservative framework for combining magnesium and melatonin, including timing, dose discipline, and when not to stack.',
        ['sleep', 'magnesium', 'melatonin', 'stack'],
        '10 min read',
      ),
      makeArticle(
        'sleep',
        'product-guide',
        'best-magnesium-for-sleep',
        'Best Magnesium for Sleep: Forms and Buying Criteria',
        'How to choose a magnesium supplement for sleep using form, elemental dose, tolerability, and third-party testing criteria.',
        ['sleep', 'magnesium', 'buying guide'],
        '8 min read',
      ),
    ],
  },
  {
    category: 'energy',
    title: 'Energy Supplement Guides',
    description: 'Future evidence-first guides for smoother energy, caffeine alternatives, and exercise support.',
    goalHref: '/goals/fatigue/',
    articles: [],
  },
  {
    category: 'mood',
    title: 'Mood and Anxiety Supplement Guides',
    description: 'Evidence-first guides for everyday anxiety support, calming stacks, and stress-adjacent supplement decisions.',
    goalHref: '/goals/anxiety/',
    articles: [
      makeArticle(
        'mood',
        'cornerstone',
        'natural-anxiety-relief',
        'Natural Anxiety Relief: Evidence-Based Supplement Guide',
        'A cautious guide to everyday anxiety support options, safety context, and when supplement self-experimentation is the wrong tool.',
        ['anxiety', 'stress', 'calm', 'safety'],
        '14 min read',
      ),
      makeArticle(
        'mood',
        'satellite',
        'anxiety-stack-guide',
        'Anxiety Stack Guide: Simple, Safer Combinations',
        'How to think about magnesium, L-theanine, ashwagandha, and sleep-linked anxiety without overstacking calming products.',
        ['anxiety', 'stacks', 'magnesium', 'l-theanine'],
        '12 min read',
      ),
      makeArticle(
        'mood',
        'satellite',
        'l-theanine-for-anxiety',
        'L-Theanine for Anxiety: Calm Without Heavy Sedation',
        'Where L-theanine fits for acute stress, anxious overthinking, caffeine smoothing, and low-sedation calm.',
        ['anxiety', 'l-theanine', 'calm'],
        '8 min read',
      ),
      makeArticle(
        'mood',
        'satellite',
        'ashwagandha-for-anxiety',
        'Ashwagandha for Anxiety: Evidence, Dose, and Safety',
        'A practical look at ashwagandha anxiety evidence, thyroid and pregnancy cautions, and delayed-onset expectations.',
        ['anxiety', 'ashwagandha', 'adaptogen'],
        '9 min read',
      ),
      makeArticle(
        'mood',
        'satellite',
        'cbd-vs-ashwagandha-for-anxiety',
        'CBD vs Ashwagandha for Anxiety',
        'Compare two popular anxiety-support options by evidence maturity, interaction risk, onset, and real-world fit.',
        ['anxiety', 'cbd', 'ashwagandha', 'comparison'],
        '10 min read',
      ),
    ],
  },
  {
    category: 'immune',
    title: 'Immune Supplement Guides',
    description: 'Future evidence-first guides for immune-season decisions and realistic supplement limits.',
    goalHref: '/goals/immune-support/',
    articles: [],
  },
  {
    category: 'memory',
    title: 'Focus and Cognition Supplement Guides',
    description: 'Evidence-first guides for focus, ADHD-adjacent support, calm stimulation, and nootropic decision-making.',
    goalHref: '/goals/focus/',
    articles: [
      makeArticle(
        'memory',
        'cornerstone',
        'best-supplements-for-adhd',
        'Best Supplements for ADHD: Evidence-Based Guide',
        'A conservative ADHD-adjacent supplement guide focused on nutrients, sleep, focus support, and what evidence can and cannot show.',
        ['adhd', 'focus', 'nootropics', 'safety'],
        '15 min read',
      ),
      makeArticle(
        'memory',
        'satellite',
        'l-theanine-for-adhd',
        'L-Theanine for ADHD: Calm Focus Context',
        'How L-theanine may fit calm-focus routines, caffeine pairing, and stimulant-sensitivity decisions.',
        ['adhd', 'focus', 'l-theanine'],
        '8 min read',
      ),
      makeArticle(
        'memory',
        'satellite',
        'citicoline-vs-alpha-gpc',
        'Citicoline vs Alpha-GPC',
        'Compare two choline donors by mechanism, tolerance, evidence maturity, and practical nootropic use.',
        ['focus', 'choline', 'comparison'],
        '9 min read',
      ),
      makeArticle(
        'memory',
        'satellite',
        'l-theanine-vs-caffeine-for-focus',
        'L-Theanine vs Caffeine for Focus',
        'A practical comparison of fast stimulation, calmer attention, tolerance, sleep tradeoffs, and stacking logic.',
        ['focus', 'caffeine', 'l-theanine', 'comparison'],
        '9 min read',
      ),
      makeArticle(
        'memory',
        'satellite',
        'l-theanine-without-caffeine',
        'L-Theanine Without Caffeine',
        'When a non-stimulant calm-focus option may fit better than another caffeine-centered stack.',
        ['focus', 'l-theanine', 'non-stimulant'],
        '8 min read',
      ),
    ],
  },
]

export function getGoalCluster(category: GoalCategory): GoalCluster | null {
  return goalClusters.find((cluster) => cluster.category === category) ?? null
}

export function getGoalArticle(slug: string): GoalArticle | null {
  for (const cluster of goalClusters) {
    const article = cluster.articles.find((item) => item.slug === slug)
    if (article) return article
  }
  return null
}

export function getSiblingGoalArticles(slug: string): GoalArticle[] {
  const article = getGoalArticle(slug)
  if (!article) return []
  const cluster = getGoalCluster(article.category)
  if (!cluster) return []
  return cluster.articles.filter((item) => item.slug !== slug)
}

export function getCornerstoneArticle(category: GoalCategory): GoalArticle | null {
  const cluster = getGoalCluster(category)
  return cluster?.articles.find((article) => article.kind === 'cornerstone') ?? null
}

export function getRelatedGoalArticles(slug: string, limit = 4): GoalArticle[] {
  const article = getGoalArticle(slug)
  if (!article) return []
  const siblings = getSiblingGoalArticles(slug)
  const cornerstone = getCornerstoneArticle(article.category)
  const ordered = [
    ...(cornerstone && cornerstone.slug !== slug ? [cornerstone] : []),
    ...siblings.filter((item) => item.slug !== cornerstone?.slug),
  ]
  return ordered.slice(0, limit)
}
