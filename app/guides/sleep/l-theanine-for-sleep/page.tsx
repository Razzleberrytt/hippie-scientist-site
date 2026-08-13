import Link from 'next/link'
import Image from 'next/image'
import JsonLd from '@/components/seo/JsonLd'
import {
  buildPageMetadata,
  blogJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
  compactMetaTitle,
} from '../../../../src/lib/seo'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import EmailCapture from '@/components/EmailCapture'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'
import NewsletterCtaBlock from '@/components/NewsletterCtaBlock'
import LastUpdatedBadge from '../../../../src/components/editorial/LastUpdatedBadge'
import ResponsiveTable from '@/components/ui/ResponsiveTable'

const SLUG = 'l-theanine-for-sleep'
const TITLE = 'L-Theanine for Sleep: What the Evidence Supports in 2026'
const DESCRIPTION =
  'Evidence-first review of L-theanine for sleep, including the 2025 sleep meta-analysis, direct trial context, timing and dose limits, combination uncertainty, safety, and chronic-insomnia care.'
const DATE = '2026-06-09'
const UPDATED_DATE = '2026-08-12'
const AUTHOR = 'Will'
const READING_TIME = '10 min read'
const TAGS = ['l-theanine', 'sleep', 'sleep quality', 'amino acids']

export const metadata = buildPageMetadata({
  title: compactMetaTitle(TITLE),
  description: DESCRIPTION,
  path: `/guides/sleep/${SLUG}`,
  openGraphType: 'article',
})

const SOURCES = [
  {
    label: 'L-theanine sleep systematic review and meta-analysis (2025)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/40056718/',
    note: 'Nineteen articles / 897 participants were included, with 18 studies in meta-analysis. Small improvements appeared in subjective sleep-onset latency, daytime dysfunction, and overall subjective sleep quality. The authors emphasized the shortage of pure L-theanine studies and said adequate dose and duration still need to be determined.',
  },
  {
    label: 'L-theanine vs melatonin vs placebo in cancer-related insomnia (2024)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/38846134/',
    note: 'One hundred twenty cancer patients with insomnia were randomized to melatonin 3 mg, L-theanine 200 mg, or placebo for 14 consecutive days, taken two hours before bedtime. L-theanine improved insomnia scores versus placebo, while melatonin outperformed L-theanine. Seven participants dropped out. This is a specific clinical population and regimen, not a universal bedtime protocol.',
  },
  {
    label: 'Lactium plus L-theanine sleep trial (2024)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/38953043/',
    note: 'Forty adults with sleep discomfort received a commercial Lactium + L-theanine combination (LTC-022) or placebo for 8 weeks. Because two active ingredients were combined, the trial cannot isolate an L-theanine effect; three authors were affiliated with the product company R&D center.',
  },
  {
    label: 'L-theanine cognitive and affective systematic review/meta-analysis (2026)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/42410082/',
    note: 'Thirty-one randomized trials / 1,168 participants compared oral L-theanine with placebo. A 200 mg single dose 30–60 minutes before cognitive testing improved choice reaction time; that timing result concerns attention testing, not bedtime sleep. Acute stress benefit was modest and bias-sensitive, anxiety effects were inconsistent, and no serious adverse events were reported. One author founded a supplement company.',
  },
  {
    label: 'AASM: cognitive behavioral therapy for insomnia',
    href: 'https://aasm.org/coding-quarterly-cognitive-behavioral-therapy-for-insomnia/',
    note: 'The American Academy of Sleep Medicine describes CBT-I as the first-line, evidence-based treatment for chronic insomnia.',
  },
]

