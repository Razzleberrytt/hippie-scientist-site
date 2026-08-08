import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import StructuredData from '@/components/StructuredData'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import EmailCapture from '@/components/EmailCapture'
import References from '@/components/References'
import ResponsiveTable from '@/components/ui/ResponsiveTable'
import { buildPageMetadata, SITE_URL } from '@/src/lib/seo'

const PATH = '/guides/focus/best-nootropics-for-focus'
const TITLE = 'Best Nootropics for Focus: Evidence by Goal'
const DESCRIPTION =
  'Compare focus nootropics by the outcome actually studied: acute attention, long-term memory, stress-related fatigue, or population-specific memory support—with safety and evidence limits.'

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  image: '/images/guides/best-nootropics-for-focus.jpg',
  openGraphType: 'article',
})

const HEADINGS: Heading[] = [
  { id: 'quick-answer', text: 'Quick answer', level: 2 },
  { id: 'decision-map', text: 'Choose by the real outcome', level: 2 },
  { id: 'evidence-profiles', text: 'Evidence profiles', level: 2 },
  { id: 'study-context', text: 'Study context, not protocols', level: 2 },
  { id: 'trial-design', text: 'How to test one safely', level: 2 },
  { id: 'product-quality', text: 'Product-quality checklist', level: 2 },
  { id: 'faq', text: 'Frequently asked questions', level: 2 },
]

const FAQS = [
  {
    question: 'What is the best nootropic for focus?',
    answer:
      'There is no universal winner. For a short demanding task, already-tolerated caffeine—sometimes paired with L-theanine—has the most direct acute attention evidence, but effects are small or task-specific and caffeine can worsen sleep, anxiety, blood pressure, and palpitations. Bacopa is better framed as a long-term memory option, not an immediate focus aid. The other ingredients on this page remain more population-specific or experimental.',
  },
  {
    question: 'Do natural nootropics reliably improve attention in healthy adults?',
    answer:
      'Not reliably. A 2025 network meta-analysis of natural extracts found that none significantly outperformed placebo for attention in healthy adults. Individual trials can report positive tasks or subgroups, but that is different from a dependable, broad focus effect.',
  },
  {
    question: 'Can nootropics replace ADHD medication or assessment?',
    answer:
      'No. A supplement guide for healthy-adult cognition does not establish treatment for ADHD, depression, anxiety, sleep disorders, or another medical cause of persistent concentration problems. Do not use a stack to delay appropriate assessment or prescribed care.',
  },
  {
    question: 'Should I combine several nootropics?',
    answer:
      'Starting several products together makes benefits, side effects, and interactions difficult to attribute. Define one measurable target, establish a baseline, change one variable, and set a review and stop date before considering another ingredient.',
  },
  {
    question: 'How long do nootropics take to work?',
    answer:
      'It depends on the studied outcome. Caffeine and L-theanine trials usually measure effects within hours. Bacopa memory trials generally run about 12 weeks. Citicoline, lion’s mane, rhodiola, and phosphatidylserine findings come from different populations, products, and durations, so a universal timeline is not evidence-based.',
  },
  {
    question: 'What is the safest nootropic?',
    answer:
      'There is no universally safest option. Risk depends on dose, product identity, caffeine sensitivity, cardiovascular and mood history, allergies, pregnancy, medications, sleep, and whether the ingredient is being combined with other stimulating or sedating products.',
  },
]

