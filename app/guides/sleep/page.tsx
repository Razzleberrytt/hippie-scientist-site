import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL, buildTwitterMetadata } from '@/lib/seo'

import { HubSectionHeading } from '@/components/guides/HubSectionHeading'
import { DecisionRouter, type IntentRoute } from '@/components/guides/DecisionRouter'
import { GuideCardGrid, type GuideCard } from '@/components/guides/GuideCardGrid'
import SchemaGraphScript from '@/components/seo/SchemaGraphScript'
import { buildGuideHubSchemaGraph } from '../../../lib/schema-graph'

export const metadata: Metadata = {
  title: 'Sleep Research & Supplements: Evidence, Timing & Safety',
  description:
    'Evidence-based sleep research covering supplements, insomnia, circadian timing, shift work, sleep measurement, environmental tools, substances, and safety.',
  alternates: { canonical: `${SITE_URL}/guides/sleep/` },
  openGraph: {
    title: 'Sleep Research & Supplements: Evidence, Timing & Safety',
    description: 'Compare sleep interventions by evidence, mechanism, timing, measurement, safety, and the actual sleep problem.',
    url: `${SITE_URL}/guides/sleep/`,
    type: 'website',
    images: ['/og-default.jpg'],
  },
  twitter: buildTwitterMetadata({
    title: 'Sleep Research & Supplements: Evidence, Timing & Safety',
    description: 'Compare sleep interventions by evidence, mechanism, timing, measurement, safety, and the actual sleep problem.',
  }),
}

const START_HERE: IntentRoute[] = [
  {
    problem: 'Racing thoughts at bedtime',
    why: 'Review the limited sleep evidence for a calming amino acid that is not a conventional sedative.',
    cta: 'L-Theanine for Sleep',
    href: '/guides/sleep/l-theanine-for-sleep/',
  },
  {
    problem: 'Physical tension or a restless body',
    why: 'Check whether magnesium fits your situation, especially if low intake or deficiency may be relevant.',
    cta: 'Magnesium for Sleep',
    href: '/guides/sleep/magnesium-for-sleep/',
  },
  {
    problem: 'Waking up tired after short or light sleep',
    why: 'Glycine is a sleep-quality experiment, not a knockout sedative.',
    cta: 'Glycine for Sleep',
    href: '/guides/sleep/glycine-for-sleep/',
  },
  {
    problem: 'You sleep fine — but only very late',
    why: 'If sleep becomes normal on a later schedule, circadian delay may fit better than generic insomnia.',
    cta: 'Delayed Sleep Phase vs Insomnia',
    href: '/articles/delayed-sleep-wake-phase-vs-insomnia/',
  },
  {
    problem: 'Night or rotating shifts are wrecking sleep',
    why: 'Shift work combines circadian misalignment, sleep loss and alertness problems that need a schedule-specific toolkit.',
    cta: 'Shift Work Sleep Disorder',
    href: '/articles/shift-work-sleep-disorder/',
  },
  {
    problem: 'Light, noise, heat or stuffy air keeps disrupting sleep',
    why: 'Environmental control can be a cleaner first experiment than adding another supplement.',
    cta: 'Sleep Environment Guide',
    href: '/articles/sleep-environment-evidence-guide/',
  },
  {
    problem: 'Not sure which magnesium to buy',
    why: 'Glycinate, citrate, threonate and oxide are not interchangeable for sleep.',
    cta: 'Magnesium Types for Sleep',
    href: '/guides/sleep/magnesium-types-for-sleep/',
  },
  {
    problem: 'Choosing glycinate vs L-threonate',
    why: 'A buyer-intent comparison keeps premium forms from sounding automatically better.',
    cta: 'Glycinate vs L-Threonate',
    href: '/guides/sleep/magnesium-glycinate-vs-l-threonate-for-sleep/',
  },
  {
    problem: 'Stress-related insomnia',
    why: 'Explore an adaptogen studied for stress and sleep over weeks, not as a same-night sedative.',
    cta: 'Ashwagandha for Sleep',
    href: '/guides/sleep/ashwagandha-for-sleep/',
  },
  {
    problem: 'Trending sleep supplements sound convincing',
    why: 'Apigenin needs a reality check before it becomes another overstacked sleep trend.',
    cta: 'Apigenin for Sleep',
    href: '/guides/sleep/apigenin-for-sleep/',
  },
  {
    problem: 'Comparing your options',
    why: 'A mineral and a circadian signal solve different problems.',
    cta: 'Magnesium vs Melatonin',
    href: '/guides/sleep/magnesium-vs-melatonin/',
  },
  {
    problem: 'You want a full plan',
    why: 'How to combine supplements safely — timing, dosing, and stacking.',
    cta: 'Sleep Stack Guide',
    href: '/guides/sleep/sleep-stack-guide/',
  },
  {
    problem: 'ADHD-related sleep issues',
    why: 'Delayed sleep and stimulant timing need a different approach.',
    cta: 'Sleep & ADHD',
    href: '/guides/adhd/sleep-and-adhd/',
  },
]

