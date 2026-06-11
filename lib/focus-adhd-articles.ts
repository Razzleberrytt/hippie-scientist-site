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
    description: 'Evidence-based comparison of supplements for ADHD symptoms. Reviews L-Theanine, Magnesium, Ashwagandha, Omega-3, Zinc, and others with clear strength-of-evidence ratings, safety considerations, and practical guidance.',
    category: 'Supplement Evidence',
    tags: ['Focus', 'ADHD', 'Sleep', 'Nutrient Deficiencies', 'Supplement Evidence'],
    date: '2026-06-10',
    readingTime: '12 min read',
  },
  {
    slug: 'adhd-stack-guide',
    source: 'docs/content/focus-cluster/adhd-stack-guide-v2-content.md',
    title: 'ADHD Stack Guide: Evidence-Based Supplement Combinations for Focus, Attention, and Symptom Support',
    seoTitle: 'ADHD Stack Guide: Evidence-Based Supplement Combinations for Focus, Attention, and Symptom Support',
    description: 'Comprehensive evidence-based guide to building supplement stacks for adults with ADHD symptoms. Covers neurobiology foundations, medication interactions, tiered protocols, monitoring strategies, and safety. Not medical advice.',
    category: 'Focus',
    tags: ['Focus', 'ADHD', 'Supplement Evidence'],
    date: '2026-06-10',
    readingTime: '14 min read',
  },
  {
    slug: 'sleep-and-adhd',
    source: 'docs/content/focus-cluster/sleep-and-adhd-content-v1.md',
    title: 'Sleep and ADHD: Evidence-Based Support for Rest, Timing, and Next-Day Focus',
    seoTitle: 'Sleep and ADHD: Evidence-Based Support for Rest, Timing, and Next-Day Focus',
    description: 'Conservative guide to the sleep-ADHD connection, including circadian timing, stimulant timing, behavioral foundations, and where melatonin, magnesium, and L-theanine may fit.',
    category: 'Sleep',
    tags: ['Focus', 'ADHD', 'Sleep', 'Supplement Evidence'],
    date: '2026-06-10',
    readingTime: '6 min read',
  },
  {
    slug: 'nutrient-deficiencies-and-adhd',
    source: 'docs/content/focus-cluster/nutrient-deficiencies-and-adhd-content-v1.md',
    title: 'Nutrient Deficiencies and ADHD: What to Check Before Supplementing',
    seoTitle: 'Nutrient Deficiencies and ADHD: What to Check Before Supplementing',
    description: 'Evidence-first guide to nutrient status in ADHD, including magnesium, omega-3, iron/ferritin, zinc, vitamin D, and why deficiency correction differs from treating ADHD.',
    category: 'Nutrient Deficiencies',
    tags: ['Focus', 'ADHD', 'Nutrient Deficiencies', 'Supplement Evidence'],
    date: '2026-06-10',
    readingTime: '7 min read',
  },
  {
    slug: 'melatonin-for-adhd-sleep',
    source: 'docs/content/focus-cluster/melatonin-for-adhd-sleep-content-v1.md',
    title: 'Melatonin for ADHD Sleep: Evidence, Timing, and Safety Considerations',
    seoTitle: 'Melatonin for ADHD Sleep: Evidence, Timing, and Safety Considerations',
    description: 'Conservative review of melatonin for ADHD-related sleep onset problems, with timing, dose caution, medication context, and links to broader sleep-support guides.',
    category: 'Sleep',
    tags: ['Focus', 'ADHD', 'Sleep', 'Supplement Evidence'],
    date: '2026-06-10',
    readingTime: '6 min read',
  },
  {
    slug: 'magnesium-for-adhd',
    source: 'docs/content/focus-cluster/magnesium-for-adhd-content-v1.md',
    title: 'Magnesium for ADHD: Evidence on Symptoms, Forms, and Practical Use',
    seoTitle: 'Magnesium for ADHD: Evidence on Symptoms, Forms, and Practical Use',
    description: 'Magnesium status is often lower in people with ADHD. This evidence-first review examines meta-analyses, RCTs, different forms, pediatric and adult data, dosing, safety, and who may benefit most.',
    category: 'Nutrient Deficiencies',
    tags: ['Focus', 'ADHD', 'Sleep', 'Nutrient Deficiencies', 'Supplement Evidence'],
    date: '2026-06-10',
    readingTime: '11 min read',
  },
  {
    slug: 'l-theanine-for-adhd',
    source: 'docs/content/focus-cluster/l-theanine-for-adhd-content-v1.md',
    title: 'L-Theanine for ADHD: Evidence on Sleep, Attention, and Calm Focus Support',
    seoTitle: 'L-Theanine for ADHD: Evidence on Sleep, Attention, and Calm Focus Support',
    description: 'L-Theanine shows moderate evidence for sleep quality in children with ADHD and preliminary attention data when paired with caffeine. Covers mechanisms, dosing, safety, and practical expectations.',
    category: 'Focus',
    tags: ['Focus', 'ADHD', 'Sleep', 'Supplement Evidence'],
    date: '2026-06-10',
    readingTime: '14 min read',
  },
  {
    slug: 'omega-3-and-adhd',
    source: 'docs/content/focus-cluster/omega-3-and-adhd-content-v1.md',
    title: 'Omega-3 and ADHD: What the Evidence Suggests About EPA, DHA, and Attention',
    seoTitle: 'Omega-3 and ADHD: What the Evidence Suggests About EPA, DHA, and Attention',
    description: 'Evidence-first overview of omega-3 fatty acids in ADHD, including modest average effects, EPA/DHA questions, diet context, safety, and realistic expectations.',
    category: 'Supplement Evidence',
    tags: ['Focus', 'ADHD', 'Nutrient Deficiencies', 'Supplement Evidence'],
    date: '2026-06-10',
    readingTime: '6 min read',
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
    slug: 'ashwagandha-for-adhd',
    source: 'docs/content/focus-cluster/ashwagandha-for-adhd-content-v1.md',
    title: 'Ashwagandha for ADHD: Evidence on Stress, Focus, Sleep, and Symptom Support',
    seoTitle: 'Ashwagandha for ADHD: Evidence on Stress, Focus, Sleep, and Symptom Support',
    description: 'Ashwagandha shows promising effects on stress, anxiety, sleep, and some ADHD symptoms in children. This evidence-first guide reviews RCTs, forms (KSM-66, Sensoril), pediatric data, dosing, safety, and practical expectations.',
    category: 'Focus',
    tags: ['ashwagandha', 'adhd', 'focus', 'sleep', 'adaptogens'],
    date: '2026-06-10',
    readingTime: '10 min read',
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

export function getFocusAdhdArticle(slug: string) {
  const article = focusAdhdArticles.find((item) => item.slug === slug)
  if (!article) return null

  let body = article.fallbackBody || ''
  if (article.source) {
    const sourcePath = path.join(process.cwd(), article.source)
    if (existsSync(sourcePath)) {
      const raw = readFileSync(sourcePath, 'utf8')
      body = sectionValue(raw, 'Full Article Content') || sectionValue(raw, 'Full article content') || body
    }
  }

  return {
    ...article,
    body: removeEditorialScaffold(body),
  }
}

