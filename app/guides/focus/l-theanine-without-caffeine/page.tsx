import Link from 'next/link'
import Image from 'next/image'
import JsonLd from '@/components/seo/JsonLd'
import type { Metadata } from 'next'
import {
  buildPageMetadata,
  blogJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
  compactMetaTitle,
} from '../../../../src/lib/seo'
import LastUpdatedBadge from '../../../../src/components/editorial/LastUpdatedBadge'
import ResponsiveTable from '@/components/ui/ResponsiveTable'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import EmailCapture from '@/components/EmailCapture'
import NewsletterCtaBlock from '@/components/NewsletterCtaBlock'

const SLUG = 'l-theanine-without-caffeine'
const TITLE = 'L-Theanine Without Caffeine for ADHD: What the Evidence Supports in 2026'
const DESCRIPTION =
  'Evidence-first guide to L-theanine alone for ADHD-related focus questions, separating general attention data from the very limited ADHD-specific trials and avoiding universal dose or onset claims.'
const DATE = '2026-06-12'
const UPDATED_DATE = '2026-08-12'
const AUTHOR = 'Will'
const READING_TIME = '9 min read'

export const metadata: Metadata = buildPageMetadata({
  title: compactMetaTitle(TITLE),
  description: DESCRIPTION,
  path: `/guides/focus/${SLUG}`,
  openGraphType: 'article',
})

const SOURCES = [
  {
    label: 'L-theanine systematic review and meta-analysis (2026)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/42410082/',
    note: 'Thirty-one randomized trials / 1,168 participants across healthy and clinical populations. A single 200 mg dose 30–60 minutes before cognitive testing improved choice reaction time, but anxiety findings were inconsistent and the authors said clinical relevance still needs confirmation. No serious adverse events were reported. One author disclosed founding a dietary-supplement company.',
  },
  {
    label: 'L-theanine/caffeine proof-of-concept ADHD crossover (2020)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/32753637/',
    note: 'Only five boys ages 8–15 with ADHD completed a four-condition crossover of L-theanine, caffeine, the combination, and placebo. Some cognition outcomes improved, but inhibitory-control findings were mixed. The sample is far too small to establish an ADHD treatment effect or dosing protocol.',
  },
  {
    label: 'L-theanine sleep trial in boys with ADHD (2011)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/22214254/',
    note: 'Ninety-eight boys ages 8–12 with diagnosed ADHD received 400 mg/day of Suntheanine or placebo for six weeks. The trial studied objective sleep quality, not daytime ADHD focus or core symptom treatment.',
  },
  {
    label: 'Tea/L-theanine cognition, sleep, and mood meta-analysis (2025)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/40314930/',
    note: 'Systematic review of tea, L-theanine, and L-theanine plus caffeine in healthy participants. This helps contextualize cognition claims but does not establish efficacy for ADHD.',
  },
]

const FAQS = [
  {
    question: 'Does L-theanine without caffeine treat ADHD?',
    answer:
      'Current evidence does not establish L-theanine alone as an ADHD treatment. The strongest recent pooled evidence for L-theanine comes mostly from healthy and mixed clinical populations, while the ADHD-specific acute cognition study involved only five boys.',
  },
  {
    question: 'Does L-theanine help attention without caffeine?',
    answer:
      'A 2026 meta-analysis found a short-term improvement in choice reaction time after a single L-theanine dose in cognitive-testing studies. That supports a general attention signal, but it should not be converted into a universal ADHD benefit, dose, or onset promise.',
  },
  {
    question: 'What dose of L-theanine should someone with ADHD take?',
    answer:
      'There is no evidence-based universal ADHD dose. Published studies used different populations, formulations, doses, and outcomes. A dose used in a healthy-adult attention experiment or a pediatric sleep trial is study context, not a personalized ADHD protocol.',
  },
  {
    question: 'Can L-theanine be taken with ADHD medication?',
    answer:
      'Direct interaction and coadministration evidence is limited. The pediatric sleep trial included boys with and without stimulant treatment, but it was not designed to establish medication-interaction safety. People taking prescription ADHD medication should review supplement use with the prescriber or pharmacist managing that treatment.',
  },
  {
    question: 'Is L-theanine plus caffeine better for ADHD than L-theanine alone?',
    answer:
      'The combination has more cognition research than L-theanine alone, but most of that literature is not ADHD-specific. One ADHD proof-of-concept crossover involved only five boys, so it is too small to establish that the combination is an effective ADHD treatment.',
  },
  {
    question: 'What did the larger ADHD L-theanine trial actually show?',
    answer:
      'The larger randomized trial involved 98 boys with ADHD and studied sleep. It found improvements in some actigraphy-based sleep measures after six weeks, but it did not establish an effect on daytime attention, executive function, or core ADHD symptoms.',
  },
]