const BEST_FIRST: GuideCard[] = [
  {
    href: '/articles/sleep-interventions-evidence-matrix/',
    title: 'Sleep Interventions Evidence Matrix',
    desc: 'Compare supplements, CBT-I, circadian tools, environmental interventions, substances and red flags in one decision-first map.',
  },
  {
    href: '/guides/sleep/best-supplements-for-sleep/',
    title: 'Best Supplements for Sleep',
    desc: 'The evidence-graded supplement overview — start here if your question is specifically about supplements.',
  },
  {
    href: '/articles/cbt-i-vs-sleep-supplements/',
    title: 'CBT-I vs Sleep Supplements',
    desc: 'The evidence hierarchy for chronic insomnia before you add another bedtime product.',
  },
  {
    href: '/articles/insomnia-vs-sleep-deprivation/',
    title: 'Insomnia vs Sleep Deprivation',
    desc: 'Same exhausted feeling, different bottleneck: can you sleep, or are you simply not getting enough opportunity?',
  },
  {
    href: '/articles/melatonin-timing-vs-dose/',
    title: 'Melatonin Timing vs Dose',
    desc: 'Why clock timing, indication and formulation can matter as much as milligrams.',
  },
  {
    href: '/articles/why-sleep-studies-disagree/',
    title: 'Why Sleep Studies Disagree',
    desc: 'A research-literacy map for endpoints, formulations, populations, measurements and conflicting meta-analyses.',
  },
]

const COMPARISONS: GuideCard[] = [
  {
    href: '/guides/sleep/magnesium-vs-melatonin/',
    title: 'Magnesium vs Melatonin',
    desc: 'Nervous-system calm vs circadian timing — which problem is yours?',
  },
  {
    href: '/guides/sleep/magnesium-glycinate-vs-l-threonate-for-sleep/',
    title: 'Magnesium Glycinate vs L-Threonate',
    desc: 'Simple, lower-cost first trial vs premium cognition-branded magnesium.',
  },
  {
    href: '/guides/sleep/sleep-herbs-vs-melatonin/',
    title: 'Sleep Herbs vs Melatonin',
    desc: 'Valerian, passionflower and lemon balm compared to melatonin.',
  },
  {
    href: '/guides/sleep/ashwagandha-vs-magnesium-for-sleep/',
    title: 'Ashwagandha vs Magnesium for Sleep',
    desc: 'Stress-driven insomnia vs physical tension.',
  },
  {
    href: '/guides/sleep/magnesium-types-for-sleep/',
    title: 'Magnesium Types for Sleep',
    desc: 'Glycinate vs citrate vs threonate vs oxide, ranked for sleep.',
  },
]

