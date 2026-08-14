import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import StructuredData from '@/components/StructuredData'
import { SITE_URL } from '@/lib/navigation-config'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import EmailCapture from '@/components/EmailCapture'
import NewsletterCtaBlock from '@/components/NewsletterCtaBlock'
import ResponsiveTable from '@/components/ui/ResponsiveTable'
import { buildTwitterMetadata } from '@/src/lib/seo'

const PAGE_URL = `${SITE_URL}/guides/sleep/best-supplements-for-sleep`
const UPDATED_DATE = '2026-08-12'

export const metadata: Metadata = {
  title: 'Best Sleep Supplements: Evidence, Safety & Limits',
  description:
    'Compare melatonin, ashwagandha, L-theanine, magnesium, valerian, and passionflower specifically as sleep supplements, with evidence strength, safety limits, and insomnia context.',
  alternates: { canonical: '/guides/sleep/best-supplements-for-sleep/' },
  openGraph: {
    title: 'Best Sleep Supplements: Evidence, Safety & Limits',
    description:
      'Compare common sleep supplements by what human studies actually support, where evidence is limited, and when chronic insomnia needs stronger first-line care.',
    url: '/guides/sleep/best-supplements-for-sleep/',
    type: 'article',
    images: ['/og-default.jpg'],
  },
  twitter: buildTwitterMetadata({
    title: 'Best Sleep Supplements: Evidence, Safety & Limits',
    description: 'Compare common sleep supplements by what human studies actually support, where evidence is limited, and when chronic insomnia needs stronger first-line care.',
  }),
}

const SOURCES = [
  {
    label: 'NCCIH: Sleep disorders and complementary health approaches',
    href: 'https://www.nccih.nih.gov/health/sleep-disorders-and-complementary-health-approaches',
    note: 'Current overview of melatonin, magnesium, valerian, and complementary sleep approaches; it distinguishes circadian uses from chronic-insomnia evidence and identifies CBT-I as the most strongly recommended insomnia treatment.',
  },
  {
    label: 'Ashwagandha sleep systematic review and meta-analysis (2021)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/34559859/',
    note: 'Five placebo-controlled randomized trials / 400 adults: two trials enrolled 210 healthy adults, one enrolled 50 healthy adults older than 60, one enrolled 60 adults with DSM-IV insomnia, and one enrolled 40 healthy adults plus 40 adults with DSM-IV insomnia. Four trials used KSM-66 root extract and one used Shoden root-and-leaf extract; treatment lasted 6 to 12 weeks. The pooled sleep effect was small with moderate heterogeneity, and one included trial was partially sponsored by the manufacturer.',
  },
  {
    label: 'L-theanine sleep systematic review and meta-analysis (2025)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/40056718/',
    note: 'Nineteen articles / 897 participants. Small improvements appeared in several subjective sleep outcomes, but many interventions were not pure L-theanine and the authors said adequate dose and duration still need study.',
  },
  {
    label: 'Magnesium for insomnia systematic review and meta-analysis (2021)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/33865376/',
    note: 'Three randomized trials / 151 older adults. Possible sleep-onset-latency benefit, but all trials had moderate-to-high risk of bias and certainty was low to very low.',
  },
  {
    label: 'Magnesium bisglycinate randomized placebo-controlled trial (2025)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/40918053/',
    note: 'One hundred fifty-five adults ages 18–65 with self-reported poor sleep received 250 mg elemental magnesium as bisglycinate or placebo daily for four weeks. The insomnia-severity difference was statistically significant but small (Cohen d=0.2); a separate sleep-quality measure was not significantly different and objective sleep was not measured. One coauthor is managing director of a contract research organization that receives nutraceutical-company research funding and has received nutraceutical presentation honoraria; the study supplement was manufactured by Biogena.',
  },
  {
    label: 'Valerian insomnia umbrella review (2024)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/38359657/',
    note: 'Eight systematic reviews were included. The authors found no evidence of efficacy for treating insomnia, despite some subjective sleep-quality signals, and described the underlying evidence as heterogeneous and low quality.',
  },
  {
    label: 'Passionflower insomnia randomized placebo-controlled trial (2020)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/31714321/',
    note: 'One hundred ten adults with DSM-5 insomnia disorder received passionflower extract or placebo for two weeks. Total sleep time improved versus placebo, while several other sleep outcomes did not differ between groups; the authors called for further study.',
  },
  {
    label: 'NCCIH: Ashwagandha usefulness and safety',
    href: 'https://www.nccih.nih.gov/health/ashwagandha',
    note: 'Some preparations may help insomnia or stress; long-term safety is not established and pregnancy, thyroid, autoimmune, liver, surgery, and medication-interaction cautions apply.',
  },
  {
    label: 'NIH ODS: Magnesium health professional fact sheet',
    href: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/',
    note: 'High supplemental magnesium can cause gastrointestinal effects; toxicity risk rises with impaired kidney function and magnesium can affect absorption of some medicines.',
  },
  {
    label: 'NCCIH: Passionflower usefulness and safety',
    href: 'https://www.nccih.nih.gov/health/passionflower',
    note: 'Passionflower may cause drowsiness, dizziness, or confusion; pregnancy use is not recommended because it may induce uterine contractions.',
  },
  {
    label: 'AASM: cognitive behavioral therapy for insomnia',
    href: 'https://aasm.org/coding-quarterly-cognitive-behavioral-therapy-for-insomnia/',
    note: 'The American Academy of Sleep Medicine describes CBT-I as the first-line, evidence-based treatment for chronic insomnia.',
  },
]

