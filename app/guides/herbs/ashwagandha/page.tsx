import Link from 'next/link'
import Image from 'next/image'
import JsonLd from '@/components/seo/JsonLd'
import { buildPageMetadata, blogJsonLd, breadcrumbJsonLd, faqPageJsonLd, compactMetaTitle } from '../../../../src/lib/seo'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import EmailCapture from '@/components/EmailCapture'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'
import NewsletterCtaBlock from '@/components/NewsletterCtaBlock'
import LastUpdatedBadge from '../../../../src/components/editorial/LastUpdatedBadge'
import ResponsiveTable from '@/components/ui/ResponsiveTable'

const SLUG = 'ashwagandha'
const TITLE = 'Ashwagandha: What the Evidence Supports for Stress, Anxiety, Sleep, and Cognition'
const DESCRIPTION =
  'Evidence-first ashwagandha guide updated for 2026: stress, anxiety, sleep, cognition, physical performance, preparation-specific evidence, safety limits, and what current trials do not establish.'
const DATE = '2026-06-26'
const UPDATED_DATE = '2026-08-12'
const AUTHOR = 'Will'
const READING_TIME = '12 min read'
const TAGS = ['ashwagandha', 'stress', 'anxiety', 'sleep', 'cognition', 'adaptogens']

export const metadata = buildPageMetadata({
  title: compactMetaTitle(TITLE),
  description: DESCRIPTION,
  path: `/guides/herbs/${SLUG}`,
  openGraphType: 'article',
})

const SOURCES = [
  {
    label: 'NCCIH: Ashwagandha usefulness and safety',
    href: 'https://www.nccih.nih.gov/health/ashwagandha',
    note: 'Some preparations may help stress and insomnia; anxiety evidence is described as unclear. NCCIH also summarizes short-term safety, rare liver injury, pregnancy/breastfeeding avoidance, thyroid/autoimmune cautions, surgery, and medication interactions.',
  },
  {
    label: 'Stress and anxiety systematic review and meta-analysis (2024)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/39348746/',
    note: 'Nine randomized controlled trials / 558 participants using specific formulations versus placebo. Pooled perceived-stress, Hamilton anxiety, and serum-cortisol outcomes favored ashwagandha; four trials reported mild-to-moderate adverse events and long-term safety remained unresolved.',
  },
  {
    label: 'Mental-health systematic review and dose-response meta-analysis (2026)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/41644067/',
    note: 'Twenty-two randomized studies were included. Pooled stress, anxiety, and depression outcomes were favorable, but the authors emphasized heterogeneity and the need for better trials before translating results into clinical recommendations, doses, or durations.',
  },
  {
    label: 'Sleep systematic review and meta-analysis (2021)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/34559859/',
    note: 'Five randomized trials / 400 adults found a small overall sleep benefit. Heterogeneity was moderate and the authors called for more long-term safety data.',
  },
  {
    label: 'Cognitive and physical function systematic review and meta-analysis (2026)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/42199854/',
    note: 'Twenty studies / 1,249 participants reported signals for several cognitive domains, testosterone, and muscle strength. No outcome had enough studies for a reliable publication-bias assessment, and intervention preparations and durations varied.',
  },
]

const FAQS = [
  {
    question: 'What is ashwagandha best supported for?',
    answer:
      'Stress has the clearest overall support in the current evidence base. Some preparations may also help insomnia. Anxiety results are promising in pooled trials, but NCCIH still describes anxiety evidence as unclear, so an anxiety-treatment claim would be too strong.',
  },
  {
    question: 'How quickly does ashwagandha work?',
    answer:
      'Most relevant trials evaluate repeated use over days or weeks. Their study schedules do not establish a guaranteed personal onset, and ashwagandha should not be presented as a same-hour rescue option for anxiety, sleep, or a presumed cortisol spike.',
  },
  {
    question: 'Which ashwagandha extract is best?',
    answer:
      'There is no universal evidence-based winner. Trials use different root, root-and-leaf, branded, and standardized preparations. A positive trial validates that studied preparation and context; it does not prove that KSM-66, Sensoril, raw powder, tea, gummies, or another extract are interchangeable.',
  },
  {
    question: 'Does ashwagandha lower cortisol?',
    answer:
      'Some trials and pooled analyses report lower serum or salivary cortisol, but cortisol is an outcome measure rather than a home diagnosis. Feeling stressed, tired, wired, or unable to sleep does not establish that someone has pathologically high cortisol or that lowering cortisol is an appropriate treatment goal.',
  },
  {
    question: 'Does ashwagandha help sleep?',
    answer:
      'A five-trial meta-analysis in 400 adults found a small overall sleep benefit, and NCCIH says some preparations may help insomnia. The evidence does not establish one universal product, dose, or bedtime timing rule.',
  },
  {
    question: 'Does ashwagandha improve focus or athletic performance?',
    answer:
      'A 2026 meta-analysis reported signals for several cognitive measures, muscle strength, and testosterone, but the evidence is spread across small and varied trials. Those results are promising rather than a blanket nootropic or performance guarantee.',
  },
  {
    question: 'Can ashwagandha be stacked with magnesium or L-theanine?',
    answer:
      'Separate studies of individual ingredients do not establish that a combination is more effective or safer. Medication use, sedative effects, thyroid or autoimmune conditions, pregnancy status, and other supplements can materially change the safety picture, so a popular stack should not be treated as a validated protocol.',
  },
]

