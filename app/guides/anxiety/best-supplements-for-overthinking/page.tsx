import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import StructuredData from '@/components/StructuredData'
import { SITE_URL } from '@/lib/navigation-config'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import EmailCapture from '@/components/EmailCapture'
import References from '@/components/References'

const PAGE_URL = `${SITE_URL}/guides/anxiety/best-supplements-for-overthinking`

export const metadata: Metadata = {
  title: 'Best Supplements for Overthinking & a Racing Mind',
  description:
    'An evidence-first guide to supplements commonly considered for overthinking, separating direct evidence from adjacent stress, anxiety, and cognition research.',
  alternates: { canonical: '/guides/anxiety/best-supplements-for-overthinking/' },
  openGraph: {
    title: 'Best Supplements for Overthinking & a Racing Mind',
    description:
      'Compare L-theanine, magnesium, and ashwagandha by what human studies actually measured, with evidence limits and safety context kept visible.',
    url: '/guides/anxiety/best-supplements-for-overthinking/',
    type: 'article',
    images: ['/og-default.jpg'],
  },
}

const FAQS = [
  {
    question: 'What supplement is best for overthinking?',
    answer:
      'No supplement has strong direct evidence for treating overthinking itself. The closest evidence is indirect: L-theanine research includes acute cognition and mood outcomes, magnesium research includes subjective anxiety in vulnerable groups, and ashwagandha research includes chronic-stress outcomes. That makes these possible context-dependent options, not a proven ranking.',
  },
  {
    question: 'Can a supplement stop a racing mind at night?',
    answer:
      'A supplement may change arousal, stress, or anxiety for some people, but the studies cited here do not establish a reliable same-night treatment for rumination. Persistent bedtime rumination is better approached by checking sleep, caffeine, stress load, medications, and mental-health context rather than assuming a capsule is the missing piece.',
  },
  {
    question: 'Is overthinking the same as anxiety?',
    answer:
      'No. Overthinking or rumination describes a thinking pattern, while anxiety is a broader emotional and physical state. They can overlap, but evidence for an anxiety or stress outcome should not automatically be presented as evidence for rumination itself.',
  },
  {
    question: 'How long should I expect a supplement to take?',
    answer:
      'There is no single evidence-based timeline for this goal. The cited L-theanine study measured acute effects, the ashwagandha trial ran for 60 days, and the magnesium review combined heterogeneous studies. Those timelines are study context, not a universal protocol.',
  },
]

const HEADINGS: Heading[] = [
  { id: 'quick-answer', text: 'Quick answer', level: 2 },
  { id: 'decision-map', text: 'Choose by the outcome actually studied', level: 2 },
  { id: 'evidence-profiles', text: 'Evidence profiles', level: 2 },
  { id: 'study-context', text: 'Study context, not a protocol', level: 2 },
  { id: 'basics', text: 'What to check before adding a supplement', level: 2 },
  { id: 'risks', text: 'When a supplement is the wrong next step', level: 2 },
  { id: 'faq', text: 'Frequently asked questions', level: 2 },
]

const REFERENCES = [
  {
    n: 1,
    text: 'Haskell CF, et al. L-theanine, caffeine and cognition. Biol Psychol. 2008. PMID: 18006208.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/18006208/',
  },
  {
    n: 2,
    text: 'Chandrasekhar K, et al. Ashwagandha root extract for stress and anxiety in adults. Indian J Psychol Med. 2012. PMID: 23439798.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/23439798/',
  },
  {
    n: 3,
    text: 'Boyle NB, et al. Magnesium supplementation and subjective anxiety and stress: systematic review. Nutrients. 2017. PMID: 28445426.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/28445426/',
  },
]

const DECISION_ROWS = [
  {
    label: 'Acute cognition and mood — not rumination',
    option: 'L-theanine is often marketed here, but the cited trial does not prove an anti-rumination effect.',
    evidence:
      'The randomized crossover study measured cognition and mood after L-theanine, caffeine, and their combination. L-theanine alone did not produce a clean broad benefit pattern.',
    href: '/compounds/l-theanine/',
  },
  {
    label: 'Subjective anxiety in vulnerable groups',
    option: 'Magnesium may be relevant when anxiety vulnerability or low-magnesium risk is part of the picture.',
    evidence:
      'A systematic review found suggestive results in anxiety-vulnerable samples, but the authors judged the quality of the existing evidence poor and called for better trials.',
    href: '/compounds/magnesium-glycinate/',
  },
  {
    label: 'Chronic stress — not a same-night rescue',
    option: 'Ashwagandha has more direct stress evidence than rumination evidence.',
    evidence:
      'A 60-day randomized placebo-controlled trial in 64 adults with chronic stress reported improvements in stress scales and serum cortisol for one high-concentration root extract. That does not establish a treatment for rumination or prove every ashwagandha product equivalent.',
    href: '/herbs/ashwagandha/',
  },
  {
    label: 'Persistent intrusive or impairing rumination',
    option: 'Do not make the next decision a supplement ranking.',
    evidence:
      'If repetitive thoughts are persistent, intrusive, tied to panic or low mood, or disrupting sleep and daily function, the higher-value next step is assessment of the underlying problem rather than stacking calming products.',
    href: '/info/supplement-safety-checklist/',
  },
] as const

