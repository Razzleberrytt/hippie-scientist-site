import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { goalConfigs } from '@/data/goals'
import { getCompounds } from '../src/lib/runtime-data'
import ConversionAffiliateCard from '@/components/conversion-affiliate-card'
import { AFFILIATE_TAGS } from '@/config/affiliate'
import { isClean } from '@/lib/display-utils'
import AffiliateDisclosure from '../components/AffiliateDisclosure'
import EmailCapture from '@/components/EmailCapture'
import RecommendationSection from '@/components/RecommendationSection'
import { getRevenueProductSet } from '@/config/revenue-products'
import { EvidenceBadge } from '@/components/ui'
import { buildPageMetadata } from '../src/lib/seo'
import { isRestrictedRecord } from '../src/lib/restricted-ingredients'
import { buildSeoEntrySchemaGraph } from '../src/lib/schema-graph'
import SchemaGraphScript from '@/components/seo/SchemaGraphScript'
import { seoEntryExpansions } from '@/lib/curated-expansions'

type SeoEntryConfig = {
  route: string
  goalSlug: string
  title: string
  h1: string
  intro: string
  searchIntent: string
  bullets: string[]
  customFaqs?: FaqItem[]
}

type FaqItem = {
  question: string
  answer: string
}

type CompoundRecord = {
  slug: string
  name?: string
  displayName?: string
  summary?: string
  mechanism?: string
  evidence?: string
  safety?: string
  evidenceLevel?: string
  evidence_tier?: string
  bestFor?: string
  form?: string
}