export default function AshwagandhaArticlePage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: 'Guides', url: 'https://thehippiescientist.net/guides/' },
    { name: TITLE, url: `https://thehippiescientist.net/guides/herbs/${SLUG}/` },
  ])

  const articleLd = blogJsonLd(
    { title: TITLE, slug: SLUG, date: DATE, updated: UPDATED_DATE, description: DESCRIPTION },
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
        <span className="line-clamp-1 text-ink">Ashwagandha</span>
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
        <div className="mt-3"><LastUpdatedBadge date={UPDATED_DATE} label="Last evidence review" /></div>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted">{DESCRIPTION}</p>

        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
            <Image
              src="/images/guides/ashwagandha-herb.jpg"
              alt="Ashwagandha roots, leaves, berries, and root powder"
              width={1536}
              height={1024}
              priority
              className="h-auto w-full"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            Ashwagandha evidence is preparation- and outcome-specific; one successful extract trial does not validate every product sold under the same plant name.
          </figcaption>
        </figure>
      </section>

      <div className="mt-4 rounded-[1rem] border border-brand-900/10 bg-brand-50/60 px-5 py-3 text-xs leading-6 text-muted">
        <strong className="text-ink">Affiliate disclosure:</strong> This page contains optional product-sourcing links. They are not evidence that a commercial product will reproduce a trial result. We may earn a commission at no added cost to you.
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="space-y-6">
          <section className="rounded-[1rem] border border-brand-700/20 bg-brand-50/60 p-6 shadow-sm sm:p-8">
            <p className="eyebrow-label">Evidence bottom line</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              Stress has the strongest practical signal; the rest need narrower claims
            </h2>
            <div className="mt-3 space-y-3 text-[1.01rem] leading-[1.85] text-muted">
              <p>
                The 2024 stress/anxiety meta-analysis pooled <strong>nine randomized trials / 558 participants</strong> and found favorable pooled results for perceived stress, Hamilton anxiety scores, and serum cortisol. A broader 2026 mental-health meta-analysis was also positive, while explicitly calling for better trials because of heterogeneity and uncertainty around optimal intervention details.
              </p>
              <p>
                NCCIH’s more conservative synthesis is useful for decision-making: some preparations may help <strong>stress and insomnia</strong>, while the evidence for <strong>anxiety remains unclear</strong>. That makes “stress support” more defensible than “treats anxiety,” and it rules out turning cortisol measurements, branded extracts, or trial schedules into universal protocols.
              </p>
            </div>
          </section>

          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <p className="eyebrow-label">Outcome-by-outcome</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">What the current evidence supports</h2>
            <ResponsiveTable label="Ashwagandha evidence by outcome">
              <table className="mt-5 min-w-[700px] w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-900/10">
                    <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Goal</th>
                    <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Direct evidence</th>
                    <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">Main limit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-900/5">
                  <tr className="align-top">
                    <td className="py-3 pr-4 font-semibold text-ink">Stress</td>
                    <td className="py-3 pr-4 text-muted">Nine-RCT 2024 meta-analysis plus a larger 2026 mental-health meta-analysis support repeated-dose stress signals.</td>
                    <td className="py-3 text-muted">Preparations, populations, outcomes, doses, and durations vary; there is no universal protocol.</td>
                  </tr>
                  <tr className="align-top">
                    <td className="py-3 pr-4 font-semibold text-ink">Anxiety</td>
                    <td className="py-3 pr-4 text-muted">Pooled anxiety scales favor ashwagandha in meta-analyses.</td>
                    <td className="py-3 text-muted">NCCIH still calls anxiety evidence unclear; stress-population outcomes should not be relabeled as established anxiety-disorder treatment.</td>
                  </tr>
                  <tr className="align-top">
                    <td className="py-3 pr-4 font-semibold text-ink">Sleep</td>
                    <td className="py-3 pr-4 text-muted">Five RCTs / 400 adults produced a small overall sleep benefit in the 2021 meta-analysis.</td>
                    <td className="py-3 text-muted">Small evidence base, moderate heterogeneity, preparation differences, and limited long-term safety data.</td>
                  </tr>
                  <tr className="align-top">
                    <td className="py-3 pr-4 font-semibold text-ink">Cognition / physical function</td>
                    <td className="py-3 pr-4 text-muted">A 2026 meta-analysis of 20 studies / 1,249 participants reported signals in several cognitive domains, testosterone, and muscle strength.</td>
                    <td className="py-3 text-muted">No outcome had enough studies for reliable publication-bias assessment; results do not establish a blanket nootropic, testosterone, or athletic-performance effect.</td>
                  </tr>
                </tbody>
              </table>
            </ResponsiveTable>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">Evidence snapshots</h2>
            <EvidenceSummaryCard
              title="Ashwagandha — stress"
              evidenceLevel="Moderate"
              humanEvidence="The 2024 meta-analysis pooled nine randomized controlled trials with 558 participants and found favorable pooled perceived-stress and cortisol outcomes versus placebo. A 2026 mental-health meta-analysis also reported a stress signal, while warning that heterogeneity and uncertainty still limit clinical recommendations."
              mechanisticEvidence="Cortisol and stress-pathway findings are useful research outcomes, but they do not diagnose 'HPA dysregulation' from symptoms or prove that lower cortisol is always desirable."
              safetyProfile="Short-trial safety is more reassuring than long-term safety. Four trials in the 2024 review reported mild-to-moderate adverse events; NCCIH says evidence beyond roughly three months is insufficient for firm conclusions."
            />
            <EvidenceSummaryCard
              title="Ashwagandha — anxiety"
              evidenceLevel="Limited"
              humanEvidence="Meta-analyses report favorable pooled anxiety scores, but populations and formulations vary and NCCIH continues to describe anxiety evidence as unclear. That is not enough to present ashwagandha as an established anxiety-disorder treatment."
              mechanisticEvidence="Stress, cortisol, sleep, and anxiety measures overlap but are not interchangeable outcomes. A stress result should not automatically become an anxiolytic claim."
              safetyProfile="Anxiety symptoms can also signal conditions that need assessment rather than supplementation, especially when persistent, disabling, associated with panic, substance use, or major sleep disruption."
            />
            <EvidenceSummaryCard
              title="Ashwagandha — sleep"
              evidenceLevel="Limited"
              humanEvidence="The 2021 systematic review/meta-analysis included five randomized trials and 400 adults and found a small overall sleep benefit, with moderate heterogeneity."
              mechanisticEvidence="A sleep signal does not establish one bedtime mechanism, a universal sedative effect, or a specific timing rule for every preparation."
              safetyProfile="Drowsiness can occur. Sedative medications and other products that impair alertness can change the risk profile, and long-term safety remains less certain than short-term tolerability."
            />
            <EvidenceSummaryCard
              title="Ashwagandha — cognition and physical outcomes"
              evidenceLevel="Limited"
              humanEvidence="A 2026 meta-analysis included 20 studies / 1,249 participants and reported pooled signals for memory, attention/processing speed, executive function, testosterone, and muscle strength. Individual outcomes were supported by too few studies for reliable publication-bias assessment."
              mechanisticEvidence="Positive pooled outcomes do not prove a universal focus enhancer, testosterone booster, or performance effect across products and populations."
              safetyProfile="The review reported no serious adverse events in included trials, but adverse-event reporting varied and that trial record does not override broader NCCIH cautions or establish long-term safety."
            />
          </section>

          <section className="rounded-[1rem] border border-amber-200 bg-amber-50/70 p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-amber-950">Why extract names, milligrams, and trial timing are not universal instructions</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-amber-950">
              <p>
                Ashwagandha studies use different plant parts, extraction methods, standardization targets, branded preparations, doses, populations, and exposure periods. A KSM-66 trial validates KSM-66 in that trial; a Sensoril trial validates Sensoril in that trial. Neither creates a class-wide winner.
              </p>
              <p>
                Trial regimens are study context, not personal dosing instructions. The newer 2026 mental-health review specifically says more high-quality research is needed before optimal doses and intervention durations can be translated into clinical recommendations.
              </p>
              <p>
                The same rule applies to timing: a multi-week trial does not establish that everyone should take an extract for a fixed six- or eight-week “course,” and it does not identify a same-day rescue strategy for anxiety, insomnia, or a presumed cortisol problem.
              </p>
            </div>
          </section>

          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">Cortisol is a study outcome, not a DIY diagnosis</h2>
            <div className="mt-3 space-y-3 text-[1.01rem] leading-[1.85] text-muted">
              <p>
                Some ashwagandha trials measure cortisol and report lower average levels. That does not mean symptoms such as fatigue, poor sleep, feeling “wired,” or stress prove that someone has pathologically high cortisol.
              </p>
              <p>
                If the concern is a true cortisol disorder, that is a medical testing question. For everyday stress, the useful evidence question is whether a studied preparation improved meaningful symptoms—not whether a supplement can be used to chase a hormone number without a diagnosis.
              </p>
              <Link href="/guides/anxiety/how-to-lower-cortisol-naturally/" className="inline-block text-sm font-semibold text-brand-700 hover:underline">
                Read the cortisol testing and stress guide →
              </Link>
            </div>
          </section>

          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">Combination evidence: why popular stacks are not protocols</h2>
            <p className="mt-3 text-[1.01rem] leading-[1.85] text-muted">
              Separate trials of ashwagandha, magnesium, L-theanine, melatonin, or other supplements do not prove that combining them creates synergy or is safer. Starting multiple products at once also makes benefit and side effects harder to attribute. A stack needs direct combination evidence before it can inherit the claims of its ingredients.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-brand-700">
              <Link href="/guides/anxiety/anxiety-stack-guide/" className="hover:underline">Anxiety stack evidence →</Link>
              <Link href="/guides/sleep/sleep-stack-guide/" className="hover:underline">Sleep stack evidence →</Link>
            </div>
          </section>

          <section>
            <SafetyNotice title="Safety and stop rules">
              <ul className="ml-5 space-y-2 list-disc">
                <li><strong>Short term vs long term:</strong> NCCIH says short-term use up to about three months may be safe for many people, but there is not enough information to establish long-term safety.</li>
                <li><strong>Common side effects:</strong> drowsiness, stomach upset, diarrhea, and vomiting can occur.</li>
                <li><strong>Liver:</strong> rare cases of liver injury have been linked to ashwagandha supplements. Stop and seek medical advice for jaundice, dark urine, severe unexplained fatigue, or persistent upper-abdominal symptoms.</li>
                <li><strong>Pregnancy and breastfeeding:</strong> NCCIH says to avoid ashwagandha during pregnancy and not use it while breastfeeding.</li>
                <li><strong>Conditions:</strong> NCCIH does not recommend it around surgery or for people with autoimmune or thyroid disorders without appropriate medical guidance.</li>
                <li><strong>Medication interactions:</strong> possible interaction categories include diabetes and blood-pressure medicines, immunosuppressants, sedatives, anticonvulsants, and thyroid hormone medicines.</li>
                <li><strong>Hormone-sensitive prostate cancer:</strong> NCCIH advises avoidance because ashwagandha may increase testosterone levels.</li>
                <li><strong>Persistent or severe symptoms:</strong> supplements should not delay assessment for disabling anxiety, chronic insomnia, significant depression, panic, major functional decline, or thoughts of self-harm.</li>
              </ul>
            </SafetyNotice>
          </section>

          <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">Product sourcing: match the label to the evidence</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              If a supplement trial is appropriate, look for a label that clearly identifies the plant part, extract or powder form, and standardization rather than assuming the highest withanolide percentage or a patented trademark is automatically “best.” Independent quality testing can help with identity and contamination, but it does not prove efficacy.
            </p>
            <div className="mt-5">
              <RecommendationSection products={getRevenueProductSet('ashwagandha')?.products ?? []} />
            </div>
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
                  <a href={source.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 hover:underline">
                    {source.label}
                  </a>
                  <span> — {source.note}</span>
                </li>
              ))}
            </ol>
          </section>

          <div className="my-10">
            <NewsletterCtaBlock />
            <div className="mt-6"><EmailCapture /></div>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-[1rem] border border-brand-900/10 bg-white p-4 text-sm shadow-sm">
            <p className="font-semibold text-ink">Deep dives</p>
            <nav className="mt-3 space-y-2 text-brand-700">
              <Link href="/guides/anxiety/ashwagandha-for-anxiety/" className="block hover:underline">Ashwagandha and anxiety</Link>
              <Link href="/guides/sleep/ashwagandha-for-sleep/" className="block hover:underline">Ashwagandha and sleep</Link>
              <Link href="/herbs/ashwagandha/" className="block hover:underline">Herb profile</Link>
              <Link href="/guides/anxiety/best-adaptogens-for-stress/" className="block hover:underline">Adaptogen comparison</Link>
            </nav>
          </div>
          <div className="rounded-[1rem] border border-brand-900/10 bg-brand-50/60 p-4 text-xs leading-6 text-muted">
            <strong className="text-ink">Interpretation rule:</strong> evidence for one outcome, extract, population, or trial duration should not be transferred automatically to another.
          </div>
        </aside>
      </div>
    </article>
  )
}