export default function Page() {
  const toc = <TableOfContents headings={HEADINGS} />

  return (
    <ArticleLayout toc={toc} zone="supplement">
      <StructuredData
        pageUrl={PAGE_URL}
        headline="Best Supplements for Overthinking"
        description="Evidence-first guide to supplements commonly considered for overthinking, separating direct evidence from adjacent stress, anxiety, and cognition research."
        datePublished="2026-06-18"
        dateModified="2026-08-10"
        faqs={FAQS}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides/' },
          { label: 'Anxiety Guides', href: '/guides/anxiety/' },
          { label: 'Best Supplements for Overthinking', href: '/guides/anxiety/best-supplements-for-overthinking/' },
        ]}
      />

      <div className="space-y-12">
        <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-10">
          <p className="eyebrow-label">Evidence-first decision guide</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Best Supplements for Overthinking
          </h1>
          <p className="mt-2 text-xs text-muted">
            Written and edited by{' '}
            <Link href="/info/author/" rel="author" className="font-medium text-brand-700 hover:underline">
              Willie B. Randolph III
            </Link>{' '}
            · Last updated August 10, 2026
          </p>
          <p className="detail-reading mt-4 max-w-3xl text-muted">
            “Overthinking” is not a single clinical outcome, and the human studies behind popular calming supplements usually
            measure something adjacent: cognition, mood, subjective anxiety, stress scales, or cortisol. That distinction matters.
            This guide keeps those outcomes separate so a plausible option does not get promoted into a proven treatment.
          </p>

          <figure className="mt-6">
            <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
              <Image
                src="/images/guides/best-supplements-for-overthinking.jpg"
                alt="L-theanine and magnesium supplements with green tea and lavender"
                width={1536}
                height={1024}
                priority
                className="h-auto w-full"
              />
            </div>
            <figcaption className="mt-3 text-center text-sm text-muted">
              Commonly marketed options are not automatically supported for the same outcome.
            </figcaption>
          </figure>
        </section>

        <section id="quick-answer" className="card-premium scroll-mt-20 border-brand-700/30 bg-brand-50/60 p-6">
          <p className="eyebrow-label">Quick answer</p>
          <h2 className="mt-1 text-2xl font-semibold text-ink">There is no proven “best supplement” for overthinking</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            No supplement has strong direct evidence for treating “overthinking” itself. L-theanine, magnesium, and ashwagandha
            are better understood as options with <em>adjacent</em> evidence in cognition or mood, subjective anxiety, or chronic
            stress. The practical edge is to identify the outcome you are actually trying to change, then judge the evidence for
            that outcome rather than buying a generic “calm” stack.
          </p>
        </section>

        <section id="decision-map" className="scroll-mt-20 space-y-5">
          <div>
            <p className="eyebrow-label">Decision map</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Choose by the outcome actually studied</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
              These are not interchangeable claims. A stress score, an anxiety questionnaire, a reaction-time task, and repetitive
              rumination answer different questions.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {DECISION_ROWS.map((row) => (
              <article key={row.label} className="card-premium p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">Closest evidence context</p>
                <h3 className="mt-2 text-lg font-semibold text-ink">{row.label}</h3>
                <p className="mt-3 text-sm font-medium leading-6 text-ink">{row.option}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{row.evidence}</p>
                <Link href={row.href} className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:underline">
                  Read the narrower page →
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section id="evidence-profiles" className="scroll-mt-20 space-y-5">
          <p className="eyebrow-label">Evidence profiles</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">What the cited human evidence does — and does not — show</h2>

          <article className="card-premium p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-brand-800">
                <Link href="/compounds/l-theanine/" className="hover:underline">L-theanine</Link>
              </h3>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">Indirect for rumination</span>
            </div>
            <p className="mt-4 text-sm leading-7 text-muted">
              The cited randomized crossover trial tested acute cognition and mood after L-theanine, caffeine, and their
              combination. L-theanine alone increased headache ratings and reduced performance on one serial-subtraction task;
              several clearer performance effects involved caffeine or the combination. That evidence does not establish a
              treatment for rumination, nor does it justify promising that L-theanine will reliably “quiet mental chatter.”
            </p>
          </article>

          <article className="card-premium p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-brand-800">
                <Link href="/compounds/magnesium-glycinate/" className="hover:underline">Magnesium</Link>
              </h3>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">Suggestive, low-quality evidence</span>
            </div>
            <p className="mt-4 text-sm leading-7 text-muted">
              The systematic review covered 18 studies in groups already vulnerable to anxiety, including mildly anxious,
              premenstrual, postpartum, and hypertensive samples. Results were mixed, and the authors concluded that the quality
              of the existing evidence was poor. The review therefore supports caution—not a claim that magnesium glycinate is a
              reliable treatment for overthinking or that one magnesium form is proven superior for this goal.
            </p>
          </article>

          <article className="card-premium p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-brand-800">
                <Link href="/herbs/ashwagandha/" className="hover:underline">Ashwagandha</Link>
              </h3>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">Stress evidence, not rumination evidence</span>
            </div>
            <p className="mt-4 text-sm leading-7 text-muted">
              A small randomized placebo-controlled trial enrolled 64 adults with chronic stress and tested one high-concentration
              full-spectrum root extract for 60 days. Stress-scale scores and serum cortisol improved relative to placebo. That is
              relevant when chronic stress is the question, but it does not prove an immediate anti-rumination effect, establish a
              universal dose, or show that every extract on the market is equivalent.
            </p>
          </article>
        </section>

        <section id="study-context" className="scroll-mt-20 rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
          <p className="eyebrow-label">Dose and timeline boundary</p>
          <h2 className="mt-1 text-2xl font-semibold text-ink">Study context is not a protocol</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            The studies on this page used different populations, products, outcomes, doses, and durations. A milligram amount from
            one trial should not be copied into a universal “start here” instruction, and an acute cognition study should not be
            given the same expected timeline as a 60-day chronic-stress trial. Product identity and the reason for taking it matter.
          </p>
        </section>

        <section id="basics" className="scroll-mt-20 rounded-[1.65rem] border border-brand-900/10 bg-brand-50/40 p-6">
          <h2 className="text-xl font-semibold text-ink">What to check before adding a supplement</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-muted">
            <li>• <strong className="text-ink">Name the actual problem:</strong> worry, intrusive thoughts, sleep loss, stimulant overload, chronic stress, or another driver may require different next steps.</li>
            <li>• <strong className="text-ink">Audit caffeine and sleep:</strong> adding a calming product while leaving a large arousal driver untouched makes the result difficult to interpret.</li>
            <li>• <strong className="text-ink">Change one variable:</strong> multi-ingredient stacks make benefits, adverse effects, and interactions harder to attribute.</li>
            <li>• <strong className="text-ink">Define a stop rule:</strong> stop and reassess if symptoms worsen, new adverse effects appear, or the chosen outcome does not meaningfully improve.</li>
          </ul>
        </section>

        <section id="risks" className="scroll-mt-20 rounded-[1.65rem] border border-amber-200 bg-amber-50/70 p-6">
          <p className="eyebrow-label">Safety boundary</p>
          <h2 className="mt-1 text-2xl font-semibold text-amber-950">When a supplement is the wrong next step</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-amber-900">
            <li>• Repetitive thoughts are intrusive, frightening, tied to compulsions, panic, or low mood, or are significantly impairing sleep or daily function.</li>
            <li>• Symptoms appeared after a medication or substance change, or you are combining multiple stimulating, sedating, or mood-active products.</li>
            <li>• Pregnancy, breastfeeding, significant liver or kidney disease, or a complex medication regimen changes the safety calculation.</li>
            <li>• You are using supplements to postpone assessment of a persistent mental-health or sleep problem.</li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/safety-checker/" className="rounded-full bg-amber-900 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-950">
              Check interaction cautions
            </Link>
            <Link href="/info/supplement-safety-checklist/" className="rounded-full border border-amber-900/20 px-4 py-2 text-sm font-semibold text-amber-950 hover:bg-white/60">
              Use the safety checklist
            </Link>
          </div>
        </section>

        <References refs={REFERENCES} />

        <section id="faq" className="scroll-mt-20 space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details key={faq.question} className="card-premium p-5">
                <summary className="cursor-pointer text-base font-semibold text-ink">{faq.question}</summary>
                <p className="mt-2 text-sm leading-6 text-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <EmailCapture location="guides-best-supplements-for-overthinking" className="mt-6" />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Related guides &amp; comparisons</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/guides/anxiety/best-herbs-for-anxiety/" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Best Herbs for Anxiety →</Link>
            <Link href="/guides/anxiety/best-herbs-for-stress-and-anxiety-at-night/" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Stress &amp; Anxiety at Night →</Link>
            <Link href="/guides/compare/ashwagandha-vs-l-theanine-vs-magnesium/" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Ashwagandha vs L-theanine vs Magnesium →</Link>
            <Link href="/safety-checker/" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Safety Interaction Checker →</Link>
            <Link href="/guides/anxiety/" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">All Anxiety Guides →</Link>
            <Link href="/guides/" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">All Guides →</Link>
          </div>
        </section>
      </div>
    </ArticleLayout>
  )
}
