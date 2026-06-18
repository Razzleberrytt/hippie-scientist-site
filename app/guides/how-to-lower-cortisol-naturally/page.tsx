import type { Metadata } from 'next'
import Link from 'next/link'
import StructuredData from '@/components/StructuredData'
import { SITE_URL } from '@/lib/navigation-config'

const PAGE_URL = `${SITE_URL}/guides/how-to-lower-cortisol-naturally`

export const metadata: Metadata = {
  title: 'How to Lower Cortisol Naturally — Evidence-Based Guide',
  description:
    'A practical, evidence-based guide to lowering cortisol naturally: how the stress hormone works, the lifestyle levers that move it most, and the herbs — ashwagandha, rhodiola, holy basil, magnesium — with the best support.',
  alternates: { canonical: '/guides/how-to-lower-cortisol-naturally' },
  openGraph: {
    title: 'How to Lower Cortisol Naturally — Evidence-Based Guide',
    description:
      'How to lower cortisol naturally — the lifestyle levers that matter most plus the best-supported adaptogenic herbs, with dosing context and safety.',
    url: '/guides/how-to-lower-cortisol-naturally',
    type: 'article',
  },
}

const FAQS = [
  {
    question: 'What lowers cortisol the fastest?',
    answer:
      'Acutely, the fastest levers are behavioral: slow breathing (a longer exhale than inhale), a short walk, sunlight, and physical or social comfort all reduce cortisol within minutes. Supplements work more slowly. Among them, L-theanine and phosphatidylserine can blunt an acute cortisol response, while ashwagandha lowers baseline cortisol over weeks of consistent use.',
  },
  {
    question: 'Does ashwagandha really lower cortisol?',
    answer:
      'Yes — ashwagandha is the best-evidenced supplement for this. Multiple randomized trials of standardized extracts (such as KSM-66) show meaningful reductions in serum cortisol and perceived stress in chronically stressed adults, typically over 4–8 weeks. It is not an instant fix; it works by helping the HPA stress axis return to a more regulated baseline.',
  },
  {
    question: 'Is high cortisol always bad?',
    answer:
      'No. Cortisol is essential and follows a healthy daily rhythm — high in the morning to wake you, low at night to let you sleep. The problem is chronic elevation or a flattened rhythm from ongoing stress, poor sleep and irregular routines. The goal is not to crush cortisol but to restore its natural rhythm.',
  },
  {
    question: 'When should I see a doctor about cortisol?',
    answer:
      'Lifestyle and supplements address everyday stress load, not medical disease. Symptoms like unexplained weight changes, persistent high blood pressure, easy bruising, muscle weakness or severe fatigue warrant medical evaluation, because conditions such as Cushing&rsquo;s syndrome or adrenal disorders need proper testing and treatment.',
  },
]

