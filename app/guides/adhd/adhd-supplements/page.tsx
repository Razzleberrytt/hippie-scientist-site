import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import JsonLd from '@/components/seo/JsonLd'
import { buildPageMetadata } from '../../../../src/lib/seo'
import { focusAdhdArticles } from '@/lib/focus-adhd-articles'
import { AdhdInlineCta } from '@/components/articles/AdhdMonetizationWidgets'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import References from '@/components/References'
import ResponsiveTable from '@/components/ui/ResponsiveTable'

const PATH = '/guides/adhd/adhd-supplements'
const TITLE = 'ADHD Supplements: What the Evidence Actually Supports'
const DESCRIPTION =
  'An evidence-calibrated ADHD supplement guide separating core-symptom evidence, deficiency correction, sleep support, early research, testing, and safety.'

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  openGraphType: 'article',
})

const HEADINGS: Heading[] = [
  { id: 'quick-answer', text: 'Quick answer', level: 2 },
  { id: 'decision-map', text: 'Decision map', level: 2 },
  { id: 'evidence-ranking', text: 'Evidence ranking', level: 2 },
  { id: 'deficiency-first', text: 'Deficiency-first support', level: 2 },
  { id: 'sleep-support', text: 'Sleep support', level: 2 },
  { id: 'stack-rules', text: 'Safer stack rules', level: 2 },
  { id: 'start-here', text: 'Start-here guides', level: 2 },
  { id: 'faq', text: 'Frequently asked questions', level: 2 },
]

const FAQS = [
  {
    question: 'Can supplements replace ADHD medication or behavioral treatment?',
    answer:
      'No. Supplements should not be presented as substitutes for diagnosis, medication, behavioral treatment, sleep care, coaching, or accommodations. Their most defensible roles are correcting a clinically meaningful nutrient gap, targeting a separate problem such as delayed sleep onset, or serving as a carefully monitored adjunct when expectations are modest.',
  },
  {
    question: 'What is the best supplement to start with for ADHD?',
    answer:
      'There is no universal best starting supplement. First define the target: core ADHD symptoms, low dietary intake, a suspected deficiency, delayed sleep onset, constipation, medication-related appetite suppression, or another problem. The correct next step may be diet review, sleep treatment, laboratory evaluation, or no supplement at all.',
  },
  {
    question: 'Does omega-3 reliably improve ADHD symptoms?',
    answer:
      'The evidence is mixed. A 2023 meta-analysis found no statistically significant overall improvement in core ADHD symptoms, although studies lasting at least four months showed a possible subgroup benefit. NICE advises against offering fatty-acid supplementation as a treatment for ADHD in children and young people.',
  },
  {
    question: 'Is magnesium an evidence-based ADHD treatment?',
    answer:
      'No well-controlled evidence establishes magnesium as an ADHD treatment or identifies a superior form for core symptoms. Magnesium may still be considered for low intake, documented deficiency, constipation, or a separate sleep goal, but those are different decisions from treating ADHD.',
  },
  {
    question: 'Can melatonin improve ADHD?',
    answer:
      'Melatonin can improve sleep timing and total sleep time in some children with ADHD and chronic sleep-onset insomnia. In a controlled ADHD trial, it did not improve behavior, cognition, or quality of life. It is a targeted sleep intervention, not a core ADHD treatment.',
  },
  {
    question: 'Are ADHD supplements safe for children?',
    answer:
      'A child should not receive an adult supplement stack. Pediatric use requires age-appropriate dosing, product-quality review, medication screening, and clinician involvement—especially for iron, zinc, vitamin D, magnesium, melatonin, saffron, or multi-ingredient products.',
  },
]

