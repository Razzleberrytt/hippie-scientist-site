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

const SLUG = 'l-theanine'
const TITLE = 'L-Theanine: What the Evidence Supports for Focus, Stress, Anxiety, and Sleep'
const DESCRIPTION =
  'An evidence-first L-theanine guide updated for 2026: attention, stress, anxiety, sleep, caffeine combinations, studied doses, safety limits, and what current trials do not establish.'
const DATE = '2026-08-11'
const AUTHOR = 'Will'
const READING_TIME = '11 min read'
const TAGS = ['l-theanine', 'focus', 'stress', 'anxiety', 'sleep', 'caffeine']

export const metadata = buildPageMetadata({
  title: compactMetaTitle(TITLE),
  description: DESCRIPTION,
  path: `/guides/herbs/${SLUG}`,
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'What does the best current evidence support for L-theanine?',
    answer:
      'The clearest current signal is a short-term attention effect in healthy adults. A 2026 meta-analysis of 31 randomized trials found a robust improvement in choice reaction time after a single 200 mg dose studied before cognitive testing. Acute-stress effects were modest and sensitive to study quality, while anxiety findings were inconsistent overall.',
  },
  {
    question: 'How fast does L-theanine work?',
    answer:
      'Trials often measure outcomes 30–60 minutes after a single dose, but that study timing is not a validated promise for when someone will feel calmer or whether anxiety will improve. The strongest 30–60-minute result in the 2026 meta-analysis was an attention outcome, not a reliable anxiety-relief onset.',
  },
  {
    question: 'Does L-theanine help anxiety?',
    answer:
      'Current pooled evidence does not establish L-theanine as an anxiety treatment. The 2026 meta-analysis found anxiety effects inconsistent and generally non-significant. Stress-task findings and attention improvements should not be relabeled as proof of anxiety relief.',
  },
  {
    question: 'Should L-theanine be paired with caffeine?',
    answer:
      'L-theanine plus caffeine has randomized-trial evidence for some task-specific cognitive and mood outcomes, but the size and direction of effects vary. A 2025 meta-analysis reported uncertainty across many confidence intervals, so there is no evidence-based universal ratio and no guarantee that L-theanine will prevent caffeine-related jitters, anxiety, or sleep disruption.',
  },
  {
    question: 'Does L-theanine help sleep?',
    answer:
      'A 2025 systematic review and meta-analysis found small improvements in several subjective sleep outcomes, including sleep-onset latency and overall sleep quality. The authors also highlighted the shortage of studies using pure L-theanine and said the optimal dose and duration remain unresolved.',
  },
  {
    question: 'Is L-theanine FDA approved or universally GRAS?',
    answer:
      'No blanket FDA approval or universal product-level GRAS finding should be inferred. FDA has issued “no questions” responses to specific GRAS notices for specified L-theanine preparations and intended food uses, including some uses up to 250 mg per serving. Those notices do not establish that every dietary supplement, dose, or use is FDA approved.',
  },
  {
    question: 'Is daily L-theanine proven safe long term?',
    answer:
      'Short randomized trials generally report good tolerability, and the 2026 meta-analysis reported no serious adverse events. That is reassuring but does not establish unlimited long-term safety for every person, dose, product, medication combination, pregnancy, or medical condition.',
  },
]

const SOURCES = [
  {
    label: 'L-theanine systematic review and meta-analysis of 31 randomized trials (2026)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/42410082/',
    note: '31 RCTs, 1,168 participants; robust short-term attention signal, modest bias-sensitive acute-stress effect, inconsistent anxiety findings, and no serious adverse events reported.',
  },
  {
    label: 'Tea, L-theanine, and L-theanine plus caffeine meta-analysis (2025)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/40314930/',
    note: 'Healthy participants; task-specific cognitive and mood findings with frequent uncertainty in effect direction and magnitude. Industry relationships were disclosed.',
  },
  {
    label: 'L-theanine and sleep systematic review and meta-analysis (2025)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/40056718/',
    note: '19 articles and 897 participants; small subjective sleep signals, with limited pure-L-theanine evidence and unresolved optimal dose and duration.',
  },
  {
    label: 'Four-week L-theanine crossover trial in healthy adults (2019)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/31623400/',
    note: '30 healthy adults without major psychiatric illness; 200 mg/day versus placebo for four weeks. Some stress, anxiety-trait, sleep, and cognitive outcomes improved; product-supplier employees were coauthors.',
  },
  {
    label: 'FDA GRAS Notice 209: L-theanine',
    href: 'https://hfpappexternal.fda.gov/scripts/fdcc/index.cfm?id=209&set=GRASNotices',
    note: 'Specific food-ingredient notice with intended uses up to 250 mg per serving; FDA response: “no questions.”',
  },
  {
    label: 'FDA GRAS Notice 338: tea-derived L-theanine',
    href: 'https://hfpappexternal.fda.gov/scripts/fdcc/index.cfm?id=338&set=grasnotices',
    note: 'Specific tea-derived preparation and specified food uses up to 250 mg per serving; FDA response: “no questions.”',
  },
]

