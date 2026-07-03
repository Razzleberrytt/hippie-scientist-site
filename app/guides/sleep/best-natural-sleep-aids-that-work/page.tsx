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

const PAGE_URL = `${SITE_URL}/guides/sleep/best-natural-sleep-aids-that-work`

export const metadata: Metadata = {
  title: 'Best Natural Sleep Aids That Actually Work (Evidence-Based)',
  description:
    'Which natural sleep aids actually work? An evidence-graded guide to magnesium, valerian, melatonin, L-theanine, passionflower and lemon balm — matched to why you cannot sleep, with dosing, safety and what to avoid.',
  alternates: { canonical: '/guides/sleep/best-natural-sleep-aids-that-work/' },
  openGraph: {
    title: 'Best Natural Sleep Aids That Actually Work (Evidence-Based)',
    description:
      'An honest, evidence-graded look at the natural sleep aids worth your time — and the ones that are mostly marketing. Matched to your sleep problem, with dosing and safety.',
    url: '/guides/sleep/best-natural-sleep-aids-that-work/',
    type: 'article',
    images: ['/og-default.jpg'],
  },
}

const FAQS = [
  {
    question: 'What is the most effective natural sleep aid?',
    answer:
      'There is no single best option — it depends on why you are awake. For stress-driven, "wired but tired" sleep problems, magnesium glycinate and ashwagandha have the most consistent support. For trouble falling asleep on a shifted schedule (jet lag, shift work, late chronotype), low-dose melatonin is the best-evidenced. For racing thoughts, L-theanine and passionflower are the gentlest reliable options.',
  },
  {
    question: 'How long do natural sleep aids take to work?',
    answer:
      'Fast-acting options like melatonin and L-theanine work within 30–60 minutes of a single dose. Adaptogenic and herbal options that rebalance the stress system — ashwagandha, valerian, passionflower — usually need 1–4 weeks of consistent nightly use before their full effect shows. Judging them after one night is the most common reason people conclude they "do not work."',
  },
  {
    question: 'Are natural sleep aids safe to take every night?',
    answer:
      'Magnesium, L-theanine and low-dose melatonin are generally well tolerated for nightly use in healthy adults. Sedating herbs such as valerian and passionflower should not be combined with alcohol, benzodiazepines or other sedatives, and are not recommended in pregnancy. If you need a sleep aid every single night for more than a few weeks, that is a signal to investigate the underlying cause rather than to keep medicating the symptom.',
  },
  {
    question: 'Can I combine natural sleep aids?',
    answer:
      'Some combinations are well established — magnesium with L-theanine, or melatonin with L-theanine. The key rule is to add one variable at a time so you can tell what is actually working. Stacking five supplements at once tells you nothing and raises the chance of side effects or interactions.',
  },
]

const HEADINGS: Heading[] = [
  { id: 'quick-answer', text: 'Quick answer', level: 2 },
  { id: 'takeaways', text: 'Key takeaways', level: 2 },
  { id: 'match', text: 'Match the sleep aid to your problem', level: 2 },
  { id: 'research', text: 'What the research actually supports', level: 2 },
  { id: 'risks', text: 'Risks & safety', level: 2 },
  { id: 'mistakes', text: 'Common mistakes to avoid', level: 2 },
  { id: 'faq', text: 'Frequently asked questions', level: 2 },
]

