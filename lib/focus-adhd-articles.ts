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
    source: 'docs/content/focus-cluster/omega-3-and-adhd.md',
    title: 'Omega-3 and ADHD: What the Research Shows About EPA, DHA, Symptoms, and Supplementation',
    seoTitle: 'Omega-3 and ADHD: What the Research Shows About EPA, DHA, Symptoms, and Supplementation',
    description: 'Evidence-based review of omega-3 fatty acids for ADHD. Covers EPA, DHA, omega-3 deficiency, pediatric and adult evidence, hyperactivity, attention, dosing, safety, fish oil quality, and practical decision-making.',
    category: 'Supplement Evidence',
    tags: ['Focus', 'ADHD', 'Nutrient Deficiencies', 'Supplement Evidence'],
    date: '2026-06-11',
    readingTime: '12 min read',
  },
  {
    slug: 'zinc-and-adhd',
    source: 'docs/content/focus-cluster/zinc-and-adhd.md',
    title: 'Zinc and ADHD: What the Research Shows About Symptoms, Deficiency, and Supplementation',
    seoTitle: 'Zinc and ADHD: What the Research Shows About Symptoms, Deficiency, and Supplementation',
    description: 'Evidence-based review of zinc and ADHD. Covers zinc deficiency, symptom severity, pediatric and adult evidence, supplementation studies, dosing, safety, medication interactions, and practical decision-making.',
    category: 'Nutrient Deficiencies',
    tags: ['Focus', 'ADHD', 'Nutrient Deficiencies', 'Supplement Evidence'],
    date: '2026-06-11',
    readingTime: '11 min read',
  },
  {
    slug: 'iron-ferritin-and-adhd',
    source: 'docs/content/focus-cluster/iron-ferritin-and-adhd.md',
    title: 'Iron/Ferritin and ADHD: What the Research Shows About Low Iron Stores, Symptoms, and Supplementation',
    seoTitle: 'Iron/Ferritin and ADHD: What the Research Shows About Low Iron Stores, Symptoms, and Supplementation',
    description: 'Evidence-based review of iron and ferritin in ADHD. Covers low ferritin, symptom severity, stimulant response, pediatric and adult evidence, supplementation studies, testing, safety, and practical decision-making.',
    category: 'Nutrient Deficiencies',
    tags: ['Focus', 'ADHD', 'Nutrient Deficiencies', 'Supplement Evidence'],
    date: '2026-06-11',
    readingTime: '12 min read',
  },
  {
    slug: 'vitamin-d-and-adhd',
    source: 'docs/content/focus-cluster/vitamin-d-and-adhd.md',
    title: 'Vitamin D and ADHD: What the Research Shows About Deficiency, Symptoms, and Supplementation',
    seoTitle: 'Vitamin D and ADHD: What the Research Shows About Deficiency, Symptoms, and Supplementation',
    description: 'Evidence-based review of vitamin D and ADHD. Covers vitamin D deficiency, symptom severity, pediatric and adult evidence, supplementation studies, testing, dosing, safety, and practical decision-making.',
    category: 'Nutrient Deficiencies',
    tags: ['Focus', 'ADHD', 'Nutrient Deficiencies', 'Supplement Evidence'],
    date: '2026-06-11',
    readingTime: '11 min read',
  },
  {
    slug: 'ashwagandha-for-adhd',
    source: 'docs/content/focus-cluster/ashwagandha-for-adhd.md',
    title: 'Ashwagandha for ADHD: Evidence on Stress, Focus, Sleep, and Emotional Regulation',
    seoTitle: 'Ashwagandha for ADHD: Evidence on Stress, Focus, Sleep, and Emotional Regulation',
    description: 'Evidence-based review of ashwagandha for ADHD-related symptoms. Examines stress reduction, sleep quality, emotional regulation, pediatric and adult data, dosing, safety, and realistic expectations as an adjunctive support.',
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