const RESEARCH_ARTICLES: GuideCard[] = [
  {
    href: '/articles/saffron-for-sleep/',
    title: 'Saffron for Sleep',
    desc: 'Meta-analyses, randomized trials, and the newer 2025 moderate-insomnia study — with effect-size limits intact.',
  },
  {
    href: '/articles/tart-cherry-for-sleep/',
    title: 'Tart Cherry for Sleep',
    desc: 'The 2025 systematic review, small positive insomnia pilots, and recent null trials compared side by side.',
  },
  {
    href: '/articles/chamomile-for-sleep/',
    title: 'Chamomile for Sleep',
    desc: 'What the 2024 meta-analysis actually found, including outcomes that did not improve.',
  },
  {
    href: '/articles/lavender-for-sleep/',
    title: 'Lavender for Sleep',
    desc: 'The 2026 meta-analysis of 11 randomized trials, with aromatherapy, measurement and formulation limits preserved.',
  },
  {
    href: '/articles/passionflower-for-sleep/',
    title: 'Passionflower for Sleep',
    desc: 'Direct insomnia PSG evidence, the older tea trial and the newer standardized-extract RCT separated by endpoint and formulation.',
  },
  {
    href: '/articles/lemon-balm-for-sleep/',
    title: 'Lemon Balm for Sleep',
    desc: 'Newer standardized-extract RCTs look promising, while combination trials and formulation differences keep the verdict cautious.',
  },
  {
    href: '/articles/l-tryptophan-for-sleep/',
    title: 'L-Tryptophan for Sleep',
    desc: 'Why the modern synthesis points more toward wake-after-sleep-onset than a blanket sleep-latency claim.',
  },
  {
    href: '/articles/5-htp-for-sleep/',
    title: '5-HTP for Sleep',
    desc: 'A small 2024 older-adult RCT, very limited insomnia evidence, and the serotonergic safety context.',
  },
  {
    href: '/articles/oral-gaba-for-sleep/',
    title: 'Oral GABA for Sleep',
    desc: 'The systematic review still calls the sleep evidence very limited; newer small RCTs add signals without settling efficacy.',
  },
  {
    href: '/articles/omega-3-and-sleep/',
    title: 'Omega-3 and Sleep',
    desc: 'A newer positive RCT meta-analysis versus an earlier adult-null synthesis, separated by endpoint instead of flattened into one claim.',
  },
  {
    href: '/articles/vitamin-d-and-sleep/',
    title: 'Vitamin D and Sleep',
    desc: 'Meta-analytic sleep-quality signals with uncertain effects on sleep quantity and disorders — a nutrient-status question, not a sedative.',
  },
  {
    href: '/articles/hops-for-sleep/',
    title: 'Hops for Sleep',
    desc: 'Mostly valerian+hops combination evidence, including a small 2025 feasibility RCT that cannot establish a standalone hops effect.',
  },
  {
    href: '/articles/sleep-supplement-formulations/',
    title: 'Why Formulations Are Not Interchangeable',
    desc: 'Why one magnesium salt, branded extract, juice, tea, or proprietary blend cannot validate an entire ingredient class.',
  },
]

const CORE_SLEEP_SCIENCE: GuideCard[] = [
  {
    href: '/articles/sleep-interventions-evidence-matrix/',
    title: 'Sleep Interventions Evidence Matrix',
    desc: 'A fast map of evidence position, best-supported role, main signal and biggest limitation across the sleep cluster.',
  },
  {
    href: '/articles/sleep-onset-vs-sleep-maintenance/',
    title: 'Sleep Onset vs Sleep Maintenance',
    desc: 'SOL, WASO, total sleep time and sleep efficiency — learn which endpoint a study actually changed.',
  },
  {
    href: '/articles/subjective-vs-objective-sleep/',
    title: 'Subjective vs Objective Sleep',
    desc: 'Why insomnia can feel severe even when polysomnography or wearable changes look smaller.',
  },
  {
    href: '/articles/why-sleep-studies-disagree/',
    title: 'Why Sleep Studies Disagree',
    desc: 'Nine reasons apparently conflicting trials can be answering different questions rather than cancelling each other out.',
  },
  {
    href: '/articles/sleep-trackers-accuracy/',
    title: 'How Accurate Are Sleep Trackers?',
    desc: 'The 2025–2026 evidence on wearables, actigraphy, sleep stages and systematic measurement bias.',
  },
  {
    href: '/articles/sleep-inertia-grogginess-after-waking/',
    title: 'Sleep Inertia After Waking',
    desc: 'Why post-waking grogginess is a measurable performance state and why short naps do not guarantee avoiding it.',
  },
  {
    href: '/articles/insomnia-vs-sleep-deprivation/',
    title: 'Insomnia vs Sleep Deprivation',
    desc: 'Same tired feeling, different bottleneck: adequate sleep opportunity is the key distinction.',
  },
]

