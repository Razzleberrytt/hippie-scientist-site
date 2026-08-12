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
import LastUpdatedBadge from '../../../../src/components/editorial/LastUpdatedBadge'
import ResponsiveTable from '@/components/ui/ResponsiveTable'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import EmailCapture from '@/components/EmailCapture'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'
import NewsletterCtaBlock from '@/components/NewsletterCtaBlock'

const SLUG = 'anxiety-stack-guide'
const TITLE = 'Anxiety Supplement Stacks: Evidence, Interactions, and Safer Combination Rules'
const DESCRIPTION =
  'An evidence-first anxiety stack guide: what current research actually supports for L-theanine, ashwagandha, and magnesium, why ingredient evidence does not validate a named stack, and how to reduce avoidable combination risk.'
const DATE = '2026-08-11'

export const metadata = buildPageMetadata({
  title: compactMetaTitle(TITLE),
  description: DESCRIPTION,
  path: `/guides/anxiety/${SLUG}`,
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'What is the best anxiety supplement stack?',
    answer:
      'Current evidence does not establish a universal best stack. L-theanine, ashwagandha, and magnesium have been studied mostly as individual interventions or in heterogeneous formulations. Evidence for one ingredient cannot be assumed to prove that a named multi-supplement combination is more effective or safer.',
  },
  {
    question: 'Can I combine ashwagandha and L-theanine?',
    answer:
      'The combination is commercially common, but ingredient-level evidence does not validate the pair as a treatment. Ashwagandha evidence is primarily repeated-dose and formulation-specific, while a 2026 L-theanine meta-analysis found inconsistent anxiety effects. Adding both together also makes benefit, side effects, and interactions harder to attribute.',
  },
  {
    question: 'Can I combine magnesium with anxiety supplements?',
    answer:
      'Magnesium is often included in combination products, but the 2024 systematic review found heterogeneous populations, formulations, doses, durations, and some multi-ingredient trials. That makes it difficult to infer what magnesium contributes to a specific stack. Kidney disease and medication timing can also materially change magnesium safety.',
  },
  {
    question: 'How fast should an anxiety stack work?',
    answer:
      'There is no evidence-based onset time for an anxiety stack. L-theanine is often studied 30–60 minutes before cognitive testing, but its robust acute signal was attention rather than reliable anxiety relief. Ashwagandha evidence is generally repeated-dose over weeks, while magnesium studies vary widely in duration and population.',
  },
  {
    question: 'Is starting several supplements at once a good way to test a stack?',
    answer:
      'Starting several new ingredients together makes it harder to identify what helped or caused a side effect and increases interaction complexity. If a clinician or pharmacist agrees that supplementation is reasonable, changing one variable at a time is easier to interpret than beginning a multi-ingredient regimen all at once.',
  },
  {
    question: 'When is a supplement stack the wrong tool for anxiety?',
    answer:
      'Persistent, worsening, panic-level, or functionally impairing anxiety deserves established mental-health care rather than supplement escalation. Suicidal thoughts, thoughts of self-harm, inability to stay safe, or imminent danger require immediate emergency or crisis care.',
  },
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
    note: 'Nine randomized trials and 558 participants; pooled stress/anxiety signals versus placebo using specific formulations, with long-term safety still less certain.',
  },
  {
    label: 'Ashwagandha root-extract randomized trial in adults with moderate stress and anxiety (2026)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/41815853/',
    note: '141 healthy adults ages 18–65; 8-week three-arm trial comparing 300 mg proprietary root extract twice daily, another root extract, and placebo.',
  },
  {
    label: 'Magnesium anxiety and sleep systematic review (2024)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/38817505/',
    note: '15 interventional studies, seven with anxiety outcomes; heterogeneity in populations, formulations, doses, durations, and co-ingredients limits firm conclusions.',
  },
  {
    label: 'NIH Office of Dietary Supplements: Magnesium fact sheet for health professionals',
    href: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/',
    note: 'Safety, tolerable upper-intake context for supplemental magnesium, kidney-risk considerations, and medication interactions.',
  },
]

