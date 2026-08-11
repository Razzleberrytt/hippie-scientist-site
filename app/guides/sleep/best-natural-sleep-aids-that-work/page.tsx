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
import References from '@/components/References'

const PAGE_URL = `${SITE_URL}/guides/sleep/best-natural-sleep-aids-that-work`

export const metadata: Metadata = {
  title: 'Best Natural Sleep Aids That Actually Work (Evidence-Based)',
  description:
    'Which natural sleep aids have human evidence? A cautious guide to melatonin, magnesium, L-theanine, valerian and passionflower — including where evidence is useful, limited or inconclusive.',
  alternates: { canonical: '/guides/sleep/best-natural-sleep-aids-that-work/' },
  openGraph: {
    title: 'Best Natural Sleep Aids That Actually Work (Evidence-Based)',
    description:
      'An evidence-graded look at common natural sleep aids, what human trials actually show, where uncertainty remains, and when persistent insomnia deserves evaluation.',
    url: '/guides/sleep/best-natural-sleep-aids-that-work/',
    type: 'article',
    images: ['/og-default.jpg'],
  },
}

const FAQS = [
  {
    question: 'What is the most effective natural sleep aid?',
    answer:
      'There is no single best supplement for insomnia. Melatonin has a distinct role as a circadian timing signal, especially when sleep timing is shifted. Magnesium, L-theanine, valerian and passionflower each have human studies, but the strength and consistency of evidence vary and do not justify a universal ranking.',
  },
  {
    question: 'How long do natural sleep aids take to work?',
    answer:
      'There is no reliable 30–60 minute rule across natural sleep aids. Melatonin timing depends on the circadian goal, while L-theanine, magnesium and herbal trials use different doses, products and treatment windows. A study schedule is not the same thing as a guaranteed onset time for an individual.',
  },
  {
    question: 'Are natural sleep aids safe to take every night?',
    answer:
      'Nightly safety is not equally established for every supplement, dose or duration. Short-term trials can support tolerability without proving indefinite use is risk-free. Medication use, pregnancy or breastfeeding, kidney disease and other health conditions can change the risk. Persistent insomnia is a reason to evaluate the cause rather than simply extending supplement use.',
  },
  {
    question: 'Can I combine natural sleep aids?',
    answer:
      'Do not assume common combinations are well established. Trials of multi-ingredient products cannot prove that magnesium plus L-theanine or melatonin plus L-theanine is reliably better than either ingredient alone. If you choose to try supplements, adding one variable at a time makes benefit, side effects and interactions easier to interpret.',
  },
]

const HEADINGS: Heading[] = [
  { id: 'quick-answer', text: 'Quick answer', level: 2 },
  { id: 'takeaways', text: 'Key takeaways', level: 2 },
  { id: 'match', text: 'Match the sleep aid to your problem', level: 2 },
  { id: 'research', text: 'What the research actually supports', level: 2 },
  { id: 'sleep-herbs', text: 'Best herbs for sleep', level: 2 },
  { id: 'risks', text: 'Risks & safety', level: 2 },
  { id: 'mistakes', text: 'Common mistakes to avoid', level: 2 },
  { id: 'faq', text: 'Frequently asked questions', level: 2 },
]

const BEST_NATURAL_SLEEP_AIDS_THAT_WORK_REFS = [
  { n: 1, text: 'Mah J, Pitre T. (2021). Oral magnesium supplementation for insomnia in older adults: systematic review and meta-analysis. BMC Complement Med Ther, 21:125.', url: 'https://pubmed.ncbi.nlm.nih.gov/33865376/' },
  { n: 2, text: 'Valente V, et al. (2024). Does valerian work for insomnia? An umbrella review of the evidence. Eur Neuropsychopharmacol, 82:6-28.', url: 'https://pubmed.ncbi.nlm.nih.gov/38359657/' },
  { n: 3, text: 'Ferracioli-Oda E, et al. (2013). Melatonin for primary sleep disorders: meta-analysis. PLoS ONE, 8(5): e63773.', url: 'https://pubmed.ncbi.nlm.nih.gov/23691095/' },
  { n: 4, text: 'Bulman A, et al. (2025). The effects of L-theanine consumption on sleep outcomes: a systematic review and meta-analysis. Sleep Med Rev, 81:102076.', url: 'https://pubmed.ncbi.nlm.nih.gov/40056718/' },
  { n: 5, text: 'Cotter J, et al. (2026). Examining the effect of L-theanine on sleep: a systematic review of dietary supplementation trials. Nutr Neurosci, 29(2):224-238.', url: 'https://pubmed.ncbi.nlm.nih.gov/41176609/' },
  { n: 6, text: 'Lee J, et al. (2020). Effects of Passiflora incarnata on polysomnographic sleep parameters in subjects with insomnia disorder: randomized placebo-controlled study. Int Clin Psychopharmacol, 35(1):29-35.', url: 'https://pubmed.ncbi.nlm.nih.gov/31714321/' },
]