const CIRCADIAN_AND_SCHEDULE: GuideCard[] = [
  {
    href: '/articles/night-owl-chronotype-vs-delayed-sleep-phase/',
    title: 'Night Owl vs Delayed Sleep Phase Disorder',
    desc: 'A late chronotype is not automatically a disorder; impairment and schedule conflict are what change the interpretation.',
  },
  {
    href: '/articles/delayed-sleep-wake-phase-vs-insomnia/',
    title: 'Delayed Sleep Phase vs Insomnia',
    desc: 'When sleep is relatively normal on a later schedule, the biological clock may be a better target than stronger sedation.',
  },
  {
    href: '/articles/shift-work-sleep-disorder/',
    title: 'Shift Work Sleep Disorder',
    desc: 'The 2025–2026 guidance on naps, light, caffeine, melatonin, meal timing and fixed versus rotating nights.',
  },
  {
    href: '/articles/teen-sleep-and-school-start-times/',
    title: 'Teen Sleep and School Start Times',
    desc: 'The 2026 meta-analysis and randomized school-delay evidence on sleep duration, social jet lag and why later starts do not treat every teen sleep problem.',
  },
  {
    href: '/articles/morning-light-and-sleep-timing/',
    title: 'Morning Light and Sleep Timing',
    desc: 'Circadian phase shifting, recent insomnia meta-analyses, and why the clock time of light exposure changes its effect.',
  },
  {
    href: '/articles/melatonin-timing-vs-dose/',
    title: 'Melatonin Timing vs Dose',
    desc: 'The 2024 dose-response meta-analysis and 2026 review-of-reviews explain why timing, indication and formulation matter alongside milligrams.',
  },
  {
    href: '/articles/blue-light-screens-and-sleep/',
    title: 'Blue Light, Screens and Sleep',
    desc: 'Mechanism is real, intervention evidence is mixed, and bedtime screens affect sleep through more than wavelength alone.',
  },
  {
    href: '/articles/sleep-regularity-health/',
    title: 'Sleep Regularity',
    desc: 'Why day-to-day timing stability is emerging as a sleep-health dimension separate from duration.',
  },
  {
    href: '/articles/weekend-catch-up-sleep/',
    title: 'Weekend Catch-Up Sleep',
    desc: 'Partial recovery versus social jet lag: why sleeping in can help without fully erasing chronic sleep debt.',
  },
  {
    href: '/articles/naps-and-nighttime-sleep/',
    title: 'Naps and Nighttime Sleep',
    desc: 'Sleep pressure, nap timing, cognitive benefits and the very different logic of shift-work napping.',
  },
  {
    href: '/articles/exercise-timing-and-sleep/',
    title: 'Exercise Timing and Sleep',
    desc: 'The 2026 morning-vs-evening review: flexible timing, with intensity and proximity to bed as bigger variables.',
  },
  {
    href: '/articles/time-restricted-eating-and-sleep/',
    title: 'Time-Restricted Eating and Sleep',
    desc: 'Recent meta-analyses disagree: controlled trials do not establish a dependable sleep benefit from fasting windows.',
  },
]

