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
  'An evidence-based review of L-theanine for anxiety, stress, calm focus, dosage, safety, and how it compares with ashwagandha and magnesium.'
const DATE = '2026-08-02'

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
      'Small studies suggest L-theanine may reduce some stress responses in healthy adults, but a placebo-controlled trial in generalized anxiety disorder did not find an anxiety benefit. It is not an established anxiety treatment and should not replace professional care.',
  },
  {
    question: 'How long does L-theanine take to work?',
    answer:
      'A small acute-stress study measured changes during the first three hours after a 200 mg dose. That does not establish a guaranteed onset time, and individual responses vary.',
  },
  {
    question: 'How much L-theanine should I take for anxiety?',
    answer:
      'There is no established treatment dose for anxiety. Small stress studies have commonly tested 200 mg, while a generalized anxiety disorder trial tested higher adjunctive doses without an anxiety benefit. Discuss use with a clinician if symptoms are persistent or you take medication.',
  },
  {
    question: 'Is L-theanine better than ashwagandha for anxiety?',
    answer:
      'There is not enough head-to-head evidence to declare a winner. L-theanine has been studied mainly for acute stress responses, while ashwagandha trials generally use standardized extracts over several weeks and carry different safety considerations.',
  },
  {
    question: 'Can I take L-theanine every day?',
    answer:
      'A small study tested 200 mg daily for four weeks, but long-term effectiveness and safety are not well established. Treat daily use as a supplement decision, especially if you take medication or have a medical condition.',
  },
  {
    question: 'Is L-theanine sedating?',
    answer:
      'L-theanine is usually described as calming rather than strongly sedating. That is why many readers use it during the day for calm focus or with caffeine to smooth stimulation.',
  },
]

const relatedArticles = [
  {
    href: '/guides/herbs/l-theanine/',
    title: 'Complete L-Theanine Evidence Guide',
    description: 'The main hub for caffeine, calm focus, sleep, stress, dosage, safety, and evidence.',
  },
  {
    href: '/guides/anxiety/natural-anxiety-relief/',
    title: 'Natural Anxiety Relief',
    description: 'A broader anxiety guide for readers comparing supplement and lifestyle options.',
  },
  {
    href: '/guides/anxiety/ashwagandha-for-anxiety',
    title: 'Ashwagandha for Anxiety',
    description: 'Better fit when the problem is chronic stress rather than acute overarousal.',
  },
  {
    href: '/guides/sleep/magnesium-for-sleep/',
    title: 'Magnesium for Sleep',
    description: 'Better fit when sleep, muscle tension, or magnesium status is the main issue.',
  },
  {
    href: '/guides/sleep/l-theanine-for-sleep',
    title: 'L-Theanine for Sleep',
    description: 'A focused sleep page for wired-at-night and racing-thought use cases.',
  },
  {
    href: '/guides/anxiety/anxiety-stack-guide',
    title: 'Anxiety Stack Guide',
    description: 'A practical stack guide for readers comparing combined support options.',
  },
]