const DECISION_ROWS = [
  [
    'Short-term alertness during a demanding task',
    'Caffeine, optionally paired with L-theanine when caffeine is already tolerated',
    'Selected acute attention and reaction-time outcomes in healthy adults',
    'The effect is task-specific; L-theanine does not erase caffeine-related sleep, anxiety, heart-rate, or blood-pressure risk.',
  ],
  [
    'Memory over months rather than same-day focus',
    'Bacopa monnieri',
    'The clearest signal is memory free recall after sustained use',
    'Evidence for attention and broader cognitive enhancement is weaker; extracts and bacoside standardization vary.',
  ],
  [
    'Age-associated memory complaint',
    'Citicoline may be considered as a population-specific option',
    'A positive randomized trial exists in adults ages 50–85 with age-associated memory impairment',
    'That manufacturer-affiliated trial does not establish an immediate focus benefit in healthy young adults.',
  ],
  [
    'Concentration that collapses with stress or fatigue',
    'Address sleep, workload, mood, medical causes, and stimulant load first',
    'Rhodiola research is contradictory and methodologically limited',
    'A placebo-controlled trial in nursing students found fatigue outcomes favoring placebo.',
  ],
  [
    'Experimental mushroom-based cognitive support',
    'Lion’s mane',
    'Small pilot trials report isolated positive tasks or trends',
    'Samples are small, findings are mixed, and product composition is not interchangeable across fruiting-body and mycelium extracts.',
  ],
  [
    'Stress-buffering or older-adult memory context',
    'Phosphatidylserine',
    'Small studies and combination products provide limited population-specific signals',
    'The evidence does not support ranking standalone phosphatidylserine as a reliable general focus enhancer.',
  ],
] as const

const NOOTROPICS = [
  {
    name: 'L-Theanine + Caffeine',
    href: '/guides/focus/l-theanine-without-caffeine/',
    label: 'Most defensible acute option',
    role: 'Selected short-term attention, alertness, and reaction-time tasks in healthy adults.',
    evidence:
      'A 2025 systematic review included 50 randomized trials and found small-to-moderate differences on selected outcomes, while confidence intervals often showed uncertainty about direction or magnitude. A separate 2026 L-theanine meta-analysis reported an acute choice-reaction-time benefit, but its clinical relevance outside test settings remains uncertain.',
    boundary:
      'The evidence is not ADHD treatment evidence, not proof of all-day productivity, and not proof that L-theanine neutralizes caffeine side effects. Several tea and branded-ingredient studies have industry involvement, which belongs in the interpretation.',
    studyContext:
      'Trials use different caffeine-to-theanine ratios and usually assess performance within one or two hours. Those study doses should not be converted into a universal daily stack.',
    safety:
      'Caffeine can worsen insomnia, anxiety, tremor, reflux, palpitations, and blood pressure. Count coffee, tea, energy drinks, pre-workout, medications, and supplements together.',
  },
  {
    name: 'Bacopa Monnieri',
    href: '/herbs/bacopa/',
    label: 'Memory—not acute focus',
    role: 'Long-term memory acquisition and free recall when a delayed evaluation period is acceptable.',
    evidence:
      'A systematic review of six randomized trials found that all studies lasted 12 weeks and that the most consistent positive findings were in memory free recall. Evidence for other cognitive domains was sparse. A newer network meta-analysis in healthy adults expands the evidence base but does not turn bacopa into a same-day attention aid.',
    boundary:
      'Bacopa should not be marketed as a stimulant-like focus booster. Benefits depend on extract identity, population, outcome, and sustained adherence; newer positive branded-extract trials do not automatically generalize to every bottle.',
    studyContext:
      'Historical trials commonly used standardized extracts for roughly 12 weeks. The extract and bacoside profile matter more than copying one milligram number across products.',
    safety:
      'GI effects are common enough to affect adherence. Fatigue or sedation can occur. Review thyroid, cholinergic, pregnancy, and medication context before use.',
  },
  {
    name: 'Citicoline (CDP-Choline)',
    href: '/compounds/cdp-choline/',
    label: 'Population-specific',
    role: 'Memory support in selected older or clinically studied populations—not an immediate stimulant substitute.',
    evidence:
      'A randomized trial in 100 adults ages 50–85 with age-associated memory impairment reported memory benefits after 12 weeks. The investigators included employees or partners of the branded citicoline manufacturer, and the population was not healthy young adults seeking sharper same-day focus.',
    boundary:
      'Choline-pathway plausibility is not enough to claim broad cognitive enhancement. Evidence for healthy young adults, persistent inattention, and acute work performance is much thinner than product marketing implies.',
    studyContext:
      'Use the population, duration, branded ingredient, and measured memory outcomes as context—not as a universal protocol.',
    safety:
      'Headache, GI symptoms, restlessness, and insomnia can occur. Avoid casually stacking multiple cholinergic products, and review medication or neurologic context with a clinician.',
  },
  {
    name: 'Rhodiola Rosea',
    href: '/herbs/rhodiola/',
    label: 'Contradictory fatigue evidence',
    role: 'An experimental option when perceived stress or fatigue—not baseline attention—is the clearly defined target.',
    evidence:
      'A systematic review found contradictory results and judged all included fatigue studies to have high risk of bias or reporting problems. A later randomized trial in nursing students found fatigue changes that favored placebo rather than rhodiola.',
    boundary:
      'Rhodiola is not a reliably proven focus enhancer. Exercise-performance findings and preclinical memory mechanisms do not establish better concentration during ordinary cognitive work.',
    studyContext:
      'Products differ in extract composition and rosavin/salidroside standardization, making cross-product dose claims unreliable.',
    safety:
      'It can feel activating and may worsen agitation or sleep. Review bipolar-spectrum risk, psychiatric medication, blood pressure, and stimulant combinations.',
  },
  {
    name: 'Lion’s Mane (Hericium erinaceus)',
    href: '/herbs/lions-mane/',
    label: 'Early and experimental',
    role: 'A research-stage option for people comfortable with uncertain, product-specific evidence.',
    evidence:
      'A 2023 pilot trial in 41 healthy adults found one faster Stroop outcome and a trend toward lower stress, alongside null and limited negative findings. A newer acute crossover study included only 18 healthy younger adults. These are useful signals for future research, not a reliable ranking claim.',
    boundary:
      'Fruiting-body, mycelium, erinacine, hericenone, and extraction differences matter. Preclinical neurotrophic mechanisms and dementia studies cannot be silently converted into a healthy-adult focus promise.',
    studyContext:
      'The human studies use different preparations and durations. “Lion’s mane” on a front label does not show equivalence to a studied extract.',
    safety:
      'Avoid with mushroom allergy and stop for allergic, respiratory, or skin symptoms. Long-term extract and medication-interaction data remain limited.',
  },
  {
    name: 'Phosphatidylserine',
    href: '/compounds/phosphatidylserine/',
    label: 'Product- and population-specific',
    role: 'Stress-response or memory questions in selected populations rather than broad everyday focus enhancement.',
    evidence:
      'Small studies have examined induced stress, older adults with memory complaints, or formulas that combine phosphatidylserine with other active ingredients. One induced-stress study included only 16 healthy participants. Combination trials cannot isolate phosphatidylserine’s contribution.',
    boundary:
      'Membrane biology and stress-hormone findings do not establish a dependable attention benefit. Source material, combination ingredients, age, and baseline impairment change what a result can mean.',
    studyContext:
      'Do not copy doses from combination products as though they were standalone phosphatidylserine trials.',
    safety:
      'GI effects and insomnia are possible. Check soy or other source allergens and review anticoagulant, cholinergic, and medication context.',
  },
] as const