export default function Page() {
  const toc = <TableOfContents headings={HEADINGS} />
  const valerianProducts = getRevenueProductSet('valerian')
  return (
    <ArticleLayout toc={toc} zone="supplement">
      <StructuredData
        pageUrl={PAGE_URL}
        headline="Best Natural Sleep Aids That Actually Work"
        description="Evidence-graded guide to natural sleep aids, including what human trials support, what remains uncertain, and when persistent insomnia deserves evaluation."
        datePublished="2026-06-18"
        dateModified="2026-08-11"
        faqs={FAQS}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides' },
          { label: 'Best Natural Sleep Aids That Work', href: '/guides/sleep/best-natural-sleep-aids-that-work' },
        ]}
      />

      <div className="space-y-12">
        <AffiliateDisclosure variant="compact" className="mb-6" />
        {/* Hero */}
        <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-10">
          <p className="eyebrow-label">Evidence-based sleep guide</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Best Natural Sleep Aids That Actually Work
          </h1>
          <p className="mt-2 text-xs text-muted">
            Written and edited by{' '}
            <Link href="/info/author/" rel="author" className="font-medium text-brand-700 hover:underline">Willie B. Randolph III</Link>
            {' '}· Last updated August 2026
          </p>
          <p className="detail-reading mt-4 text-muted">
            Natural sleep aids are often ranked as though one capsule reliably fixes one kind of
            insomnia. Human evidence is messier. Some ingredients have a clear biological role but
            modest clinical effects; others have promising subjective outcomes without strong objective
            confirmation. This guide separates those signals from marketing certainty and shows where
            the evidence is useful, limited or still inconclusive.
          </p>

          <figure className="mt-6">
            <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
              <Image
                src="/images/guides/best-natural-sleep-aids-that-work.jpg"
                alt="Natural sleep aids including magnesium, melatonin, valerian root, and lavender"
                width={1536}
                height={1024}
                priority
                className="w-full h-auto"
              />
            </div>
            <figcaption className="mt-3 text-center text-sm text-muted">
              Common natural sleep aids — compared by human evidence, limitations and safety context.
            </figcaption>
          </figure>
        </section>

        {/* Quick Answer */}
        <section id="quick-answer" className="card-premium scroll-mt-20 space-y-3 p-6">
          <h2 className="text-2xl font-semibold text-ink">Quick answer</h2>
          <p className="text-muted">
            Start with the sleep problem, not a supplement stack. <strong className="text-ink">Melatonin</strong>{' '}
            is most defensible when the problem is circadian timing. <strong className="text-ink">Magnesium</strong>{' '}
            may help some people, but insomnia trials are small and low quality. A 2025 meta-analysis found
            small improvements in several <em>subjective</em> sleep outcomes with <strong className="text-ink">L-theanine</strong>,
            while also noting that pure L-theanine studies and dose/duration evidence remain limited.
            <strong className="text-ink"> Valerian</strong> and <strong className="text-ink">passionflower</strong>{' '}
            have less consistent evidence. For chronic insomnia, supplements should not displace evaluation
            and evidence-based insomnia treatment.
          </p>
        </section>

        {/* Key Takeaways */}
        <section id="takeaways" className="scroll-mt-20 space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Key takeaways</h2>
          <ul className="space-y-2 text-muted">
            <li>• <strong className="text-ink">Do not treat “natural” as one evidence category.</strong> Melatonin, magnesium, L-theanine and herbs have different mechanisms, trial designs and certainty levels.</li>
            <li>• <strong className="text-ink">Do not promise a 30–60 minute L-theanine onset.</strong> Current reviews do not establish a universal sleep dose, onset or duration.</li>
            <li>• <strong className="text-ink">Magnesium is not a universal sleep fix.</strong> The insomnia evidence is limited and low quality, especially when magnesium status is unknown.</li>
            <li>• <strong className="text-ink">Valerian evidence remains inconclusive.</strong> A 2024 umbrella review found subjective sleep signals but no demonstrated efficacy for insomnia.</li>
            <li>• <strong className="text-ink">Combination evidence is product-specific.</strong> A multi-ingredient trial does not prove that any two ingredients form a reliably superior stack.</li>
          </ul>
        </section>

        {/* Match to cause */}
        <section id="match" className="scroll-mt-20 space-y-4">
          <p className="eyebrow-label">Start here</p>
          <h2 className="text-2xl font-semibold text-ink">Match the sleep aid to your problem</h2>
          <p className="text-muted">
            These are evidence-aligned directions to research, not treatment prescriptions. The same
            symptom can have different causes, and persistent insomnia deserves a broader assessment.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { problem: 'Sleep timing is shifted by travel or schedule', pick: 'Research melatonin timing', href: '/compounds/melatonin' },
              { problem: 'You are considering L-theanine for sleep', pick: 'Review the sleep-specific evidence', href: '/compounds/l-theanine' },
              { problem: 'You suspect low magnesium or have a reason to supplement', pick: 'Review magnesium evidence and safety', href: '/compounds/magnesium-glycinate' },
              { problem: 'Stress seems linked to poor sleep', pick: 'Separate stress evidence from insomnia evidence', href: '/herbs/ashwagandha' },
              { problem: 'You are considering valerian', pick: 'Review the mixed insomnia evidence first', href: '/herbs/valerian' },
              { problem: 'You are considering passionflower', pick: 'Review the preliminary human trials', href: '/herbs/passionflower/' },
            ].map((row) => (
              <Link key={row.problem} href={row.href} className="card-premium block p-5 transition hover:border-brand-700/40">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">If this describes you</p>
                <p className="mt-1 text-sm font-semibold text-ink">{row.problem}</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-brand-700">Evidence next step</p>
                <p className="mt-1 text-sm font-medium text-brand-800">{row.pick} →</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Evidence overview */}
        <section id="research" className="scroll-mt-20 space-y-5">
          <p className="eyebrow-label">Evidence overview</p>
          <h2 className="text-2xl font-semibold text-ink">What the research actually supports</h2>
          <p className="text-muted">
            The labels below describe the clinical evidence for sleep outcomes, not how popular an
            ingredient is. A plausible mechanism or a positive small trial is not the same as a proven
            insomnia treatment. This is educational context, not personal medical advice.
          </p>

          <div className="space-y-3">
            <article className="card-premium p-6">
              <h3 className="text-xl font-semibold text-brand-800">
                <Link href="/compounds/magnesium-glycinate/" className="hover:underline">Magnesium</Link>{' '}
                <span className="ml-2 rounded-full bg-brand-50 px-3 py-0.5 align-middle text-xs font-semibold text-brand-800">Limited · Low certainty</span>
              </h3>
              <p className="mt-3 text-sm text-muted">
                Magnesium is biologically relevant to sleep and deficiency matters, but supplementation
                evidence for insomnia is not robust. A systematic review found only three randomized
                trials in 151 older adults; sleep-onset latency improved in pooled analysis, while the
                evidence quality was rated low to very low and total sleep time did not significantly
                improve. That does not establish magnesium glycinate as the broadly best sleep aid or
                prove a universal bedtime dose. See{' '}
                <Link href="/guides/sleep/magnesium-for-sleep/" className="font-medium text-brand-700 hover:underline">magnesium for sleep</Link>{' '}
                for the form, dose and safety discussion.
              </p>
            </article>

            <article className="card-premium p-6">
              <h3 className="text-xl font-semibold text-brand-800">
                <Link href="/compounds/l-theanine/" className="hover:underline">L-theanine</Link>{' '}
                <span className="ml-2 rounded-full bg-brand-50 px-3 py-0.5 align-middle text-xs font-semibold text-brand-800">Promising · Uncertain protocol</span>
              </h3>
              <p className="mt-3 text-sm text-muted">
                A 2025 systematic review and meta-analysis of randomized trials found small improvements
                in subjective sleep-onset latency, daytime dysfunction and overall subjective sleep
                quality. The authors also emphasized the shortage of studies using pure L-theanine and
                the need to establish an adequate dose and duration. That supports a promising sleep
                signal, not a guarantee that L-theanine works within 30–60 minutes or a validated bedtime
                treatment dose.
              </p>
            </article>

            <article className="card-premium p-6">
              <h3 className="text-xl font-semibold text-brand-800">
                <Link href="/compounds/melatonin/" className="hover:underline">Melatonin</Link>{' '}
                <span className="ml-2 rounded-full bg-brand-50 px-3 py-0.5 align-middle text-xs font-semibold text-brand-800">Best defined · Circadian timing</span>
              </h3>
              <p className="mt-3 text-sm text-muted">
                Melatonin is a circadian signal rather than a conventional sedative. Its clearest use is
                when sleep timing is misaligned, while effects for general insomnia are more modest and
                depend on timing, formulation and population. Dose and timing should follow the specific
                goal rather than a “more is better” rule. See{' '}
                <Link href="/guides/compare/melatonin-vs-magnesium/" className="font-medium text-brand-700 hover:underline">melatonin vs magnesium</Link>{' '}
                and{' '}
                <Link href="/guides/sleep/magnesium-vs-melatonin/" className="font-medium text-brand-700 hover:underline">our magnesium vs melatonin guide</Link>{' '}
                for the different mechanisms.
              </p>
            </article>

            <article className="card-premium p-6">
              <h3 className="text-xl font-semibold text-brand-800">
                <Link href="/herbs/valerian/" className="hover:underline">Valerian root</Link>{' '}
                <span className="ml-2 rounded-full bg-brand-50 px-3 py-0.5 align-middle text-xs font-semibold text-brand-800">Inconclusive · Subjective signal</span>
              </h3>
              <p className="mt-3 text-sm text-muted">
                Valerian remains popular, but popularity is stronger than the insomnia evidence. A 2024
                umbrella review found no demonstrated efficacy for treating insomnia, although some
                reviews reported subjective sleep-quality improvement. Objective and quantitative results
                remain inconsistent, and preparations vary substantially. Avoid presenting a particular
                extract or treatment duration as reliably effective.
              </p>
            </article>

            <article className="card-premium p-6">
              <h3 className="text-xl font-semibold text-brand-800">
                <Link href="/herbs/passionflower/" className="hover:underline">Passionflower</Link>{' '}
                <span className="ml-2 rounded-full bg-brand-50 px-3 py-0.5 align-middle text-xs font-semibold text-brand-800">Preliminary · Small trial base</span>
              </h3>
              <p className="mt-3 text-sm text-muted">
                Passionflower has preliminary human sleep data rather than a mature evidence base. In one
                randomized placebo-controlled insomnia trial, total sleep time increased by about 23
                minutes relative to placebo, while between-group differences for sleep efficiency and
                wake-after-sleep-onset were not significant. That is a signal worth studying, not proof of
                a reliable herbal insomnia treatment. Read the full{' '}
                <Link href="/guides/passionflower/" className="font-medium text-brand-700 hover:underline">passionflower guide</Link>{' '}
                for preparation and safety context.
              </p>
            </article>
          </div>
        </section>

        <section id="sleep-herbs" className="scroll-mt-20 space-y-4">
          <p className="eyebrow-label">Herbal sleep aids</p>
          <h2 className="text-2xl font-semibold text-ink">Best herbs for sleep and sleeplessness</h2>
          <p className="text-muted">
            “Best” is too strong for most sleep herbs. Valerian has the largest review literature but
            inconclusive insomnia efficacy; passionflower has smaller randomized trials with some
            positive signals; lemon balm is commonly used in combination products, which makes its
            independent effect harder to isolate. Treat tea rituals and traditional use as different
            evidence from a controlled insomnia trial.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Link href="/herbs/valerian/" className="card-premium block p-5 text-sm hover:border-brand-700/40">
              <span className="block font-semibold text-ink">Valerian</span>
              <span className="mt-2 block text-muted">Commonly used for sleep, with subjective signals but inconclusive evidence for treating insomnia.</span>
            </Link>
            <Link href="/herbs/passionflower/" className="card-premium block p-5 text-sm hover:border-brand-700/40">
              <span className="block font-semibold text-ink">Passionflower</span>
              <span className="mt-2 block text-muted">Preliminary randomized evidence suggests possible sleep benefits, but replication and stronger trials are needed.</span>
            </Link>
            <Link href="/herbs/melissa-officinalis/" className="card-premium block p-5 text-sm hover:border-brand-700/40">
              <span className="block font-semibold text-ink">Lemon balm</span>
              <span className="mt-2 block text-muted">Often studied in combinations, so do not assume the effect of a multi-ingredient formula belongs to lemon balm alone.</span>
            </Link>
          </div>
        </section>

        {/* Risks & safety */}
        <section id="risks" className="scroll-mt-20 space-y-3 rounded-[1.65rem] border border-amber-200 bg-amber-50/70 p-6">
          <h2 className="text-xl font-semibold text-amber-900">Risks &amp; safety</h2>
          <ul className="space-y-2 text-sm text-amber-900">
            <li>• Do not assume “natural” means interaction-free. Sedating supplements can add to the effects of alcohol, prescription sedatives or other products that impair alertness.</li>
            <li>• Pregnancy, breastfeeding, childhood use and prescription-medication use deserve product-specific guidance rather than blanket nightly-safety claims.</li>
            <li>• Supplemental magnesium can cause gastrointestinal effects, and impaired kidney function changes magnesium safety.</li>
            <li>• Persistent insomnia, loud snoring with pauses, restless legs, significant mood symptoms or daytime exhaustion can point to a condition a supplement will not address.</li>
          </ul>
        </section>

        {/* Common mistakes */}
        <section id="mistakes" className="scroll-mt-20 space-y-3 rounded-[1.65rem] border border-red-100 bg-red-50/60 p-6">
          <h2 className="text-xl font-semibold text-red-900">Common mistakes to avoid</h2>
          <ul className="space-y-2 text-sm text-red-800">
            <li>• <strong>Treating study timing as guaranteed onset.</strong> Taking an ingredient 30–60 minutes before bed in a trial does not prove that everyone will feel an effect in that window.</li>
            <li>• <strong>Turning a positive small study into a universal ranking.</strong> Population, formulation, dose and outcome measure all matter.</li>
            <li>• <strong>Assuming stacks are established.</strong> Multi-ingredient products are not evidence that every pair of ingredients is synergistic.</li>
            <li>• <strong>Ignoring persistent insomnia.</strong> Repeatedly adding supplements can delay finding a circadian, breathing, movement, medication, mood or behavioral contributor.</li>
          </ul>
        </section>

        {valerianProducts && (
        <>
          <References refs={BEST_NATURAL_SLEEP_AIDS_THAT_WORK_REFS} />
          <p className="text-xs text-muted">
            Product links are a commercial handoff for readers who choose valerian despite the uncertain
            insomnia evidence above; they are not an efficacy endorsement.
          </p>
          <RecommendationSection products={valerianProducts.products} />
        </>
        )}

        {/* FAQs */}
        <section id="faq" className="scroll-mt-20 space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details key={faq.question} className="card-premium p-5">
                <summary className="cursor-pointer text-base font-semibold text-ink">{faq.question}</summary>
                <p className="mt-2 text-sm text-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <EmailCapture location="guides-best-natural-sleep-aids-that-work" className="mt-6" />

        {/* Related */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Related guides &amp; comparisons</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/guides/sleep/best-supplements-for-sleep/" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Best Supplements for Sleep →</Link>
            <Link href="/guides/sleep/magnesium-for-sleep/" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Magnesium for Sleep →</Link>
            <Link href="/guides/anxiety/best-herbs-for-stress-and-anxiety-at-night/" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Best Herbs for Stress &amp; Anxiety at Night →</Link>
            <Link href="/guides/compare/melatonin-vs-valerian-vs-magnesium-for-sleep/" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Melatonin vs Valerian vs Magnesium →</Link>
            <Link href="/guides/compare/sleep-herbs-vs-melatonin/" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Sleep Herbs vs Melatonin →</Link>
            <Link href="/guides/sleep/" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">All Sleep Guides →</Link>
          </div>
        </section>
      </div>
    </ArticleLayout>
  )
}
