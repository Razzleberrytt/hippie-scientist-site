import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import StructuredData from '@/components/StructuredData'
import { SITE_URL } from '@/lib/navigation-config'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import EmailCapture from '@/components/EmailCapture'

const PAGE_URL = `${SITE_URL}/guides/anxiety/best-herbs-for-stress-and-anxiety-at-night`
const DATE = '2026-08-11'

export const metadata: Metadata = {
  title: 'Best Herbs for Stress and Anxiety at Night: Evidence & Safety',
  description:
    'An evidence-first guide to nighttime stress and anxiety: what current research says about L-theanine, passionflower, ashwagandha, valerian, sleep routines, and when supplements are the wrong tool.',
  alternates: { canonical: '/guides/anxiety/best-herbs-for-stress-and-anxiety-at-night/' },
  openGraph: {
    title: 'Best Herbs for Stress and Anxiety at Night: Evidence & Safety',
    description:
      'Separate same-night claims from repeated-dose evidence, compare safety limits, and learn when chronic insomnia or anxiety deserves a stronger approach than supplements.',
    url: '/guides/anxiety/best-herbs-for-stress-and-anxiety-at-night/',
    type: 'article',
    images: ['/og-default.jpg'],
  },
}

const FAQS = [
  {
    question: 'What herb works fastest for nighttime anxiety?',
    answer:
      'Current evidence does not establish a reliably fast herbal treatment for nighttime anxiety. L-theanine is often studied 30–60 minutes before cognitive testing, but a 2026 meta-analysis found its strongest acute signal in attention while anxiety outcomes were inconsistent. Study timing should not be converted into a guaranteed anxiety-relief onset.',
  },
  {
    question: 'Is passionflower a reliable bedtime anxiety remedy?',
    answer:
      'Not based on current evidence. NCCIH describes only a small amount of human research, with conclusions about anxiety not definite and mixed findings for sleep onset and staying asleep. Passionflower can also cause drowsiness, dizziness, and confusion and should not be used during pregnancy.',
  },
  {
    question: 'Does ashwagandha have a proven immediate bedtime effect?',
    answer:
      'No immediate bedtime effect has been established. The better human evidence comes from repeated-dose trials and meta-analyses in adults with stress or anxiety symptoms using specific extracts over weeks. That does not establish an acute effect or a class effect for every ashwagandha product.',
  },
  {
    question: 'What if anxiety keeps me awake most nights?',
    answer:
      'Frequent nighttime anxiety and chronic insomnia deserve more than supplement ranking. Cognitive behavioral therapy for insomnia (CBT-I) is strongly recommended for chronic insomnia, and persistent or impairing anxiety should be evaluated rather than managed only with herbs.',
  },
  {
    question: 'Can calming herbs be combined with sleep or anxiety medication?',
    answer:
      'Do not assume they are compatible. Sedating supplements can add to alcohol, sleep medicines, benzodiazepines, opioids, anesthesia, and other central-nervous-system depressants. Medication interactions and medical conditions should be reviewed with a pharmacist or clinician before regular use.',
  },
]

const HEADINGS: Heading[] = [
  { id: 'bottom-line', text: 'Bottom line', level: 2 },
  { id: 'bigger-question', text: 'Nighttime anxiety or chronic insomnia?', level: 2 },
  { id: 'evidence', text: 'Evidence by ingredient', level: 2 },
  { id: 'routine', text: 'What to prioritize tonight', level: 2 },
  { id: 'safety', text: 'Safety and interactions', level: 2 },
  { id: 'sources', text: 'Sources', level: 2 },
  { id: 'faq', text: 'Frequently asked questions', level: 2 },
]

const SOURCES = [
  {
    label: 'L-theanine systematic review and meta-analysis of 31 randomized trials (2026)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/42410082/',
    note: '31 RCTs and 1,168 participants; robust short-term attention signal, modest bias-sensitive acute-stress effect, and inconsistent anxiety findings.',
  },
  {
    label: 'Ashwagandha stress and anxiety systematic review and meta-analysis (2024)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/39348746/',
    note: 'Nine randomized trials and 558 participants; pooled effects versus placebo using specific formulations, with heterogeneity and unresolved long-term safety.',
  },
  {
    label: 'Ashwagandha root-extract randomized trial in adults with moderate stress and anxiety (2026)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/41815853/',
    note: '141 healthy adults ages 18–65; 8-week three-arm trial comparing 300 mg proprietary root extract twice daily, another root extract, and placebo.',
  },
  {
    label: 'NCCIH: Passionflower usefulness and safety',
    href: 'https://www.nccih.nih.gov/health/passionflower',
    note: 'Small amount of research; anxiety conclusions are not definite, sleep findings are mixed, and pregnancy/anesthesia cautions matter.',
  },
  {
    label: 'NCCIH: Anxiety and complementary health approaches',
    href: 'https://www.nccih.nih.gov/health/anxiety-and-complementary-health-approaches',
    note: 'Complementary approaches can carry side effects and medication interactions and should not substitute for established care for an anxiety disorder.',
  },
  {
    label: 'American Academy of Sleep Medicine: behavioral and psychological treatments for chronic insomnia',
    href: 'https://aasm.org/new-guideline-supports-behavioral-psychological-treatments-for-insomnia/',
    note: 'Strong recommendation for cognitive behavioral therapy for insomnia (CBT-I) in adults with chronic insomnia disorder.',
  },
]