export default function AnxietyStackGuidePage() {
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Guides', url: 'https://thehippiescientist.net/guides/' },
    { name: 'Anxiety', url: 'https://thehippiescientist.net/guides/anxiety/' },
    { name: TITLE, url: `https://thehippiescientist.net/guides/anxiety/${SLUG}/` },
  ])
  const articleLd = blogJsonLd(
    { title: TITLE, slug: SLUG, date: DATE, description: DESCRIPTION },
    `/guides/anxiety/${SLUG}/`,
  )
  const faqLd = faqPageJsonLd({ pagePath: `/guides/anxiety/${SLUG}/`, questions: FAQS })
  const comparisonProducts = [
    ...(getRevenueProductSet('ashwagandha')?.products ?? []),
    ...(getRevenueProductSet('l-theanine')?.products ?? []),
    ...(getRevenueProductSet('magnesium')?.products ?? []),
  ]

  return (
    <article className="mx-auto max-w-5xl space-y-0 px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <JsonLd schema={articleLd} />
      <JsonLd schema={breadcrumbs} />
      {faqLd ? <JsonLd schema={faqLd} /> : null}

      <nav className="mb-6 flex items-center gap-2 text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/guides/" className="hover:text-ink">Guides</Link>
        <span>/</span>
        <Link href="/guides/anxiety/" className="hover:text-ink">Anxiety</Link>
        <span>/</span>
        <span className="text-ink">Stack Guide</span>
      </nav>

      <section className="rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-brand-900/10 bg-brand-50 px-2.5 py-0.5 font-bold uppercase tracking-wider text-brand-800">
            Combination evidence guide
          </span>
          <span className="text-muted">Evidence review · August 11, 2026</span>
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
          {TITLE}
        </h1>
        <div className="mt-3"><LastUpdatedBadge date={DATE} label="Last evidence review" /></div>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted">{DESCRIPTION}</p>

        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
            <Image
              src="/images/guides/anxiety-stack-guide.jpg"
              alt="Several supplement containers and capsules arranged for comparison rather than as a prescribed anxiety stack"
              width={1536}
              height={1024}
              priority
              className="h-auto w-full"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            Combining ingredients creates a new evidence and interaction question; it is not automatically supported by each ingredient&apos;s individual studies.
          </figcaption>
        </figure>
      </section>

      <div className="mt-4 rounded-[1rem] border border-brand-900/10 bg-brand-50/60 px-5 py-3 text-xs leading-6 text-muted">
        <strong className="text-ink">Affiliate disclosure:</strong> This guide contains affiliate links. The optional sourcing examples cover the three ingredients compared on this page—ashwagandha, L-theanine, and magnesium—and are not evidence that a product or combination treats anxiety. We may earn a commission at no added cost to you.
      </div>

      <div className="mt-6 space-y-6">
        <section className="rounded-[1rem] border border-brand-700/20 bg-brand-50/60 p-6 shadow-sm sm:p-8">
          <p className="eyebrow-label">Evidence bottom line</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            Ingredient evidence does not validate a named anxiety stack
          </h2>
          <div className="mt-3 space-y-3 text-[1.01rem] leading-[1.85] text-muted">
            <p>
              The old page presented several recipe-style combinations as if they were validated protocols. A positive trial for one ingredient does not tell us whether adding a second or third ingredient improves the outcome, adds nothing, or mainly adds side effects and interaction complexity.
            </p>
            <p>
              A more defensible approach is to separate <strong>what was studied directly</strong> from what is only a combination hypothesis. If someone still chooses to combine supplements, changing one variable at a time is easier to interpret than starting a multi-ingredient regimen all at once.
            </p>
          </div>
        </section>

        <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
          <p className="eyebrow-label">What current evidence actually covers</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Three popular ingredients, three different evidence boundaries</h2>
          <div className="mt-5 overflow-x-auto">
            <ResponsiveTable label="Evidence boundaries for common anxiety stack ingredients">
              <table className="min-w-[760px] w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-900/10">
                    <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Ingredient</th>
                    <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Studied directly</th>
                    <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Key limit</th>
                    <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">What it does not prove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-900/5">
                  <tr className="align-top">
                    <td className="py-3 pr-4 font-semibold text-ink">L-theanine</td>
                    <td className="py-3 pr-4 text-muted">31 placebo-controlled RCTs across healthy and clinical populations; robust short-term choice-reaction-time signal.</td>
                    <td className="py-3 pr-4 text-muted">Acute stress effect was modest and bias-sensitive; anxiety findings were inconsistent overall.</td>
                    <td className="py-3 text-muted">No reliable acute-anxiety onset and no proof that adding magnesium or ashwagandha creates a better anxiety treatment.</td>
                  </tr>
                  <tr className="align-top">
                    <td className="py-3 pr-4 font-semibold text-ink">Ashwagandha</td>
                    <td className="py-3 pr-4 text-muted">Nine placebo-controlled RCTs / 558 participants in the 2024 meta-analysis. A representative 2026 trial enrolled 141 healthy adults ages 18–65 with moderate stress/anxiety for 8 weeks and compared 300 mg proprietary root extract twice daily, another root extract, and placebo.</td>
                    <td className="py-3 pr-4 text-muted">Repeated-dose, formulation-specific evidence in stressed adults; long-term safety remains less certain.</td>
                    <td className="py-3 text-muted">No immediate calming promise, no class effect for every ashwagandha product, and no validation of an ashwagandha-plus-magnesium combination.</td>
                  </tr>
                  <tr className="align-top">
                    <td className="py-3 pr-4 font-semibold text-ink">Magnesium</td>
                    <td className="py-3 pr-4 text-muted">15 interventional studies in the 2024 review; seven measured anxiety-related outcomes.</td>
                    <td className="py-3 pr-4 text-muted">Populations, salts, doses, durations, baseline status, and co-ingredients varied substantially.</td>
                    <td className="py-3 text-muted">No universal anxiety dose/form and no way to assign a combination benefit to magnesium when several actives change together.</td>
                  </tr>
                </tbody>
              </table>
            </ResponsiveTable>
          </div>
        </section>

        <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
          <p className="eyebrow-label">Why stacking changes the question</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">More ingredients mean more uncertainty, not automatically more benefit</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4">
              <h3 className="font-semibold text-ink">Attribution gets harder</h3>
              <p className="mt-2 text-sm leading-6 text-muted">If symptoms change after three new supplements start together, you cannot tell which ingredient helped, which did nothing, or which caused an adverse effect.</p>
            </div>
            <div className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4">
              <h3 className="font-semibold text-ink">Interactions compound</h3>
              <p className="mt-2 text-sm leading-6 text-muted">Sedation, blood-pressure effects, GI effects, medication absorption, thyroid effects, liver concerns, and kidney function can matter differently for each ingredient.</p>
            </div>
            <div className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4">
              <h3 className="font-semibold text-ink">Dose logic does not transfer automatically</h3>
              <p className="mt-2 text-sm leading-6 text-muted">A dose studied alone is not automatically the right dose when combined with other active ingredients, and a product label is not a validated anxiety protocol.</p>
            </div>
            <div className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4">
              <h3 className="font-semibold text-ink">The underlying problem may be misclassified</h3>
              <p className="mt-2 text-sm leading-6 text-muted">Panic, persistent anxiety, medication effects, sleep disorders, substance effects, thyroid disease, and other conditions are not solved by escalating supplement complexity.</p>
            </div>
          </div>
        </section>

        <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
          <p className="eyebrow-label">If supplementation is still being considered</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">A lower-complexity decision sequence</h2>
          <ol className="mt-5 space-y-4 text-sm leading-7 text-muted">
            <li><strong className="text-ink">1. Define the outcome.</strong> “Anxiety” can mean laboratory stress, racing thoughts, panic, chronic generalized anxiety, sleep disruption, or physical tension. The evidence is not interchangeable across those outcomes.</li>
            <li><strong className="text-ink">2. Check whether the ingredient evidence matches that outcome.</strong> Use the dedicated evidence reviews rather than a stack label: <Link href="/guides/anxiety/l-theanine-for-anxiety/" className="font-semibold text-brand-700 hover:underline">L-theanine</Link>, <Link href="/guides/anxiety/ashwagandha-for-anxiety/" className="font-semibold text-brand-700 hover:underline">ashwagandha</Link>, and <Link href="/guides/other/magnesium-types-guide/" className="font-semibold text-brand-700 hover:underline">magnesium forms</Link>.</li>
            <li><strong className="text-ink">3. Review medications and health conditions first.</strong> A pharmacist or clinician can catch interaction, kidney, liver, thyroid, pregnancy, sedation, or absorption issues that a generic stack chart cannot.</li>
            <li><strong className="text-ink">4. Avoid changing several variables together.</strong> If supplementation is appropriate, one change at a time makes response and side effects easier to interpret.</li>
            <li><strong className="text-ink">5. Reassess rather than automatically adding another ingredient.</strong> If the first approach does not address the problem, the answer may be a different diagnosis or treatment—not a larger stack.</li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Safety and stop rules</h2>
          <SafetyNotice title="Combination safety matters more as complexity rises">
            <ul className="ml-5 list-disc space-y-2">
              <li><strong>Ashwagandha:</strong> pregnancy, thyroid, autoimmune, medication, and rare liver-injury concerns require ingredient-specific review.</li>
              <li><strong>Magnesium:</strong> kidney disease can increase risk, and magnesium can interfere with absorption of some medications when taken too close together.</li>
              <li><strong>L-theanine:</strong> short trials are generally reassuring, but they do not establish unlimited long-term safety or compatibility with every medication and condition.</li>
              <li><strong>Multiple sedating substances:</strong> alcohol, sleep medications, benzodiazepines, opioids, antihistamines, and sedating supplements can compound impairment.</li>
              <li><strong>Do not use stack escalation as a substitute for care:</strong> persistent, worsening, panic-level, or functionally impairing anxiety deserves professional evaluation.</li>
              <li><strong>Immediate stop rule:</strong> suicidal thoughts, thoughts of self-harm, inability to stay safe, or imminent danger require immediate emergency or crisis care.</li>
            </ul>
          </SafetyNotice>
        </section>

        <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
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

        <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Sources and directness notes</h2>
          <ol className="mt-5 space-y-4">
            {SOURCES.map((source, index) => (
              <li key={source.href} className="text-sm leading-7 text-muted">
                <span className="font-semibold text-ink">{index + 1}. </span>
                <a href={source.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 hover:underline">{source.label}</a>
                <span> — {source.note}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-[1rem] border border-brand-900/10 bg-brand-50/40 p-6">
          <h2 className="text-xl font-semibold text-ink">Related evidence guides</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link href="/guides/anxiety/natural-anxiety-relief/" className="font-semibold text-brand-700 hover:underline">Natural Anxiety Relief →</Link>
            <Link href="/guides/anxiety/best-herbs-for-anxiety/" className="font-semibold text-brand-700 hover:underline">Best Herbs for Anxiety →</Link>
            <Link href="/guides/herbs/l-theanine/" className="font-semibold text-brand-700 hover:underline">L-Theanine Umbrella Guide →</Link>
            <Link href="/guides/herbs/ashwagandha/" className="font-semibold text-brand-700 hover:underline">Ashwagandha Umbrella Guide →</Link>
          </div>
        </section>

        <section className="rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
          <p className="eyebrow-label">Optional sourcing examples</p>
          <h2 className="mt-2 text-xl font-semibold text-ink">Neutral product coverage for all three compared ingredients</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            The sourcing module below includes ashwagandha, L-theanine, and magnesium examples from the same shared product registry. Inclusion is for label/form comparison and affiliate convenience; it does not rank one ingredient above another or validate a combination.
          </p>
          <div className="mt-5">
            <RecommendationSection products={comparisonProducts} />
          </div>
        </section>

        <div className="my-12">
          <NewsletterCtaBlock />
          <div className="mt-6"><EmailCapture /></div>
        </div>
      </div>
    </article>
  )
}