const HEADINGS: Heading[] = [
  { id: 'quick-answer', text: 'Quick answer', level: 2 },
  { id: 'comparison', text: 'Evidence comparison', level: 2 },
  { id: 'directness', text: 'What the studies actually support', level: 2 },
  { id: 'safety', text: 'Safety boundaries', level: 2 },
  { id: 'stacking', text: 'Why stacks overreach', level: 2 },
  { id: 'insomnia', text: 'Chronic insomnia', level: 2 },
  { id: 'sourcing', text: 'Product sourcing', level: 2 },
  { id: 'references', text: 'Sources', level: 2 },
]

export default function BestSupplementsForSleepPage() {
  const toc = <TableOfContents headings={HEADINGS} />

  return (
    <>
      <StructuredData
        pageUrl={PAGE_URL}
        headline="Best Sleep Supplements: Evidence, Safety & Limits"
        description="Evidence-first comparison of common sleep supplements, including direct human evidence, uncertainty, safety, and chronic-insomnia limits."
        datePublished="2026-06-16"
        dateModified={UPDATED_DATE}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides' },
          { label: 'Best Sleep Supplements', href: '/guides/sleep/best-supplements-for-sleep' },
        ]}
      />

      <ArticleLayout toc={toc} zone="supplement">
        <div className="space-y-12">
          <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10">
            <p className="eyebrow-label">Sleep evidence guide</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Best Sleep Supplements: Evidence, Safety & Limits
            </h1>
            <p className="mt-2 text-xs text-muted">
              Written and edited by{' '}
              <Link href="/info/author/" rel="author" className="font-medium text-brand-700 hover:underline">
                Willie B. Randolph III
              </Link>{' '}
              · Last evidence review August 12, 2026
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">
              “Best” is a search term, not a scientific ranking. Melatonin, ashwagandha, L-theanine, magnesium,
              valerian, and passionflower have different evidence bases, studied populations, preparations, and
              safety limits. This guide compares what is actually supported without turning those studies into a
              symptom-to-supplement selector or a universal bedtime dose chart.
            </p>

            <div className="mt-5 rounded-xl border border-brand-900/10 bg-brand-50/50 p-4 text-sm leading-6 text-muted">
              <strong className="text-ink">This page is intentionally supplement-specific.</strong>{' '}
              If you are comparing light, routines, behavioral approaches, and nonprescription options together, use the{' '}
              <Link href="/guides/sleep/best-natural-sleep-aids-that-work/" className="font-semibold text-brand-700 hover:underline">
                natural sleep aids guide
              </Link>{' '}instead.
            </div>

            <figure className="mt-6">
              <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
                <Image
                  src="/images/guides/best-supplements-for-sleep.jpg"
                  alt="An assortment of common sleep supplements and calming herbs arranged for an evidence comparison"
                  width={1536}
                  height={1024}
                  priority
                  className="h-auto w-full"
                />
              </div>
              <figcaption className="mt-3 text-center text-sm text-muted">
                Evidence for one ingredient, formulation, population, or sleep outcome should not be transferred automatically to another.
              </figcaption>
            </figure>
          </section>

          <section id="quick-answer" className="scroll-mt-20 rounded-[1.65rem] border border-brand-700/20 bg-brand-50/60 p-6 shadow-sm">
            <p className="eyebrow-label">Quick answer</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">There is no universal first supplement for poor sleep</h2>
            <div className="mt-4 space-y-3 text-sm leading-7 text-muted sm:text-base">
              <p>
                <strong>Melatonin</strong> has its clearest role in circadian-timing situations such as jet lag and some shift-work problems—not as a universal chronic-insomnia treatment. <strong>Ashwagandha</strong> and <strong>L-theanine</strong> have limited sleep signals, but their studies do not establish one bedtime regimen or symptom-matched indication.
              </p>
              <p>
                <strong>Magnesium</strong> evidence remains limited even after a small positive 2025 bisglycinate trial. <strong>Valerian</strong> has no demonstrated insomnia efficacy in a 2024 umbrella review. <strong>Passionflower</strong> has one useful but preliminary two-week insomnia trial. None of those findings replaces diagnosis of the sleep problem itself.
              </p>
            </div>
          </section>

          <section id="comparison" className="scroll-mt-20 space-y-4">
            <p className="eyebrow-label">Directness before ranking</p>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">What human evidence is actually available?</h2>
            <ResponsiveTable label="Sleep supplement evidence comparison">
              <table className="min-w-[980px] w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-900/10">
                    <th className="pb-3 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Option</th>
                    <th className="pb-3 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Most defensible evidence context</th>
                    <th className="pb-3 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Main limit</th>
                    <th className="pb-3 text-left text-xs font-bold uppercase tracking-wider text-muted">Evidence interpretation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-900/5">
                  <tr className="align-top">
                    <td className="py-4 pr-4 font-semibold text-ink">Melatonin</td>
                    <td className="py-4 pr-4 text-muted">Circadian timing, especially jet lag and some shift-work sleep problems; some sleep-onset effects in insomnia studies.</td>
                    <td className="py-4 pr-4 text-muted">Effects vary by sleep problem and timing; chronic-insomnia guidelines do not support treating it as the default long-term answer.</td>
                    <td className="py-4 text-muted">Context-specific, not “best overall.”</td>
                  </tr>
                  <tr className="align-top">
                    <td className="py-4 pr-4 font-semibold text-ink">Ashwagandha</td>
                    <td className="py-4 pr-4 text-muted">Five placebo-controlled RCTs / 400 adults: healthy adults, healthy adults over 60, adults with DSM-IV insomnia, and a mixed healthy/insomnia cohort. Four trials used KSM-66 root extract and one used Shoden root-and-leaf extract for 6–12 weeks.</td>
                    <td className="py-4 pr-4 text-muted">Small pooled effect with moderate heterogeneity; all five trials were conducted in India, preparations and doses varied, one trial was partially manufacturer-sponsored, and long-term safety remains uncertain.</td>
                    <td className="py-4 text-muted">Limited sleep signal.</td>
                  </tr>
                  <tr className="align-top">
                    <td className="py-4 pr-4 font-semibold text-ink">L-theanine</td>
                    <td className="py-4 pr-4 text-muted">2025 meta-analysis: 19 articles / 897 participants with small improvements in several subjective sleep outcomes.</td>
                    <td className="py-4 pr-4 text-muted">Many interventions were not pure L-theanine; appropriate dose and duration remain unresolved.</td>
                    <td className="py-4 text-muted">Promising but indirect/heterogeneous.</td>
                  </tr>
                  <tr className="align-top">
                    <td className="py-4 pr-4 font-semibold text-ink">Magnesium</td>
                    <td className="py-4 pr-4 text-muted">Older review: 3 RCTs / 151 older adults with low-to-very-low certainty. 2025 bisglycinate RCT: 155 adults ages 18–65 received 250 mg elemental magnesium or placebo daily for four weeks; the insomnia-severity effect was small (d=0.2).</td>
                    <td className="py-4 pr-4 text-muted">No objective sleep measure; separate sleep-quality measure was not significantly different; form superiority is not established. One coauthor leads a CRO receiving nutraceutical-industry funding and honoraria, and the study supplement was manufactured by Biogena.</td>
                    <td className="py-4 text-muted">Limited, with one newer small signal.</td>
                  </tr>
                  <tr className="align-top">
                    <td className="py-4 pr-4 font-semibold text-ink">Valerian</td>
                    <td className="py-4 pr-4 text-muted">2024 umbrella review of 8 systematic reviews found some subjective sleep-quality signals.</td>
                    <td className="py-4 pr-4 text-muted">No evidence of efficacy for treating insomnia; underlying studies were heterogeneous and low quality.</td>
                    <td className="py-4 text-muted">Do not present as established insomnia therapy.</td>
                  </tr>
                  <tr className="align-top">
                    <td className="py-4 pr-4 font-semibold text-ink">Passionflower</td>
                    <td className="py-4 pr-4 text-muted">One 110-person DSM-5 insomnia RCT over two weeks found greater total-sleep-time improvement than placebo.</td>
                    <td className="py-4 pr-4 text-muted">Several other sleep outcomes did not differ between groups; one short trial is not enough for a broad sleep-treatment claim.</td>
                    <td className="py-4 text-muted">Preliminary.</td>
                  </tr>
                </tbody>
              </table>
            </ResponsiveTable>
          </section>

          <section id="directness" className="scroll-mt-20 grid gap-5 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-ink">Study schedules are not bedtime prescriptions</h2>
              <p className="mt-3 text-sm leading-7 text-muted">
                A trial may use a specific dose, extract, timing schedule, and treatment duration because that is what researchers chose to test. That does not establish a universal personal dose, 30–60-minute onset, “take as needed” strategy, or fixed multi-week course for every commercial product.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-ink">Symptoms do not identify a supplement</h2>
              <p className="mt-3 text-sm leading-7 text-muted">
                “Racing thoughts,” tension, stress, and difficulty falling asleep overlap across insomnia, anxiety, circadian problems, medication effects, pain, sleep apnea, restless legs, and ordinary short sleep. A symptom label does not prove that L-theanine, magnesium, ashwagandha, or another supplement is the correct intervention.
              </p>
            </div>
          </section>

          <section id="safety" className="scroll-mt-20 rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
            <p className="eyebrow-label">Safety is ingredient-specific</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Important boundaries that a “best” list should not hide</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-brand-900/10 bg-brand-50/35 p-4 text-sm leading-7 text-muted">
                <strong className="text-ink">Melatonin:</strong> short-term use appears relatively safe for many adults, but long-term safety is uncertain. Daytime drowsiness can occur, and people with epilepsy or taking blood thinners should use medical supervision.
              </div>
              <div className="rounded-xl border border-brand-900/10 bg-brand-50/35 p-4 text-sm leading-7 text-muted">
                <strong className="text-ink">Ashwagandha:</strong> NCCIH lists rare liver injury, pregnancy/breastfeeding avoidance, thyroid and autoimmune cautions, surgery concerns, and several medication-interaction categories.
              </div>
              <div className="rounded-xl border border-brand-900/10 bg-brand-50/35 p-4 text-sm leading-7 text-muted">
                <strong className="text-ink">Magnesium:</strong> supplemental magnesium can cause diarrhea, nausea, and cramping; toxicity risk rises with impaired kidney function and it can interfere with absorption of some medicines.
              </div>
              <div className="rounded-xl border border-brand-900/10 bg-brand-50/35 p-4 text-sm leading-7 text-muted">
                <strong className="text-ink">Valerian / passionflower:</strong> both can cause sedation-related effects. Valerian should not be combined casually with alcohol or sedatives; passionflower is not recommended during pregnancy because it may induce uterine contractions.
              </div>
              <div className="rounded-xl border border-brand-900/10 bg-brand-50/35 p-4 text-sm leading-7 text-muted md:col-span-2">
                <strong className="text-ink">L-theanine:</strong> the sleep evidence base does not establish comprehensive long-term or interaction safety for every pure or combination product. “Generally tolerated in trials” should not be translated into “interaction-free.”
              </div>
            </div>
          </section>

          <section id="stacking" className="scroll-mt-20 rounded-[1.65rem] border border-amber-200 bg-amber-50/60 p-6">
            <h2 className="text-2xl font-semibold tracking-tight text-amber-950">Why sleep stacks overreach the evidence</h2>
            <p className="mt-3 text-sm leading-7 text-amber-900">
              Separate trials of melatonin, magnesium, L-theanine, ashwagandha, valerian, or passionflower do not prove that combining them creates synergy, works faster, or is safer. A multi-ingredient stack is a new intervention with its own interaction and attribution problem. If supplementation is appropriate, changing one variable at a time is easier to interpret than copying a stack assembled from unrelated studies.
            </p>
            <Link href="/guides/sleep/sleep-stack-guide/" className="mt-3 inline-block text-sm font-semibold text-amber-950 hover:underline">Sleep stack evidence guide →</Link>
          </section>

          <section id="insomnia" className="scroll-mt-20 rounded-[1.65rem] border border-red-100 bg-red-50/60 p-6">
            <h2 className="text-2xl font-semibold tracking-tight text-red-950">Chronic insomnia has a stronger first-line treatment</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-red-900">
              <p>
                The American Academy of Sleep Medicine describes cognitive behavioral therapy for insomnia (CBT-I) as the first-line, evidence-based treatment for chronic insomnia. A supplement ranking should not obscure that stronger evidence base.
              </p>
              <p>
                Loud snoring or gasping, dangerous daytime sleepiness, an urge to move the legs, severe mood symptoms, new sleep problems after a medication change, or insomnia that persists for months are reasons to seek assessment rather than escalating supplements.
              </p>
            </div>
          </section>

          <section id="sourcing" className="scroll-mt-20 rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
            <p className="eyebrow-label">Product sourcing</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Why this broad guide does not rank products</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Study preparations and retail products are not automatically interchangeable. This broad guide intentionally does not rank affiliate products or make one ingredient look commercially preferred. Ingredient-specific pages are the better place to evaluate plant part, extract, form, standardization, label accuracy, and independent quality testing.
            </p>
          </section>

          <section id="references" className="scroll-mt-20 rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
            <p className="eyebrow-label">Sources</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Evidence sources used for this guide</h2>
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

          <section className="grid gap-3 sm:grid-cols-2">
            <Link href="/guides/compare/sleep-herbs-vs-melatonin/" className="rounded-xl border border-brand-900/10 bg-white p-4 text-sm font-semibold text-brand-700 hover:underline">Sleep herbs vs melatonin →</Link>
            <Link href="/guides/sleep/ashwagandha-for-sleep/" className="rounded-xl border border-brand-900/10 bg-white p-4 text-sm font-semibold text-brand-700 hover:underline">Ashwagandha for sleep →</Link>
            <Link href="/guides/herbs/l-theanine/" className="rounded-xl border border-brand-900/10 bg-white p-4 text-sm font-semibold text-brand-700 hover:underline">L-theanine evidence →</Link>
            <Link href="/guides/sleep/" className="rounded-xl border border-brand-900/10 bg-white p-4 text-sm font-semibold text-brand-700 hover:underline">Sleep goal hub →</Link>
          </section>

          <EmailCapture
            headline="Get future sleep research notes by email"
            description="Evidence-first supplement updates, safety context, and new guide announcements. No universal bedtime protocols."
            location="best-supplements-for-sleep"
          />
          <NewsletterCtaBlock
            title="Continue with the newsletter archive"
            description="Short notes built for cautious supplement decisions."
            location="best-supplements-for-sleep-newsletter"
          />
        </div>
      </ArticleLayout>
    </>
  )
}