export default function LTheanineForAnxietyPage() {
  const pageBreadcrumb = breadcrumbJsonLd([
    { name: 'Home', url: 'https://thehippiescientist.net' },
    { name: 'Anxiety', url: 'https://thehippiescientist.net/guides/anxiety/natural-anxiety-relief/' },
    { name: TITLE, url: `https://thehippiescientist.net/guides/anxiety/${SLUG}/` },
  ])

  const articleLd = blogJsonLd(
    { title: TITLE, slug: SLUG, date: DATE, description: DESCRIPTION },
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
          <LastUpdatedBadge date={DATE} />
          <h1 className="text-4xl font-bold tracking-tight mt-4 mb-4">{TITLE}</h1>
          <p className="text-xl text-muted-foreground">{DESCRIPTION}</p>

        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
            <Image
              src="/images/guides/l-theanine-for-anxiety.jpg"
              alt="L-theanine capsules and green tea used for anxiety and calm"
              width={1536}
              height={1024}
              priority
              className="w-full h-auto"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            L-theanine from green tea — used for fast, non-sedating calm.
          </figcaption>
        </figure>
        </div>

        <div className="prose prose-sm mb-8 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm">
            <strong>Affiliate Disclosure:</strong> This article contains affiliate links.
            Purchases through these links may earn us a small commission at no extra cost to you.
            We only link to products we believe offer genuine value.
          </p>
        </div>

        <section className="mb-10 p-6 border rounded-xl bg-card">
          <h2 className="text-2xl font-semibold mb-4">Quick Verdict</h2>
          <p className="text-muted-foreground mb-4">
            L-theanine has limited evidence for reducing some stress responses in healthy adults,
            but it has not been shown to treat an anxiety disorder. Consider it an optional,
            one-ingredient trial for situational tension—not a substitute for anxiety care.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="font-semibold mb-1">Best fit</p>
              <p className="text-muted-foreground">A cautious trial for situational stress or caffeine-related tension.</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="font-semibold mb-1">Studied dose</p>
              <p className="text-muted-foreground">200 mg in small acute and four-week stress studies; not an established anxiety dose.</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="font-semibold mb-1">Evidence level</p>
              <p className="text-muted-foreground">Limited for stress; a generalized anxiety disorder trial was negative.</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="font-semibold mb-1">Main caution</p>
              <p className="text-muted-foreground">Not a replacement for clinical anxiety care or medication guidance.</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            For the complete evidence hub, read the{' '}
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
              L-theanine is a non-protein amino acid found primarily in tea leaves from
              <em> Camellia sinensis</em>. It is best known for calm alertness: a relaxed but
              functional state that can pair well with focus work.
            </p>
            <p>
              For anxiety readers, the key point is not sedation. L-theanine is better framed as
              a support for overarousal: mental tension, racing thoughts, caffeine sensitivity,
              and stress that makes the body feel wired.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">How L-Theanine May Affect Anxiety</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              Current evidence suggests L-theanine is most relevant for stress-related mental
              tension rather than severe clinical anxiety disorders. Research has examined acute
              stress response, alpha-wave activity, and the way theanine can smooth caffeine.
            </p>
            <p>
              The practical hypothesis is that L-theanine may take the edge off for some people
              without strong sedation. The studies are too small and mixed to promise that result,
              particularly for persistent or diagnosed anxiety.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Evidence Summary</h2>
          <EvidenceSummaryCard
            title="L-Theanine for Anxiety and Stress"
            evidenceLevel="Limited"
            humanEvidence="Small studies in healthy adults report changes in some psychological or physiological stress measures. In a placebo-controlled generalized anxiety disorder trial, adjunctive L-theanine did not reduce anxiety more than placebo."
            mechanisticEvidence="L-theanine is proposed to support alpha-wave activity and modulate glutamate and GABA-related pathways. This may help explain relaxed alertness without strong sedation."
            safetyProfile="Generally well tolerated at common doses. Use caution with blood-pressure medications, sedatives, sleep medications, prescription stimulants, pregnancy, breastfeeding, or psychiatric conditions."
          />
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Dosage and Timing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-xl p-5">
              <h3 className="font-semibold mb-2">Situational anxiety</h3>
              <p className="text-muted-foreground text-sm">200 mg has been tested in small acute-stress studies; no clinical anxiety dose is established.</p>
            </div>
            <div className="border rounded-xl p-5">
              <h3 className="font-semibold mb-2">Caffeine jitters</h3>
              <p className="text-muted-foreground text-sm">Combination studies use varied ratios; avoid adding caffeine if it worsens anxiety.</p>
            </div>
            <div className="border rounded-xl p-5">
              <h3 className="font-semibold mb-2">Evening tension</h3>
              <p className="text-muted-foreground text-sm">Sleep evidence is preliminary; do not assume a stress-study dose treats insomnia.</p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">L-Theanine vs Ashwagandha vs Magnesium</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              <strong>L-theanine</strong> has small acute-stress studies. <strong>Ashwagandha</strong>
              has several short-term extract trials but more interaction and safety considerations.
              <strong>Magnesium</strong> is most directly relevant when intake or status is low.
              These are different evidence bases, not proven interchangeable anxiety treatments.
            </p>
            <p>
              For deeper comparisons, read{' '}
              <Link href="/guides/herbs/ashwagandha/" className="text-primary underline">
                Ashwagandha for Anxiety
              </Link>
              ,{' '}
              <Link href="/guides/sleep/magnesium-for-sleep/" className="text-primary underline">
                Magnesium for Sleep
              </Link>
              , and{' '}
              <Link href="/guides/compare/ashwagandha-vs-l-theanine-vs-magnesium/" className="text-primary underline">
                L-Theanine vs Magnesium
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Anxiety and Sleep Overlap</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              Anxiety and sleep often reinforce each other. Poor sleep increases next-day anxiety,
              and anxious rumination can delay sleep. L-theanine is most rational when the sleep
              problem is a wired mind rather than pain, sleep apnea, restless legs, alcohol, or
              inconsistent sleep timing.
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
              <li>L-theanine is generally well tolerated at typical supplemental doses.</li>
              <li>Some people may experience mild side effects such as headache or dizziness.</li>
              <li>Caution is advised with medications that affect blood pressure or sedation.</li>
              <li>Use extra caution with prescription stimulants or psychiatric medications.</li>
              <li>Pregnancy and breastfeeding: limited supplemental-dose safety data.</li>
              <li>Do not stop prescribed medication without medical supervision.</li>
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
              Prefer a single-ingredient product with a clear per-serving dose, lot information,
              and credible independent quality testing when available. Avoid proprietary stress
              blends: they make dose comparison and side-effect attribution harder. Most readers
              do not need a complex stack to test whether L-theanine helps.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Sources and References</h2>
          <div className="p-6 bg-muted/50 rounded-xl text-sm">
            <ul className="list-disc pl-5 space-y-3 text-muted-foreground">
              <li><a className="text-primary underline" href="https://pubmed.ncbi.nlm.nih.gov/30580081/" target="_blank" rel="noopener noreferrer">Sarris et al. (2019)</a>: placebo-controlled adjunctive trial in generalized anxiety disorder; no anxiety or insomnia-severity benefit over placebo.</li>
              <li><a className="text-primary underline" href="https://pubmed.ncbi.nlm.nih.gov/34562208/" target="_blank" rel="noopener noreferrer">White et al. (2021)</a>: crossover study of a single 200 mg branded dose in 16 healthy, moderately stressed adults.</li>
              <li><a className="text-primary underline" href="https://pubmed.ncbi.nlm.nih.gov/31623400/" target="_blank" rel="noopener noreferrer">Hidese et al. (2019)</a>: four-week, 30-person healthy-adult study; small sample and supplier-related conflict disclosed.</li>
              <li><a className="text-primary underline" href="https://pubmed.ncbi.nlm.nih.gov/26797633/" target="_blank" rel="noopener noreferrer">Unno et al. (2016)</a>: acute stress crossover study using a nutrient drink, so effects cannot be attributed to L-theanine alone.</li>
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