const manualSeoEntryPages: SeoEntryConfig[] = [
  {
    route: 'best-supplements-for-sleep',
    goalSlug: 'sleep',
    title: 'Best Supplements for Sleep (Actually Worth Comparing)',
    h1: 'Best Supplements for Sleep',
    intro: 'Compare sleep supplements by evidence, timing, next-day grogginess risk, and safety context before buying anything.',
    searchIntent: 'sleep supplements, nighttime stack, sleep onset support',
    bullets: ['Compare calming compounds without assuming they work the same way.', 'Use the goal guide to review ranked picks, safety notes, and related stacks.', 'Check compound pages before combining sleep aids with sedatives or medication.'],
  },
  {
    route: 'best-supplements-for-stress',
    goalSlug: 'stress',
    title: 'Best Supplements for Stress (Calm Without Hype)',
    h1: 'Best Supplements for Stress',
    intro: 'Compare calming compounds and adaptogen-style options with evidence limits, safety context, and practical fit kept visible.',
    searchIntent: 'stress supplements, calming supplements, adaptogen comparison',
    bullets: ['Separate acute calming support from longer-term adaptogen routines.', 'Review interactions and cautions before stacking multiple calming products.', 'Use the full goal page for ranked compounds and comparisons.'],
  },
  {
    route: 'best-supplements-for-focus',
    goalSlug: 'focus',
    title: 'Best Supplements for Focus (Clean Energy Guide)',
    h1: 'Best Supplements for Focus',
    intro: 'Compare focus supplements by stimulation, mental clarity, evidence strength, and safety instead of chasing nootropic hype.',
    searchIntent: 'focus supplements, nootropic stack, clean energy supplements',
    bullets: ['Balance stimulation with sleep, anxiety, and blood-pressure context.', 'Compare caffeine-adjacent options with non-stimulant support.', 'Use the goal decision page for ranked picks and compound profiles.'],
  },
  {
    route: 'best-supplements-for-fat-loss',
    goalSlug: 'fat-loss',
    title: 'Best Supplements for Fat Loss (Evidence-Strength Support)',
    h1: 'Best Supplements for Fat Loss',
    intro: 'A grounded fat-loss supplement guide that avoids proprietary-blend hype and keeps stimulant safety in view.',
    searchIntent: 'fat loss supplements, thermogenic supplement stack, appetite support',
    bullets: ['Prioritize modest support with limited-to-stronger evidence strength over miracle claims.', 'Watch stimulant load, blood pressure, anxiety, and medication interactions.', 'Use the goal guide to compare stacks, compounds, and related evidence.'],
  },
  {
    route: 'best-supplements-for-blood-pressure',
    goalSlug: 'blood-pressure',
    title: 'Best Supplements for Blood Pressure Support (Safety-First)',
    h1: 'Best Supplements for Blood Pressure Support',
    intro: 'A safety-first guide to cardiovascular-support supplements where medication context and monitoring matter.',
    searchIntent: 'blood pressure supplements, cardiovascular support supplements',
    bullets: ['Treat supplements as support, not replacement blood-pressure care.', 'Review medication interactions and monitoring needs before acting.', 'Use the goal page for ranked compounds and comparison links.'],
  },
  {
    route: 'best-supplements-for-gut-health',
    goalSlug: 'gut-health',
    title: 'Best Supplements for Gut Health (Fiber + Digestion Guide)',
    h1: 'Best Supplements for Gut Health',
    intro: 'Compare gut-health support options with attention to fiber type, digestion, tolerance, and medication timing.',
    searchIntent: 'gut health supplements, fiber supplements, digestion support',
    bullets: ['Consider fiber and gut-active compounds by tolerance and timing.', 'Separate medication timing when absorption may be affected.', 'Use the goal page for top related compounds and safety context.'],
  },
  {
    route: 'best-supplements-for-joint-support',
    goalSlug: 'joint-support',
    title: 'Best Supplements for Joint Support (Mobility Guide)',
    h1: 'Best Supplements for Joint Support',
    intro: 'Compare joint-support supplements without treating every mobility or inflammation claim equally.',
    searchIntent: 'joint support supplements, glucosamine chondroitin comparison',
    bullets: ['Compare options by evidence strength and safety context.', 'Review allergy, blood thinner, diabetes, and surgery cautions where relevant.', 'Use the full goal guide for ranked picks and comparison pages.'],
  },
  {
    route: 'natural-testosterone-boosters',
    goalSlug: 'testosterone-support',
    title: 'Natural Testosterone Boosters (Evidence-Strength Guide)',
    h1: 'Natural Testosterone Boosters',
    intro: 'A skeptical guide to testosterone-support supplements that separates cautious evidence from aggressive booster marketing.',
    searchIntent: 'natural testosterone boosters, testosterone support supplements',
    bullets: ['Be careful with hormone claims and proprietary booster blends.', 'Look for deficiency, sleep, training, and safety context before buying.', 'Use the goal decision page for ranked compounds and related comparisons.'],
  },
  {
    route: 'best-herbs-for-anxiety',
    goalSlug: 'stress',
    title: 'Best Herbs for Anxiety (Safety-First Herbal Guide)',
    h1: 'Best Herbs for Anxiety',
    intro: 'A cautious guide to anxiety-related herbs and calming compounds that keeps evidence limits and interaction risks visible.',
    searchIntent: 'best herbs for anxiety, natural anxiolytics, calming herbs',
    bullets: ['Separate traditional calming herbs from compounds with stronger human data.', 'Check sedative, medication, pregnancy, bipolar, thyroid, and liver-safety concerns before use.', 'Use the stress guide for ranked options, comparisons, and safer starting points.'],
  },
  {
    route: 'herbs-for-sleep',
    goalSlug: 'sleep',
    title: 'Herbs for Sleep (Natural Sleep Aid Guide)',
    h1: 'Herbs for Sleep',
    intro: 'A practical guide to sleep herbs and nighttime support options, organized by timing, safety, and real-world fit.',
    searchIntent: 'herbs for sleep, natural sleep aids, calming herbs for sleep',
    bullets: ['Compare onset support, nighttime relaxation, and next-day grogginess risk.', 'Avoid stacking sedative herbs without checking interaction and medication context.', 'Use the sleep guide to move from broad herb ideas into specific compound profiles.'],
  },
  {
    route: 'guides/magnesium-vs-melatonin',
    goalSlug: 'sleep',
    title: 'Magnesium vs Melatonin for Sleep (Evidence-Based Comparison)',
    h1: 'Magnesium vs Melatonin',
    intro: 'Complementary tools with distinct primary roles. Magnesium often supports relaxation, muscle ease, and sleep quality — particularly when intake is suboptimal or tension is present. Melatonin is more directly linked to sleep timing, onset latency, and circadian alignment (jet lag, schedule shifts). Effects are context-dependent.',
    searchIntent: 'magnesium vs melatonin for sleep, magnesium or melatonin, sleep timing vs relaxation support',
    bullets: [
      'Magnesium is usually framed around relaxation, muscle tension, and deficiency-related sleep quality support.',
      'Melatonin is more directly tied to sleep onset latency and circadian timing (jet lag, delayed sleep phase).',
      'Many people use both together successfully when factors overlap.',
      'Context, individual response, and addressing sleep fundamentals matter more than choosing one over the other.',
    ],
    customFaqs: [
      {
        question: "Can I take magnesium and melatonin together?",
        answer: "Yes, many people do so safely as they work through different pathways. Start with lower doses of each, pay attention to timing (magnesium earlier in the evening, melatonin closer to bed), and watch for excessive drowsiness. Individual tolerance varies."
      },
      {
        question: "How long does it take to notice benefits?",
        answer: "Melatonin often shows effects on onset within the first few uses (timing-dependent). Magnesium benefits for sleep quality or relaxation frequently build over 1–4+ weeks of consistent use, especially if addressing lower status. Track subjective and objective measures if possible."
      },
      {
        question: "Is one better than the other overall?",
        answer: "No simple winner — it depends on your primary need. Melatonin has more consistent data for circadian timing and onset latency issues. Magnesium shows promise for quality, relaxation, and deficiency-related sleep disruption. Many benefit from addressing both angles or the underlying contributors."
      },
      {
        question: "What about side effects or long-term use?",
        answer: "Both are generally well-tolerated short-to-medium term at appropriate doses. Magnesium: watch GI tolerance and kidney status. Melatonin: possible next-day grogginess or vivid dreams in sensitive users; timing is key. Long-term nightly use should be discussed with a clinician, alongside good sleep practices."
      },
      {
        question: "Which form of magnesium is best for sleep?",
        answer: "Glycinate or bisglycinate are frequently preferred for absorption and calming effects with fewer GI issues. L-threonate has emerging data for sleep architecture and daytime function. Oxide is less ideal for sleep-focused use due to lower bioavailability."
      },
      {
        question: "Does magnesium help produce melatonin?",
        answer: "There is some biological interplay (magnesium supports enzymatic steps in melatonin synthesis; deficiency can affect rhythms), but they are not direct substitutes. Supplementation of one does not reliably replace the need for the other in all contexts."
      }
    ]
  },
  {
    route: 'best-nootropics-for-focus',
    goalSlug: 'focus',
    title: 'Best Nootropics for Focus (Evidence-Strength Guide)',
    h1: 'Best Nootropics for Focus',
    intro: 'A cleaner entry point for focus nootropics that separates stimulation, attention support, and overhyped claims.',
    searchIntent: 'best nootropics for focus, focus supplements, nootropic stack',
    bullets: ['Compare stimulant and non-stimulant options before building a stack.', 'Watch anxiety, sleep, blood-pressure, and stimulant-load tradeoffs.', 'Use the focus guide to review ranked compounds and full safety profiles.'],
  },
  {
    route: 'best-adaptogens-for-stress',
    goalSlug: 'stress',
    title: 'Best Adaptogens for Stress (No-Hype Guide)',
    h1: 'Best Adaptogens for Stress',
    intro: 'A grounded adaptogen guide that separates long-term stress support from vague wellness marketing.',
    searchIntent: 'best adaptogens for stress, adaptogen supplements, stress herbs',
    bullets: ['Compare adaptogens by use-case, evidence strength, and safety profile.', 'Avoid assuming adaptogens are interchangeable or risk-free.', 'Use the stress guide for ranked options and safety-first decision support.'],
  },
  {
    route: 'kratom-7oh-withdrawal-management',
    goalSlug: 'stress',
    title: 'Kratom 7-OH Withdrawal Management | Evidence-Informed Harm Reduction Guide',
    h1: 'Kratom 7-OH Withdrawal Management',
    intro: 'Evidence-informed strategies for 7-hydroxymitragynine (7-OH) withdrawal, including symptom timeline, tapering approaches, harm reduction context, and when to seek medical support.',
    searchIntent: 'kratom 7-oh withdrawal, 7-hydroxymitragynine withdrawal management, kratom withdrawal guide',
    bullets: ['Understand the 7-OH withdrawal timeline and common symptoms.', 'Compare tapering strategies and harm reduction approaches.', 'Access professional medical and mental health support resources.'],
  },
]