const TRIAL_STEPS = [
  [
    'Name one outcome',
    'Use a measurable target such as reaction time on a defined task, fatigue during a recurring shift, or delayed memory recall—not “optimize my brain.”',
  ],
  [
    'Record the baseline',
    'Track the target, sleep, caffeine intake, anxiety, and adverse symptoms before changing anything. Otherwise normal variation can look like an effect.',
  ],
  [
    'Change one variable',
    'A multi-ingredient stack prevents attribution and can hide excess caffeine, overlapping stimulation, sedation, or cholinergic effects.',
  ],
  [
    'Match the review date to the evidence',
    'Acute caffeine/theanine questions can be evaluated quickly. A bacopa memory question requires a much longer window. Do not use one timeline for every ingredient.',
  ],
  [
    'Define the stop rule',
    'Stop for concerning cardiovascular, allergic, GI, sleep, or mood effects, and end a trial that produces no meaningful benefit by the review date.',
  ],
] as const

const REFERENCES = [
  {
    n: 1,
    text: 'Payne ER, et al. Tea, L-theanine, and L-theanine plus caffeine for cognition, sleep, and mood: systematic review and meta-analysis. 2025. PMID: 40314930.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/40314930/',
  },
  {
    n: 2,
    text: 'Gerolymos C, et al. Cognitive and affective effects of L-theanine: systematic review and meta-analysis of 31 randomized trials. 2026. PMID: 42410082.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/42410082/',
  },
  {
    n: 3,
    text: 'Pase MP, et al. Cognitive-enhancing effects of Bacopa monnieri: systematic review of randomized controlled human trials. 2012. PMID: 22747190.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/22747190/',
  },
  {
    n: 4,
    text: 'Comparative effects of Bacopa monnieri and Ginkgo biloba on cognitive functions: systematic review and network meta-analysis. 2026. PMID: 41678913.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/41678913/',
  },
  {
    n: 5,
    text: 'Nakazaki E, et al. Citicoline and memory function in healthy older adults: randomized placebo-controlled trial. 2021. PMID: 33978188.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/33978188/',
  },
  {
    n: 6,
    text: 'Ishaque S, et al. Rhodiola rosea for physical and mental fatigue: systematic review. 2012. PMID: 22643043.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/22643043/',
  },
  {
    n: 7,
    text: 'Punja S, et al. Rhodiola rosea for mental and physical fatigue in nursing students: randomized controlled trial. 2014. PMID: 25268730.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/25268730/',
  },
  {
    n: 8,
    text: 'Docherty S, et al. Acute and chronic lion’s mane supplementation in young adults: double-blind pilot study. 2023. PMID: 38004235.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/38004235/',
  },
  {
    n: 9,
    text: 'Acute effects of a standardized lion’s mane extract on cognition and mood in healthy younger adults: randomized crossover study. 2025. PMID: 40276537.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/40276537/',
  },
  {
    n: 10,
    text: 'Baumeister J, et al. Phosphatidylserine, cognitive performance, and cortical activity after induced stress. 2008. PMID: 18616866.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/18616866/',
  },
  {
    n: 11,
    text: 'Effects of natural extracts on cognitive function in healthy adults: systematic review and network meta-analysis. 2025. PMID: 40213691.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/40213691/',
  },
] as const