export default function LTheanineWithoutCaffeinePage() {
  const breadcrumbLd = breadcrumbJsonLd([
    { name: 'Guides', url: 'https://thehippiescientist.net/guides/' },
    { name: 'Focus', url: 'https://thehippiescientist.net/guides/focus/' },
    { name: TITLE, url: `https://thehippiescientist.net/guides/focus/${SLUG}/` },
  ])
  const articleLd = blogJsonLd(
    { title: TITLE, slug: SLUG, date: DATE, updated: UPDATED_DATE, description: DESCRIPTION },
    `/guides/focus/${SLUG}/`,
  )
  const faqLd = faqPageJsonLd({ pagePath: `/guides/focus/${SLUG}/`, questions: FAQS })

  return (
    <article className="mx-auto max-w-5xl space-y-0 px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <JsonLd schema={articleLd} />
      <JsonLd schema={breadcrumbLd} />
      {faqLd ? <JsonLd schema={faqLd} /> : null}

      <nav className="mb-6 flex items-center gap-2 text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/guides/" className="transition hover:text-ink">Guides</Link>
        <span>/</span>
        <Link href="/guides/focus/" className="transition hover:text-ink">Focus</Link>
        <span>/</span>
        <span className="line-clamp-1 text-ink">L-theanine without caffeine</span>
      </nav>

      <section className="rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-brand-900/10 bg-brand-50 px-2.5 py-0.5 font-bold uppercase tracking-wider text-brand-800">Focus evidence</span>
          <span className="text-muted">{READING_TIME}</span>
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">{TITLE}</h1>
        <p className="mt-2 text-sm text-muted">By <Link href="/info/about/" rel="author" className="font-medium text-ink hover:underline">{AUTHOR}</Link></p>
        <div className="mt-3"><LastUpdatedBadge date={UPDATED_DATE} label="Last evidence review" /></div>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted">{DESCRIPTION}</p>

        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
            <Image
              src="/images/guides/l-theanine-without-caffeine.jpg"
              alt="Caffeine-free L-theanine capsules with green tea leaves"
              width={1536}
              height={1024}
              priority
              className="h-auto w-full"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            General attention evidence should not be mistaken for proof that L-theanine treats ADHD.
          </figcaption>
        </figure>
      </section>

      <div className="mt-6 space-y-6">
        <section className="rounded-[1rem] border border-brand-700/20 bg-brand-50/60 p-6 shadow-sm sm:p-8">
          <p className="eyebrow-label">Bottom line</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">There is an attention signal, but the ADHD-specific evidence is far too small for a treatment claim</h2>
          <div className="mt-3 space-y-3 text-[1.01rem] leading-[1.85] text-muted">
            <p>
              The 2026 meta-analysis pooled <strong>31 randomized trials / 1,168 participants</strong> and found a robust short-term choice-reaction-time signal after L-theanine in cognitive-testing studies. The pooled population was not an ADHD population, so that result supports general attention research—not an ADHD protocol.
            </p>
            <p>
              The most directly relevant acute ADHD study was a proof-of-concept crossover in only <strong>five boys</strong>. L-theanine improved one total-cognition composite, while inhibitory-control findings were mixed. A larger <strong>98-boy</strong> ADHD trial studied sleep quality over six weeks, not daytime focus or core ADHD symptoms.
            </p>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <EvidenceSummaryCard
            title="General attention evidence"
            evidenceLevel="Limited"
            humanEvidence="The 2026 meta-analysis included 31 placebo-controlled trials / 1,168 participants across healthy and clinical populations. A single-dose attention signal was detected in choice reaction time, but the evidence does not establish ADHD treatment efficacy."
            mechanisticEvidence="Alpha-wave, neurotransmitter, and stress-response hypotheses may help explain experimental findings, but mechanism does not diagnose an ADHD subtype or identify who will benefit."
            safetyProfile="No serious adverse events were reported in the 2026 meta-analysis, but trial safety does not establish unlimited long-term use, pediatric self-treatment, or safety with every medication combination."
          />
          <EvidenceSummaryCard
            title="ADHD-specific evidence"
            evidenceLevel="Limited"
            humanEvidence="The acute ADHD cognition study enrolled only five boys in a four-condition crossover. A separate 98-boy randomized trial studied sleep rather than daytime ADHD symptoms. This is not enough evidence for a clinical ADHD efficacy claim."
            mechanisticEvidence="A calmer subjective state is not the same outcome as improved executive function, inhibitory control, or reduced ADHD symptom burden."
            safetyProfile="Direct coadministration and interaction data with prescription ADHD medicines remain limited; medication-specific decisions should be reviewed with the prescriber or pharmacist managing treatment."
          />
        </section>

        <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">What was actually studied?</h2>
          <ResponsiveTable label="L-theanine ADHD evidence directness table">
            <table className="mt-5 min-w-[860px] w-full text-sm">
              <thead>
                <tr className="border-b border-brand-900/10">
                  <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Evidence source</th>
                  <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Population / design</th>
                  <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">What it found</th>
                  <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">What it does not prove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-900/5">
                <tr className="align-top">
                  <td className="py-3 pr-4 font-semibold text-ink">2026 meta-analysis</td>
                  <td className="py-3 pr-4 text-muted">31 RCTs / 1,168 healthy and clinical participants</td>
                  <td className="py-3 pr-4 text-muted">Short-term improvement in choice reaction time after a single dose in cognitive-testing studies</td>
                  <td className="py-3 text-muted">ADHD efficacy, a universal dose, or a guaranteed personal onset</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 pr-4 font-semibold text-ink">2020 ADHD crossover</td>
                  <td className="py-3 pr-4 text-muted">5 boys ages 8–15; L-theanine, caffeine, combination, and placebo</td>
                  <td className="py-3 pr-4 text-muted">Some cognition outcomes improved; inhibitory-control findings were mixed</td>
                  <td className="py-3 text-muted">A reliable ADHD treatment effect or dosing protocol</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 pr-4 font-semibold text-ink">2011 ADHD sleep RCT</td>
                  <td className="py-3 pr-4 text-muted">98 boys ages 8–12; six weeks; L-theanine vs placebo</td>
                  <td className="py-3 pr-4 text-muted">Some objective sleep measures improved</td>
                  <td className="py-3 text-muted">Daytime attention, executive function, or core ADHD symptom improvement</td>
                </tr>
              </tbody>
            </table>
          </ResponsiveTable>
        </section>

        <section className="rounded-[1rem] border border-amber-200 bg-amber-50/70 p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-amber-950">Why the old “100–200 mg, 30–60 minutes before focus” script overreached</h2>
          <div className="mt-3 space-y-3 text-sm leading-7 text-amber-950">
            <p>
              The 2026 meta-analysis did find a choice-reaction-time effect in studies using a single dose before cognitive testing. That is a study regimen and outcome—not evidence that every person with ADHD should take a specific milligram amount before work or school.
            </p>
            <p>
              Likewise, the five-person ADHD crossover is too small to turn its weight-based experimental dosing into a consumer ADHD protocol. The larger pediatric trial used repeated dosing for sleep, not an as-needed focus intervention.
            </p>
          </div>
        </section>

        <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">L-theanine plus caffeine is a different intervention</h2>
          <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
            Studies of L-theanine plus caffeine cannot be used as proof that L-theanine alone works the same way. The combination literature is larger, but much of it is in healthy participants. Even the ADHD-specific combination study was only a five-person proof-of-concept crossover. Caffeine also changes sleep, anxiety, heart-rate, and medication considerations for some people.
          </p>
          <Link href="/guides/focus/l-theanine-vs-caffeine-for-focus/" className="mt-3 inline-block text-sm font-semibold text-brand-700 hover:underline">L-theanine vs caffeine evidence guide →</Link>
        </section>

        <section>
          <SafetyNotice title="Safety and medication boundaries">
            <ul className="ml-5 space-y-2 list-disc">
              <li><strong>Trial safety:</strong> the 2026 meta-analysis reported no serious adverse events, but that does not establish unlimited long-term safety or safety for every child, pregnancy, health condition, or medication combination.</li>
              <li><strong>ADHD medicines:</strong> direct interaction and coadministration evidence is limited. Do not use the absence of a known interaction as proof that a supplement-medication combination is safe for a particular person.</li>
              <li><strong>Children:</strong> pediatric trials used defined products and research protocols. They are not a basis for unsupervised pediatric dosing.</li>
              <li><strong>Treatment changes:</strong> supplements should not be used to stop, skip, or alter prescribed ADHD medication without the prescribing clinician.</li>
            </ul>
          </SafetyNotice>
        </section>

        <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Product sourcing note</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            This ADHD-focused page intentionally does not rank affiliate products or present a retail dose as the “right” ADHD dose. Commercial L-theanine products can differ from the preparations used in trials. The broader <Link href="/guides/herbs/l-theanine/" className="font-semibold text-brand-700 hover:underline">L-theanine evidence guide</Link> is the better place for formulation and sourcing context.
          </p>
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

        <section className="grid gap-3 sm:grid-cols-2">
          <Link href="/guides/herbs/l-theanine/" className="rounded-xl border border-brand-900/10 bg-white p-4 text-sm font-semibold text-brand-700 hover:underline">L-theanine umbrella evidence →</Link>
          <Link href="/guides/focus/l-theanine-vs-caffeine-for-focus/" className="rounded-xl border border-brand-900/10 bg-white p-4 text-sm font-semibold text-brand-700 hover:underline">L-theanine vs caffeine →</Link>
          <Link href="/guides/focus/" className="rounded-xl border border-brand-900/10 bg-white p-4 text-sm font-semibold text-brand-700 hover:underline">Focus goal hub →</Link>
          <Link href="/tools/" className="rounded-xl border border-brand-900/10 bg-white p-4 text-sm font-semibold text-brand-700 hover:underline">Safety and evidence tools →</Link>
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
    </article>
  )
}