const canonicalGuideRouteOverrides: Record<string, string> = {
  'best-supplements-for-blood-pressure': 'best-supplements-for-blood-pressure',
  'herbs-for-sleep': 'articles/best-herbs-for-sleep',
}

const manualGuideSeoEntryPages: SeoEntryConfig[] = manualSeoEntryPages.map((page) => ({
  ...page,
  route: canonicalGuideRouteOverrides[page.route]
    || (page.route.startsWith('guides/') ? page.route : `guides/${page.route}`),
}))

const guideTopics = [
  ['sleep', 'natural sleep aids'], ['sleep', 'supplements for deep sleep'], ['sleep', 'supplements for insomnia'], ['sleep', 'melatonin alternatives'], ['sleep', 'calming supplements for sleep'], ['sleep', 'nighttime relaxation supplements'], ['sleep', 'sleep onset supplements'], ['sleep', 'sleep stack supplements'], ['sleep', 'non habit forming sleep aids'], ['sleep', 'magnesium for sleep'], ['sleep', 'glycine for sleep'], ['sleep', 'theanine for sleep'],
  ['stress', 'natural anxiety supplements'], ['stress', 'herbs for stress relief'], ['stress', 'supplements for cortisol'], ['stress', 'adaptogens for anxiety'], ['stress', 'calming supplements'], ['stress', 'stress relief supplements'], ['stress', 'supplements for panic support'], ['stress', 'ashwagandha alternatives'], ['stress', 'rhodiola vs ashwagandha'], ['stress', 'kava alternatives'], ['stress', 'relaxation supplements'], ['stress', 'non sedating anxiety supplements'],
  ['focus', 'supplements for brain fog'], ['focus', 'natural focus supplements'], ['focus', 'supplements for concentration'], ['focus', 'nootropics for studying'], ['focus', 'non stimulant nootropics'], ['focus', 'clean energy supplements'], ['focus', 'caffeine alternatives for focus'], ['focus', 'supplements for mental clarity'], ['focus', 'choline supplements for focus'], ['focus', 'alpha gpc vs citicoline'], ['focus', 'focus stack supplements'], ['focus', 'nootropics for work'],
  ['fat-loss', 'thermogenic supplements'], ['fat-loss', 'appetite support supplements'], ['fat-loss', 'green tea extract for fat loss'], ['fat-loss', 'berberine for weight support'], ['fat-loss', 'fiber supplements for appetite'], ['fat-loss', 'caffeine for fat loss'], ['fat-loss', 'stimulant free fat loss supplements'], ['fat-loss', 'metabolism support supplements'], ['fat-loss', 'capsaicin for weight loss'], ['fat-loss', 'fat loss stack supplements'],
  ['blood-pressure', 'magnesium for blood pressure'], ['blood-pressure', 'supplements for cardiovascular support'], ['blood-pressure', 'beetroot alternatives'], ['blood-pressure', 'fiber for cholesterol and blood pressure'], ['blood-pressure', 'plant sterols guide'], ['blood-pressure', 'citrulline for circulation'], ['blood-pressure', 'heart health supplements'], ['blood-pressure', 'blood pressure support without stimulants'],
  ['gut-health', 'fiber supplements for gut health'], ['gut-health', 'supplements for bloating'], ['gut-health', 'prebiotics vs probiotics'], ['gut-health', 'digestive enzyme supplements'], ['gut-health', 'psyllium husk guide'], ['gut-health', 'inulin vs psyllium'], ['gut-health', 'gut health stack supplements'], ['gut-health', 'supplements for digestion'], ['gut-health', 'probiotic alternatives'], ['gut-health', 'prebiotic fiber supplements'],
  ['joint-support', 'glucosamine vs chondroitin'], ['joint-support', 'curcumin for joint support'], ['joint-support', 'supplements for knee support'], ['joint-support', 'mobility supplements'], ['joint-support', 'joint support without nsaids'], ['joint-support', 'anti inflammatory supplements'], ['joint-support', 'collagen for joints'], ['joint-support', 'boswellia alternatives'],
  ['testosterone-support', 'supplements for low testosterone'], ['testosterone-support', 'herbs that increase testosterone'], ['testosterone-support', 'testosterone support supplements'], ['testosterone-support', 'zinc for testosterone'], ['testosterone-support', 'magnesium for testosterone'], ['testosterone-support', 'ashwagandha for testosterone'], ['testosterone-support', 'natural energy boosters for men'], ['testosterone-support', 'testosterone booster alternatives'],
] as const