export default function LTheanineArticlePage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: 'Guides', url: 'https://thehippiescientist.net/guides/' },
    { name: TITLE, url: `https://thehippiescientist.net/guides/herbs/${SLUG}/` },
  ])
  const articleLd = blogJsonLd(
    { title: TITLE, slug: SLUG, date: DATE, description: DESCRIPTION },
    `/guides/herbs/${SLUG}/`,
  )
  const faqLd = faqPageJsonLd({ pagePath: `/guides/herbs/${SLUG}/`, questions: FAQS })

  return (
    <article className="mx-auto max-w-5xl space-y-0 px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <JsonLd schema={articleLd} />
      <JsonLd schema={breadcrumb} />
      {faqLd ? <JsonLd schema={faqLd} /> : null}

      <nav className="mb-6 flex items-center gap-2 text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/guides/" className="transition hover:text-ink">Guides</Link>
        <span>/</span>
        <span className="line-clamp-1 text-ink">L-Theanine</span>
      </nav>

      <section className="rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-brand-900/10 bg-brand-50 px-2.5 py-0.5 font-bold uppercase tracking-wider text-brand-800">
            Evidence-first umbrella guide
          </span>
          {TAGS.slice(0, 4).map((tag) => (
            <span key={tag} className="rounded-full border border-brand-900/10 bg-white px-2.5 py-0.5 font-semibold capitalize text-muted">
              {tag}
            </span>
          ))}
          <span className="text-muted">{READING_TIME}</span>
        </div>

        <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
          {TITLE}
        </h1>
        <p className="mt-2 text-sm text-muted">
          By <Link href="/info/about/" rel="author" className="font-medium text-ink hover:underline">{AUTHOR}</Link>
        </p>
        <div className="mt-3"><LastUpdatedBadge date={DATE} label="Last evidence review" /></div>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted">{DESCRIPTION}</p>

        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
            <Image
              src="/images/guides/l-theanine-herb.jpg"
              alt="Green tea leaves, L-theanine powder, and a cup of tea"
              width={1536}
              height={1024}
              priority
              className="h-auto w-full"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            L-theanine research is outcome-specific: attention, stress tasks, anxiety scales, and sleep outcomes should not be treated as interchangeable.
          </figcaption>
        </figure>
      </section>

      <div className="mt-4 rounded-[1rem] border border-brand-900/10 bg-brand-50/60 px-5 py-3 text-xs leading-6 text-muted">
        <strong className="text-ink">Affiliate disclosure:</strong> This page contains affiliate links. Product links are optional sourcing examples, not proof that a product will improve anxiety, sleep, or cognition. We may earn a commission at no added cost to you.
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="space-y-6">
          <section id="bottom-line" className="rounded-[1rem] border border-brand-700/20 bg-brand-50/60 p-6 shadow-sm sm:p-8">
            <p className="eyebrow-label">Evidence bottom line</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              L-theanine has a credible attention signal, but the evidence is much less certain for anxiety and broad “calm” claims
            </h2>
            <div className="mt-3 space-y-3 text-[1.01rem] leading-[1.85] text-muted">
              <p>
                The July 2026 meta-analysis pooled <strong>31 randomized trials and 1,168 participants</strong>. Its strongest short-term finding was improved choice reaction time after a single 200 mg dose studied before cognitive testing. The pooled acute-stress effect was modest and heavily influenced by higher-risk-of-bias studies, while anxiety findings were inconsistent overall.
              </p>
              <p>
                That means “studied 30–60 minutes before a task” should not be converted into “you will feel anxiety relief in 30–60 minutes.” It also means a cognitive result should not be relabeled as proof that L-theanine treats racing thoughts, panic, or an anxiety disorder.
              </p>
            </div>
          </section>

          <section id="outcomes" className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <p className="eyebrow-label">Match the claim to the outcome</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">What current evidence says by goal</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4">
                <h3 className="font-semibold text-ink">Attention and cognitive tasks</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  This is the clearest current signal. The 2026 meta-analysis found a robust short-term choice-reaction-time benefit in healthy adults, but that does not establish a broad nootropic effect across every cognitive task.
                </p>
                <Link href="/guides/focus/l-theanine-without-caffeine/" className="mt-3 inline-block text-sm font-semibold text-brand-700 hover:underline">
                  Review caffeine-free focus evidence →
                </Link>
              </div>

              <div className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4">
                <h3 className="font-semibold text-ink">Stress and anxiety</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Acute-stress findings are modest and study-quality-sensitive. Anxiety outcomes are inconsistent, so current pooled evidence does not establish L-theanine as a reliable acute or chronic anxiety treatment.
                </p>
                <Link href="/guides/anxiety/l-theanine-for-anxiety/" className="mt-3 inline-block text-sm font-semibold text-brand-700 hover:underline">
                  Read the anxiety-specific review →
                </Link>
              </div>

              <div className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4">
                <h3 className="font-semibold text-ink">Sleep</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  The 2025 meta-analysis found small improvements in several subjective sleep outcomes. Pure-L-theanine studies were limited, and the optimal formulation, dose, and duration remain unresolved.
                </p>
                <Link href="/guides/sleep/l-theanine-for-sleep/" className="mt-3 inline-block text-sm font-semibold text-brand-700 hover:underline">
                  Read the sleep-specific review →
                </Link>
              </div>

              <div className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4">
                <h3 className="font-semibold text-ink">L-theanine plus caffeine</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Combination trials show task-specific cognitive and mood effects, but a 2025 meta-analysis emphasized uncertainty in direction and magnitude for many outcomes. There is no universal evidence-based ratio and no guaranteed “jitter shield.”
                </p>
                <Link href="/guides/focus/l-theanine-vs-caffeine-for-focus/" className="mt-3 inline-block text-sm font-semibold text-brand-700 hover:underline">
                  Compare L-theanine and caffeine →
                </Link>
              </div>
            </div>
          </section>

          <section id="evidence" className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">Evidence snapshots</h2>
            <EvidenceSummaryCard
              title="L-Theanine — Attention and acute stress"
              evidenceLevel="Moderate"
              humanEvidence="The 2026 meta-analysis included 31 randomized placebo-controlled trials with 1,168 participants across healthy and clinical populations. A single 200 mg dose studied 30–60 minutes before cognitive testing improved choice reaction time. Acute-stress reduction was modest and strongly influenced by studies at high risk of bias; anxiety effects were inconsistent overall."
              mechanisticEvidence="EEG and preclinical work offer plausible mechanisms, but mechanistic plausibility does not establish a clinical anxiety, sleep, or cognitive treatment effect."
              safetyProfile="No serious adverse events were reported in the 2026 meta-analysis. That short-trial record is reassuring but is not equivalent to unlimited long-term safety across all populations and products."
            />

            <EvidenceSummaryCard
              title="L-Theanine — Sleep"
              evidenceLevel="Limited"
              humanEvidence="A 2025 systematic review identified 19 articles and 897 participants and found small improvements in several subjective sleep outcomes. The review highlighted limited evidence using pure L-theanine and unresolved optimal dose and duration."
              mechanisticEvidence="Relaxation mechanisms are proposed, but sleep benefits should be judged from sleep outcomes rather than alpha-wave or anxiety mechanisms alone."
              safetyProfile="Sleep studies vary by product, population, dose, and co-ingredients, so findings should not be generalized to every nighttime supplement or combination."
            />
          </section>

          <section id="study-context" className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <p className="eyebrow-label">Study context matters</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">What the commonly cited doses actually represent</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-muted">
              <div className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4">
                <p className="font-semibold text-ink">200 mg as a single dose</p>
                <p className="mt-1">In the 2026 meta-analysis, 200 mg given 30–60 minutes before cognitive testing was associated with a choice-reaction-time benefit. That is a study protocol and an attention result—not a universal anxiety dose, guaranteed onset time, or personal dosing instruction.</p>
              </div>
              <div className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4">
                <p className="font-semibold text-ink">200 mg/day for four weeks</p>
                <p className="mt-1">A small 2019 double-blind crossover trial studied 30 healthy adults without major psychiatric illness. Some stress-related, sleep, and cognitive measures improved, but the sample was small and the tablets were supplied by a company whose employees were study authors.</p>
              </div>
              <div className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4">
                <p className="font-semibold text-ink">Sleep doses and timing</p>
                <p className="mt-1">The 2025 sleep review found heterogeneous products and protocols and did not establish one optimal pure-L-theanine dose or duration. A common label schedule should not be mistaken for a settled clinical protocol.</p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-6 text-muted">
              Study doses describe research conditions. They are not individualized medical instructions, and medication, pregnancy, blood-pressure, sleep, and other health context can change the risk-benefit calculation.
            </p>
          </section>

          <section id="caffeine" className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <p className="eyebrow-label">Caffeine pairing</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Useful research question, not a universal stack recipe</h2>
            <div className="mt-3 space-y-3 text-[1.01rem] leading-[1.85] text-muted">
              <p>
                A 2025 systematic review and meta-analysis evaluated tea, L-theanine alone, and L-theanine plus caffeine in healthy participants. It found some small-to-moderate task-specific cognitive and mood differences, while confidence intervals frequently showed uncertainty about the direction or magnitude of effects.
              </p>
              <p>
                The review also disclosed industry relationships involving Lipton and Unilever. That does not invalidate the work, but it belongs in the evidence context. The practical takeaway is narrower than “use a fixed ratio”: combination effects depend on the exact task, doses, population, and comparator, and current evidence does not prove that L-theanine reliably prevents caffeine jitters or sleep disruption.
              </p>
            </div>
          </section>

          <section id="safety" className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">Safety and FDA/GRAS context</h2>
            <SafetyNotice title="Safety summary — L-Theanine">
              <ul className="ml-5 space-y-2 list-disc">
                <li><strong>Short trials:</strong> The 2026 meta-analysis reported no serious adverse events, which is reassuring for the studied populations and durations.</li>
                <li><strong>Long-term certainty:</strong> Short RCTs do not establish unlimited long-term safety, dependence risk, pregnancy safety, pediatric safety, or safety with every medication or supplement combination.</li>
                <li><strong>FDA GRAS notices:</strong> FDA has issued “no questions” responses for specific L-theanine preparations and specified food uses. That is not blanket FDA approval of all L-theanine supplements, doses, brands, or health claims.</li>
                <li><strong>Medication context:</strong> If you use prescription medication or have a medical condition, review regular supplement use with a clinician or pharmacist rather than relying on a general safety label.</li>
                <li><strong>Driving and alertness:</strong> Individual responses can differ. Do not assume a supplement is impairment-free for you until you know how you respond.</li>
              </ul>
            </SafetyNotice>
          </section>

          <section id="buying" className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <p className="eyebrow-label">If you choose to buy it</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Use the label to match the product to the evidence you are reviewing</h2>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-muted">
              <li>• Prefer a label that clearly states the amount of L-theanine per serving rather than hiding it inside a proprietary blend.</li>
              <li>• Separate pure L-theanine evidence from combination-product evidence; caffeine, melatonin, magnesium, or herbal co-ingredients change what the product is.</li>
              <li>• Do not treat “Suntheanine,” “tea-derived,” “GRAS,” or a fixed theanine:caffeine ratio as proof of superior clinical efficacy.</li>
              <li>• Compare the exact product, dose, population, and outcome with the study you are using to justify the purchase.</li>
            </ul>
          </section>

          <section id="faq" className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">Frequently asked questions</h2>
            <div className="mt-5 space-y-4">
              {FAQS.map((faq) => (
                <div key={faq.question} className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4">
                  <h3 className="font-semibold text-ink">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="sources" className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">Sources and directness notes</h2>
            <ol className="mt-5 space-y-4">
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

          <RecommendationSection products={getRevenueProductSet('l-theanine')?.products ?? []} />

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
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">In this guide</p>
            <nav className="mt-3 space-y-1.5" aria-label="Article sections">
              {[
                ['#bottom-line', 'Evidence bottom line'],
                ['#outcomes', 'Evidence by goal'],
                ['#evidence', 'Evidence snapshots'],
                ['#study-context', 'Study-dose context'],
                ['#caffeine', 'Caffeine pairing'],
                ['#safety', 'Safety & GRAS'],
                ['#buying', 'Buying checklist'],
                ['#faq', 'FAQ'],
                ['#sources', 'Sources'],
              ].map(([href, label]) => (
                <a key={href} href={href} className="block text-sm text-brand-700 hover:underline">{label}</a>
              ))}
            </nav>
          </div>

          <div className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Related evidence</p>
            <div className="mt-3 space-y-2">
              <Link href="/guides/anxiety/l-theanine-for-anxiety/" className="block text-sm font-medium text-brand-700 hover:underline">L-theanine for anxiety →</Link>
              <Link href="/guides/sleep/l-theanine-for-sleep/" className="block text-sm font-medium text-brand-700 hover:underline">L-theanine for sleep →</Link>
              <Link href="/guides/focus/l-theanine-without-caffeine/" className="block text-sm font-medium text-brand-700 hover:underline">L-theanine without caffeine →</Link>
              <Link href="/guides/focus/l-theanine-vs-caffeine-for-focus/" className="block text-sm font-medium text-brand-700 hover:underline">L-theanine vs caffeine →</Link>
              <Link href="/compounds/l-theanine/" className="block text-sm font-medium text-brand-700 hover:underline">Compound profile →</Link>
              <Link href="/guides/anxiety/natural-anxiety-relief/" className="block text-sm font-medium text-brand-700 hover:underline">Natural anxiety relief →</Link>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-8">
        <Link href="/guides/" className="text-sm font-semibold text-brand-700 hover:text-brand-800">← Back to Guides</Link>
      </div>
    </article>
  )
}