export default function BestNootropicsForFocusPage() {
  const toc = <TableOfContents headings={HEADINGS} />

  return (
    <ArticleLayout toc={toc} zone="supplement">
      <StructuredData
        pageUrl={`${SITE_URL}${PATH}`}
        headline={TITLE}
        description={DESCRIPTION}
        datePublished="2026-06-16"
        dateModified="2026-08-02"
        image={`${SITE_URL}/images/guides/best-nootropics-for-focus.jpg`}
        faqs={FAQS}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides/' },
          { label: 'Focus Guides', href: '/guides/focus/' },
          { label: 'Best Nootropics for Focus', href: PATH },
        ]}
      />

      <div className="space-y-12">
        <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10">
          <p className="eyebrow-label">Outcome-specific evidence guide</p>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
            Best Nootropics for Focus?
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
            “Focus” can mean acute alertness, memory over months, resistance to fatigue, or concentration that is
            being disrupted by sleep, anxiety, ADHD, medication, or illness. Those are different problems. This
            guide ranks the decision confidence—not the marketing excitement—behind six common options.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold">
            <Link href="/guides/focus/" className="text-brand-700 hover:underline">
              Focus evidence hub →
            </Link>
            <Link href="/guides/focus/focus-without-caffeine-crash/" className="text-brand-700 hover:underline">
              Caffeine-crash alternatives →
            </Link>
            <Link href="/guides/adhd/adhd-supplements/" className="text-brand-700 hover:underline">
              ADHD evidence boundary →
            </Link>
          </div>

          <figure className="mt-7">
            <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
              <Image
                src="/images/guides/best-nootropics-for-focus.jpg"
                alt="Nootropic ingredients arranged for an evidence comparison by attention, fatigue, and memory outcome"
                width={1536}
                height={1024}
                priority
                className="h-auto w-full"
              />
            </div>
            <figcaption className="mt-3 text-center text-sm text-muted">
              Match the ingredient to the measured outcome—not the word “nootropic” on the label.
            </figcaption>
          </figure>
        </section>

        <section id="quick-answer" className="scroll-mt-20 rounded-[1.65rem] border border-brand-200 bg-brand-50/60 p-6 shadow-sm sm:p-8">
          <p className="eyebrow-label">Quick answer</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            The strongest option depends on whether the target is attention or memory
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
            For selected short-term attention tasks, already-tolerated caffeine—sometimes paired with
            L-theanine—has the clearest direct evidence, but effects are limited and caffeine risk still applies.
            Bacopa has a better long-term memory case than an acute-focus case. Citicoline is population-specific.
            Rhodiola, lion’s mane, and phosphatidylserine remain too inconsistent or indirect to call reliable
            general focus enhancers.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ['Acute task', 'Caffeine ± L-theanine, only when caffeine is already tolerated and sleep cost is counted.'],
              ['Memory over months', 'Bacopa has the clearest sustained-memory rationale, not a same-day productivity effect.'],
              ['Persistent concentration problems', 'Assess sleep, mood, ADHD, medication, substance use, and medical causes before building a stack.'],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-xl border border-brand-900/10 bg-white/80 p-4">
                <h3 className="text-sm font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-xs leading-6 text-muted">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="decision-map" className="scroll-mt-20 space-y-5">
          <div className="max-w-3xl">
            <p className="eyebrow-label">Decision map</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              Choose by the real outcome
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              A positive memory result in older adults is not proof of acute attention in a younger adult. A
              stress-hormone result is not automatically a focus result. A single positive computer task does not
              establish a broad productivity effect.
            </p>
          </div>
          <ResponsiveTable label="Nootropic decision map by focus-related outcome">
            <table className="min-w-[1040px] w-full text-left text-sm">
              <thead className="bg-brand-50/80">
                <tr className="border-b border-brand-900/10">
                  {['Actual target', 'Most relevant option', 'What the evidence addresses', 'Boundary'].map((heading) => (
                    <th key={heading} className="px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-brand-900">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-900/10 bg-white">
                {DECISION_ROWS.map(([target, option, evidence, boundary]) => (
                  <tr key={target} className="align-top">
                    <td className="px-4 py-4 font-semibold text-ink">{target}</td>
                    <td className="px-4 py-4 text-muted">{option}</td>
                    <td className="px-4 py-4 text-muted">{evidence}</td>
                    <td className="px-4 py-4 text-muted">{boundary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ResponsiveTable>
        </section>

        <section id="evidence-profiles" className="scroll-mt-20 space-y-6">
          <div className="max-w-3xl">
            <p className="eyebrow-label">Evidence profiles</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              Six popular options, without pretending they answer the same question
            </h2>
          </div>

          <div className="space-y-5">
            {NOOTROPICS.map((item) => (
              <article key={item.name} className="rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <Link href={item.href} className="text-xl font-semibold text-brand-800 hover:underline">
                    {item.name}
                  </Link>
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
                    {item.label}
                  </span>
                </div>
                <p className="mt-3 text-sm font-medium leading-6 text-ink">{item.role}</p>
                <div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
                  <div>
                    <h3 className="font-semibold text-ink">What the evidence shows</h3>
                    <p className="mt-2 leading-7 text-muted">{item.evidence}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink">What it does not show</h3>
                    <p className="mt-2 leading-7 text-muted">{item.boundary}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink">Study context</h3>
                    <p className="mt-2 leading-7 text-muted">{item.studyContext}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink">Safety lens</h3>
                    <p className="mt-2 leading-7 text-muted">{item.safety}</p>
                  </div>
                </div>
                <Link href={item.href} className="mt-4 inline-flex text-xs font-semibold text-brand-700 hover:underline">
                  Open related profile or guide →
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section id="study-context" className="scroll-mt-20 rounded-[1.65rem] border border-amber-900/15 bg-amber-50/70 p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-800">Study context—not protocols</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-amber-950">
            A dose in a trial is not a universal recommendation
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-amber-950/90">
            <p>
              Nootropic studies use different extracts, branded ingredients, populations, durations, cognitive
              batteries, caffeine backgrounds, and inclusion criteria. Copying one study dose while changing the
              product, goal, age group, or health context breaks the link to the evidence.
            </p>
            <p>
              This matters especially for bacopa standardization, lion’s mane fruiting-body versus mycelium
              preparations, rhodiola rosavin and salidroside profiles, branded citicoline, phosphatidylserine
              combination products, and caffeine that is already being consumed from other sources.
            </p>
            <p>
              Product-specific funding and investigator conflicts do not automatically invalidate a result, but
              they increase the value of independent replication. A buying guide should disclose that uncertainty
              instead of converting the newest positive trial into a category-wide promise.
            </p>
          </div>
        </section>

        <section id="trial-design" className="scroll-mt-20 space-y-5">
          <div className="max-w-3xl">
            <p className="eyebrow-label">N-of-1 discipline</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              How to test one safely
            </h2>
          </div>
          <ol className="space-y-4">
            {TRIAL_STEPS.map(([title, copy], index) => (
              <li key={title} className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm">
                <div className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-800">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-ink">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted">{copy}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="product-quality" className="scroll-mt-20 rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
          <p className="eyebrow-label">Before buying</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            Product-quality checklist
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              'Prefer a clearly disclosed single ingredient before a proprietary “focus matrix.”',
              'Match the extract or active standardization to the research instead of assuming the plant name is enough.',
              'Look for independent identity, potency, microbial, heavy-metal, and contaminant testing—not only a GMP logo.',
              'Count caffeine from every source and avoid hidden stimulant ingredients such as guarana or concentrated tea extracts.',
              'Check source allergens and distinguish fruiting body, mycelium, phospholipid source, and branded ingredient where relevant.',
              'Reject medication-replacement, guaranteed-IQ, instant-memory, or universal “clinically proven” claims.',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-brand-900/10 bg-brand-50/30 p-5 text-sm leading-6 text-muted">
                {item}
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold">
            <Link href="/learn/product-quality/" className="text-brand-700 hover:underline">
              Product-quality basics →
            </Link>
            <Link href="/safety-checker/" className="text-brand-700 hover:underline">
              Check interaction pathways →
            </Link>
          </div>
        </section>

        <section id="faq" className="scroll-mt-20 rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Frequently asked questions</h2>
          <div className="mt-5 divide-y divide-brand-900/10">
            {FAQS.map((faq) => (
              <div key={faq.question} className="py-5 first:pt-0 last:pb-0">
                <h3 className="font-semibold text-ink">{faq.question}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <References refs={[...REFERENCES]} />

        <EmailCapture location="guides-best-nootropics-for-focus" className="mt-6" />

        <nav className="flex flex-wrap gap-4 text-sm font-semibold text-brand-700">
          <Link href="/guides/focus/" className="hover:text-brand-800">Focus goal hub →</Link>
          <Link href="/guides/focus/focus-without-caffeine-crash/" className="hover:text-brand-800">Focus Without the Caffeine Crash →</Link>
          <Link href="/guides/adhd/adhd-supplements/" className="hover:text-brand-800">ADHD Supplements Hub →</Link>
          <Link href="/guides/other/supplements-for-brain-fog-and-fatigue/" className="hover:text-brand-800">Brain Fog & Fatigue →</Link>
          <Link href="/guides/compare/caffeine-vs-l-theanine-vs-bacopa-for-focus/" className="hover:text-brand-800">Caffeine vs L-Theanine vs Bacopa →</Link>
          <Link href="/guides/" className="hover:text-brand-800">All Guides →</Link>
        </nav>

        <p className="text-xs leading-6 text-muted">
          This guide is educational and does not diagnose or treat ADHD, cognitive impairment, fatigue, anxiety,
          depression, or a sleep disorder. Review persistent concentration changes, pregnancy, cardiovascular or
          mood conditions, and medication combinations with a qualified clinician or pharmacist.
        </p>
      </div>
    </ArticleLayout>
  )
}