export default function Page() {
  return (
    <>
      <StructuredData
        pageUrl={PAGE_URL}
        headline="How to Lower Cortisol Naturally"
        description="Evidence-based guide to lowering cortisol naturally — the lifestyle levers that move it most and the best-supported adaptogenic herbs, with dosing context and safety."
        datePublished="2026-06-18"
        dateModified="2026-06-18"
        faqs={FAQS}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides' },
          { label: 'How to Lower Cortisol Naturally', href: '/guides/how-to-lower-cortisol-naturally' },
        ]}
      />

      <div className="container-page space-y-12 py-10">
        {/* Hero */}
        <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-10">
          <p className="eyebrow-label">Stress education</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            How to Lower Cortisol Naturally
          </h1>
          <p className="mt-2 text-xs text-muted">
            Written and reviewed by{' '}
            <Link href="/author" className="font-medium text-brand-700 hover:underline">Will Thomas</Link>
            {' '}· Last updated June 2026
          </p>
          <p className="detail-reading mt-4 text-muted">
            Cortisol is not the enemy. It is the hormone that wakes you up, mobilizes energy and helps you
            respond to challenge. The problem is when it stays elevated — or loses its natural daily rhythm
            — because of chronic stress, poor sleep and constant stimulation. Lowering cortisol naturally
            is really about restoring that rhythm. This guide covers the lifestyle levers that move it
            most, then the herbs with the strongest evidence, in priority order.
          </p>
        </section>

        {/* Quick Answer */}
        <section className="card-premium space-y-3 p-6">
          <h2 className="text-2xl font-semibold text-ink">Quick answer</h2>
          <p className="text-muted">
            The biggest natural lever on cortisol is not a supplement — it is{' '}
            <strong className="text-ink">sleep and a consistent daily rhythm</strong>, followed by{' '}
            <strong className="text-ink">morning light</strong>,{' '}
            <strong className="text-ink">moderate exercise</strong> (without overtraining),{' '}
            <strong className="text-ink">slow breathing</strong> and{' '}
            <strong className="text-ink">limiting late caffeine and alcohol</strong>. On top of that
            foundation, the best-supported supplements are{' '}
            <strong className="text-ink">ashwagandha</strong> (lowers baseline cortisol over weeks),{' '}
            <strong className="text-ink">rhodiola</strong> (stress resilience and fatigue),{' '}
            <strong className="text-ink">magnesium</strong> and{' '}
            <strong className="text-ink">L-theanine</strong> (acute calming).
          </p>
        </section>

        {/* Key Takeaways */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Key takeaways</h2>
          <ul className="space-y-2 text-muted">
            <li>• <strong className="text-ink">Aim for rhythm, not zero.</strong> Healthy cortisol is high in the morning and low at night; the target is a normal curve, not the lowest possible number.</li>
            <li>• <strong className="text-ink">Sleep is the master regulator.</strong> A single poor night raises next-day cortisol; consistent sleep does more than any capsule.</li>
            <li>• <strong className="text-ink">Ashwagandha has the best supplement evidence</strong> for lowering baseline cortisol, but it works over weeks, not overnight.</li>
            <li>• <strong className="text-ink">Match the tool to the timeframe:</strong> breathing and L-theanine for acute spikes, adaptogens for chronic load.</li>
            <li>• <strong className="text-ink">Persistent symptoms need testing</strong> — supplements are for everyday stress, not endocrine disease.</li>
          </ul>
        </section>

        {/* Lifestyle levers */}
        <section className="space-y-4">
          <p className="eyebrow-label">Foundations first</p>
          <h2 className="text-2xl font-semibold text-ink">The lifestyle levers that move cortisol most</h2>
          <p className="text-muted">
            Before reaching for any supplement, it is worth being honest about where cortisol really comes
            from. For the vast majority of people, chronically elevated cortisol is downstream of
            day-to-day inputs — too little sleep, too much stimulation, irregular routines and unrelenting
            psychological pressure — not a hormonal disease. That is good news, because these inputs are
            the levers you actually control, and they move cortisol far more than any capsule does. The
            six below are listed roughly in order of impact; if you only change one thing, make it your
            sleep and the consistency of your daily schedule.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { lever: 'Sleep & schedule', detail: 'Regular sleep and wake times stabilize the cortisol rhythm. Sleep debt is one of the most reliable ways to push cortisol up.' },
              { lever: 'Morning light', detail: 'Bright light early in the day sharpens the healthy morning cortisol peak and supports a lower evening level.' },
              { lever: 'Moderate exercise', detail: 'Regular movement lowers stress reactivity — but chronic overtraining without recovery does the opposite.' },
              { lever: 'Slow breathing', detail: 'A longer exhale than inhale shifts you toward the parasympathetic state and lowers acute cortisol within minutes.' },
              { lever: 'Caffeine & alcohol timing', detail: 'Late caffeine raises cortisol and fragments sleep; alcohol disrupts the overnight recovery window.' },
              { lever: 'Connection & nature', detail: 'Social comfort and time outdoors measurably reduce stress hormones — low-cost, underrated levers.' },
            ].map((row) => (
              <div key={row.lever} className="card-premium p-5">
                <p className="text-sm font-semibold text-ink">{row.lever}</p>
                <p className="mt-2 text-sm text-muted">{row.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Herbs evidence */}
        <section className="space-y-5">
          <p className="eyebrow-label">Evidence overview</p>
          <h2 className="text-2xl font-semibold text-ink">Herbs and supplements, in priority order</h2>

          <article className="card-premium p-6">
            <h3 className="text-xl font-semibold text-brand-800">
              <Link href="/herbs/ashwagandha" className="hover:underline">Ashwagandha</Link>{' '}
              <span className="ml-2 rounded-full bg-brand-50 px-3 py-0.5 align-middle text-xs font-semibold text-brand-800">Strongest evidence</span>
            </h3>
            <p className="mt-3 text-sm text-muted">
              Standardized extracts repeatedly lower serum cortisol and perceived stress in chronically
              stressed adults across randomized trials. Typical dose is 300–600&nbsp;mg of a standardized
              extract, given 4–8 weeks. It is the closest thing to a direct cortisol-lowering supplement —
              see how it stacks up in{' '}
              <Link href="/compare/rhodiola-vs-ashwagandha" className="font-medium text-brand-700 hover:underline">rhodiola vs ashwagandha</Link>.
            </p>
          </article>

          <article className="card-premium p-6">
            <h3 className="text-xl font-semibold text-brand-800">
              <Link href="/herbs/rhodiola" className="hover:underline">Rhodiola rosea</Link>
            </h3>
            <p className="mt-3 text-sm text-muted">
              Rhodiola targets the <em>experience</em> of stress — fatigue, mental tiredness and burnout —
              and can blunt the stress response under demanding conditions. Best taken in the morning at
              200–400&nbsp;mg of a standardized extract; it can disrupt sleep if taken late. Explore the
              full{' '}
              <Link href="/guides/rhodiola-complete-guide" className="font-medium text-brand-700 hover:underline">rhodiola guide</Link>.
            </p>
          </article>

          <article className="card-premium p-6">
            <h3 className="text-xl font-semibold text-brand-800">
              <Link href="/herbs/holy-basil" className="hover:underline">Holy basil (tulsi)</Link>
            </h3>
            <p className="mt-3 text-sm text-muted">
              A traditional adaptogen with emerging trial support for reducing stress symptoms. A gentle,
              well-tolerated option that fits naturally into a daily routine as a tea or extract.
            </p>
          </article>

          <article className="card-premium p-6">
            <h3 className="text-xl font-semibold text-brand-800">
              <Link href="/compounds/magnesium-glycinate" className="hover:underline">Magnesium</Link> &amp;{' '}
              <Link href="/compounds/l-theanine" className="hover:underline">L-theanine</Link>
            </h3>
            <p className="mt-3 text-sm text-muted">
              Magnesium supports HPA-axis regulation and is often depleted in stressed people; deficiency
              amplifies the stress response. L-theanine is the best acute tool, blunting cortisol and the
              feeling of stress within an hour without sedation. Together they cover the moment-to-moment
              side of stress while adaptogens work on the baseline. See{' '}
              <Link href="/compare/ashwagandha-vs-l-theanine-vs-magnesium" className="font-medium text-brand-700 hover:underline">ashwagandha vs L-theanine vs magnesium</Link>.
            </p>
          </article>
        </section>

        {/* Risks & safety */}
        <section className="space-y-3 rounded-[1.65rem] border border-amber-200 bg-amber-50/70 p-6">
          <h2 className="text-xl font-semibold text-amber-900">Risks &amp; safety</h2>
          <ul className="space-y-2 text-sm text-amber-900">
            <li>• Adaptogens are not a substitute for medical evaluation, especially with endocrine conditions, diabetes, or while pregnant or breastfeeding.</li>
            <li>• Ashwagandha can affect thyroid hormone levels and interacts with sedatives and immunosuppressants — check with a clinician if relevant.</li>
            <li>• Rhodiola is stimulating for some people and may worsen sleep or agitation if taken late or in high doses.</li>
            <li>• If you take medication for blood pressure, mood, sleep or a hormonal condition, confirm compatibility before adding herbs.</li>
          </ul>
        </section>

        {/* FAQs */}
        <section className="space-y-4">
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

        {/* Related */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Related guides &amp; comparisons</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/guides/best-supplements-for-stress" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Best Supplements for Stress →</Link>
            <Link href="/guides/best-adaptogens-for-stress" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Best Adaptogens for Stress →</Link>
            <Link href="/guides/best-herbs-for-stress-and-anxiety-at-night" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Best Herbs for Stress &amp; Anxiety at Night →</Link>
            <Link href="/guides/rhodiola-complete-guide" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Complete Rhodiola Guide →</Link>
            <Link href="/compare/rhodiola-vs-ashwagandha" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Rhodiola vs Ashwagandha →</Link>
            <Link href="/goals/stress" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">All Stress Guides →</Link>
          </div>
        </section>
      </div>
    </>
  )
}
