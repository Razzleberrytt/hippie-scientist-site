import type { Metadata } from 'next'
import Link from 'next/link'
import StructuredData from '@/components/StructuredData'
import { SITE_URL } from '@/lib/navigation-config'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import EmailCapture from '@/components/EmailCapture'

const PAGE_URL = `${SITE_URL}/guides/best-supplements-for-overthinking`

export const metadata: Metadata = {
  title: 'Best Supplements for Overthinking & a Racing Mind',
  description:
    'Stuck in mental loops? An evidence-informed guide to supplements for overthinking — L-theanine, magnesium, lemon balm, ashwagandha and saffron — matched to whether your overthinking is anxious, stress-driven or sleep-deprived.',
  alternates: { canonical: '/guides/best-supplements-for-overthinking/' },
  openGraph: {
    title: 'Best Supplements for Overthinking & a Racing Mind',
    description:
      'Supplements that genuinely help quiet a racing mind — matched to whether your overthinking is anxiety, stress overload or poor sleep, with dosing and safety.',
    url: '/guides/best-supplements-for-overthinking',
    type: 'article',
  },
}

const FAQS = [
  {
    question: 'What supplement is best for overthinking?',
    answer:
      'L-theanine is the best first choice for most people. At 100–200&nbsp;mg it quiets stress-driven mental chatter within an hour without sedation or dependency. If overthinking is worse in the evening and tied to tension, magnesium glycinate is a strong addition. If it is chronic and stress-hormone driven, ashwagandha addresses the underlying load over a few weeks.',
  },
  {
    question: 'Can supplements stop a racing mind at night?',
    answer:
      'They can take the edge off. L-theanine and magnesium in the evening, or a passionflower or lemon balm tea, reduce the arousal that fuels bedtime rumination. But supplements work best alongside a wind-down routine — dimming screens, a caffeine curfew, and a quick written "brain dump" to get the loop out of your head and onto paper.',
  },
  {
    question: 'Is overthinking the same as anxiety?',
    answer:
      'They overlap but are not identical. Overthinking (rumination) is a thinking pattern; anxiety is the broader emotional and physical state that often drives it. Mild, situational overthinking responds well to calming supplements and routine changes. Persistent rumination that interferes with daily life, sleep or mood is better addressed with a clinician and approaches like CBT, with supplements as optional support.',
  },
  {
    question: 'How long until these supplements work?',
    answer:
      'L-theanine and magnesium are felt the same day, often within an hour or two. Lemon balm is similar. Ashwagandha and saffron work gradually, usually over 2–6 weeks of consistent daily use. Give the fast options a few days and the adaptogens at least a month before judging them.',
  },
]

const HEADINGS: Heading[] = [
  { id: 'quick-answer', text: 'Quick answer', level: 2 },
  { id: 'takeaways', text: 'Key takeaways', level: 2 },
  { id: 'match', text: 'Match the supplement to why your mind races', level: 2 },
  { id: 'options', text: 'The options worth trying', level: 2 },
  { id: 'basics', text: 'The basics that beat any supplement', level: 2 },
  { id: 'risks', text: 'Risks & safety', level: 2 },
  { id: 'faq', text: 'Frequently asked questions', level: 2 },
]

