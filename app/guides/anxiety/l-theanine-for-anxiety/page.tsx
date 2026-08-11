import Link from 'next/link'
import Image from 'next/image'
import JsonLd from '@/components/seo/JsonLd'
import { buildPageMetadata, blogJsonLd, breadcrumbJsonLd, faqPageJsonLd, compactMetaTitle } from '../../../../src/lib/seo'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import EmailCapture from '@/components/EmailCapture'
import NewsletterCtaBlock from '@/components/NewsletterCtaBlock'
import LastUpdatedBadge from '../../../../src/components/editorial/LastUpdatedBadge'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'

const SLUG = 'l-theanine-for-anxiety'
const TITLE = 'L-Theanine for Anxiety: Benefits, Dosage, Safety, and Research Review'
const DESCRIPTION =
  'An evidence-first review of L-theanine for anxiety and stress, including the 2026 meta-analysis, studied doses, safety limits, and what the trials do not establish.'
const DATE = '2026-08-02'
const UPDATED_DATE = '2026-08-11'

export const metadata = buildPageMetadata({
  title: compactMetaTitle(TITLE),
  description: DESCRIPTION,
  path: `/guides/anxiety/${SLUG}`,
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'Does L-theanine help anxiety?',
    answer:
      'The best current synthesis does not show a consistent anxiety benefit. A 2026 meta-analysis of 31 randomized trials found anxiety effects inconsistent and non-significant overall, while a placebo-controlled trial in generalized anxiety disorder also did not find an anxiety benefit. L-theanine is not an established anxiety treatment.',
  },
  {
    question: 'How long does L-theanine take to work?',
    answer:
      'There is no validated onset time for anxiety relief. Acute studies measure outcomes within specific experimental windows after a single dose, but those schedules do not establish when an individual will feel an effect or whether anxiety will improve at all.',
  },
  {
    question: 'How much L-theanine should I take for anxiety?',
    answer:
      'There is no established treatment dose for anxiety. A 200 mg single dose appears often in acute studies, and some repeated-dose studies have also used 200 mg per day, but study doses are not universal dosing instructions. Product-specific and medication-specific guidance still matters.',
  },
  {
    question: 'Is L-theanine better than ashwagandha for anxiety?',
    answer:
      'There is not enough direct head-to-head evidence to declare one better. The products have different trial designs, preparations, safety questions, and evidence limitations, so separate studies should not be treated as a comparative ranking.',
  },
  {
    question: 'Can I take L-theanine every day?',
    answer:
      'Some randomized studies have tested repeated daily use for several weeks, but that does not establish long-term effectiveness or safety for every person. If you use prescription medication, are pregnant or breastfeeding, or have a medical condition, discuss regular supplement use with a clinician or pharmacist.',
  },
  {
    question: 'Is L-theanine sedating?',
    answer:
      'L-theanine is not established as a sedative, and many studies assess attention or stress without using sleep as the primary outcome. Individual responses can still differ. A calming reputation should not be treated as proof that it relieves an anxiety disorder.',
  },
]

const relatedArticles = [
  {
    href: '/guides/herbs/l-theanine/',
    title: 'Complete L-Theanine Evidence Guide',
    description: 'The main hub for cognition, sleep, stress, dosage, safety, and evidence.',
  },
  {
    href: '/guides/anxiety/natural-anxiety-relief/',
    title: 'Natural Anxiety Relief',
    description: 'A broader anxiety guide for comparing evidence, safety, and non-supplement options.',
  },
  {
    href: '/guides/anxiety/ashwagandha-for-anxiety',
    title: 'Ashwagandha for Anxiety',
    description: 'A separate review of ashwagandha trials, extract-specific evidence, and safety limits.',
  },
  {
    href: '/guides/sleep/magnesium-for-sleep/',
    title: 'Magnesium for Sleep',
    description: 'What magnesium trials do and do not show for sleep, deficiency, and supplement choice.',
  },
  {
    href: '/guides/sleep/l-theanine-for-sleep',
    title: 'L-Theanine for Sleep',
    description: 'A sleep-specific review that keeps sleep findings separate from anxiety claims.',
  },
  {
    href: '/guides/anxiety/anxiety-stack-guide',
    title: 'Anxiety Stack Guide',
    description: 'How to evaluate combination claims without assuming separate ingredients work better together.',
  },
]

