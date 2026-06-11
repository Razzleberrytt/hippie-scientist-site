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
    title: 'Best Supplements for ADHD: Evidence-Based Options for Focus, Sleep, and Emotional Regulation',
    seoTitle: 'Best Supplements for ADHD: Evidence-Based Options for Focus, Sleep, and Emotional Regulation',
    description: 'Comprehensive evidence-based review of supplements commonly discussed for ADHD, including omega-3, magnesium, L-theanine, melatonin, ashwagandha, citicoline, Alpha-GPC, zinc, iron, and vitamin D.',
    category: 'Supplement Evidence',
    tags: ['Focus', 'ADHD', 'Sleep', 'Nutrient Deficiencies', 'Supplement Evidence'],
    date: '2026-06-10',
    readingTime: '12 min read',
  },
  {
    slug: 'adhd-stack-guide',
    source: 'docs/content/focus-cluster/adhd-stack-guide-v2-content.md',
    title: 'ADHD Stack Guide: Building an Evidence-Based Approach to Focus, Sleep, and Emotional Regulation',
    seoTitle: 'ADHD Stack Guide: Building an Evidence-Based Approach to Focus, Sleep, and Emotional Regulation',
    description: 'Evidence-based guide to building an ADHD supplement stack. Reviews magnesium, L-theanine, omega-3, ashwagandha, melatonin, citicoline, and Alpha-GPC with practical frameworks, safety considerations, and realistic expectations.',
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
    title: 'Nutrient Deficiencies and ADHD: What the Research Shows',
    seoTitle: 'Nutrient Deficiencies and ADHD: What the Research Shows',
    description: 'Evidence-based review of nutrient deficiencies linked to ADHD. Examines magnesium, iron, zinc, vitamin D, omega-3 status, testing considerations, supplementation evidence, and practical guidance for children and adults.',
    category: 'Nutrient Deficiencies',
    tags: ['Focus', 'ADHD', 'Nutrient Deficiencies', 'Supplement Evidence'],
    date: '2026-06-10',
    readingTime: '7 min read',
  },
  {
    slug: 'adhd-blood-tests',
    source: 'docs/content/focus-cluster/adhd-blood-tests.md',
    title: 'ADHD Blood Tests Guide: What Labs Matter and Why',
    seoTitle: 'ADHD Blood Tests Guide: Ferritin, Vitamin D, Zinc, Magnesium, Thyroid, and B12',
    description: 'Evidence-based guide to ADHD blood tests. Learn which labs may help identify nutrient deficiencies, sleep-related contributors, thyroid issues, anemia, and other factors that can worsen attention, mood, fatigue, or treatment response.',
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
    title: 'Magnesium for ADHD: Forms, Evidence, Dosage, and Practical Use',
    seoTitle: 'Magnesium for ADHD: Forms, Evidence, Dosage, and Practical Use',
    description: 'Evidence-based review of magnesium for ADHD-related symptoms. Covers magnesium deficiency, forms like glycinate and threonate, pediatric and adult evidence, sleep, hyperactivity, emotional regulation, dosing, safety, and testing.',
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
    title: 'Omega-3 and ADHD: What the Research Shows About EPA, DHA, Symptoms, and Supplementation',
    seoTitle: 'Omega-3 and ADHD: What the Research Shows About EPA, DHA, Symptoms, and Supplementation',
    description: 'Evidence-based review of omega-3 and ADHD. Covers EPA, DHA, symptom severity, inattention, hyperactivity, impulsivity, dosing, safety, and realistic expectations as adjunctive support.',
    category: 'Supplement Evidence',
    tags: ['Focus', 'ADHD', 'Nutrient Deficiencies', 'Supplement Evidence'],
    date: '2026-06-11',
    readingTime: '12 min read',
  },
  {
    slug: 'zinc-and-adhd',
    source: 'docs/content/focus-cluster/zinc-and-adhd.md',
    title: 'Zinc and ADHD: What the Research Shows About Symptoms, Deficiency, Supplementation, and Cognitive Function',
    seoTitle: 'Zinc and ADHD: What the Research Shows About Symptoms, Deficiency, Supplementation, and Cognitive Function',
    description: 'Evidence-based review of zinc and ADHD. Covers zinc deficiency, hyperactivity, inattention, impulsivity, stimulant response, dosing, safety, copper balance, and realistic expectations.',
    category: 'Nutrient Deficiencies',
    tags: ['Focus', 'ADHD', 'Nutrient Deficiencies', 'Supplement Evidence'],
    date: '2026-06-11',
    readingTime: '11 min read',
  },
  {
    slug: 'iron-ferritin-and-adhd',
    source: 'docs/content/focus-cluster/iron-ferritin-and-adhd.md',
    title: 'Iron/Ferritin and ADHD: What the Research Shows About Dopamine, Deficiency, Attention, Hyperactivity, Sleep, and Supplementation',
    seoTitle: 'Iron/Ferritin and ADHD: What the Research Shows About Dopamine, Deficiency, Attention, Hyperactivity, Sleep, and Supplementation',
    description: 'Evidence-based review of iron, ferritin, and ADHD. Covers dopamine production, deficiency, restless sleep, symptom severity, supplementation studies, dosing, safety, testing, and realistic expectations.',
    category: 'Nutrient Deficiencies',
    tags: ['Focus', 'ADHD', 'Nutrient Deficiencies', 'Supplement Evidence'],
    date: '2026-06-11',
    readingTime: '12 min read',
  },
  {
    slug: 'vitamin-d-and-adhd',
    source: 'docs/content/focus-cluster/vitamin-d-and-adhd.md',
    title: 'Vitamin D and ADHD',
    seoTitle: 'Vitamin D and ADHD: Deficiency, Symptoms, Testing, and Supplementation',
    description: 'Evidence-based guide to vitamin D and ADHD. Learn what studies show about deficiency, inattention, mood, sleep, testing, supplementation, safety, and realistic expectations.',
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