const DECISION_ROWS = [
  [
    'Core inattention, hyperactivity, or impulsivity',
    'Evidence-based ADHD care first',
    'Supplements have smaller, less consistent, or indirect evidence',
    'Do not build the plan around a supplement stack.',
  ],
  [
    'Low intake, restricted eating, or a plausible nutrient gap',
    'Diet review and selective clinical evaluation',
    'Correcting a real deficiency is more defensible than blind supplementation',
    'Treat the gap as a health issue, not proof of an ADHD cure.',
  ],
  [
    'Low ferritin, iron deficiency, or anemia concern',
    'Clinician-guided iron evaluation and treatment',
    'ADHD groups may have lower iron or ferritin on average, but association is not treatment evidence',
    'Never use iron casually; excess can be dangerous.',
  ],
  [
    'Delayed sleep onset or circadian delay',
    'Behavioral sleep work; melatonin in selected cases',
    'Better support for sleep timing than for daytime ADHD symptoms',
    'Track sleep onset and total sleep—not vague “focus.”',
  ],
  [
    'Considering fish oil for core symptoms',
    'Omega-3 as an optional adjunct',
    'Mixed overall results; possible longer-duration subgroup signal',
    'Set modest expectations and avoid presenting it as first-line treatment.',
  ],
  [
    'Considering saffron, L-theanine, or another nootropic',
    'Treat as an early or uncertain experiment',
    'Small or indirect evidence bases, product variation, and limited replication',
    'Use one change at a time and define a stop rule.',
  ],
] as const

const EVIDENCE_GROUPS = [
  {
    label: 'Most defensible role',
    title: 'Correct a documented or strongly suspected health gap',
    copy:
      'Iron, zinc, vitamin D, magnesium, and omega-3 status can be clinically relevant when diet, symptoms, medical history, or laboratory findings point to a problem. The benefit is correcting the gap—not proving the nutrient treats ADHD in everyone.',
  },
  {
    label: 'Targeted symptom role',
    title: 'Treat a separate sleep-onset problem',
    copy:
      'Behavioral sleep interventions have the strongest decision logic. Melatonin has evidence for sleep timing and sleep duration in selected pediatric populations, but it should not be reframed as a daytime attention treatment.',
  },
  {
    label: 'Optional adjunct',
    title: 'Omega-3 with modest expectations',
    copy:
      'Recent pooled evidence did not show a statistically significant overall core-symptom benefit. A longer-duration subgroup signal is hypothesis-generating, not permission to promise a reliable effect.',
  },
  {
    label: 'Early and uncertain',
    title: 'Saffron, L-theanine, and specialized nootropics',
    copy:
      'Saffron has a small emerging ADHD trial base. L-theanine has limited ADHD-specific evidence and broader cognitive research that does not automatically transfer to ADHD. Citicoline, tyrosine, bacopa, ginkgo, rhodiola, and proprietary blends remain lower-confidence choices.',
  },
] as const

const STACK_RULES = [
  ['Define one target', 'Choose a measurable problem such as sleep onset, constipation, low intake, or a specific side effect—not “optimize everything.”'],
  ['Change one variable', 'Starting several products together makes benefits, side effects, and interactions impossible to attribute.'],
  ['Record the baseline', 'Track the target before starting so normal day-to-day variation is not mistaken for an effect.'],
  ['Set a review date', 'A trial without a checkpoint quietly becomes permanent. Decide in advance when benefit, harm, cost, and adherence will be reviewed.'],
  ['Use a stop rule', 'Stop and seek advice for concerning symptoms, medication interactions, worsening sleep, mood changes, persistent GI effects, or no meaningful benefit.'],
] as const

const START_HERE_SLUGS = [
  'best-supplements-for-adhd',
  'nutrient-deficiencies-and-adhd',
  'adhd-blood-tests',
  'omega-3-and-adhd',
  'iron-ferritin-and-adhd',
  'melatonin-for-adhd-sleep',
  'adhd-stack-guide',
  'l-theanine-for-adhd',
] as const

const START_HERE_ARTICLES = START_HERE_SLUGS.flatMap((slug) => {
  const article = focusAdhdArticles.find((candidate) => candidate.slug === slug)
  return article ? [article] : []
})

