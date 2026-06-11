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
    source: 'docs/content/focus-cluster/best-supplements-for-adhd-content-v1.md',
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
    source: 'docs/content/focus-cluster/adhd-stack-guide-content-v1.md',
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
    title: 'Sleep and ADHD: Evidence-Based Support for Rest, Timing, and Next-Day Focus',
    seoTitle: 'Sleep and ADHD: Evidence-Based Support for Rest, Timing, and Next-Day Focus',
    description: 'Conservative guide to the sleep-ADHD connection, including circadian timing, stimulant timing, behavioral foundations, and where melatonin, magnesium, and L-theanine may fit.',
    category: 'Sleep',
    tags: ['Focus', 'ADHD', 'Sleep', 'Supplement Evidence'],
    date: '2026-06-10',
    readingTime: '6 min read',
    fallbackBody: `## Important medical context

Sleep problems are common in people with ADHD, but poor sleep can also mimic or worsen attention problems. This article is informational only and is not a substitute for ADHD diagnosis, sleep-disorder evaluation, or medication guidance from a qualified clinician.

## Why sleep matters in ADHD

Short sleep, irregular sleep timing, delayed circadian rhythm, sleep apnea, restless legs, anxiety, and evening stimulant effects can all worsen next-day attention and emotional regulation. Before adding supplements, the most useful first step is usually to identify the specific sleep pattern: delayed sleep onset, night waking, insufficient sleep opportunity, or poor sleep quality.

## Evidence-first supplement context

- [Melatonin for ADHD Sleep](/articles/melatonin-for-adhd-sleep) is most relevant when delayed sleep onset or circadian timing is the main issue.
- [Magnesium for ADHD](/articles/magnesium-for-adhd) may be most relevant when dietary intake or status is low, or when muscle tension and sleep quality are part of the picture.
- [L-Theanine for ADHD](/articles/l-theanine-for-adhd) is discussed mainly for calm focus and sleep-quality support, not as an ADHD treatment.

## Practical hierarchy

1. Review stimulant timing, caffeine timing, screen timing, and consistent wake time.
2. Screen for snoring, restless legs, insomnia disorder, anxiety, and medication side effects.
3. Consider supplements only as adjuncts, one at a time, with a defined outcome such as sleep latency or total sleep time.

## Related articles

Start with [Best Supplements for ADHD](/articles/best-supplements-for-adhd) for the broad evidence map, then use the [ADHD Stack Guide](/articles/adhd-stack-guide) for conservative combination principles.`,
  },
  {
    slug: 'nutrient-deficiencies-and-adhd',
    title: 'Nutrient Deficiencies and ADHD: What to Check Before Supplementing',
    seoTitle: 'Nutrient Deficiencies and ADHD: What to Check Before Supplementing',
    description: 'Evidence-first guide to nutrient status in ADHD, including magnesium, omega-3, iron/ferritin, zinc, vitamin D, and why deficiency correction differs from treating ADHD.',
    category: 'Nutrient Deficiencies',
    tags: ['Focus', 'ADHD', 'Nutrient Deficiencies', 'Supplement Evidence'],
    date: '2026-06-10',
    readingTime: '7 min read',
    fallbackBody: `## Important medical context

Nutrient deficiencies can affect energy, sleep, mood, and cognition, but correcting a deficiency is not the same thing as treating ADHD. Testing and interpretation should be handled with a qualified clinician, especially for children, pregnancy, anemia, kidney disease, or medication use.

## Why baseline status matters

Some ADHD supplement claims are strongest when a person starts with low intake or low measured status. This is especially relevant for minerals and fatty acids. Without baseline context, supplementation can look ineffective, unnecessary, or occasionally unsafe.

## Nutrients commonly discussed

- [Magnesium for ADHD](/articles/magnesium-for-adhd): most relevant when intake or status is low, or when sleep and physical tension are prominent.
- [Omega-3 and ADHD](/articles/omega-3-and-adhd): evidence is mixed, with modest average effects in some analyses and major variability by EPA/DHA dose and baseline diet.
- Iron/ferritin, zinc, and vitamin D: potentially important when low, but should be tested rather than guessed.

## Conservative decision framework

1. Identify the symptom domain: attention, sleep, emotional regulation, fatigue, or restlessness.
2. Check diet and labs where clinically appropriate.
3. Correct clear deficiencies before building complex stacks.
4. Track outcomes and adverse effects.

## Related articles

For a broader comparison, see [Best Supplements for ADHD](/articles/best-supplements-for-adhd). For combination logic, see the [ADHD Stack Guide](/articles/adhd-stack-guide).`,
  },
  {
    slug: 'melatonin-for-adhd-sleep',
    title: 'Melatonin for ADHD Sleep: Evidence, Timing, and Safety Considerations',
    seoTitle: 'Melatonin for ADHD Sleep: Evidence, Timing, and Safety Considerations',
    description: 'Conservative review of melatonin for ADHD-related sleep onset problems, with timing, dose caution, medication context, and links to broader sleep-support guides.',
    category: 'Sleep',
    tags: ['Focus', 'ADHD', 'Sleep', 'Supplement Evidence'],
    date: '2026-06-10',
    readingTime: '6 min read',
    fallbackBody: `## Important medical context

Melatonin is a hormone involved in circadian timing. It is not an ADHD treatment and should not be used to mask untreated sleep disorders, medication side effects, or inadequate sleep opportunity. Pediatric use should be clinician-guided.

## Where melatonin may fit

Melatonin is most relevant when the main problem is delayed sleep onset or a shifted sleep schedule. It is less likely to solve night waking, insufficient time in bed, untreated sleep apnea, or daytime attention problems unrelated to sleep.

## Timing matters

Melatonin is generally discussed as a timing signal rather than a sedative. Dose, timing, formulation, age, and concurrent medications all matter. More is not automatically better, and next-day grogginess or vivid dreams can occur.

## Cross-links in the ADHD sleep cluster

- Start with [Sleep and ADHD](/articles/sleep-and-adhd) for the broader sleep framework.
- Compare calming adjuncts in [Magnesium for ADHD](/articles/magnesium-for-adhd) and [L-Theanine for ADHD](/articles/l-theanine-for-adhd).
- Use [Best Supplements for ADHD](/articles/best-supplements-for-adhd) and the [ADHD Stack Guide](/articles/adhd-stack-guide) for evidence ranking and stacking cautions.`,
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