export default function Page() {
  const toc = <TableOfContents headings={HEADINGS} />
  const ashwagandhaProducts = getRevenueProductSet('ashwagandha')

  return (
    <ArticleLayout toc={toc} zone="supplement">
      <StructuredData
        pageUrl={PAGE_URL}
        headline="Best Herbs for Stress and Anxiety at Night: Evidence & Safety"
        description="Evidence-first guide to nighttime stress and anxiety, including L-theanine, passionflower, ashwagandha, valerian, sleep routines, and safety."
        datePublished="2026-06-18"
        dateModified={DATE}
        faqs={FAQS}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides' },
          { label: 'Anxiety', href: '/guides/anxiety/' },
          { label: 'Nighttime stress and anxiety', href: '/guides/anxiety/best-herbs-for-stress-and-anxiety-at-night' },
        ]}
      />

      <div className="space-y-10">
        <AffiliateDisclosure variant="compact" className="mb-6" />

        <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-10">
          <p className="eyebrow-label">Nighttime evidence guide</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Best Herbs for Stress and Anxiety at Night
          </h1>
          <p className="mt-2 text-xs text-muted">
            Written and edited by{' '}
            <Link href="/info/author/" rel="author" className="font-medium text-brand-700 hover:underline">
              Willie B. Randolph III
            </Link>{' '}
            · Last evidence review August 11, 2026
          </p>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
            Nighttime stress, racing thoughts, and insomnia overlap, but they are not the same outcome.
            Human trials do not support a universal “best herb” or a reliably fast supplement for bedtime
            anxiety. This guide separates same-night claims from repeated-dose evidence and puts chronic
            insomnia and persistent anxiety in the right treatment context.
          </p>

          <div className="mt-5 rounded-xl border border-brand-900/10 bg-brand-50/50 p-4 text-sm leading-6 text-muted">
            <strong className="text-ink">Is the main problem sleep rather than anxiety?</strong>{' '}
            Compare the broader{' '}
            <Link href="/guides/sleep/best-natural-sleep-aids-that-work/" className="font-semibold text-brand-700 hover:underline">natural sleep aids guide</Link>{' '}
            or the supplement-only{' '}
            <Link href="/guides/sleep/best-supplements-for-sleep/" className="font-semibold text-brand-700 hover:underline">sleep supplement guide</Link>.
          </div>

          <figure className="mt-6">
            <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
              <Image
                src="/images/guides/best-herbs-for-stress-and-anxiety-at-night.jpg"
                alt="Calming nighttime herbs including lavender, chamomile, and passionflower beside herbal tea"
                width={1536}
                height={1024}
                priority
                className="h-auto w-full"
              />
            </div>
            <figcaption className="mt-3 text-center text-sm text-muted">
              Bedtime supplement evidence varies sharply by ingredient, outcome, preparation, and duration.
            </figcaption>
          </figure>
        </section>

        <section id="bottom-line" className="card-premium scroll-mt-20 space-y-3 border-brand-700/30 bg-brand-50/60 p-6">
          <p className="eyebrow-label">Bottom line</p>
          <h2 className="text-2xl font-semibold text-ink">
            No herb is proven to be a reliably fast treatment for nighttime anxiety
          </h2>
          <div className="space-y-3 text-muted">
            <p>
              <strong>L-theanine</strong> has short-term cognitive and stress research, but the July 2026
              meta-analysis found anxiety effects inconsistent overall. The often-cited 30–60-minute window
              describes study timing; the strongest robust result in that window was an attention outcome,
              not demonstrated acute anxiety relief.
            </p>
            <p>
              <strong>Passionflower</strong> has only a small amount of human research, and NCCIH says the
              conclusions about anxiety are not definite. <strong>Ashwagandha</strong> has a more substantial
              repeated-dose stress/anxiety signal, but that evidence comes from specific extracts studied over
              weeks rather than a same-night bedtime effect.
            </p>
          </div>
        </section>

        <section id="bigger-question" className="card-premium scroll-mt-20 space-y-4 p-6">
          <p className="eyebrow-label">Start with the bigger question</p>
          <h2 className="text-2xl font-semibold text-ink">Is the main problem occasional arousal, chronic insomnia, or persistent anxiety?</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4">
              <h3 className="font-semibold text-ink">Occasional stressful evening</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Avoid converting a single stressful night into a supplement stack. A predictable wind-down,
                lower stimulation, and protecting the sleep window are lower-complexity first steps.
              </p>
            </div>
            <div className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4">
              <h3 className="font-semibold text-ink">Chronic insomnia</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                CBT-I has a strong guideline recommendation for adults with chronic insomnia. Sleep hygiene can
                support it, but a ranked herb list is not an evidence-equivalent replacement.
              </p>
            </div>
            <div className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4">
              <h3 className="font-semibold text-ink">Persistent or impairing anxiety</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                If anxiety is frequent, escalating, causing panic, or impairing daily life, treat that as an
                anxiety-care question rather than a search for the strongest nighttime supplement.
              </p>
            </div>
          </div>
        </section>

        <section id="evidence" className="scroll-mt-20 space-y-5">
          <p className="eyebrow-label">Evidence by ingredient</p>
          <h2 className="text-2xl font-semibold text-ink">What the better human evidence actually supports</h2>

          <article className="card-premium p-6">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-semibold text-brand-800">
                <Link href="/guides/anxiety/l-theanine-for-anxiety/" className="hover:underline">L-theanine</Link>
              </h3>
              <span className="rounded-full bg-brand-50 px-3 py-0.5 text-xs font-semibold text-brand-800">Anxiety evidence: inconsistent</span>
            </div>
            <p className="mt-3 text-sm leading-7 text-muted">
              The 2026 meta-analysis included 31 randomized trials and 1,168 participants. A single 200 mg dose
              studied 30–60 minutes before cognitive testing improved choice reaction time; acute-stress reduction
              was modest and sensitive to study quality, while anxiety effects were inconsistent and generally
              non-significant. That does not support calling L-theanine a dependable same-night anxiolytic.
            </p>
          </article>

          <article className="card-premium p-6">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-semibold text-brand-800">
                <Link href="/herbs/passionflower/" className="hover:underline">Passionflower</Link>
              </h3>
              <span className="rounded-full bg-brand-50 px-3 py-0.5 text-xs font-semibold text-brand-800">Evidence: sparse</span>
            </div>
            <p className="mt-3 text-sm leading-7 text-muted">
              NCCIH says passionflower has not been studied extensively. A small amount of research suggests
              possible anxiety or pre-procedure benefit, but conclusions are not definite. For sleep, total sleep
              time may improve in some studies while sleep-onset and sleep-maintenance findings are mixed.
            </p>
            <p className="mt-3 text-sm leading-7 text-muted">
              Safety matters: drowsiness, dizziness, and confusion are possible; passionflower can interact with
              anesthesia and should not be used during pregnancy because of uterine-contraction concerns.
            </p>
          </article>

          <article className="card-premium p-6">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-semibold text-brand-800">
                <Link href="/herbs/ashwagandha/" className="hover:underline">Ashwagandha</Link>
              </h3>
              <span className="rounded-full bg-brand-50 px-3 py-0.5 text-xs font-semibold text-brand-800">Repeated-dose signal</span>
            </div>
            <p className="mt-3 text-sm leading-7 text-muted">
              A 2024 meta-analysis pooled nine randomized placebo-controlled trials and 558 participants and
              reported reductions in stress/anxiety measures and cortisol. A representative 2026 trial enrolled
              141 healthy men and women ages 18–65 with moderate stress and anxiety and randomized them for
              8 weeks to 300 mg of a proprietary ashwagandha root extract twice daily, another root extract, or
              placebo. That is repeated-dose, formulation-specific evidence in stressed adults—not evidence of an
              immediate bedtime effect or a class effect for every powder, extract, or product shown below.
            </p>
          </article>

          <article className="card-premium p-6">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-semibold text-brand-800">
                <Link href="/herbs/valerian/" className="hover:underline">Valerian and other sedating herbs</Link>
              </h3>
              <span className="rounded-full bg-brand-50 px-3 py-0.5 text-xs font-semibold text-brand-800">Do not over-rank</span>
            </div>
            <p className="mt-3 text-sm leading-7 text-muted">
              Valerian, lemon balm, magnolia, and other calming herbs are frequently marketed for bedtime use,
              but direct anxiety evidence is not strong enough to build a reliable symptom-to-herb ranking.
              Sedation also changes the safety calculation, especially with alcohol, sleep medication,
              benzodiazepines, opioids, or other central-nervous-system depressants.
            </p>
          </article>
        </section>

        <section id="routine" className="scroll-mt-20 space-y-4 rounded-[1.65rem] border border-brand-900/10 bg-brand-50/40 p-6">
          <p className="eyebrow-label">Lower-risk first layer</p>
          <h2 className="text-xl font-semibold text-ink">What to prioritize tonight before adding another supplement</h2>
          <ul className="space-y-2 text-sm leading-7 text-muted">
            <li>• Protect a consistent sleep opportunity and reduce avoidable late stimulation rather than chasing a stronger sedative effect.</li>
            <li>• If caffeine is contributing to evening arousal, changing caffeine timing is more direct than adding a supplement to counteract it.</li>
            <li>• A short written “brain dump,” relaxation exercise, or low-stimulation wind-down can be useful components of a bedtime routine.</li>
            <li>• If insomnia is chronic, move beyond sleep-hygiene tips and consider CBT-I, which has stronger guideline support than supplement ranking.</li>
          </ul>
          <p className="text-xs leading-6 text-muted">
            A bedtime routine is not a substitute for evaluation when anxiety, depression, panic, trauma symptoms,
            sleep apnea, restless legs, substance use, medication effects, or another condition may be driving the sleep problem.
          </p>
        </section>

        <section id="safety" className="scroll-mt-20 space-y-3 rounded-[1.65rem] border border-amber-200 bg-amber-50/70 p-6">
          <h2 className="text-xl font-semibold text-amber-900">Safety and interactions</h2>
          <ul className="space-y-2 text-sm leading-7 text-amber-900">
            <li>• Do not assume “natural” means non-sedating or interaction-free. Alcohol and prescription sedatives can compound impairment.</li>
            <li>• <strong>Passionflower:</strong> possible drowsiness, dizziness, and confusion; avoid during pregnancy and discuss use around surgery/anesthesia.</li>
            <li>• <strong>Ashwagandha:</strong> pregnancy, thyroid, autoimmune, medication, and rare liver-injury concerns deserve specific review.</li>
            <li>• <strong>L-theanine:</strong> short trials are generally reassuring, but that does not establish unlimited long-term safety or compatibility with every medication or condition.</li>
            <li>• If nighttime anxiety is frequent, severe, or impairing, supplements should not delay established mental-health or sleep care.</li>
            <li>• <strong>Immediate stop rule:</strong> if anxiety comes with suicidal thoughts, thoughts of self-harm, an inability to stay safe, or imminent danger, seek immediate emergency or crisis care rather than trying another supplement.</li>
          </ul>
        </section>

        <section id="sources" className="card-premium scroll-mt-20 space-y-4 p-6">
          <h2 className="text-2xl font-semibold text-ink">Sources and directness notes</h2>
          <ol className="space-y-4">
            {SOURCES.map((source, index) => (
              <li key={source.href} className="text-sm leading-7 text-muted">
                <span className="font-semibold text-ink">{index + 1}. </span>
                <a href={source.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 hover:underline">
                  {source.label}
                </a>
                <span> — {source.note}</span>
              </li>
            ))}
          </ol>
        </section>

        {ashwagandhaProducts ? (
          <RecommendationSection products={ashwagandhaProducts.products} />
        ) : null}

        <section id="faq" className="scroll-mt-20 space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details key={faq.question} className="card-premium p-5">
                <summary className="cursor-pointer text-base font-semibold text-ink">{faq.question}</summary>
                <p className="mt-2 text-sm leading-7 text-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <EmailCapture location="guides-best-herbs-for-stress-and-anxiety-at-night" className="mt-6" />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Related evidence guides</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/guides/sleep/best-natural-sleep-aids-that-work/" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Natural Sleep Aids: Evidence & Safety →</Link>
            <Link href="/guides/anxiety/natural-anxiety-relief/" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Natural Anxiety Relief: Current Evidence →</Link>
            <Link href="/guides/anxiety/l-theanine-for-anxiety/" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">L-Theanine for Anxiety →</Link>
            <Link href="/guides/anxiety/ashwagandha-for-anxiety/" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Ashwagandha for Anxiety →</Link>
            <Link href="/guides/anxiety/best-herbs-for-anxiety/" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Best Herbs for Anxiety →</Link>
            <Link href="/guides/anxiety/" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">All Anxiety Guides →</Link>
          </div>
        </section>
      </div>
    </ArticleLayout>
  )
}