const REFERENCES = [
  {
    n: 1,
    text: 'NICE. Attention deficit hyperactivity disorder: diagnosis and management. Dietary recommendations, including recommendation 1.6.4.',
    url: 'https://www.nice.org.uk/guidance/ng87/chapter/recommendations',
  },
  {
    n: 2,
    text: 'Liu TH, et al. Omega-3 polyunsaturated fatty acids for core symptoms of ADHD: meta-analysis of randomized controlled trials. 2023. PMID: 37656283.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/37656283/',
  },
  {
    n: 3,
    text: 'Van der Heijden KB, et al. Effect of melatonin on sleep, behavior, and cognition in ADHD and chronic sleep-onset insomnia. 2007. PMID: 17242627.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/17242627/',
  },
  {
    n: 4,
    text: 'Larsson I, et al. Sleep interventions for children with ADHD: systematic literature review. 2023. PMID: 36603513.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/36603513/',
  },
  {
    n: 5,
    text: 'Granero R, et al. The role of iron and zinc in the treatment of ADHD among children and adolescents: systematic review of randomized clinical trials. 2021. PMID: 34836314.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/34836314/',
  },
  {
    n: 6,
    text: 'Ghanizadeh A. A systematic review of magnesium therapy for treating ADHD. 2013. PMID: 23808779.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/23808779/',
  },
  {
    n: 7,
    text: 'Seyedi-Sahebari S, et al. The effects of Crocus sativus (saffron) on ADHD: a systematic review. 2024. PMID: 37864351.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/37864351/',
  },
  {
    n: 8,
    text: 'Lyon MR, et al. L-theanine and objective sleep quality in boys with ADHD: randomized double-blind placebo-controlled trial. 2011. PMID: 22214254.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/22214254/',
  },
  {
    n: 9,
    text: 'Gerolymos C, et al. Cognitive and affective effects of L-theanine: systematic review and meta-analysis of 31 randomized trials. 2026. PMID: 42410082.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/42410082/',
  },
  {
    n: 10,
    text: 'Essential trace elements zinc, iron, copper and ADHD in children and adolescents: systematic review and meta-analysis of case-control studies. 2026. PMID: 42280439.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/42280439/',
  },
] as const

