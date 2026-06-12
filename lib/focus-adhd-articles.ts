import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

export type FocusAdhdArticle = {
  slug: string
  source?: string
  title: string
  seoTitle: string
  description: string
  category: string
  tags: string[]
  date: string
  readingTime: string
  fallbackBody?: string
}

export const focusAdhdArticles: FocusAdhdArticle[] = [
  {
    slug: 'best-supplements-for-adhd',
    source: 'docs/content/focus-cluster/best-supplements-for-adhd-v2-content.md',
    title: 'Best Supplements for ADHD: Evidence-Based Options for Focus, Sleep, and Nutrient Support',
    seoTitle: 'Best Supplements for ADHD: Evidence-Based Options for Focus, Sleep, and Nutrient Support',
    description: 'Compare ADHD supplements by evidence, safety, and use case. Covers omega-3, magnesium, zinc, iron, vitamin D, L-theanine, citicoline, and more.',
    category: 'Supplement Evidence',
    tags: ['Focus', 'ADHD', 'Sleep', 'Nutrient Deficiencies', 'Supplement Evidence'],
    date: '2026-06-10',
    readingTime: '12 min read',
  },
  {
    slug: 'adhd-stack-guide',
    source: 'docs/content/focus-cluster/adhd-stack-guide-v2-content.md',
    title: 'ADHD Stack Guide: Evidence-Based Supplement Combinations for Focus, Sleep, and Support',
    seoTitle: 'ADHD Stack Guide: Evidence-Based Supplement Combinations for Focus, Sleep, and Support',
    description: 'Learn how to build safer ADHD supplement stacks with evidence-based combinations, deficiency checks, medication cautions, and realistic expectations.',
    category: 'Focus',
    tags: ['Focus', 'ADHD', 'Supplement Evidence'],
    date: '2026-06-10',
    readingTime: '14 min read',
  },
  {
    slug: 'sleep-and-adhd',
    source: 'docs/content/focus-cluster/sleep-and-adhd-content-v1.md',
    title: 'Sleep and ADHD: Evidence-Based Strategies for Better Focus, Behavior, and Daily Functioning',
    seoTitle: 'Sleep and ADHD: Evidence-Based Strategies for Better Focus, Behavior, and Daily Functioning',
    description: 'Evidence-based guide to sleep problems in ADHD. Explores why sleep issues are common, how poor sleep worsens symptoms, and practical strategies including sleep hygiene, circadian support, and supplements like melatonin, magnesium, and L-theanine — with clear guidance on when to seek professional care.',
    category: 'Sleep',
    tags: ['Focus', 'ADHD', 'Sleep', 'Supplement Evidence'],
    date: '2026-06-10',
    readingTime: '6 min read',
  },
  {
    slug: 'nutrient-deficiencies-and-adhd',
    source: 'docs/content/focus-cluster/nutrient-deficiencies-and-adhd-content-v1.md',
    title: 'Nutrient Deficiencies and ADHD: Iron, Zinc, Vitamin D, Magnesium, and Omega-3',
    seoTitle: 'Nutrient Deficiencies and ADHD: Iron, Zinc, Vitamin D, Magnesium, and Omega-3',
    description: 'Evidence-based guide to nutrient deficiencies linked with ADHD symptoms, including ferritin, zinc, vitamin D, magnesium, omega-3, and testing.',
    category: 'Nutrient Deficiencies',
    tags: ['Focus', 'ADHD', 'Nutrient Deficiencies', 'Supplement Evidence'],
    date: '2026-06-10',
    readingTime: '7 min read',
  },
  {
    slug: 'adhd-blood-tests',
    source: 'docs/content/focus-cluster/adhd-blood-tests.md',
    title: 'ADHD Blood Tests Guide: Ferritin, Vitamin D, Zinc, Magnesium, Thyroid, and B12',
    seoTitle: 'ADHD Blood Tests Guide: Ferritin, Vitamin D, Zinc, Magnesium, Thyroid, and B12',
    description: 'Learn which blood tests may reveal nutrient, thyroid, or anemia issues that can worsen focus, sleep, fatigue, mood, or ADHD-like symptoms.',
    category: 'Nutrient Deficiencies',
    tags: ['Focus', 'ADHD', 'Nutrient Deficiencies', 'Supplement Evidence'],
    date: '2026-06-11',
    readingTime: '13 min read',
  },
  {
    slug: 'melatonin-for-adhd-sleep',
    source: 'docs/content/focus-cluster/melatonin-for-adhd-sleep-content-v1.md',
    title: 'Melatonin for ADHD Sleep: What the Research Shows',
    seoTitle: 'Melatonin for ADHD Sleep: What the Research Shows',
    description: 'Evidence-based review of melatonin for ADHD-related sleep problems. Covers sleep onset insomnia, delayed sleep phase, pediatric and adult evidence, dosing considerations, safety, side effects, and realistic expectations.',
    category: 'Sleep',
    tags: ['Focus', 'ADHD', 'Sleep', 'Supplement Evidence'],
    date: '2026-06-10',
    readingTime: '6 min read',
  },
  {
    slug: 'magnesium-for-adhd',
    source: 'docs/content/focus-cluster/magnesium-for-adhd-content-v1.md',
    title: 'Magnesium for ADHD: Evidence, Forms, Sleep, Calm, and Practical Use',
    seoTitle: 'Magnesium for ADHD: Evidence, Forms, Sleep, Calm, and Practical Use',
    description: 'Evidence-based guide to magnesium and ADHD. Covers forms, sleep, calm focus, deficiency, dosing, safety, and realistic expectations.',
    category: 'Nutrient Deficiencies',
    tags: ['Focus', 'ADHD', 'Sleep', 'Nutrient Deficiencies', 'Supplement Evidence'],
    date: '2026-06-10',
    readingTime: '11 min read',
  },
  {
    slug: 'l-theanine-for-adhd',
    source: 'docs/content/focus-cluster/l-theanine-for-adhd-content-v1.md',
    title: 'L-Theanine for ADHD: Evidence on Attention, Sleep, and Emotional Regulation',
    seoTitle: 'L-Theanine for ADHD: Evidence on Attention, Sleep, and Emotional Regulation',
    description: 'Evidence-based review of L-theanine for ADHD-related symptoms. Covers attention, sleep quality, emotional regulation, caffeine synergy, pediatric and adult evidence, dosing, safety, and practical use.',
    category: 'Focus',
    tags: ['Focus', 'ADHD', 'Sleep', 'Supplement Evidence'],
    date: '2026-06-10',
    readingTime: '14 min read',
  },
  {
    slug: 'omega-3-and-adhd',
    source: 'docs/content/focus-cluster/omega-3-and-adhd.md',
    title: 'Omega-3 and ADHD: EPA, DHA, Symptoms, Dosing, and Fish Oil Quality',
    seoTitle: 'Omega-3 and ADHD: EPA, DHA, Symptoms, Dosing, and Fish Oil Quality',
    description: 'Evidence-based review of omega-3 and ADHD. Covers EPA, DHA, symptom research, dosing, fish oil quality, safety, and realistic expectations.',
    category: 'Supplement Evidence',
    tags: ['Focus', 'ADHD', 'Nutrient Deficiencies', 'Supplement Evidence'],
    date: '2026-06-11',
    readingTime: '12 min read',
  },
  {
    slug: 'zinc-and-adhd',
    source: 'docs/content/focus-cluster/zinc-and-adhd.md',
    title: 'Zinc and ADHD: Deficiency, Hyperactivity, Attention, and Supplementation',
    seoTitle: 'Zinc and ADHD: Deficiency, Hyperactivity, Attention, and Supplementation',
    description: 'Evidence-based review of zinc and ADHD. Covers deficiency, hyperactivity, attention, stimulant response, dosing, safety, and copper balance.',
    category: 'Nutrient Deficiencies',
    tags: ['Focus', 'ADHD', 'Nutrient Deficiencies', 'Supplement Evidence'],
    date: '2026-06-11',
    readingTime: '11 min read',
  },
  {
    slug: 'iron-ferritin-and-adhd',
    source: 'docs/content/focus-cluster/iron-ferritin-and-adhd.md',
    title: 'Iron/Ferritin and ADHD: Low Ferritin, Dopamine, Sleep, and Supplementation',
    seoTitle: 'Iron/Ferritin and ADHD: Low Ferritin, Dopamine, Sleep, and Supplementation',
    description: 'Evidence-based review of iron, ferritin, and ADHD. Covers low ferritin, dopamine, restless sleep, testing, supplementation, and iron safety.',
    category: 'Nutrient Deficiencies',
    tags: ['Focus', 'ADHD', 'Nutrient Deficiencies', 'Supplement Evidence'],
    date: '2026-06-11',
    readingTime: '12 min read',
  },
  {
    slug: 'vitamin-d-and-adhd',
    source: 'docs/content/focus-cluster/vitamin-d-and-adhd.md',
    title: 'Vitamin D and ADHD: Deficiency, Symptoms, Mood, Sleep, and Supplementation',
    seoTitle: 'Vitamin D and ADHD: Deficiency, Symptoms, Mood, Sleep, and Supplementation',
    description: 'Evidence-based review of vitamin D and ADHD. Covers deficiency, symptom severity, mood, sleep, testing, dosing, safety, and realistic expectations.',
    category: 'Nutrient Deficiencies',
    tags: ['Focus', 'ADHD', 'Nutrient Deficiencies', 'Supplement Evidence'],
    date: '2026-06-11',
    readingTime: '11 min read',
  },
  {
    slug: 'ashwagandha-for-adhd',
    source: 'docs/content/focus-cluster/ashwagandha-for-adhd.md',
    title: 'Ashwagandha and ADHD: What the Research Shows About Stress, Focus, Sleep, and Emotional Regulation',
    seoTitle: 'Ashwagandha and ADHD: What the Research Shows About Stress, Focus, Sleep, and Emotional Regulation',
    description: 'Evidence-based review of ashwagandha and ADHD. Covers stress response, cortisol, attention, sleep, emotional regulation, pediatric and adult evidence, dosing, safety, and realistic expectations.',
    category: 'Supplement Evidence',
    tags: ['Focus', 'ADHD', 'Sleep', 'Supplement Evidence'],
    date: '2026-06-11',
    readingTime: '8 min read',
  },
  {
    slug: 'citicoline-vs-alpha-gpc',
    source: 'docs/content/focus-cluster/citicoline-vs-alpha-gpc-content-v1.md',
    title: 'Citicoline vs Alpha-GPC: Which Choline Supplement Is Better for Focus and Cognitive Support?',
    seoTitle: 'Citicoline vs Alpha-GPC: Which Choline Supplement Is Better for Focus and Cognitive Support?',
    description: 'Evidence-based comparison of Citicoline and Alpha-GPC for focus, memory, and cognitive support. Covers mechanisms, ADHD and healthy adult data, dosing, side effects, and practical recommendations.',
    category: 'Supplement Evidence',
    tags: ['Focus', 'ADHD', 'Supplement Evidence'],
    date: '2026-06-10',
    readingTime: '13 min read',
  },
  {
    slug: 'l-theanine-vs-caffeine-for-focus',
    source: 'docs/content/focus-cluster/l-theanine-vs-caffeine-for-focus-content-v1.md',
    title: 'L-Theanine vs Caffeine for Focus: Which Works Better for Attention and Calm Energy?',
    seoTitle: 'L-Theanine vs Caffeine for Focus: Which Works Better for Attention and Calm Energy?',
    description: 'Direct comparison of L-Theanine and caffeine for focus, attention, and calm energy. Reviews mechanisms, evidence in ADHD and healthy adults, dosing ratios, safety, sleep impact, and a practical decision framework.',
    category: 'Supplement Evidence',
    tags: ['Focus', 'ADHD', 'Sleep', 'Supplement Evidence'],
    date: '2026-06-10',
    readingTime: '9 min read',
  },
]