const titleCase = (value: string) =>
  value.split(' ').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')

const slugify = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

const generatedSeoEntryPages: SeoEntryConfig[] = guideTopics.map(([goalSlug, topic]) => ({
  route: `guides/${slugify(topic)}`,
  goalSlug,
  title: `${titleCase(topic)} (Evidence-Strength Guide)`,
  h1: titleCase(topic),
  intro: `A practical guide to ${topic} with evidence-strength context, related compounds, and a clear path into ranked decision pages.`,
  searchIntent: topic,
  bullets: [
    `Use this guide to compare ${topic} without treating every supplement claim as equal.`,
    'Open the related goal page for ranked options, dose context, timing, and safety notes.',
    'Review individual compound profiles before combining products or buying anything.',
  ],
}))

export const seoEntryPages: SeoEntryConfig[] = [
  ...manualSeoEntryPages,
  ...manualGuideSeoEntryPages,
  ...generatedSeoEntryPages,
]

export const canonicalGuidePages: SeoEntryConfig[] = seoEntryPages.filter((page) =>
  page.route.startsWith('guides/'),
)

export const indexableGuidePages: SeoEntryConfig[] = [
  ...manualGuideSeoEntryPages,
  ...generatedSeoEntryPages.filter((page) => page.route === 'guides/magnesium-for-sleep'),
]


const revenueProductSlugs: Record<string, string[]> = {
  'best-supplements-for-sleep': ['magnesium', 'l-theanine'],
  'best-supplements-for-stress': ['ashwagandha', 'rhodiola', 'l-theanine'],
  'best-supplements-for-focus': ['l-theanine', 'lions-mane'],
  'best-nootropics-for-focus': ['l-theanine', 'lions-mane'],
  'best-supplements-for-gut-health': ['probiotics', 'ginger', 'glutamine'],
  'best-supplements-for-fat-loss': ['berberine', 'green-tea-extract', 'caffeine'],
  'best-supplements-for-blood-pressure': ['magnesium', 'coenzyme-q10', 'omega-3', 'garlic'],
  'best-supplements-for-joint-support': ['turmeric', 'omega-3', 'glucosamine', 'collagen'],
  'natural-testosterone-boosters': ['ashwagandha', 'zinc', 'vitamin-d', 'maca'],
  'best-adaptogens-for-stress': ['ashwagandha', 'rhodiola', 'holy-basil'],
  'guides/best-supplements-for-sleep': ['magnesium', 'l-theanine'],
  'guides/best-supplements-for-stress': ['ashwagandha', 'rhodiola', 'l-theanine'],
  'guides/best-supplements-for-focus': ['l-theanine', 'lions-mane'],
  'guides/best-nootropics-for-focus': ['l-theanine', 'lions-mane'],
}

const clean = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return value.map(clean).filter(Boolean).join(', ')
  if (typeof value === 'object') return ''
  const normalized = String(value).replace(/\s+/g, ' ').trim()
  return isClean(normalized) ? normalized : ''
}

const sentence = (text: string) => text.endsWith('.') ? text : `${text}.`

const compoundLabel = (compound: CompoundRecord) =>
  clean(compound.displayName) || clean(compound.name) || titleCase(compound.slug.replace(/-/g, ' '))

const matchesAny = (compound: CompoundRecord, candidates: string[]) => {
  const haystack = [compound.slug, compound.name, compound.displayName, compound.summary, compound.mechanism, compound.evidence]
    .map(clean)
    .join(' ')
    .toLowerCase()

  return candidates.some((candidate) => haystack.includes(candidate.toLowerCase().replace(/-/g, ' ')) || haystack.includes(candidate.toLowerCase()))
}