const ENVIRONMENT_AND_NON_DRUG: GuideCard[] = [
  {
    href: '/articles/sleep-environment-evidence-guide/',
    title: 'Sleep Environment Evidence Guide',
    desc: 'A decision-first map for light, noise, heat, ventilation, air quality and sleep position before adding another compound.',
  },
  {
    href: '/articles/eye-masks-earplugs-and-sleep/',
    title: 'Eye Masks, Earplugs, and Sleep',
    desc: 'The strongest evidence comes from bright, noisy clinical environments; eye masks and combined use outperform earplugs alone more consistently.',
  },
  {
    href: '/articles/bedroom-air-quality-ventilation-and-sleep/',
    title: 'Bedroom Air Quality and Sleep',
    desc: 'Small controlled studies suggest a ventilation signal, while CO₂ remains partly a marker of occupancy and air exchange rather than a universal sleep threshold.',
  },
  {
    href: '/articles/sleep-temperature-and-cooling/',
    title: 'Sleep Temperature and Cooling',
    desc: 'Heat reliably matters, but randomized cooling-bedding evidence does not support assuming every cooling product improves sleep.',
  },
  {
    href: '/articles/warm-bath-shower-before-bed/',
    title: 'Warm Bath or Shower Before Bed',
    desc: 'A meta-analytic sleep-onset signal that complements—not contradicts—cool-bedroom thermoregulation evidence.',
  },
  {
    href: '/articles/white-noise-and-sleep/',
    title: 'White Noise and Sleep',
    desc: 'A newer positive RCT meta-analysis updates—but does not erase—the older very-low-certainty review.',
  },
  {
    href: '/articles/music-for-sleep/',
    title: 'Music for Sleep',
    desc: 'Moderate Cochrane evidence for subjective sleep quality, with much weaker objective sleep changes and no proven magic frequency.',
  },
  {
    href: '/articles/weighted-blankets-for-sleep/',
    title: 'Weighted Blankets for Sleep',
    desc: 'Promising adult insomnia data, weaker objective findings and pooled estimates that remain sensitive to study selection.',
  },
  {
    href: '/articles/mindfulness-for-insomnia/',
    title: 'Mindfulness for Insomnia',
    desc: 'Why improvement versus waitlist is not the same as an advantage over active controls or full CBT-I.',
  },
  {
    href: '/articles/sleep-position-osa-and-reflux/',
    title: 'Sleep Position: OSA and Reflux',
    desc: 'No universal best side: nonsupine sleep can help positional OSA, while left-side sleeping has direct evidence for nocturnal reflux.',
  },
]

const SUBSTANCES_AND_OTC: GuideCard[] = [
  {
    href: '/articles/caffeine-and-sleep-timing/',
    title: 'Caffeine and Sleep Timing',
    desc: 'Dose × timing evidence, including newer controlled trials and meta-analyses of sleep disruption.',
  },
  {
    href: '/articles/alcohol-and-sleep/',
    title: 'Alcohol and Sleep',
    desc: 'Why faster sedation does not equal better sleep, including the 2025 dose-response REM meta-analysis.',
  },
  {
    href: '/articles/cannabis-cannabinoids-and-sleep/',
    title: 'Cannabis and Sleep',
    desc: 'Randomized insomnia signals, weak CBD-only results, objective sleep-architecture limits and recreational-use contradictions.',
  },
  {
    href: '/articles/nicotine-vaping-and-sleep/',
    title: 'Nicotine, Vaping and Sleep',
    desc: 'Vaping associations, withdrawal, and why temporary quit-related insomnia does not mean nicotine improves sleep.',
  },
  {
    href: '/articles/otc-antihistamines-for-sleep/',
    title: 'OTC Antihistamines for Sleep',
    desc: 'Why diphenhydramine and doxylamine sedation is not the same as strong chronic-insomnia treatment evidence.',
  },
]

const LIFE_STAGES_AND_COMORBIDITY: GuideCard[] = [
  {
    href: '/articles/teen-adolescent-sleep/',
    title: 'Teen and Adolescent Sleep',
    desc: 'Circadian delay, school schedules, adolescent insomnia, CBT-I, light and melatonin belong in one age-specific evidence framework.',
  },
  {
    href: '/articles/menopause-and-sleep/',
    title: 'Menopause and Sleep',
    desc: 'Hot flashes, chronic insomnia, CBT-I, hormone-therapy sleep effects, sleep apnea and restless legs need different treatment logic.',
  },
  {
    href: '/articles/pregnancy-postpartum-and-sleep/',
    title: 'Pregnancy & Postpartum Sleep',
    desc: 'Pregnancy-specific CBT-I, sleep-disorder screening, postpartum sleep opportunity and stricter supplement-safety boundaries.',
  },
  {
    href: '/articles/chronic-pain-and-sleep/',
    title: 'Chronic Pain and Sleep',
    desc: 'Sleep and pain can reinforce each other, while treating insomnia does not automatically produce a large reduction in pain intensity.',
  },
  {
    href: '/articles/sleep-in-older-adults/',
    title: 'Sleep in Older Adults',
    desc: 'Normal aging changes sleep, but persistent insomnia, sleep apnea, restless legs and medication effects still need their own evidence pathways.',
  },
]

