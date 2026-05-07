import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { goalConfigs } from '@/data/goals'
import { getCompounds } from '@/lib/runtime-data'
import ConversionAffiliateCard from '@/components/conversion-affiliate-card'
import { isClean } from '@/lib/display-utils'

type SeoEntryConfig = {
  route: string
  goalSlug: string
  title: string
  h1: string
  intro: string
  searchIntent: string
  bullets: string[]
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
}

const manualSeoEntryPages: SeoEntryConfig[] = [
  {
    route: 'best-supplements-for-sleep',
    goalSlug: 'sleep',
    title: 'Best Supplements for Sleep (Actually Worth Comparing) | The Hippie Scientist',
    h1: 'Best Supplements for Sleep',
    intro: 'Compare sleep supplements by evidence, timing, next-day grogginess risk, and safety context before buying anything.',
    searchIntent: 'sleep supplements, nighttime stack, sleep onset support',
    bullets: ['Compare calming compounds without assuming they work the same way.', 'Use the goal guide to review ranked picks, safety notes, and related stacks.', 'Check compound pages before combining sleep aids with sedatives or medication.'],
  },
  {
    route: 'best-supplements-for-stress',
    goalSlug: 'stress',
    title: 'Best Supplements for Stress (Calm Without Hype) | The Hippie Scientist',
    h1: 'Best Supplements for Stress',
    intro: 'Compare calming compounds and adaptogen-style options with evidence limits, safety context, and practical fit kept visible.',
    searchIntent: 'stress supplements, calming supplements, adaptogen comparison',
    bullets: ['Separate acute calming support from longer-term adaptogen routines.', 'Review interactions and cautions before stacking multiple calming products.', 'Use the full goal page for ranked compounds and comparisons.'],
  },
  {
    route: 'best-supplements-for-focus',
    goalSlug: 'focus',
    title: 'Best Supplements for Focus (Clean Energy Guide) | The Hippie Scientist',
    h1: 'Best Supplements for Focus',
    intro: 'Compare focus supplements by stimulation, mental clarity, evidence strength, and safety instead of chasing nootropic hype.',
    searchIntent: 'focus supplements, nootropic stack, clean energy supplements',
    bullets: ['Balance stimulation with sleep, anxiety, and blood-pressure context.', 'Compare caffeine-adjacent options with non-stimulant support.', 'Use the goal decision page for ranked picks and compound profiles.'],
  },
  {
    route: 'best-supplements-for-fat-loss',
    goalSlug: 'fat-loss',
    title: 'Best Supplements for Fat Loss (Evidence-Aware Support) | The Hippie Scientist',
    h1: 'Best Supplements for Fat Loss',
    intro: 'A grounded fat-loss supplement guide that avoids proprietary-blend hype and keeps stimulant safety in view.',
    searchIntent: 'fat loss supplements, thermogenic supplement stack, appetite support',
    bullets: ['Prioritize modest evidence-aware support over miracle claims.', 'Watch stimulant load, blood pressure, anxiety, and medication interactions.', 'Use the goal guide to compare stacks, compounds, and related evidence.'],
  },
  {
    route: 'best-supplements-for-blood-pressure',
    goalSlug: 'blood-pressure',
    title: 'Best Supplements for Blood Pressure Support (Safety-First) | The Hippie Scientist',
    h1: 'Best Supplements for Blood Pressure Support',
    intro: 'A safety-first guide to cardiovascular-support supplements where medication context and monitoring matter.',
    searchIntent: 'blood pressure supplements, cardiovascular support supplements',
    bullets: ['Treat supplements as support, not replacement blood-pressure care.', 'Review medication interactions and monitoring needs before acting.', 'Use the goal page for ranked compounds and comparison links.'],
  },
  {
    route: 'best-supplements-for-gut-health',
    goalSlug: 'gut-health',
    title: 'Best Supplements for Gut Health (Fiber + Digestion Guide) | The Hippie Scientist',
    h1: 'Best Supplements for Gut Health',
    intro: 'Compare gut-health support options with attention to fiber type, digestion, tolerance, and medication timing.',
    searchIntent: 'gut health supplements, fiber supplements, digestion support',
    bullets: ['Consider fiber and gut-active compounds by tolerance and timing.', 'Separate medication timing when absorption may be affected.', 'Use the goal page for top related compounds and safety context.'],
  },
  {
    route: 'best-supplements-for-joint-support',
    goalSlug: 'joint-support',
    title: 'Best Supplements for Joint Support (Mobility Guide) | The Hippie Scientist',
    h1: 'Best Supplements for Joint Support',
    intro: 'Compare joint-support supplements without treating every mobility or inflammation claim equally.',
    searchIntent: 'joint support supplements, glucosamine chondroitin comparison',
    bullets: ['Compare options by evidence strength and safety context.', 'Review allergy, blood thinner, diabetes, and surgery cautions where relevant.', 'Use the full goal guide for ranked picks and comparison pages.'],
  },
  {
    route: 'natural-testosterone-boosters',
    goalSlug: 'testosterone-support',
    title: 'Natural Testosterone Boosters (Evidence-Aware Guide) | The Hippie Scientist',
    h1: 'Natural Testosterone Boosters',
    intro: 'A skeptical guide to testosterone-support supplements that separates cautious evidence from aggressive booster marketing.',
    searchIntent: 'natural testosterone boosters, testosterone support supplements',
    bullets: ['Be careful with hormone claims and proprietary booster blends.', 'Look for deficiency, sleep, training, and safety context before buying.', 'Use the goal decision page for ranked compounds and related comparisons.'],
  },
  {
    route: 'best-herbs-for-anxiety',
    goalSlug: 'stress',
    title: 'Best Herbs for Anxiety (Safety-First Herbal Guide) | The Hippie Scientist',
    h1: 'Best Herbs for Anxiety',
    intro: 'A cautious guide to anxiety-related herbs and calming compounds that keeps evidence limits and interaction risks visible.',
    searchIntent: 'best herbs for anxiety, natural anxiolytics, calming herbs',
    bullets: ['Separate traditional calming herbs from compounds with stronger human data.', 'Check sedative, medication, pregnancy, bipolar, thyroid, and liver-safety concerns before use.', 'Use the stress guide for ranked options, comparisons, and safer starting points.'],
  },
  {
    route: 'herbs-for-sleep',
    goalSlug: 'sleep',
    title: 'Herbs for Sleep (Natural Sleep Aid Guide) | The Hippie Scientist',
    h1: 'Herbs for Sleep',
    intro: 'A practical guide to sleep herbs and nighttime support options, organized by timing, safety, and real-world fit.',
    searchIntent: 'herbs for sleep, natural sleep aids, calming herbs for sleep',
    bullets: ['Compare onset support, nighttime relaxation, and next-day grogginess risk.', 'Avoid stacking sedative herbs without checking interaction and medication context.', 'Use the sleep guide to move from broad herb ideas into specific compound profiles.'],
  },
  {
    route: 'best-nootropics-for-focus',
    goalSlug: 'focus',
    title: 'Best Nootropics for Focus (Evidence-Aware Guide) | The Hippie Scientist',
    h1: 'Best Nootropics for Focus',
    intro: 'A cleaner entry point for focus nootropics that separates stimulation, attention support, and overhyped claims.',
    searchIntent: 'best nootropics for focus, focus supplements, nootropic stack',
    bullets: ['Compare stimulant and non-stimulant options before building a stack.', 'Watch anxiety, sleep, blood-pressure, and stimulant-load tradeoffs.', 'Use the focus guide to review ranked compounds and full safety profiles.'],
  },
  {
    route: 'best-adaptogens-for-stress',
    goalSlug: 'stress',
    title: 'Best Adaptogens for Stress (No-Hype Guide) | The Hippie Scientist',
    h1: 'Best Adaptogens for Stress',
    intro: 'A grounded adaptogen guide that separates long-term stress support from vague wellness marketing.',
    searchIntent: 'best adaptogens for stress, adaptogen supplements, stress herbs',
    bullets: ['Compare adaptogens by use-case, evidence strength, and safety profile.', 'Avoid assuming adaptogens are interchangeable or risk-free.', 'Use the stress guide for ranked options and safety-first decision support.'],
  },
]

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
  title: `${titleCase(topic)} (Evidence-Aware Guide) | The Hippie Scientist`,
  h1: titleCase(topic),
  intro: `A practical, evidence-aware guide to ${topic}, with safety context, related compounds, and a clear path into ranked decision pages.`,
  searchIntent: topic,
  bullets: [
    `Use this guide to compare ${topic} without treating every supplement claim as equal.`,
    'Open the related goal page for ranked options, dose context, timing, and safety notes.',
    'Review individual compound profiles before combining products or buying anything.',
  ],
}))