const sectionFor = (goalSlug: string) => {
  const map: Record<string, { quick: string[]; forWho: string[]; careful: string[]; mistakes: string[]; comparison: string }> = {
    sleep: {
      quick: ['Falling asleep: melatonin, glycine, or theanine may fit best.', 'Stress-related sleep issues: magnesium or theanine may be more relevant.', 'Nighttime routines should avoid stacking too many sedating compounds at once.'],
      forWho: ['People comparing natural sleep aids before buying.', 'People who want timing, dose, and grogginess context.', 'People trying to avoid random multi-ingredient sleep blends.'],
      careful: ['People using sedatives or sleep medications.', 'Pregnant or breastfeeding individuals.', 'Anyone with medical conditions affecting sleep, breathing, mood, or medication safety.'],
      mistakes: ['Using high-dose melatonin when a lower dose may fit better.', 'Stacking several relaxing supplements on the first night.', 'Ignoring caffeine timing, alcohol, sleep apnea, or medication interactions.'],
      comparison: 'Melatonin is mainly a sleep-timing signal, while magnesium, glycine, and theanine are usually framed around relaxation, stress, or sleep quality support.',
    },
    stress: {
      quick: ['Acute calm: theanine-style options may fit better than adaptogens.', 'Longer-term stress support: adaptogens need more context and patience.', 'Safety matters most when combining calming agents with medications or sedatives.'],
      forWho: ['People comparing calming supplements without hype.', 'People who want non-judgmental safety context.', 'People deciding between herbs, adaptogens, and compounds.'],
      careful: ['People using sedatives, antidepressants, blood-pressure medication, or alcohol.', 'Pregnant or breastfeeding individuals.', 'People with bipolar history, thyroid issues, liver concerns, or complex medication use.'],
      mistakes: ['Treating every adaptogen as interchangeable.', 'Ignoring medication and mood-history context.', 'Buying a stress blend before checking single-ingredient evidence.'],
      comparison: 'Theanine-style calming support is often positioned differently than adaptogens like ashwagandha or rhodiola, which may require longer use and more safety context.',
    },
    focus: {
      quick: ['Stimulant focus: caffeine-based options work fast but can worsen anxiety or sleep.', 'Non-stimulant focus: choline or theanine-style options may be better for sensitive users.', 'Brain fog can come from sleep, stress, nutrition, or medical causes, not just low nootropics.'],
      forWho: ['People comparing nootropics before building a stack.', 'People who want focus without wrecking sleep.', 'People trying to separate useful compounds from hype.'],
      careful: ['People with anxiety, insomnia, high blood pressure, or heart-rhythm concerns.', 'People already using stimulants or ADHD medication.', 'Anyone stacking caffeine-heavy products.'],
      mistakes: ['Adding more stimulants when sleep is the real bottleneck.', 'Stacking multiple cholinergic nootropics without understanding tolerance.', 'Ignoring anxiety, blood pressure, and afternoon caffeine timing.'],
      comparison: 'Caffeine is fast and noticeable, while theanine, choline sources, and other nootropics may be subtler and more dependent on baseline needs.',
    },
    'fat-loss': {
      quick: ['Most fat-loss supplements produce modest support at best.', 'Stimulant-heavy products raise safety tradeoffs.', 'Fiber or metabolic-support options may fit different goals than thermogenics.'],
      forWho: ['People trying to avoid proprietary fat-burner hype.', 'People comparing stimulant and non-stimulant options.', 'People who want appetite, metabolism, and safety context.'],
      careful: ['People with blood-pressure, heart, anxiety, pregnancy, or medication concerns.', 'People sensitive to caffeine or thermogenic blends.', 'Anyone expecting supplements to replace diet and activity basics.'],
      mistakes: ['Buying aggressive stimulant blends first.', 'Ignoring blood pressure and sleep disruption.', 'Expecting supplements to create major fat loss alone.'],
      comparison: 'Caffeine and green-tea-style options are often stimulant-adjacent, while fiber and berberine-style options have different use-cases and safety concerns.',
    },
    'gut-health': {
      quick: ['Fiber type matters: psyllium, inulin, and other fibers do not feel the same.', 'Probiotics and prebiotics target different gut-health angles.', 'Medication timing matters for some fiber supplements.'],
      forWho: ['People comparing fiber, digestive enzymes, probiotics, and prebiotics.', 'People with bloating or tolerance concerns.', 'People who want simple gut-support choices.'],
      careful: ['People with severe GI symptoms, swallowing difficulty, or bowel obstruction risk.', 'People taking medications that may need timing separation from fiber.', 'Anyone who reacts strongly to fermentable fibers.'],
      mistakes: ['Starting with too much fiber too quickly.', 'Ignoring water intake with bulk-forming fiber.', 'Assuming every probiotic works the same.'],
      comparison: 'Psyllium is often used as a bulk-forming fiber, while inulin and many prebiotics may be more fermentable and less tolerated by some users.',
    },
    'blood-pressure': {
      quick: ['Blood-pressure support needs medication context first.', 'Stimulant-heavy products are usually the wrong direction.', 'Magnesium, fiber, circulation support, and diet context should be compared carefully.'],
      forWho: ['People looking for cardiovascular-support context.', 'People comparing supplements without replacing medical care.', 'People who need safety-first guidance.'],
      careful: ['People already taking blood-pressure medication.', 'People with kidney disease, heart disease, pregnancy, or complex medical history.', 'Anyone with very high or symptomatic blood pressure.'],
      mistakes: ['Replacing care with supplements.', 'Combining products without monitoring blood pressure.', 'Ignoring kidney and medication context.'],
      comparison: 'Magnesium, fiber, plant sterols, and circulation-support compounds target different cardiovascular pathways and should not be treated as interchangeable.',
    },
    'joint-support': {
      quick: ['Joint-support evidence varies widely by ingredient and form.', 'Mobility, inflammation, and cartilage-support claims are not the same.', 'Surgery, allergies, and blood-thinner context matter.'],
      forWho: ['People comparing glucosamine, chondroitin, collagen, curcumin, and related options.', 'People trying to avoid generic joint-blend marketing.', 'People who want practical safety context.'],
      careful: ['People using blood thinners or preparing for surgery.', 'People with shellfish allergy or diabetes context.', 'Pregnant or breastfeeding individuals.'],
      mistakes: ['Expecting fast effects from slow-acting joint support.', 'Ignoring form and dose differences.', 'Combining multiple anti-inflammatory products without safety review.'],
      comparison: 'Glucosamine and chondroitin are usually framed differently than curcumin or collagen, so the right option depends on the joint-support target.',
    },
    'testosterone-support': {
      quick: ['Testosterone-booster claims are often exaggerated.', 'Sleep, training, deficiency status, and overall health matter first.', 'Minerals and adaptogens should be evaluated separately.'],
      forWho: ['People skeptical of testosterone-booster marketing.', 'People comparing deficiency support versus hormone claims.', 'People who want safer, evidence-strength framing.'],
      careful: ['People with hormone-sensitive conditions or medication use.', 'People with fertility, prostate, liver, or endocrine concerns.', 'Anyone expecting supplements to replace medical evaluation.'],
      mistakes: ['Buying proprietary booster blends before checking basics.', 'Confusing energy or libido claims with testosterone evidence.', 'Ignoring sleep, alcohol, training, and deficiency status.'],
      comparison: 'Zinc and magnesium mostly make sense in deficiency or broader health context, while ashwagandha-style claims need separate evidence and safety review.',
    },
  }

  return map[goalSlug] ?? map.focus
}