const WHEN_SUPPLEMENTS_ARE_NOT_THE_MAIN_QUESTION: GuideCard[] = [
  {
    href: '/articles/cbt-i-vs-sleep-supplements/',
    title: 'CBT-I vs Sleep Supplements',
    desc: 'For chronic insomnia, CBT-I is the evidence benchmark; supplements answer narrower questions.',
  },
  {
    href: '/articles/sleep-apnea-vs-insomnia/',
    title: 'Sleep Apnea vs Insomnia',
    desc: 'COMISA can combine insomnia with obstructive sleep apnea, and sedation does not treat airway obstruction.',
  },
  {
    href: '/articles/mouth-taping-for-sleep/',
    title: 'Mouth Taping for Sleep',
    desc: 'A viral sleep hack with narrow evidence, important nasal-obstruction safety limits, and a very different role in selected CPAP users.',
  },
  {
    href: '/articles/restless-legs-iron-and-sleep/',
    title: 'Restless Legs, Iron and Sleep',
    desc: 'Why RLS can masquerade as insomnia and why AASM guidance centers ferritin and transferrin saturation rather than blind iron use.',
  },
]

const ALL_GUIDES = [
  { slug: 'best-supplements-for-sleep', title: 'Best Supplements for Sleep' },
  { slug: 'best-natural-sleep-aids-that-work', title: 'Best Natural Sleep Aids That Work' },
  { slug: 'magnesium-for-sleep', title: 'Magnesium for Sleep' },
  { slug: 'best-magnesium-for-sleep', title: 'Best Magnesium for Sleep' },
  { slug: 'magnesium-types-for-sleep', title: 'Magnesium Types for Sleep' },
  { slug: 'magnesium-glycinate-vs-l-threonate-for-sleep', title: 'Magnesium Glycinate vs L-Threonate for Sleep' },
  { slug: 'glycine-for-sleep', title: 'Glycine for Sleep' },
  { slug: 'apigenin-for-sleep', title: 'Apigenin for Sleep' },
  { slug: 'l-theanine-for-sleep', title: 'L-Theanine for Sleep' },
  { slug: 'ashwagandha-for-sleep', title: 'Ashwagandha for Sleep' },
  { slug: 'best-herbs-for-sleep', title: 'Best Herbs for Sleep' },
  { slug: 'rhodiola-sleep-stack', title: 'Rhodiola Sleep Stack' },
  { slug: 'sleep-stack-guide', title: 'Sleep Stack Guide' },
  { slug: 'sleep-stack-magnesium-melatonin', title: 'Magnesium + Melatonin Sleep Stack' },
  { slug: 'magnesium-vs-melatonin', title: 'Magnesium vs Melatonin' },
  { slug: 'sleep-herbs-vs-melatonin', title: 'Sleep Herbs vs Melatonin' },
  { slug: 'ashwagandha-vs-magnesium-for-sleep', title: 'Ashwagandha vs Magnesium for Sleep' },
]

const ADHD_SLEEP = [
  { href: '/guides/adhd/sleep-and-adhd/', title: 'Sleep & ADHD' },
  { href: '/guides/adhd/melatonin-for-adhd-sleep/', title: 'Melatonin for ADHD Sleep' },
]

const DEPTH_LINKS = [
  { href: '/compounds/l-theanine-sleep/', title: 'L-Theanine for Sleep', kind: 'Compound profile' },
  { href: '/compounds/glycine-sleep/', title: 'Glycine for Sleep', kind: 'Compound profile' },
  { href: '/compounds/magnesium-glycinate/', title: 'Magnesium Glycinate', kind: 'Compound profile' },
  { href: '/compounds/tryptophan/', title: 'Tryptophan', kind: 'Compound profile' },
  { href: '/compounds/5-htp/', title: '5-HTP', kind: 'Compound profile' },
  { href: '/herbs/ashwagandha/', title: 'Ashwagandha', kind: 'Herb profile' },
  { href: '/herbs/valerian/', title: 'Valerian', kind: 'Herb profile' },
  { href: '/herbs/passiflora-incarnata/', title: 'Passionflower', kind: 'Herb profile' },
]