export const seoEntryPages: SeoEntryConfig[] = [...manualSeoEntryPages, ...generatedSeoEntryPages]

const siteUrl = 'https://thehippiescientist.net'

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
      forWho: ['People skeptical of testosterone-booster marketing.', 'People comparing deficiency support versus hormone claims.', 'People who want safer, evidence-aware framing.'],
      careful: ['People with hormone-sensitive conditions or medication use.', 'People with fertility, prostate, liver, or endocrine concerns.', 'Anyone expecting supplements to replace medical evaluation.'],
      mistakes: ['Buying proprietary booster blends before checking basics.', 'Confusing energy or libido claims with testosterone evidence.', 'Ignoring sleep, alcohol, training, and deficiency status.'],
      comparison: 'Zinc and magnesium mostly make sense in deficiency or broader health context, while ashwagandha-style claims need separate evidence and safety review.',
    },
  }

  return map[goalSlug] ?? map.focus
}

const pickLabels = ['Best overall', 'Best fit for this goal', 'Best safety-check profile', 'Worth comparing', 'Alternative option', 'Context-dependent pick', 'Check evidence first', 'Use caution before stacking']

function buildFaqs(page: SeoEntryConfig, goalTitle: string): FaqItem[] {
  const plainGoal = goalTitle.toLowerCase()
  return [
    {
      question: `Do ${plainGoal} supplements actually work?`,
      answer: `Some supplements may help with ${plainGoal}, but results depend on the compound, dose, timing, baseline status, and individual response. The ranked guide separates stronger evidence from weaker claims.`,
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

function faqSchema(faqs: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

function breadcrumbSchema(page: SeoEntryConfig) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Supplement Guides', item: `${siteUrl}/goals` },
      { '@type': 'ListItem', position: 3, name: page.h1, item: `${siteUrl}/${page.route}` },
    ],
  }
}

export function generateSeoEntryMetadata(route: string): Metadata {
  const page = seoEntryPages.find((item) => item.route === route)
  if (!page) return { title: 'Supplement Guide | The Hippie Scientist' }

  return {
    title: page.title,
    description: page.intro,
    alternates: { canonical: `/${page.route}` },
    openGraph: {
      title: page.title,
      description: page.intro,
      url: `/${page.route}`,
      type: 'article',
    },
  }
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
  const relatedGuides = seoEntryPages
    .filter((item) => item.route !== page.route && item.goalSlug === page.goalSlug)
    .slice(0, 6)

  return (
    <main className="space-y-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(page)) }} />

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Supplement guide</p>
        <h1 className="mt-3 text-4xl font-black text-white">{page.h1}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-white/75">{page.intro}</p>
        <p className="mt-3 text-xs text-white/45">Search intent: {page.searchIntent}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={`/goals/${goal.slug}`} className="rounded-full bg-emerald-300 px-4 py-2 text-sm font-bold text-black hover:bg-emerald-200">View ranked picks</Link>
          <Link href="/compounds" className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/75 hover:bg-white/10">Browse compounds</Link>
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-300/30 bg-emerald-300/[0.08] p-5">
        <h2 className="text-xl font-black text-white">Quick answer</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-white/75">
          {pageSections.quick.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-xl font-bold text-white">Who this guide is for</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-white/70">
            {pageSections.forWho.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>
        <section className="rounded-2xl border border-amber-300/30 bg-amber-300/[0.06] p-5">
          <h2 className="text-xl font-bold text-amber-100">Who should be careful</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-white/70">
            {pageSections.careful.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {page.bullets.map((bullet) => (
          <div key={bullet} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-6 text-white/70">{bullet}</div>
        ))}
      </section>

      <ConversionAffiliateCard name={page.h1} intent={page.searchIntent} variant="dark" />

      {linkedCompounds.length > 0 ? (
        <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-2xl font-bold text-white">Related compounds</h2>
          <p className="max-w-3xl text-sm leading-6 text-white/70">These links are generated from the current compound dataset and goal mapping, so this guide points into real dataset-linked profiles.</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {linkedCompounds.map((compound) => (
              <Link key={compound.slug} href={`/compounds/${compound.slug}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-emerald-300/40">
                <h3 className="font-bold text-white">{compoundLabel(compound)}</h3>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/60">{clean(compound.summary || compound.mechanism || compound.evidence) || 'Open profile for evidence, dose, and safety context.'}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {linkedCompounds.length > 0 ? (
        <section className="space-y-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-800/80">Top picks</p>
          <h2 className="text-2xl font-black text-slate-950">Start with these compounds</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {linkedCompounds.slice(0, 6).map((compound, index) => (
              <article key={compound.slug} className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/10">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{pickLabels[index] ?? 'Worth comparing'}</p>
                <Link href={`/compounds/${compound.slug}`} className="text-lg font-black text-slate-950 hover:text-emerald-800">
                  {compoundLabel(compound)}
                </Link>
                <p className="line-clamp-2 text-sm leading-6 text-slate-600">
                  {clean(compound.summary || compound.mechanism || compound.evidence) || 'Open the full profile for evidence, dose, and safety context.'}
                </p>
                <ConversionAffiliateCard name={compoundLabel(compound)} slug={compound.slug} intent={page.searchIntent} />
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-2xl font-bold text-white">How to choose supplements for {goal.title.toLowerCase()}</h2>
        <p className="max-w-3xl leading-7 text-white/75">Not all supplements targeting {goal.title.toLowerCase()} work the same way. Some are designed for short-term support, some require consistent use, and some only make sense for specific situations or populations. Match the compound, timing, and safety profile to the problem you are actually trying to solve.</p>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-white/70">
          <li>Check whether the expected effect is acute, gradual, or dependent on baseline deficiency.</li>
          <li>Compare stimulant, calming, fiber, adaptogen, or nutrient-style approaches before stacking products.</li>
          <li>Look at interaction risks, medical context, and safety notes before combining multiple compounds.</li>
        </ul>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-2xl font-bold text-white">Comparison context</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">{pageSections.comparison}</p>
        <Link href={`/goals/${goal.slug}`} className="mt-4 inline-block text-sm font-semibold text-emerald-300">Compare ranked options →</Link>
      </section>

      <section className="rounded-2xl border border-red-300/20 bg-red-400/[0.06] p-5">
        <h2 className="text-xl font-bold text-white">Common mistakes</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-white/70">
          {pageSections.mistakes.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <section className="rounded-3xl border border-amber-300/20 bg-amber-300/[0.06] p-5">
        <h2 className="font-bold text-amber-100">Safety considerations</h2>
        <p className="mt-2 text-sm leading-6 text-white/75">{sentence(goal.safetyNote)} Supplements are not risk-free, especially when combined with medications, medical conditions, pregnancy, surgery, sedatives, stimulants, or blood-pressure concerns.</p>
        <Link href={`/goals/${goal.slug}`} className="mt-4 inline-block text-sm font-semibold text-emerald-300">Review full safety guidance →</Link>
      </section>

      <ConversionAffiliateCard name={page.h1} intent={page.searchIntent} variant="dark" />

      <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-2xl font-bold text-white">Frequently asked questions</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.question} className="rounded-2xl border border-white/10 p-4">
              <h3 className="font-semibold text-white">{faq.question}</h3>
              <p className="mt-2 text-sm leading-6 text-white/70">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {relatedGuides.length > 0 ? (
        <section>
          <h2 className="text-2xl font-bold text-white">Related supplement guides</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {relatedGuides.map((guide) => (
              <Link key={guide.route} href={`/${guide.route}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-emerald-300/40">
                <h3 className="font-bold text-white">{guide.h1}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-white/65">{guide.intro}</p>
                <span className="mt-3 inline-block text-sm font-semibold text-emerald-300">Read guide →</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  )
}