export default function AdhdSupplementsHub() {
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `https://thehippiescientist.net${PATH}/#webpage`,
        url: `https://thehippiescientist.net${PATH}/`,
        name: TITLE,
        description: DESCRIPTION,
        dateModified: '2026-08-02',
        isPartOf: {
          '@type': 'WebSite',
          name: 'The Hippie Scientist',
          url: 'https://thehippiescientist.net',
        },
        about: { '@type': 'Thing', name: 'ADHD supplements' },
      },
      {
        '@type': 'ItemList',
        '@id': `https://thehippiescientist.net${PATH}/#item-list`,
        name: 'Start-here ADHD supplement guides',
        itemListElement: START_HERE_ARTICLES.map((article, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `https://thehippiescientist.net/guides/adhd/${article.slug}/`,
          name: article.title,
        })),
      },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }

  const toc = <TableOfContents headings={HEADINGS} />

  return (
    <ArticleLayout toc={toc} zone="supplement">
      <JsonLd schema={collectionSchema} />
      <JsonLd schema={faqSchema} />

      <div className="space-y-12">
        <section className="hero-shell rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10">
          <p className="eyebrow-label">Evidence-calibrated pillar guide</p>
          <h1 className="heading-premium mt-3 text-3xl font-black leading-tight text-ink sm:text-5xl">
            ADHD Supplements: What the Evidence Actually Supports
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">
            There is no universally effective ADHD supplement. The useful question is narrower: are you
            correcting a real nutrient gap, targeting a separate sleep problem, considering a modest adjunct,
            or buying a product whose marketing has outrun the evidence?
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold">
            <Link href="/guides/adhd/nutrient-deficiencies-and-adhd/" className="text-brand-700 hover:underline">
              Check deficiency logic →
            </Link>
            <Link href="/guides/adhd/sleep-and-adhd/" className="text-brand-700 hover:underline">
              Separate sleep from ADHD →
            </Link>
            <Link href="/guides/adhd/adhd-stack-guide/" className="text-brand-700 hover:underline">
              Build a safer trial →
            </Link>
          </div>

          <figure className="mt-7">
            <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
              <Image
                src="/images/guides/adhd-supplements-hub.jpg"
                alt="Common ADHD supplements arranged for an evidence and safety comparison"
                width={1536}
                height={1024}
                priority
                className="h-auto w-full"
              />
            </div>
            <figcaption className="mt-3 text-center text-sm text-muted">
              Organize the decision by target and evidence—not by the number of bottles in a stack.
            </figcaption>
          </figure>
        </section>

        <section id="quick-answer" className="scroll-mt-20 rounded-[1.65rem] border border-brand-200 bg-brand-50/60 p-6 shadow-sm sm:p-8">
          <p className="eyebrow-label">Quick answer</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            Start with the problem, not the product
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted sm:text-base">
            Supplements sit below evidence-based ADHD care for core symptoms. Their strongest practical roles
            are correcting a clinically meaningful gap and targeting a separate problem such as delayed sleep
            onset. Omega-3 is an optional adjunct with mixed evidence. Saffron, L-theanine, and most nootropics
            remain early or uncertain rather than proven.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Core symptoms', 'Keep diagnosis and evidence-based ADHD care at the center.'],
              ['Possible deficiency', 'Review diet, history, medications, and selective testing.'],
              ['Sleep-onset problem', 'Treat sleep as its own target; do not rename it “focus support.”'],
              ['Optional experiment', 'Use one product, one outcome, one review date, and one stop rule.'],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-xl border border-brand-900/10 bg-white/80 p-4">
                <h3 className="text-sm font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-xs leading-6 text-muted">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <AdhdInlineCta type="checklist" />

        <section id="decision-map" className="scroll-mt-20 space-y-5">
          <div className="max-w-3xl">
            <p className="eyebrow-label">Decision map</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              Match each option to a specific clinical context
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              A lower nutrient level in an ADHD group does not prove causation. A sleep benefit does not prove
              an attention benefit. A study in healthy adults does not establish an ADHD treatment. Keeping
              those boundaries visible is the main quality control for this entire topic.
            </p>
          </div>
          <ResponsiveTable label="ADHD supplement decision map">
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead className="bg-brand-50/80">
                <tr className="border-b border-brand-900/10">
                  {['Situation', 'Best next category', 'Evidence boundary', 'Practical rule'].map((heading) => (
                    <th key={heading} className="px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-brand-900">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-900/10 bg-white">
                {DECISION_ROWS.map(([situation, nextStep, boundary, rule]) => (
                  <tr key={situation} className="align-top">
                    <td className="px-4 py-4 font-semibold text-ink">{situation}</td>
                    <td className="px-4 py-4 text-muted">{nextStep}</td>
                    <td className="px-4 py-4 text-muted">{boundary}</td>
                    <td className="px-4 py-4 text-muted">{rule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ResponsiveTable>
        </section>

        <section id="evidence-ranking" className="scroll-mt-20 space-y-5">
          <div className="max-w-3xl">
            <p className="eyebrow-label">Decision confidence—not hype tiers</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              Rank the role before ranking the ingredient
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {EVIDENCE_GROUPS.map((group) => (
              <div key={group.title} className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-700">{group.label}</p>
                <h3 className="mt-2 text-lg font-semibold text-ink">{group.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">{group.copy}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-amber-900/15 bg-amber-50/70 p-5 text-sm leading-7 text-amber-950/90">
            <strong>Guidelines matter:</strong> NICE specifically advises against offering dietary fatty-acid
            supplementation to treat ADHD in children and young people. That is stricter than some research
            reviews, which is why this page describes omega-3 as optional and mixed—not “Tier A.”
          </div>
        </section>

        <section id="deficiency-first" className="scroll-mt-20 rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
          <p className="eyebrow-label">Deficiency-first support</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            Group differences do not justify blind supplementation
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-muted sm:text-base">
            <p>
              Meta-analyses report that children and adolescents with ADHD can have lower average iron,
              ferritin, zinc, or magnesium measures than control groups. These are associations with substantial
              variation between studies. They do not show that every person with ADHD is deficient or that
              supplementation improves core symptoms when status is already adequate.
            </p>
            <p>
              The practical sequence is dietary history, appetite and medication review, symptoms, medical
              context, and selective clinician-directed testing when appropriate. Iron deserves particular
              caution because unnecessary supplementation can be harmful. Magnesium status is also difficult to
              summarize with one blood result, so testing and interpretation need context rather than a universal
              “ADHD panel.”
            </p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Link href="/guides/adhd/nutrient-deficiencies-and-adhd/" className="rounded-xl border border-brand-900/10 p-4 text-sm font-semibold text-brand-700 hover:underline">
              Review deficiency patterns →
            </Link>
            <Link href="/guides/adhd/adhd-blood-tests/" className="rounded-xl border border-brand-900/10 p-4 text-sm font-semibold text-brand-700 hover:underline">
              Understand selective testing →
            </Link>
            <Link href="/guides/adhd/iron-ferritin-and-adhd/" className="rounded-xl border border-brand-900/10 p-4 text-sm font-semibold text-brand-700 hover:underline">
              Read the iron safety guide →
            </Link>
          </div>
        </section>

        <section id="sleep-support" className="scroll-mt-20 space-y-5">
          <div className="max-w-3xl">
            <p className="eyebrow-label">Sleep is a separate treatment target</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              Better sleep can improve the day without becoming an ADHD cure
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Sleep problems can worsen attention, emotion regulation, and daily functioning. Behavioral sleep
              interventions have the clearest first-step logic. Melatonin can advance sleep onset and increase
              sleep time in selected children, while a controlled ADHD trial found no improvement in behavior,
              cognition, or quality of life. Magnesium and L-theanine have narrower or less certain roles.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ['Behavioral sleep work', 'Protect wake time, light exposure, routines, and sleep opportunity before assuming a supplement is the missing piece.'],
              ['Melatonin', 'Use for a defined sleep-timing problem with pediatric or clinical guidance—not as a general attention enhancer.'],
              ['Magnesium or L-theanine', 'Consider only for a clearly defined secondary goal and keep the weak ADHD-specific evidence visible.'],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm">
                <h3 className="font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{copy}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 text-sm font-semibold">
            <Link href="/guides/adhd/sleep-and-adhd/" className="text-brand-700 hover:underline">
              Sleep and ADHD guide →
            </Link>
            <Link href="/guides/adhd/melatonin-for-adhd-sleep/" className="text-brand-700 hover:underline">
              Melatonin evidence review →
            </Link>
            <Link href="/guides/adhd/best-magnesium-supplement-for-adhd/" className="text-brand-700 hover:underline">
              Magnesium buying guide →
            </Link>
          </div>
        </section>

        <AdhdInlineCta type="safety" />

        <section id="stack-rules" className="scroll-mt-20 rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
          <p className="eyebrow-label">Safer experiment design</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            A stack should behave like a controlled trial—not a shopping haul
          </h2>
          <ol className="mt-5 space-y-4">
            {STACK_RULES.map(([title, copy], index) => (
              <li key={title} className="rounded-2xl border border-brand-900/10 bg-brand-50/30 p-5">
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
          <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold">
            <Link href="/guides/adhd/adhd-stack-guide/" className="text-brand-700 hover:underline">
              Open the full stack guide →
            </Link>
            <Link href="/safety-checker/" className="text-brand-700 hover:underline">
              Check interaction risks →
            </Link>
          </div>
        </section>

        <AdhdInlineCta type="stack" />

        <section id="start-here" className="scroll-mt-20 space-y-5">
          <div className="max-w-3xl">
            <p className="eyebrow-label">Focused next steps</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              Choose the guide that matches the decision
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              The hub stays broad. These supporting pages handle the narrower evidence, dosing, testing, product,
              and safety questions without forcing every topic into one giant listicle.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {START_HERE_ARTICLES.map((article) => (
              <article key={article.slug} className="flex flex-col justify-between rounded-2xl border border-brand-900/10 bg-white/95 p-5 shadow-sm">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full border border-brand-100/60 bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-800">
                      {article.category}
                    </span>
                    <span className="text-[10px] text-muted">{article.readingTime}</span>
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-ink">
                    <Link href={`/guides/adhd/${article.slug}/`} className="hover:text-brand-800 hover:underline">
                      {article.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-xs leading-6 text-muted">{article.description}</p>
                </div>
                <Link href={`/guides/adhd/${article.slug}/`} className="mt-4 border-t border-brand-900/5 pt-3 text-xs font-semibold text-brand-700 hover:underline">
                  Read evidence review →
                </Link>
              </article>
            ))}
          </div>
          <Link href="/guides/adhd/" className="inline-flex text-sm font-semibold text-brand-700 hover:underline">
            Browse the complete ADHD guide cluster →
          </Link>
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

        <section className="rounded-[1.65rem] border border-amber-900/15 bg-amber-50/70 p-6 text-sm leading-7 text-amber-950/90 shadow-sm">
          <h2 className="text-lg font-semibold text-amber-950">Clinical safety note</h2>
          <p className="mt-3">
            This guide is educational and does not diagnose ADHD, nutrient deficiency, anemia, or a sleep
            disorder. Review supplements with a qualified clinician or pharmacist when the user is a child, is
            pregnant or breastfeeding, has kidney or liver disease, uses prescription medication, has a history
            of mood instability, or is considering iron, high-dose minerals, melatonin, saffron, or a
            multi-ingredient stack.
          </p>
        </section>
      </div>
    </ArticleLayout>
  )
}