export default function SleepGuideIndex() {
  const schemaGraph = buildGuideHubSchemaGraph({
    path: '/guides/sleep/',
    title: 'Sleep Research, Supplement Guides & Natural Sleep Aids',
    description:
      'Choose the right sleep intervention based on what is actually keeping you awake: insomnia, circadian timing, environment, substances, shift work, or a supplement question.',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Guides', url: `${SITE_URL}/guides/` },
      { name: 'Sleep', url: `${SITE_URL}/guides/sleep/` },
    ],
    itemListName: 'Sleep Research and Evidence Guides',
    items: [
      ...ALL_GUIDES.map((g) => ({ name: g.title, url: `/guides/sleep/${g.slug}/` })),
      ...RESEARCH_ARTICLES.map((g) => ({ name: g.title, url: g.href })),
      ...CORE_SLEEP_SCIENCE.map((g) => ({ name: g.title, url: g.href })),
      ...CIRCADIAN_AND_SCHEDULE.map((g) => ({ name: g.title, url: g.href })),
      ...ENVIRONMENT_AND_NON_DRUG.map((g) => ({ name: g.title, url: g.href })),
      ...SUBSTANCES_AND_OTC.map((g) => ({ name: g.title, url: g.href })),
      ...LIFE_STAGES_AND_COMORBIDITY.map((g) => ({ name: g.title, url: g.href })),
      ...WHEN_SUPPLEMENTS_ARE_NOT_THE_MAIN_QUESTION.map((g) => ({ name: g.title, url: g.href })),
    ],
  })

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-8">
      <SchemaGraphScript graph={schemaGraph} />
      <nav className="mb-4 text-xs text-muted">
        <Link href="/guides/" className="hover:text-ink">
          Guides
        </Link>
        <span className="mx-1.5">/</span>
        <span className="font-medium text-ink">Sleep</span>
      </nav>

      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Sleep Research & Supplement Guides</h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-muted">
          Start with the actual sleep problem, not the product. Compare supplements, insomnia care,
          circadian timing, environmental tools, substances, shift work and sleep measurement in one evidence-first hub.
        </p>
      </header>

      <section className="mb-12">
        <HubSectionHeading
          eyebrow="Start here"
          title="What is actually getting in the way of sleep?"
          sub="Pick the closest pattern. The router points to the mechanism before the intervention."
        />
        <DecisionRouter items={START_HERE} />
      </section>

      <section className="mb-12">
        <HubSectionHeading eyebrow="Best first reads" title="If you only read a few" />
        <GuideCardGrid cards={BEST_FIRST} />
      </section>

      <section className="mb-12">
        <HubSectionHeading
          eyebrow="Comparisons"
          title="Deciding between two options?"
          sub="These make a clear call instead of saying “both may help.”"
        />
        <GuideCardGrid cards={COMPARISONS} />
      </section>

      <section className="mb-12">
        <HubSectionHeading
          eyebrow="Ingredient research"
          title="Evidence reviews beyond the usual shortlist"
          sub="Systematic reviews, randomized trials, null findings and safety limits kept in the same frame."
        />
        <GuideCardGrid cards={RESEARCH_ARTICLES} />
      </section>

      <section className="mb-12">
        <HubSectionHeading
          eyebrow="Core sleep science"
          title="Understand what the studies are actually measuring"
          sub="Evidence mapping, onset, maintenance, subjective versus objective sleep, trackers, post-waking grogginess and the difference between insomnia and insufficient sleep."
        />
        <GuideCardGrid cards={CORE_SLEEP_SCIENCE} />
      </section>

      <section className="mb-12">
        <HubSectionHeading
          eyebrow="Circadian & schedule"
          title="When clock timing matters more than sedation"
          sub="Chronotype, adolescent school schedules, delayed sleep phase, shift work, light, melatonin timing, regularity, catch-up sleep, naps, exercise and meal timing."
        />
        <GuideCardGrid cards={CIRCADIAN_AND_SCHEDULE} />
      </section>

      <section className="mb-12">
        <HubSectionHeading
          eyebrow="Environment & non-drug tools"
          title="Change the bedroom before adding another compound"
          sub="Light, sound, temperature, ventilation, position, warm bathing, music, weighted blankets and mindfulness — with the limits of each intervention kept visible."
        />
        <GuideCardGrid cards={ENVIRONMENT_AND_NON_DRUG} />
      </section>

      <section className="mb-12">
        <HubSectionHeading
          eyebrow="Substances & OTC"
          title="Sedation, stimulation and sleep are not the same thing"
          sub="Caffeine, alcohol, cannabis, nicotine and OTC antihistamines can all change sleep — often differently from how they feel in the moment."
        />
        <GuideCardGrid cards={SUBSTANCES_AND_OTC} />
      </section>

      <section className="mb-12">
        <HubSectionHeading
          eyebrow="Life stages & comorbidity"
          title="When the sleep problem changes with the person"
          sub="Adolescence, menopause, pregnancy and postpartum sleep, chronic pain, and older-adult sleep each change the evidence hierarchy, safety boundaries, or underlying bottleneck."
        />
        <GuideCardGrid cards={LIFE_STAGES_AND_COMORBIDITY} />
      </section>

      <section className="mb-12">
        <HubSectionHeading
          eyebrow="Check the bottleneck"
          title="When another supplement may be the wrong next move"
          sub="Persistent insomnia, abnormal breathing, viral airway hacks and restless legs each have evidence pathways that a larger sleep stack can miss."
        />
        <GuideCardGrid cards={WHEN_SUPPLEMENTS_ARE_NOT_THE_MAIN_QUESTION} />
      </section>

      <section className="mb-12">
        <HubSectionHeading eyebrow="ADHD & sleep" title="ADHD-related sleep problems" />
        <div className="flex flex-wrap gap-3">
          {ADHD_SLEEP.map((g) => (
            <Link
              key={g.href}
              href={g.href}
              className="rounded-full border border-brand-900/12 bg-white px-4 py-2 text-sm font-semibold text-brand-800 transition hover:border-brand-700/30 hover:bg-brand-50 dark:border-white/10 dark:bg-[var(--surface-card)] dark:text-[var(--text-primary)]"
            >
              {g.title} →
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-12 rounded-xl border-l-4 border-brand-700/40 bg-brand-50/60 p-5 dark:bg-[var(--surface-subtle)]">
        <p className="text-sm leading-7 text-ink dark:text-[var(--text-secondary)]">
          <span className="font-bold">A note on matching the tool to the problem.</span> Supplements are
          most useful to evaluate in the context of the actual sleep issue. L-theanine, magnesium,
          ashwagandha, and melatonin have different evidence, safety considerations, and plausible
          roles — they are not interchangeable. None replaces consistent sleep opportunity or care for
          a diagnosed sleep disorder. Review the{' '}
          <Link href="/info/supplement-safety-checklist/" className="font-semibold text-brand-800 underline">
            supplement safety checklist
          </Link>{' '}
          before starting a new product, and use the{' '}
          <Link href="/learn/evidence-literacy/" className="font-semibold text-brand-800 underline">
            evidence literacy guide
          </Link>{' '}
          to interpret study claims.
        </p>
      </section>

      <section className="mb-12">
        <HubSectionHeading
          eyebrow="Research deeper"
          title="Sleep ingredient profiles"
          sub="Use these monographs after choosing a guide to check safety notes, evidence context, and related compounds."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DEPTH_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl border border-brand-900/12 bg-white p-4 transition hover:border-brand-700/30 hover:bg-brand-50 dark:border-white/10 dark:bg-[var(--surface-card)] dark:hover:bg-white/10"
            >
              <span className="block text-[11px] font-bold uppercase tracking-widest text-muted">{link.kind}</span>
              <span className="mt-1 block text-sm font-semibold text-brand-800 dark:text-[var(--text-primary)]">
                {link.title} →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <HubSectionHeading eyebrow="Full library" title="All supplement guide pages" />
        <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {ALL_GUIDES.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/guides/sleep/${g.slug}/`}
                className="text-sm font-medium text-brand-800 hover:underline dark:text-[var(--text-primary)]"
              >
                {g.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