export default function LTheanineForAnxietyPage() {
  const pageBreadcrumb = breadcrumbJsonLd([
    { name: 'Home', url: 'https://thehippiescientist.net' },
    { name: 'Anxiety', url: 'https://thehippiescientist.net/guides/anxiety/natural-anxiety-relief/' },
    { name: TITLE, url: `https://thehippiescientist.net/guides/anxiety/${SLUG}/` },
  ])

  const articleLd = blogJsonLd(
    { title: TITLE, slug: SLUG, date: DATE, updated: UPDATED_DATE, description: DESCRIPTION },
    `/guides/anxiety/${SLUG}/`,
  )

  const faqLd = faqPageJsonLd({ pagePath: `/guides/anxiety/${SLUG}/`, questions: FAQS })

  return (
    <>
      <JsonLd schema={articleLd} />
      <JsonLd schema={pageBreadcrumb} />
      <JsonLd schema={faqLd} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <LastUpdatedBadge date={UPDATED_DATE} label="Last updated" />
          <h1 className="text-4xl font-bold tracking-tight mt-4 mb-4">{TITLE}</h1>
          <p className="text-xl text-muted-foreground">{DESCRIPTION}</p>

          <figure className="mt-6">
            <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
              <Image
                src="/images/guides/l-theanine-for-anxiety.jpg"
                alt="L-theanine capsules and green tea reviewed for stress and anxiety evidence"
                width={1536}
                height={1024}
                priority
                className="w-full h-auto"
              />
            </div>
            <figcaption className="mt-3 text-center text-sm text-muted">
              L-theanine from tea — reviewed here for stress and anxiety evidence, not as a proven anxiety treatment.
            </figcaption>
          </figure>
        </div>

        <div className="prose prose-sm mb-8 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm">
            <strong>Affiliate Disclosure:</strong> This article contains affiliate links.
            Purchases through these links may earn us a small commission at no extra cost to you.
            Commercial links do not change the evidence standard used in this review.
          </p>
        </div>

        <section className="mb-10 p-6 border rounded-xl bg-card">
          <h2 className="text-2xl font-semibold mb-4">Quick Verdict</h2>
          <p className="text-muted-foreground mb-4">
            The strongest current synthesis is less supportive of anxiety marketing than older summaries.
            A 2026 meta-analysis of 31 randomized trials with 1,168 participants found a modest acute-stress
            effect that was largely influenced by studies at high risk of bias, while anxiety effects were
            inconsistent and not significant overall. L-theanine may have other studied effects, especially
            on short-term attention, but the evidence does not establish it as an anxiety treatment.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="font-semibold mb-1">What the evidence supports</p>
              <p className="text-muted-foreground">A short-term attention signal and a modest, uncertain acute-stress effect in pooled randomized trials.</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="font-semibold mb-1">What it does not establish</p>
              <p className="text-muted-foreground">Reliable relief of anxiety symptoms or treatment of generalized anxiety disorder.</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="font-semibold mb-1">Studied amounts</p>
              <p className="text-muted-foreground">Study protocols vary; 200 mg is common in acute research, but there is no established anxiety dose.</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="font-semibold mb-1">Safety confidence</p>
              <p className="text-muted-foreground">No serious adverse events were reported in the 2026 trial synthesis, but long-term and interaction evidence remain incomplete.</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            For the broader evidence hub, read the{' '}
            <Link href="/guides/herbs/l-theanine/" className="text-primary underline">
              full L-theanine guide
            </Link>
            .
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">What Is L-Theanine?</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              L-theanine is a non-protein amino acid found in tea leaves from <em>Camellia sinensis</em>.
              Supplement studies have examined attention, stress responses, mood, and sleep, sometimes using
              L-theanine alone and sometimes with caffeine or other ingredients.
            </p>
            <p>
              That range of research creates an important interpretation problem: a finding about attention,
              an acute laboratory stress task, or a combination product does not automatically show that
              L-theanine treats persistent anxiety symptoms.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Stress Findings Are Not the Same as Anxiety Treatment</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              The 2026 systematic review and meta-analysis pooled 31 randomized trials involving 1,168
              participants across healthy and clinical populations. Its primary acute-stress analysis found
              a modest effect, but that result was largely influenced by studies judged to have a high risk of bias.
            </p>
            <p>
              For anxiety outcomes, the pooled evidence was inconsistent and not significant overall. That
              matches an earlier randomized trial in 46 people with generalized anxiety disorder, where
              adjunctive L-theanine did not improve anxiety symptoms more than placebo.
            </p>
            <p>
              Mechanistic ideas—such as changes in alpha-wave activity or neurotransmitter signaling—can help
              generate hypotheses. They cannot substitute for clinical outcome evidence when the question is
              whether a supplement meaningfully improves anxiety.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Evidence Summary</h2>
          <EvidenceSummaryCard
            title="L-Theanine for Anxiety and Stress"
            evidenceLevel="Limited"
            humanEvidence="A 2026 meta-analysis of 31 randomized trials (n=1,168) found a modest acute-stress effect that was largely influenced by high-risk-of-bias studies; anxiety effects were inconsistent and non-significant overall. A separate randomized generalized anxiety disorder trial also found no anxiety benefit over placebo."
            mechanisticEvidence="Studies have explored alpha-wave activity and glutamate- or GABA-related pathways, but mechanistic plausibility does not establish an anxiety treatment effect."
            safetyProfile="The 2026 meta-analysis reported no serious adverse events in the included randomized trials. That does not establish long-term safety or rule out product-, medication-, or person-specific concerns."
          />
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">What Doses Have Been Studied?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-xl p-5">
              <h3 className="font-semibold mb-2">Single-dose studies</h3>
              <p className="text-muted-foreground text-sm">A 200 mg single dose appears in several acute protocols. That is a study design detail, not a guaranteed onset or anxiety-relief dose.</p>
            </div>
            <div className="border rounded-xl p-5">
              <h3 className="font-semibold mb-2">Repeated dosing</h3>
              <p className="text-muted-foreground text-sm">Some small studies tested daily use for several weeks. Results from one population or product should not be converted into a universal regimen.</p>
            </div>
            <div className="border rounded-xl p-5">
              <h3 className="font-semibold mb-2">Clinical anxiety</h3>
              <p className="text-muted-foreground text-sm">No treatment dose is established. The randomized generalized anxiety disorder trial did not show an anxiety benefit despite testing adjunctive L-theanine.</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Do not escalate a supplement dose simply because a lower amount did not produce a noticeable effect.
            Study dosing is context for interpreting research, not individualized medical guidance.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">L-Theanine vs Ashwagandha vs Magnesium</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              These ingredients have different evidence bases and should not be ranked by comparing unrelated
              studies. L-theanine now has a broad randomized-trial synthesis showing inconsistent anxiety effects.
              Ashwagandha research is extract-specific and carries its own safety questions. Magnesium is most
              clearly indicated when correcting inadequate intake or deficiency, while supplement trials for
              symptoms such as sleep or anxiety remain a separate question.
            </p>
            <p>
              For deeper context, read{' '}
              <Link href="/guides/anxiety/ashwagandha-for-anxiety" className="text-primary underline">
                Ashwagandha for Anxiety
              </Link>
              ,{' '}
              <Link href="/guides/sleep/magnesium-for-sleep/" className="text-primary underline">
                Magnesium for Sleep
              </Link>
              , and{' '}
              <Link href="/guides/compare/ashwagandha-vs-l-theanine-vs-magnesium/" className="text-primary underline">
                Ashwagandha vs L-Theanine vs Magnesium
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Anxiety and Sleep Are Separate Evidence Questions</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              Anxiety and poor sleep can reinforce each other, but evidence for one outcome should not be used
              as proof of the other. L-theanine has separate sleep reviews and trials, and those results should
              be interpreted on their own rather than used to rescue an unsupported anxiety claim.
            </p>
            <p>
              For sleep-specific context, read{' '}
              <Link href="/guides/sleep/l-theanine-for-sleep/" className="text-primary underline">
                L-Theanine for Sleep
              </Link>
              {' '}and{' '}
              <Link href="/guides/sleep/sleep-stack-guide/" className="text-primary underline">
                Sleep Stack Guide
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Safety and Side Effects</h2>
          <SafetyNotice>
            <ul className="space-y-2">
              <li>The 2026 meta-analysis reported no serious adverse events across the included randomized trials.</li>
              <li>That trial record does not establish long-term safety or prove that every supplement product is equivalent.</li>
              <li>Medication and supplement interaction evidence is incomplete; check the exact product with a clinician or pharmacist if you take prescription medicines.</li>
              <li>Pregnancy and breastfeeding safety at supplemental doses is not well established.</li>
              <li>Do not stop, replace, or reduce prescribed anxiety treatment based on supplement claims.</li>
            </ul>
          </SafetyNotice>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {FAQS.map((faq, index) => (
              <div key={index} className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedArticles.map((article) => (
              <Link
                key={article.href}
                href={article.href}
                className="block p-4 border rounded-lg hover:bg-muted transition-colors"
              >
                <span className="font-semibold block mb-1">{article.title}</span>
                <span className="text-sm text-muted-foreground">{article.description}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Buyer Guide</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              If you decide to buy L-theanine, a single-ingredient product with a clearly stated per-serving
              amount and credible independent quality testing is easier to evaluate than a proprietary blend.
              Product quality does not turn limited anxiety evidence into proven effectiveness.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Sources and References</h2>
          <div className="p-6 bg-muted/50 rounded-xl text-sm">
            <ul className="list-disc pl-5 space-y-3 text-muted-foreground">
              <li><a className="text-primary underline" href="https://pubmed.ncbi.nlm.nih.gov/42410082/" target="_blank" rel="noopener noreferrer">Gerolymos et al. (2026)</a>: systematic review and meta-analysis of 31 randomized trials (n=1,168); acute-stress effects were modest and sensitive to study bias, while anxiety effects were inconsistent and non-significant overall.</li>
              <li><a className="text-primary underline" href="https://pubmed.ncbi.nlm.nih.gov/30580081/" target="_blank" rel="noopener noreferrer">Sarris et al. (2019)</a>: double-blind randomized adjunctive trial in generalized anxiety disorder; no anxiety benefit over placebo.</li>
              <li><a className="text-primary underline" href="https://pubmed.ncbi.nlm.nih.gov/34562208/" target="_blank" rel="noopener noreferrer">Evans et al. (2021)</a>: crossover study of a single 200 mg branded dose in healthy adults under an experimental stress task.</li>
              <li><a className="text-primary underline" href="https://pubmed.ncbi.nlm.nih.gov/31623400/" target="_blank" rel="noopener noreferrer">Hidese et al. (2019)</a>: four-week crossover study in 30 healthy adults; small sample and supplier-related conflicts were disclosed.</li>
              <li><a className="text-primary underline" href="https://pubmed.ncbi.nlm.nih.gov/40056718/" target="_blank" rel="noopener noreferrer">Bulman et al. (2025)</a>: sleep systematic review and meta-analysis; useful for keeping sleep findings separate from anxiety claims.</li>
            </ul>
          </div>
        </section>

        <RecommendationSection products={getRevenueProductSet('l-theanine')?.products ?? []} />

        <div className="my-12">
          <NewsletterCtaBlock />
          <div className="mt-6">
            <EmailCapture />
          </div>
        </div>
      </div>
    </>
  )
}