export default function Page() {
  const toc = <TableOfContents headings={HEADINGS} />
  const ashwagandhaProducts = getRevenueProductSet('ashwagandha')
  return (
    <ArticleLayout toc={toc} zone="supplement">
      <StructuredData
        pageUrl={PAGE_URL}
        headline="Best Supplements for Overthinking"
        description="Evidence-informed guide to supplements for overthinking and a racing mind — L-theanine, magnesium, lemon balm, ashwagandha and saffron — matched to the cause, with dosing and safety."
        datePublished="2026-06-18"
        dateModified="2026-06-18"
        faqs={FAQS}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides' },
          { label: 'Best Supplements for Overthinking', href: '/guides/best-supplements-for-overthinking' },
        ]}
      />

      <div className="space-y-12">
        <AffiliateDisclosure variant="compact" className="mb-6" />
        {/* Hero */}
        <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-10">
          <p className="eyebrow-label">Decision guide</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Best Supplements for Overthinking
          </h1>
          <p className="mt-2 text-xs text-muted">
            Written and reviewed by{' '}
            <Link href="/author" className="font-medium text-brand-700 hover:underline">Will Thomas</Link>
            {' '}· Last updated June 2026
          </p>
          <p className="detail-reading mt-4 text-muted">
            Overthinking is the mental version of a car idling too high — the engine of your attention
            running when it should be resting. Supplements will not rewrite your thinking habits, but a
            few can genuinely lower the background arousal that keeps the loops spinning. The key is to
            match the supplement to <em>why</em> your mind is racing: anxiety, stress overload, or simple
            sleep deprivation. This guide breaks down the best-supported options for each.
          </p>
        </section>

        {/* Quick Answer */}
        <section id="quick-answer" className="card-premium scroll-mt-20 space-y-3 p-6">
          <h2 className="text-2xl font-semibold text-ink">Quick answer</h2>
          <p className="text-muted">
            Start with <strong className="text-ink">L-theanine</strong> (100–200&nbsp;mg) — it is the most
            reliable, fastest and safest way to quiet mental chatter without sedation. Add{' '}
            <strong className="text-ink">magnesium glycinate</strong> in the evening if overthinking peaks
            at night with physical tension. If the rumination is chronic and stress-driven, layer in{' '}
            <strong className="text-ink">ashwagandha</strong> and give it a few weeks.{' '}
            <strong className="text-ink">Lemon balm</strong> and{' '}
            <strong className="text-ink">saffron</strong> are gentle add-ons. Pair all of it with a
            screen curfew and a written &ldquo;brain dump&rdquo; — behavior moves rumination more than any
            capsule.
          </p>
        </section>

        {/* Key Takeaways */}
        <section id="takeaways" className="scroll-mt-20 space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Key takeaways</h2>
          <ul className="space-y-2 text-muted">
            <li>• <strong className="text-ink">L-theanine is the default</strong> — fast, calming, non-sedating and very safe for daily use.</li>
            <li>• <strong className="text-ink">Find the driver:</strong> anxious overthinking, stress-overload overthinking, and sleep-deprived overthinking each respond to a different tool.</li>
            <li>• <strong className="text-ink">Evening tension?</strong> Magnesium glycinate plus L-theanine is a clean, well-tolerated nighttime combination.</li>
            <li>• <strong className="text-ink">Chronic loops?</strong> Adaptogens like ashwagandha address the underlying stress load over weeks.</li>
            <li>• <strong className="text-ink">Supplements support, not replace,</strong> the behavioral basics — sleep, caffeine timing and getting thoughts out of your head.</li>
          </ul>
        </section>

        {/* Match driver */}
        <section id="match" className="scroll-mt-20 space-y-4">
          <p className="eyebrow-label">Find your driver</p>
          <h2 className="text-2xl font-semibold text-ink">Match the supplement to why your mind races</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { driver: 'Anxious overthinking', detail: 'Worry-based loops, "what ifs"', pick: 'L-theanine + lemon balm', href: '/compounds/l-theanine' },
              { driver: 'Stress-overload overthinking', detail: 'Too much on your plate', pick: 'Ashwagandha + magnesium', href: '/herbs/ashwagandha' },
              { driver: 'Sleep-deprived overthinking', detail: 'Worse when under-slept', pick: 'Magnesium + sleep routine', href: '/compounds/magnesium-glycinate' },
            ].map((row) => (
              <Link key={row.driver} href={row.href} className="card-premium block p-5 transition hover:border-brand-700/40">
                <p className="text-sm font-semibold text-ink">{row.driver}</p>
                <p className="mt-1 text-xs text-muted">{row.detail}</p>
                <p className="mt-3 text-xs font-bold uppercase tracking-wider text-brand-700">Try</p>
                <p className="mt-1 text-sm font-medium text-brand-800">{row.pick} →</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Evidence overview */}
        <section id="options" className="scroll-mt-20 space-y-5">
          <p className="eyebrow-label">Evidence overview</p>
          <h2 className="text-2xl font-semibold text-ink">The options worth trying</h2>

          <article className="card-premium p-6">
            <h3 className="text-xl font-semibold text-brand-800">
              <Link href="/compounds/l-theanine" className="hover:underline">L-theanine</Link>{' '}
              <span className="ml-2 rounded-full bg-brand-50 px-3 py-0.5 align-middle text-xs font-semibold text-brand-800">First choice</span>
            </h3>
            <p className="mt-3 text-sm text-muted">
              An amino acid from tea that raises calming alpha-wave activity and modulates GABA and
              glutamate. Trials show reduced stress and a quieter, calmer focus without drowsiness. It is
              the cleanest way to take the volume down on mental chatter, and it pairs perfectly with
              magnesium. Compare them in{' '}
              <Link href="/compare/l-theanine-vs-magnesium" className="font-medium text-brand-700 hover:underline">L-theanine vs magnesium</Link>.
            </p>
          </article>

          <article className="card-premium p-6">
            <h3 className="text-xl font-semibold text-brand-800">
              <Link href="/compounds/magnesium-glycinate" className="hover:underline">Magnesium glycinate</Link>
            </h3>
            <p className="mt-3 text-sm text-muted">
              Magnesium lowers nervous-system excitability and supports relaxation, and many people who
              overthink are running low on it. The glycinate form is gentle and well absorbed, making it a
              natural evening companion to L-theanine when rumination peaks at night.
            </p>
          </article>

          <article className="card-premium p-6">
            <h3 className="text-xl font-semibold text-brand-800">
              <Link href="/herbs/melissa-officinalis" className="hover:underline">Lemon balm &amp; saffron</Link>
            </h3>
            <p className="mt-3 text-sm text-muted">
              Lemon balm is a gentle calming herb with some trial support for reducing stress and
              improving calm. Saffron has growing evidence for mood and rumination at standardized doses.
              Both are low-risk add-ons rather than primary tools — useful if L-theanine and magnesium are
              not quite enough.
            </p>
          </article>

          <article className="card-premium p-6">
            <h3 className="text-xl font-semibold text-brand-800">
              <Link href="/herbs/ashwagandha" className="hover:underline">Ashwagandha</Link>{' '}
              <span className="ml-2 rounded-full bg-brand-50 px-3 py-0.5 align-middle text-xs font-semibold text-brand-800">For chronic loops</span>
            </h3>
            <p className="mt-3 text-sm text-muted">
              When overthinking is really chronic stress wearing a different mask, ashwagandha addresses
              the root by lowering cortisol and perceived stress over 4–8 weeks. It will not stop a single
              spiral tonight, but it lowers the baseline that makes spirals more likely. See our{' '}
              <Link href="/guides/how-to-lower-cortisol-naturally" className="font-medium text-brand-700 hover:underline">how to lower cortisol naturally</Link>{' '}
              guide.
            </p>
          </article>
        </section>

        {/* Behavioral basics */}
        <section id="basics" className="scroll-mt-20 space-y-3 rounded-[1.65rem] border border-brand-900/10 bg-brand-50/40 p-6">
          <h2 className="text-xl font-semibold text-ink">The basics that beat any supplement</h2>
          <ul className="space-y-2 text-sm text-muted">
            <li>• <strong className="text-ink">Brain dump:</strong> write the loop down for two minutes — externalizing a worry reliably loosens its grip.</li>
            <li>• <strong className="text-ink">Caffeine curfew:</strong> afternoon caffeine amplifies the arousal that feeds overthinking.</li>
            <li>• <strong className="text-ink">Protect sleep:</strong> under-slept brains ruminate more; consistent sleep is the highest-leverage fix.</li>
            <li>• <strong className="text-ink">Move:</strong> even a short walk interrupts a spiral by shifting your physiology.</li>
          </ul>
        </section>

        {/* Risks & safety */}
        <section id="risks" className="scroll-mt-20 space-y-3 rounded-[1.65rem] border border-amber-200 bg-amber-50/70 p-6">
          <h2 className="text-xl font-semibold text-amber-900">Risks &amp; safety</h2>
          <ul className="space-y-2 text-sm text-amber-900">
            <li>• This is educational guidance, not treatment. Persistent rumination, intrusive thoughts or low mood deserve a clinician&rsquo;s input.</li>
            <li>• Ashwagandha needs caution with thyroid conditions, sedatives and in pregnancy; saffron should be used at modest doses and avoided in pregnancy.</li>
            <li>• High-dose magnesium can loosen stools — lower the dose rather than stopping.</li>
            <li>• If you take medication for anxiety, mood or sleep, confirm compatibility before adding supplements.</li>
          </ul>
        </section>

        {ashwagandhaProducts && (
          <RecommendationSection products={ashwagandhaProducts.products} />
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

        <EmailCapture location="guides-best-supplements-for-overthinking" className="mt-6" />

        {/* Related */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Related guides &amp; comparisons</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/guides/best-herbs-for-anxiety" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Best Herbs for Anxiety →</Link>
            <Link href="/guides/natural-anxiolytics-beyond-ashwagandha" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Natural Anxiolytics Beyond Ashwagandha →</Link>
            <Link href="/guides/best-herbs-for-stress-and-anxiety-at-night" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Best Herbs for Stress &amp; Anxiety at Night →</Link>
            <Link href="/guides/how-to-lower-cortisol-naturally" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">How to Lower Cortisol Naturally →</Link>
            <Link href="/compare/ashwagandha-vs-l-theanine-vs-magnesium" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Ashwagandha vs L-theanine vs Magnesium →</Link>
            <Link href="/goals/anxiety" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">All Anxiety Guides →</Link>
          </div>
        </section>
      </div>
    </ArticleLayout>
  )
}