export default function Page() {
  const toc = <TableOfContents headings={HEADINGS} />
  const valerianProducts = getRevenueProductSet('valerian')
  return (
    <ArticleLayout toc={toc} zone="supplement">
      <StructuredData
        pageUrl={PAGE_URL}
        headline="Best Natural Sleep Aids That Actually Work"
        description="Evidence-graded guide to natural sleep aids — magnesium, valerian, melatonin, L-theanine, passionflower and lemon balm — matched to the cause of your sleep problem, with dosing and safety."
        datePublished="2026-06-18"
        dateModified="2026-06-18"
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
            Written and reviewed by{' '}
            <Link href="/author/" className="font-medium text-brand-700 hover:underline">Will Thomas</Link>
            {' '}· Last updated June 2026
          </p>
          <p className="detail-reading mt-4 text-muted">
            Most &ldquo;natural sleep aid&rdquo; lists are interchangeable and unhelpful: the same eight
            ingredients ranked in a different order. The truth is that sleep problems are not one
            problem. The aid that works depends almost entirely on <em>why</em> you are awake — a
            racing mind, physical tension, a shifted body clock, or stress hormones that will not
            switch off. This guide groups the best-supported options by the problem they actually
            solve, with honest evidence grades, dosing context and safety limits.
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
            The most-used natural sleep aids — compared by evidence and safety.
          </figcaption>
        </figure>
        </section>

        {/* Quick Answer */}
        <section id="quick-answer" className="card-premium scroll-mt-20 space-y-3 p-6">
          <h2 className="text-2xl font-semibold text-ink">Quick answer</h2>
          <p className="text-muted">
            If you want one place to start: <strong className="text-ink">magnesium glycinate</strong>{' '}
            (200–400&nbsp;mg in the evening) is the most broadly useful and best-tolerated natural
            sleep aid, especially when stress and muscle tension are part of the picture. Add{' '}
            <strong className="text-ink">L-theanine</strong> (100–200&nbsp;mg) if your mind races at
            bedtime. Use <strong className="text-ink">low-dose melatonin</strong> (0.5–1&nbsp;mg) only
            for a shifted schedule, not as a nightly sedative. Reserve sedating herbs like{' '}
            <strong className="text-ink">valerian</strong> and{' '}
            <strong className="text-ink">passionflower</strong> for short courses. No supplement
            replaces consistent sleep timing, morning light and a caffeine curfew.
          </p>
        </section>

        {/* Key Takeaways */}
        <section id="takeaways" className="scroll-mt-20 space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Key takeaways</h2>
          <ul className="space-y-2 text-muted">
            <li>• <strong className="text-ink">Match the aid to the cause.</strong> A mismatch between supplement and root problem is the single most common reason natural sleep aids appear to fail.</li>
            <li>• <strong className="text-ink">Magnesium and L-theanine are the safest starting points</strong> with broad, consistent evidence and a very low side-effect burden.</li>
            <li>• <strong className="text-ink">Melatonin is a timing signal, not a sedative.</strong> More is not better — 0.5–1&nbsp;mg often works as well as 5–10&nbsp;mg with fewer next-day effects.</li>
            <li>• <strong className="text-ink">Herbs take time.</strong> Valerian and passionflower are typically judged after 2–4 weeks of consistent use, not a single night.</li>
            <li>• <strong className="text-ink">Foundations beat formulas.</strong> Light, schedule, caffeine timing and stress load move sleep more than any capsule.</li>
          </ul>
        </section>

        {/* Match to cause */}
        <section id="match" className="scroll-mt-20 space-y-4">
          <p className="eyebrow-label">Start here</p>
          <h2 className="text-2xl font-semibold text-ink">Match the sleep aid to your problem</h2>
          <p className="text-muted">
            Use this as a decision shortcut, then read the profile for whichever option fits. Each row
            links to a deeper monograph or comparison.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { problem: 'Trouble falling asleep on a shifted schedule', pick: 'Low-dose melatonin', href: '/compounds/melatonin' },
              { problem: 'Racing thoughts at bedtime', pick: 'L-theanine, then passionflower', href: '/compounds/l-theanine' },
              { problem: 'Waking through the night / muscle tension', pick: 'Magnesium glycinate', href: '/compounds/magnesium-glycinate' },
              { problem: '"Wired but tired", stress-driven', pick: 'Ashwagandha (evening) + magnesium', href: '/herbs/ashwagandha' },
              { problem: 'Mild, occasional insomnia', pick: 'Valerian or lemon balm', href: '/herbs/valerian' },
              { problem: 'Anxiety-linked wakefulness', pick: 'Passionflower + L-theanine', href: '/herbs/passionflower/' },
            ].map((row) => (
              <Link key={row.problem} href={row.href} className="card-premium block p-5 transition hover:border-brand-700/40">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">If your problem is</p>
                <p className="mt-1 text-sm font-semibold text-ink">{row.problem}</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-brand-700">Best starting option</p>
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
            Grades below reflect the quality of <em>human</em> evidence: A = strong, consistent
            randomized trials; B = moderate or mixed trials; C = preliminary or mostly traditional use.
            This is educational context, not personal medical advice.
          </p>

          <div className="space-y-3">
            <article className="card-premium p-6">
              <h3 className="text-xl font-semibold text-brand-800">
                <Link href="/compounds/magnesium-glycinate" className="hover:underline">Magnesium glycinate</Link>{' '}
                <span className="ml-2 rounded-full bg-brand-50 px-3 py-0.5 align-middle text-xs font-semibold text-brand-800">Grade B · Foundation</span>
              </h3>
              <p className="mt-3 text-sm text-muted">
                Magnesium reduces nervous-system excitability and supports the calming GABA system. The
                benefit is clearest in older adults and anyone with suboptimal magnesium status — common
                in stressed, high-caffeine populations. The glycinate form is well absorbed and gentle on
                the gut. Typical evening dose is 200–400&nbsp;mg of elemental magnesium. It pairs naturally
                with L-theanine; see{' '}
                <Link href="/guides/compare/ashwagandha-vs-l-theanine-vs-magnesium" className="font-medium text-brand-700 hover:underline">L-theanine vs magnesium</Link>{' '}
                for how to choose between or combine them.
              </p>
            </article>

            <article className="card-premium p-6">
              <h3 className="text-xl font-semibold text-brand-800">
                <Link href="/compounds/l-theanine" className="hover:underline">L-theanine</Link>{' '}
                <span className="ml-2 rounded-full bg-brand-50 px-3 py-0.5 align-middle text-xs font-semibold text-brand-800">Grade B · Calm</span>
              </h3>
              <p className="mt-3 text-sm text-muted">
                An amino acid from tea that increases alpha-wave activity and quiets stress-driven
                arousal without sedation. It is the best option when the obstacle is mental noise rather
                than physical tiredness. Typical dose is 100–200&nbsp;mg, 30–60&nbsp;minutes before bed,
                and it is one of the safest supplements available for nightly use.
              </p>
            </article>

            <article className="card-premium p-6">
              <h3 className="text-xl font-semibold text-brand-800">
                <Link href="/compounds/melatonin" className="hover:underline">Melatonin (low dose)</Link>{' '}
                <span className="ml-2 rounded-full bg-brand-50 px-3 py-0.5 align-middle text-xs font-semibold text-brand-800">Grade A (circadian)</span>
              </h3>
              <p className="mt-3 text-sm text-muted">
                Melatonin is a circadian signal, not a knockout drug. It is strongly evidenced for jet
                lag, shift work and delayed sleep phase, and moderately helpful for general sleep-onset
                latency. Use 0.5–1&nbsp;mg — higher doses rarely help more and can cause grogginess. See{' '}
                <Link href="/guides/compare/melatonin-vs-magnesium" className="font-medium text-brand-700 hover:underline">melatonin vs magnesium</Link>{' '}
                and{' '}
                <Link href="/guides/sleep/magnesium-vs-melatonin" className="font-medium text-brand-700 hover:underline">our magnesium vs melatonin guide</Link>{' '}
                to decide which mechanism fits your problem.
              </p>
            </article>

            <article className="card-premium p-6">
              <h3 className="text-xl font-semibold text-brand-800">
                <Link href="/herbs/valerian" className="hover:underline">Valerian root</Link>{' '}
                <span className="ml-2 rounded-full bg-brand-50 px-3 py-0.5 align-middle text-xs font-semibold text-brand-800">Grade C–B · Sedating</span>
              </h3>
              <p className="mt-3 text-sm text-muted">
                Valerian acts on GABA-A receptors and has a genuine mild sedative effect, though trial
                results are mixed and depend heavily on extract quality. It works best with consistent
                use over a couple of weeks and pairs traditionally with{' '}
                <Link href="/herbs/hops" className="font-medium text-brand-700 hover:underline">hops</Link>{' '}
                and lemon balm. Avoid combining with alcohol or other sedatives.
              </p>
            </article>

            <article className="card-premium p-6">
              <h3 className="text-xl font-semibold text-brand-800">
                <Link href="/herbs/passionflower/" className="hover:underline">Passionflower &amp; lemon balm</Link>{' '}
                <span className="ml-2 rounded-full bg-brand-50 px-3 py-0.5 align-middle text-xs font-semibold text-brand-800">Grade C · Gentle</span>
              </h3>
              <p className="mt-3 text-sm text-muted">
                Both raise GABA tone and have a long traditional record for anxiety-related, restless
                sleep. The evidence base is smaller, but they are gentle, low-risk options for mild
                difficulty winding down. Read the full{' '}
                <Link href="/guides/passionflower" className="font-medium text-brand-700 hover:underline">passionflower guide</Link>{' '}
                for preparation and dosing.
              </p>
            </article>
          </div>
        </section>

        {/* Risks & safety */}
        <section id="risks" className="scroll-mt-20 space-y-3 rounded-[1.65rem] border border-amber-200 bg-amber-50/70 p-6">
          <h2 className="text-xl font-semibold text-amber-900">Risks &amp; safety</h2>
          <ul className="space-y-2 text-sm text-amber-900">
            <li>• Do not combine sedating herbs (valerian, passionflower) with alcohol, benzodiazepines, opioids or other CNS depressants.</li>
            <li>• Valerian and passionflower are not recommended in pregnancy or breastfeeding, or for children, without clinical guidance.</li>
            <li>• High-dose magnesium can cause loose stools; reduce the dose rather than stopping entirely. Avoid in severe kidney disease.</li>
            <li>• Persistent insomnia, loud snoring with pauses, or daytime exhaustion can signal sleep apnea or another condition — see a clinician rather than self-treating.</li>
          </ul>
        </section>

        {/* Common mistakes */}
        <section id="mistakes" className="scroll-mt-20 space-y-3 rounded-[1.65rem] border border-red-100 bg-red-50/60 p-6">
          <h2 className="text-xl font-semibold text-red-900">Common mistakes to avoid</h2>
          <ul className="space-y-2 text-sm text-red-800">
            <li>• <strong>Treating melatonin as a sedative.</strong> It shifts timing; it does not force deep sleep. Megadoses backfire.</li>
            <li>• <strong>Judging herbs after one night.</strong> Valerian and passionflower need consistent use to show their effect.</li>
            <li>• <strong>Stacking everything at once.</strong> Add one variable at a time or you will never know what worked.</li>
            <li>• <strong>Ignoring the foundations.</strong> No capsule offsets a 4&nbsp;pm coffee, a midnight screen and a different bedtime every day.</li>
          </ul>
        </section>

        {valerianProducts && (
          <RecommendationSection products={valerianProducts.products} />
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
            <Link href="/guides/sleep/best-supplements-for-sleep" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Best Supplements for Sleep →</Link>
            <Link href="/guides/sleep/magnesium-for-sleep/" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Magnesium for Sleep →</Link>
            <Link href="/guides/best-herbs-for-stress-and-anxiety-at-night" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Best Herbs for Stress &amp; Anxiety at Night →</Link>
            <Link href="/guides/compare/melatonin-vs-valerian-vs-magnesium-for-sleep" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Melatonin vs Valerian vs Magnesium →</Link>
            <Link href="/guides/compare/sleep-herbs-vs-melatonin" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Sleep Herbs vs Melatonin →</Link>
            <Link href="/guides/sleep" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">All Sleep Guides →</Link>
          </div>
        </section>
      </div>
    </ArticleLayout>
  )
}