export const firstSentences = (value: string, limit = 2) => {
  const sentences = value.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map(s => s.trim()).filter(Boolean) || []
  return sentences.slice(0, limit).join(' ')
}

function cleanGoalForFaq(goalTitle: string): string {
  let g = goalTitle.toLowerCase()
  g = g.replace(/\s+support\s+decisions$/, '')
  g = g.replace(/\s+resilience\s+decisions$/, ' resilience')
  g = g.replace(/\s+enhancement\s+decisions$/, ' enhancement')
  g = g.replace(/\s+decisions$/, '')
  g = g.replace(/\s+and\s+cellular\s+health$/, '')
  return g.trim()
}

function buildFaqs(page: SeoEntryConfig, goalTitle: string): FaqItem[] {
  const plainGoal = cleanGoalForFaq(goalTitle)
  return [
    {
      question: `Do ${plainGoal} supplements actually work?`,
      answer: `Some supplements may help with ${plainGoal}, but results depend on the compound, dose, timing, baseline status, and individual response varies. The ranked guide separates stronger research signal from weaker claims.`,
    },
    {
      question: `How long do ${plainGoal} supplements take to work?`,
      answer: 'Some supplements are felt the same day, while others require consistent use for days or weeks. Use the compound profiles and stack pages to check timing before buying or combining products.',
    },
    {
      question: `Can I combine multiple ${plainGoal} supplements?`,
      answer: 'Combining supplements can increase side effects and interaction risk. Start with one clear goal, review safety notes, and be careful with medications, pregnancy, medical conditions, or stimulant-heavy stacks.',
    },
    {
      question: `What is the safest way to choose from this ${page.h1.toLowerCase()} guide?`,
      answer: 'Use the page as a starting point, then open the full goal decision guide for ranked picks, evidence context, safety notes, related stacks, and compound-level detail.',
    },
  ]
}


export function generateSeoEntryMetadata(route: string): Metadata {
  const page = seoEntryPages.find((item) => item.route === route)
  if (!page) return { title: 'Supplement Guide | The Hippie Scientist' }
  const canonicalRoute = page.route
  const isGeneratedGuideRoute = route.startsWith('guides/')
    && !indexableGuidePages.some((item) => item.route === route)

  let meta = buildPageMetadata({
    title: page.title,
    description: page.intro,
    path: `/${canonicalRoute}`,
    image: '/og-default.jpg',
    openGraphType: 'article',
  })
  if (isGeneratedGuideRoute) {
    meta = { ...meta, robots: { index: false, follow: true } }
  }
  return meta
}