const FAQS = [
  {
    question: 'Does L-theanine help sleep?',
    answer:
      'A 2025 meta-analysis of 19 articles / 897 participants found small improvements in several subjective sleep outcomes. The signal is promising, but the review included many interventions that were not pure L-theanine and said adequate dose and duration still need study.',
  },
  {
    question: 'How long before bed should I take L-theanine?',
    answer:
      'Current evidence does not establish one universal bedtime timing rule. The widely cited 30–60-minute window in a 2026 meta-analysis referred to a 200 mg dose before cognitive testing for attention, not a sleep-onset protocol. A separate cancer-insomnia trial used 200 mg two hours before bed for 14 days in a specific clinical population.',
  },
  {
    question: 'Does L-theanine work best for racing thoughts?',
    answer:
      'That symptom-matching claim is not established. The 2026 meta-analysis found inconsistent anxiety effects, while the sleep meta-analysis did not establish a racing-thoughts subgroup that responds better than other people with sleep difficulty.',
  },
  {
    question: 'Is 200 mg the best L-theanine dose for sleep?',
    answer:
      'No. Two hundred milligrams appears in specific trials, but the 2025 sleep review explicitly said adequate dose and duration still need to be determined. A study regimen describes what researchers tested; it does not establish a universal personal dose.',
  },
  {
    question: 'Can L-theanine be combined with magnesium or ashwagandha?',
    answer:
      'Separate ingredient trials do not establish that these combinations improve sleep more, work faster, or are safer. A multi-ingredient regimen is a different intervention and makes benefits, adverse effects, and interactions harder to attribute.',
  },
  {
    question: 'Can L-theanine replace CBT-I for chronic insomnia?',
    answer:
      'No. CBT-I is the first-line evidence-based treatment for chronic insomnia. Persistent insomnia also warrants assessment for sleep apnea, restless legs, circadian problems, medication effects, mood disorders, substance use, pain, and other causes.',
  },
]