export const focusAdhdArticleSummaries = focusAdhdArticles.map((article) => ({
  slug: article.slug,
  title: article.title,
  description: article.description,
  date: article.date,
  updatedAt: article.date,
  tags: article.tags,
  category: article.category,
  readingTime: article.readingTime,
  content: '',
  profile_status: 'published',
  sitemap_included: true,
}))

const sectionValue = (raw: string, heading: string) => {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = raw.match(new RegExp(`##\\s+(?:\\d+\\.\\s*)?${escaped}\\s*\\n+([\\s\\S]*?)(?=\\n##\\s|$)`, 'i'))
  return match?.[1]?.trim()
}

const removeEditorialScaffold = (raw: string) =>
  raw
    .split(/\r?\n/)
    .filter((line) => !/^TODO:/i.test(line.trim()))
    .filter((line) => !/TODO markers/i.test(line))
    .join('\n')
    .trim()

const stripFrontmatter = (raw: string) => raw.replace(/^---[\s\S]*?---\s*\n/, '').trim()

// Strip editorial-only sections that are not meant for rendered output
const stripEditorialTerminal = (raw: string) =>
  raw
    .replace(/\n## Related Articles[\s\S]*$/, '')
    .replace(/\n## Internal Linking Recommendations[\s\S]*$/, '')
    .trim()

export function getFocusAdhdArticle(slug: string) {
  const article = focusAdhdArticles.find((item) => item.slug === slug)
  if (!article) return null

  let body = article.fallbackBody || ''
  if (article.source) {
    const sourcePath = path.join(process.cwd(), article.source)
    if (existsSync(sourcePath)) {
      const raw = readFileSync(sourcePath, 'utf8')
      const explicit = sectionValue(raw, 'Full Article Content') || sectionValue(raw, 'Full article content')
      if (explicit) {
        body = explicit
      } else if (raw.trimStart().startsWith('---')) {
        // YAML-frontmatter source doc — strip frontmatter and editorial terminal sections
        body = stripEditorialTerminal(stripFrontmatter(raw))
      } else {
        body = raw
      }
    }
  }

  return {
    ...article,
    body: removeEditorialScaffold(body),
  }
}