export async function SeoEntryPage({ route }: { route: string }) {
  const page = seoEntryPages.find((item) => item.route === route)
  if (!page) return notFound()

  const goal = goalConfigs.find((item) => item.slug === page.goalSlug)
  if (!goal) return notFound()

  const compounds = (await getCompounds()) as CompoundRecord[]
  const candidateTerms = [page.searchIntent, ...goal.compoundCandidates, goal.title]
  const linkedCompounds = compounds
    .filter((compound) => matchesAny(compound, candidateTerms))
    .slice(0, 8)

  const pageSections = sectionFor(goal.slug)
  const faqs = buildFaqs(page, goal.title)
  const expansion = seoEntryExpansions[page.route]

  const seenRoutes = new Set<string>()
  const cleanRoute = (r: string) => r.replace(/^guides\//, '')
  const currentCleanRoute = cleanRoute(page.route)

  const relatedGuides = indexableGuidePages
    .filter((item) => {
      const itemCleanRoute = cleanRoute(item.route)
      if (itemCleanRoute === currentCleanRoute) return false
      if (item.goalSlug !== page.goalSlug) return false
      if (seenRoutes.has(itemCleanRoute)) return false
      seenRoutes.add(itemCleanRoute)
      return true
    })
    .slice(0, 6)
  const revenueProducts = (revenueProductSlugs[page.route] || [])
    .map(slug => getRevenueProductSet(slug))
    .filter((set): set is NonNullable<typeof set> => Boolean(set))
    .flatMap(set => set.products)

  const schemaGraph = buildSeoEntrySchemaGraph({
    route: page.route,
    title: page.title,
    description: page.intro,
    h1: page.h1,
    faqs,
  })

  return (
    <div className="space-y-12">
      <SchemaGraphScript graph={schemaGraph} />

      <div className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 sm:p-10 shadow-sm">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Supplement guide</p>
          <h1 className="mt-3 text-4xl font-black text-ink">{page.h1}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted">{page.intro}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={`/goals/${goal.slug}`} className="rounded-full bg-emerald-300 px-4 py-2 text-sm font-bold text-black hover:bg-emerald-200">View ranked picks</Link>
            <Link href="/compounds/" className="rounded-full border border-brand-900/10 px-4 py-2 text-sm font-semibold text-ink hover:bg-brand-50">Browse compounds</Link>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <h2 className="text-xl font-black text-ink">Quick answer</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted">
          {pageSections.quick.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      {expansion ? (
        <>
          <section className="space-y-4 rounded-3xl border border-brand-900/10 bg-white/90 p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-800/80">Evidence-first ranking</p>
            <h2 className="text-2xl font-bold text-ink">How we ranked these options</h2>
            <p className="max-w-3xl text-sm leading-6 text-muted">{expansion.intent}</p>
            <ul className="grid gap-3 md:grid-cols-3">
              {expansion.methodology.map((item) => (
                <li key={item} className="rounded-2xl border border-brand-900/10 bg-brand-50/50 p-4 text-sm leading-6 text-muted">{item}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-4 rounded-3xl border border-brand-900/10 bg-white/90 p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-ink">Evidence, dose, and safety snapshot</h2>
            <div className="overflow-x-auto rounded-2xl border border-brand-900/10 bg-white">
              <table className="min-w-[760px] w-full text-left text-sm">
                <thead className="bg-brand-50/60 text-xs font-bold uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-4 py-3">Option</th>
                    <th className="px-4 py-3">Evidence</th>
                    <th className="px-4 py-3">Best fit</th>
                    <th className="px-4 py-3">Typical range</th>
                    <th className="px-4 py-3">Safety context</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-900/5">
                  {expansion.evidenceRows.map((row) => (
                    <tr key={row.name}>
                      <td className="px-4 py-3 font-semibold text-ink">
                        {row.href ? <Link href={row.href} className="text-brand-700 hover:underline">{row.name}</Link> : row.name}
                      </td>
                      <td className="px-4 py-3 text-muted">{row.tier}</td>
                      <td className="px-4 py-3 text-muted">{row.bestFor}</td>
                      <td className="px-4 py-3 text-muted">{row.dose}</td>
                      <td className="px-4 py-3 text-muted">{row.safety}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-brand-900/10 bg-white/90 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-ink">Which to try first</h2>
              <div className="mt-4 space-y-3">
                {expansion.comparisonRows.map((row) => (
                  <div key={row.scenario} className="rounded-2xl border border-brand-900/10 bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted">{row.scenario}</p>
                    <p className="mt-1 font-semibold text-ink">{row.firstChoice}</p>
                    <p className="mt-1 text-sm leading-6 text-muted">{row.why}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <section className="rounded-3xl border border-amber-300/40 bg-amber-50 p-6">
                <h2 className="text-xl font-bold text-amber-950">Safety checks before buying</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-amber-900/85">
                  {expansion.safetyNotes.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </section>
              <section className="rounded-3xl border border-brand-900/10 bg-white/90 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-ink">Buyer checklist</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted">
                  {expansion.buyerChecklist.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </section>
            </div>
          </section>

          <section className="rounded-3xl border border-brand-900/10 bg-white/90 p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-ink">References</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6">
              {expansion.references.map((ref) => (
                <li key={ref.href}>
                  <a href={ref.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 hover:underline">
                    {ref.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}

      <section className="rounded-3xl border border-amber-300/40 bg-amber-50 p-5">
        <h2 className="font-bold text-amber-900">Safety considerations</h2>
        <p className="mt-2 text-sm leading-6 text-amber-900/85">{sentence(goal.safetyNote)} Supplements are not risk-free, especially when combined with medications, medical conditions, pregnancy, surgery, sedatives, stimulants, or blood-pressure concerns.</p>
        <Link href={`/goals/${goal.slug}`} className="mt-4 inline-block text-sm font-semibold text-emerald-700">Review full safety guidance →</Link>
      </section>

      <section className="rounded-2xl border border-red-300/40 bg-red-50 p-5">
        <h2 className="text-xl font-bold text-red-900">Common mistakes</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-red-900/80">
          {pageSections.mistakes.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-brand-900/10 bg-white/90 p-5">
          <h2 className="text-xl font-bold text-ink">Who this guide is for</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted">
            {pageSections.forWho.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>
        <section className="rounded-2xl border border-amber-300/40 bg-amber-50 p-5">
          <h2 className="text-xl font-bold text-amber-900">Who should be careful</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-amber-900/80">
            {pageSections.careful.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {page.bullets.map((bullet) => (
          <div key={bullet} className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 text-sm leading-6 text-muted">{bullet}</div>
        ))}
      </section>

      <section className="space-y-4 rounded-3xl border border-brand-900/10 bg-white/90 p-6">
        <h2 className="text-2xl font-bold text-ink">How to choose supplements for {goal.title.toLowerCase()}</h2>
        <p className="max-w-3xl leading-7 text-muted">Not all supplements targeting {goal.title.toLowerCase()} work the same way. Some are designed for short-term support, some require consistent use, and some only make sense for specific situations or populations. Match the compound, timing, and safety profile to the problem you are actually trying to solve.</p>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-muted">
          <li>Check whether the expected effect is acute, gradual, or dependent on baseline deficiency.</li>
          <li>Compare stimulant, calming, fiber, adaptogen, or nutrient-style approaches before stacking products.</li>
          <li>Look at interaction risks, medical context, and safety notes before combining multiple compounds.</li>
        </ul>
      </section>

      <section className="rounded-3xl border border-brand-900/10 bg-white/90 p-6">
        <h2 className="text-2xl font-bold text-ink">Comparison context</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{pageSections.comparison}</p>
        <Link href={`/goals/${goal.slug}`} className="mt-4 inline-block text-sm font-semibold text-emerald-700">Compare ranked options →</Link>
      </section>

      {linkedCompounds.length > 0 ? (
        <section className="space-y-4 rounded-3xl border border-brand-900/10 bg-white/90 p-6">
          <h2 className="text-2xl font-bold text-ink">Related compounds</h2>
          <p className="max-w-3xl text-sm leading-6 text-muted">These links are generated from the current compound dataset and goal mapping, so this guide points into real dataset-linked profiles.</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {linkedCompounds.map((compound) => (
              <Link key={compound.slug} href={`/compounds/${compound.slug}`} className="rounded-2xl border border-brand-900/10 bg-white p-4 hover:border-emerald-300/40">
                <h3 className="font-bold text-ink">{compoundLabel(compound)}</h3>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">{clean(compound.summary || compound.mechanism || compound.evidence) || 'Open profile for evidence, dose, and safety context.'}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {linkedCompounds.length > 0 ? (
        <section className="space-y-4 rounded-3xl border border-brand-900/10 bg-white/90 p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-800/80">Sourcing &amp; Comparison Matrix</p>
          <h2 className="text-2xl font-black text-ink">Commercial Decision Table</h2>
          <p className="max-w-3xl text-sm leading-relaxed text-muted">Compare candidate compounds by role, evidence strength, caution markers, and standardized active form before you click through to check top-rated products.</p>

          <div className="overflow-x-auto rounded-2xl border border-brand-900/10 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-brand-900/10 text-left text-sm">
              <thead className="bg-brand-50/50 text-xs font-bold uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3">Compound Name</th>
                  <th className="px-4 py-3">Primary Fit</th>
                  <th className="px-4 py-3">Evidence Tier</th>
                  <th className="px-4 py-3">Caution Level</th>
                  <th className="px-4 py-3">Quality Form</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-900/5 bg-white">
                {linkedCompounds.map((compound) => {
                  const productSet = getRevenueProductSet(compound.slug)
                  const topProduct = productSet?.products.find(p => p.slot === 'overall')
                  const affUrl = isRestrictedRecord(compound)
                    ? ''
                    : topProduct?.affiliateUrl || `https://www.amazon.com/s?k=${encodeURIComponent(compoundLabel(compound) + ' Supplement')}&tag=${AFFILIATE_TAGS.amazon}`
                  const evidence = compound.evidenceLevel || compound.evidence_tier || 'Limited'
                  const primaryFit = compound.bestFor || (compound.summary ? firstSentences(compound.summary, 1) : 'Targeted support')
                  const caution = compound.safety || 'Standard'
                  const qualityForm = compound.form || 'Standard extract'

                  return (
                    <tr key={compound.slug} className="hover:bg-brand-50/20 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap font-bold text-ink">
                        <Link href={`/compounds/${compound.slug}`} className="hover:text-brand-700 hover:underline">
                          {compoundLabel(compound)}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-xs text-muted max-w-[200px] truncate">{primaryFit}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <EvidenceBadge value={evidence} />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          /high|severe|caution|warning|avoid/i.test(caution)
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {caution}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-muted max-w-[150px] truncate">{qualityForm}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-xs font-semibold">
                        <a
                          href={affUrl || `/compounds/${compound.slug}`}
                          target="_blank"
                          rel="nofollow sponsored noopener noreferrer"
                          className="inline-flex rounded-full bg-brand-700 px-3.5 py-1.5 font-bold text-white transition hover:bg-brand-800"
                        >
                          Shop Picks →
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="pt-2">
            <AffiliateDisclosure variant="compact" />
          </div>
        </section>
      ) : null}

      {revenueProducts.length > 0 ? (
        <>
          <EmailCapture
            headline={`Get the ${goal.title.toLowerCase()} supplement shortlist`}
            description={`Occasional notes on ${goal.title.toLowerCase()} evidence, safety context, and product-quality checks before you compare products.`}
            location={page.route}
          />

          <div className="space-y-3">
            <AffiliateDisclosure />
            <RecommendationSection
              title={`${goal.title} product picks`}
              description={`Affiliate recommendations for common ${goal.title.toLowerCase()} support options. Review safety, dose, and product quality before buying.`}
              products={revenueProducts}
            />
          </div>
        </>
      ) : null}

      <ConversionAffiliateCard name={page.h1} intent={page.searchIntent} variant="dark" />

      {/* Frequently asked questions */}
      <section className="space-y-4 rounded-3xl border border-brand-900/10 bg-white/90 p-6">
        <h2 className="text-2xl font-bold text-ink">Frequently asked questions</h2>
        <div className="space-y-4">
          {(page.customFaqs && page.customFaqs.length > 0
            ? page.customFaqs
            : faqs
          ).map((faq, index) => (
            <div key={index} className="rounded-2xl border border-brand-900/10 bg-white p-4">
              <h3 className="font-semibold text-ink">{faq.question}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {relatedGuides.length > 0 ? (
        <section>
          <h2 className="text-2xl font-bold text-ink">Related supplement guides</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {relatedGuides.map((guide) => (
              <Link key={guide.route} href={`/${guide.route}`} className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 hover:border-emerald-300/40">
                <h3 className="font-bold text-ink">{guide.h1}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-muted">{guide.intro}</p>
                <span className="mt-3 inline-block text-sm font-semibold text-emerald-700">Read guide →</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