export default function LTheanineForSleepPage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: 'Guides', url: 'https://thehippiescientist.net/guides/' },
    { name: 'Sleep', url: 'https://thehippiescientist.net/guides/sleep/' },
    { name: TITLE, url: `https://thehippiescientist.net/guides/sleep/${SLUG}/` },
  ])

  const articleLd = blogJsonLd(
    { title: TITLE, slug: SLUG, date: DATE, updated: UPDATED_DATE, description: DESCRIPTION },
    `/guides/sleep/${SLUG}/`,
  )

  const faqLd = faqPageJsonLd({ pagePath: `/guides/sleep/${SLUG}/`, questions: FAQS })

  return (
    <article className="mx-auto max-w-5xl space-y-0 px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <JsonLd schema={articleLd} />
      <JsonLd schema={breadcrumb} />
      {faqLd ? <JsonLd schema={faqLd} /> : null}

      <nav className="mb-6 flex items-center gap-2 text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/guides/" className="transition hover:text-ink">Guides</Link>
        <span>/</span>
        <Link href="/guides/sleep/" className="transition hover:text-ink">Sleep</Link>
        <span>/</span>
        <span className="line-clamp-1 text-ink">L-theanine</span>
      </nav>

      <section className="rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-brand-900/10 bg-brand-50 px-2.5 py-0.5 font-bold uppercase tracking-wider text-brand-800">Sleep evidence guide</span>
          {TAGS.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full border border-brand-900/10 bg-white px-2.5 py-0.5 font-semibold capitalize text-muted">{tag}</span>
          ))}
          <span className="text-muted">{READING_TIME}</span>
        </div>

        <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">{TITLE}</h1>
        <p className="mt-2 text-sm text-muted">By <Link href="/info/about/" rel="author" className="font-medium text-ink hover:underline">{AUTHOR}</Link></p>
        <div className="mt-3"><LastUpdatedBadge date={UPDATED_DATE} label="Last evidence review" /></div>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted">{DESCRIPTION}</p>

        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
            <Image
              src="/images/guides/l-theanine-for-sleep.jpg"
              alt="Green tea and L-theanine supplement imagery in a nighttime sleep setting"
              width={1536}
              height={1024}
              priority
              className="h-auto w-full"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            The sleep signal is modest and heterogeneous; study timing and milligrams should not be converted automatically into a bedtime recipe.
          </figcaption>
        </figure>
      </section>

      <div className="mt-4 rounded-[1rem] border border-brand-900/10 bg-brand-50/60 px-5 py-3 text-xs leading-6 text-muted">
        <strong className="text-ink">Affiliate disclosure:</strong> This page contains optional product-sourcing links. They are not evidence that a commercial product will reproduce a trial result. We may earn a commission at no added cost to you.
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="space-y-6">
          <section className="rounded-[1rem] border border-brand-700/20 bg-brand-50/60 p-6 shadow-sm sm:p-8">
            <p className="eyebrow-label">Bottom line</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">A modest subjective sleep signal is plausible; an acute bedtime protocol is not established</h2>
            <div className="mt-3 space-y-3 text-[1.01rem] leading-[1.85] text-muted">
              <p>
                The 2025 sleep systematic review included <strong>19 articles / 897 participants</strong> and found small improvements in subjective sleep-onset latency, daytime dysfunction, and overall subjective sleep quality. Eighteen studies contributed to meta-analysis.
              </p>
              <p>
                The authors also highlighted a central limitation: many interventions were not <strong>pure L-theanine</strong>, and adequate dose and duration still need to be determined. That makes a universal “take this amount before bed” instruction stronger than the evidence.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">Evidence directness</h2>
            <EvidenceSummaryCard
              title="L-theanine for sleep"
              evidenceLevel="Limited"
              humanEvidence="The 2025 systematic review included 19 articles / 897 participants and found small improvements in several subjective sleep outcomes. Many included interventions were not pure L-theanine, so the pooled signal should not be treated as proof of one formulation, dose, bedtime, or symptom-specific indication."
              mechanisticEvidence="Alpha-wave, neurotransmitter, stress, and relaxation mechanisms are biologically interesting but do not establish that racing thoughts identify a responder or that L-theanine is an acute hypnotic."
              safetyProfile="A separate 2026 meta-analysis of 31 randomized trials / 1,168 participants reported no serious adverse events, but that does not establish long-term nightly safety for every formulation or population. Medication use, pregnancy or breastfeeding, and persistent sleep disorders deserve individualized review."
            />
          </section>

          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">What was actually studied?</h2>
            <ResponsiveTable label="L-theanine sleep evidence directness table">
              <table className="mt-5 min-w-[820px] w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-900/10">
                    <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Evidence source</th>
                    <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Population / intervention</th>
                    <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">What it does not establish</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-900/5">
                  <tr className="align-top">
                    <td className="py-3 pr-4 font-semibold text-ink">2025 sleep meta-analysis</td>
                    <td className="py-3 pr-4 text-muted">19 articles / 897 participants across healthy and clinical populations; mixed interventions, with 18 studies meta-analyzed.</td>
                    <td className="py-3 text-muted">A universal pure-L-theanine dose, duration, bedtime, or insomnia subtype.</td>
                  </tr>
                  <tr className="align-top">
                    <td className="py-3 pr-4 font-semibold text-ink">2024 cancer-insomnia RCT</td>
                    <td className="py-3 pr-4 text-muted">120 cancer patients with insomnia randomized to melatonin 3 mg, L-theanine 200 mg, or placebo for 14 days; tablets were taken 2 hours before bedtime. Seven participants dropped out.</td>
                    <td className="py-3 text-muted">A general-population bedtime regimen. L-theanine improved versus placebo, while melatonin outperformed L-theanine in this specific population.</td>
                  </tr>
                  <tr className="align-top">
                    <td className="py-3 pr-4 font-semibold text-ink">2024 Lactium + L-theanine RCT</td>
                    <td className="py-3 pr-4 text-muted">40 adults with sleep discomfort received the commercial combination LTC-022 or placebo for 8 weeks.</td>
                    <td className="py-3 text-muted">An isolated L-theanine effect: Lactium and L-theanine were given together, and three authors were affiliated with the product-company R&amp;D center.</td>
                  </tr>
                </tbody>
              </table>
            </ResponsiveTable>
          </section>

          <section className="rounded-[1rem] border border-amber-200 bg-amber-50/70 p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-amber-950">The 30–60-minute result is not a bedtime sleep instruction</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-amber-950">
              <p>
                The July 2026 cognitive and affective meta-analysis found that a <strong>single 200 mg dose taken 30–60 minutes before cognitive testing</strong> improved choice reaction time. That is an attention result in a cognitive-testing context—not evidence that L-theanine should be taken 30–60 minutes before bed or that it improves sleep within that window.
              </p>
              <p>
                The same review found only a modest, bias-sensitive acute-stress signal and inconsistent anxiety effects. Those results do not validate “racing thoughts” as a sleep indication or justify converting an attention-study clock into an insomnia protocol.
              </p>
            </div>
          </section>

          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">“Racing thoughts” are not a validated supplement selector</h2>
            <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
              It is tempting to map mental tension to L-theanine and physical tension to magnesium, but the trials do not validate that decision tree. Sleep-onset difficulty can reflect chronic insomnia, anxiety or mood disorders, circadian mismatch, medication or substance effects, pain, sleep apnea, restless legs, insufficient sleep opportunity, or other causes. Symptom labels alone do not identify which supplement will work.
            </p>
          </section>

          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">Separate ingredient studies do not validate a sleep stack</h2>
            <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
              Trials of L-theanine, magnesium, and ashwagandha as separate interventions do not prove that an L-theanine + magnesium, L-theanine + ashwagandha, or three-ingredient combination improves sleep more, works faster, or is safer. Combining products creates a new intervention and makes benefits, side effects, and interactions harder to attribute.
            </p>
            <Link href="/guides/sleep/sleep-stack-guide/" className="mt-3 inline-block text-sm font-semibold text-brand-700 hover:underline">Sleep stack evidence guide →</Link>
          </section>

          <section>
            <SafetyNotice title="Safety and stop rules">
              <ul className="ml-5 list-disc space-y-2">
                <li><strong>Trial safety:</strong> the 2026 review of 31 randomized trials reported no serious adverse events, but trial duration and populations were limited and do not prove indefinite nightly safety.</li>
                <li><strong>Formulation matters:</strong> tea, caffeine-containing products, pure L-theanine, and multi-ingredient sleep products are not interchangeable interventions.</li>
                <li><strong>Medication context:</strong> avoid blanket “interaction-free” claims. If you use prescription sedatives, psychiatric medicines, blood-pressure medicines, or other medications, review the combination with a pharmacist or prescriber.</li>
                <li><strong>Pregnancy and breastfeeding:</strong> supplementation evidence is insufficient for a broad safety claim; discuss use with an appropriate clinician.</li>
                <li><strong>Sleep-specific stop rule:</strong> persistent insomnia, loud snoring or gasping, dangerous daytime sleepiness, restless-legs symptoms, severe mood symptoms, or rapidly worsening sleep warrant assessment rather than supplement escalation.</li>
              </ul>
            </SafetyNotice>
          </section>

          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">Chronic insomnia has a stronger first-line treatment</h2>
            <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
              The American Academy of Sleep Medicine describes cognitive behavioral therapy for insomnia (CBT-I) as the first-line, evidence-based treatment for chronic insomnia. A supplement trial should not delay evaluation of persistent insomnia or another sleep disorder.
            </p>
          </section>

          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">Product sourcing: match identity, not a bedtime-dose promise</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              If L-theanine supplementation is appropriate, look for clear ingredient identity, caffeine disclosure, and independent quality testing where available. Quality testing can improve confidence in identity and contamination control; it does not establish sleep efficacy or prove that a retail product matches a research intervention.
            </p>
            <div className="mt-5"><RecommendationSection products={getRevenueProductSet('l-theanine')?.products ?? []} /></div>
          </section>

          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">Frequently asked questions</h2>
            <div className="mt-5 space-y-5">
              {FAQS.map((faq) => (
                <div key={faq.question} className="border-l-4 border-brand-600 pl-4">
                  <h3 className="font-semibold text-ink">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">Sources and directness notes</h2>
            <ol className="mt-4 space-y-4">
              {SOURCES.map((source, index) => (
                <li key={source.href} className="text-sm leading-7 text-muted">
                  <span className="font-semibold text-ink">{index + 1}. </span>
                  <a href={source.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 hover:underline">{source.label}</a>
                  <span> — {source.note}</span>
                </li>
              ))}
            </ol>
          </section>

          <EmailCapture
            headline="Get future research notes by email"
            description="Evidence-first supplement updates, safety context, and new guide announcements. No diagnosis, treatment, or personal medical advice."
            location={`article-${SLUG}`}
          />
          <NewsletterCtaBlock
            title="Continue with the newsletter archive"
            description="Short notes built for cautious supplement decisions."
            location={`article-${SLUG}-newsletter`}
          />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Related evidence</p>
            <nav className="mt-3 space-y-2 text-sm font-medium text-brand-700">
              <Link href="/guides/herbs/l-theanine/" className="block hover:underline">L-theanine umbrella guide →</Link>
              <Link href="/guides/compare/sleep-herbs-vs-melatonin/" className="block hover:underline">Sleep supplements vs melatonin →</Link>
              <Link href="/guides/sleep/sleep-stack-guide/" className="block hover:underline">Sleep stack evidence →</Link>
              <Link href="/guides/sleep/" className="block hover:underline">Sleep goal hub →</Link>
            </nav>
          </div>
          <div className="rounded-[1rem] border border-brand-900/10 bg-brand-50/60 p-4 text-xs leading-6 text-muted">
            <strong className="text-ink">Interpretation rule:</strong> a trial regimen tells you what researchers tested. It does not automatically become a personal dose, bedtime, duration, or combination recommendation.
          </div>
        </aside>
      </div>
    </article>
  )
}
