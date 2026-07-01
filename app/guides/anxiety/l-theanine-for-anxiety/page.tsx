import Link from 'next/link'
import { buildPageMetadata, blogJsonLd, breadcrumbJsonLd, faqPageJsonLd, compactMetaTitle } from '../../../../src/lib/seo'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import EmailCapture from '@/components/EmailCapture'
import NewsletterCtaBlock from '@/components/NewsletterCtaBlock'
import LastUpdatedBadge from '../../../../src/components/editorial/LastUpdatedBadge'
import { AFFILIATE_TAGS } from '@/config/affiliate'

const SLUG = 'l-theanine-for-anxiety'
const TITLE = 'L-Theanine for Anxiety: Benefits, Dosage, Safety, and Research Review'
const DESCRIPTION =
  'An evidence-based review of L-theanine for anxiety, stress, calm focus, dosage, safety, and how it compares with ashwagandha and magnesium.'
const DATE = '2026-06-26'

export const metadata = buildPageMetadata({
  title: compactMetaTitle(TITLE),
  description: DESCRIPTION,
  path: `/articles/${SLUG}`,
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'Does L-theanine help anxiety?',
    answer:
      'L-theanine may help stress-related tension and calm focus, especially when anxiety feels like overarousal or caffeine jitters. Evidence is more limited for diagnosed anxiety disorders, so it should not replace professional care.',
  },
  {
    question: 'How long does L-theanine take to work?',
    answer:
      'Many people notice effects within 30 to 60 minutes. The most practical acute use is before a stressful event, with caffeine, or before bed when the issue is racing thoughts.',
  },
  {
    question: 'How much L-theanine should I take for anxiety?',
    answer:
      'A common evidence-aligned range is 100 to 200 mg per dose. For acute stress, 200 mg taken 30 to 60 minutes before the stressor is a practical starting point discussed in human stress-response research.',
  },
  {
    question: 'Is L-theanine better than ashwagandha for anxiety?',
    answer:
      'L-theanine is usually the faster, lower-friction option for situational calm. Ashwagandha is better positioned for chronic stress patterns that build over weeks.',
  },
  {
    question: 'Can I take L-theanine every day?',
    answer:
      'Daily use is common and generally well tolerated in studies, but long-term use should still be treated like a supplement decision, especially if you take medications or have a medical condition.',
  },
  {
    question: 'Is L-theanine sedating?',
    answer:
      'L-theanine is usually described as calming rather than strongly sedating. That is why many readers use it during the day for calm focus or with caffeine to smooth stimulation.',
  },
]

const relatedArticles = [
  {
    href: '/guides/herbs/l-theanine',
    title: 'Complete L-Theanine Evidence Guide',
    description: 'The main hub for caffeine, calm focus, sleep, stress, dosage, safety, and evidence.',
  },
  {
    href: '/guides/anxiety/natural-anxiety-relief',
    title: 'Natural Anxiety Relief',
    description: 'A broader anxiety guide for readers comparing supplement and lifestyle options.',
  },
  {
    href: '/guides/anxiety/ashwagandha-for-anxiety',
    title: 'Ashwagandha for Anxiety',
    description: 'Better fit when the problem is chronic stress rather than acute overarousal.',
  },
  {
    href: '/guides/magnesium-for-sleep',
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
    { name: 'Anxiety', url: 'https://thehippiescientist.net/guides/anxiety/natural-anxiety-relief' },
    { name: TITLE, url: `https://thehippiescientist.net/articles/${SLUG}` },
  ])

  const articleLd = blogJsonLd(
    { title: TITLE, slug: SLUG, date: DATE, description: DESCRIPTION },
    `/articles/${SLUG}`,
  )

  const faqLd = faqPageJsonLd({ pagePath: `/articles/${SLUG}`, questions: FAQS })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageBreadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <LastUpdatedBadge date={DATE} />
          <h1 className="text-4xl font-bold tracking-tight mt-4 mb-4">{TITLE}</h1>
          <p className="text-xl text-muted-foreground">{DESCRIPTION}</p>
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
            L-theanine is a better fit for situational anxiety, caffeine-related tension, and
            calm focus than for severe or persistent anxiety disorders. It is most useful when
            the reader wants to feel less wired without feeling knocked out.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="font-semibold mb-1">Best fit</p>
              <p className="text-muted-foreground">Caffeine jitters, racing thoughts, acute stress, calm focus.</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="font-semibold mb-1">Typical dose</p>
              <p className="text-muted-foreground">100 to 200 mg, usually 30 to 60 minutes before the use case.</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="font-semibold mb-1">Evidence level</p>
              <p className="text-muted-foreground">Limited-to-moderate for anxiety; stronger for caffeine synergy.</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="font-semibold mb-1">Main caution</p>
              <p className="text-muted-foreground">Not a replacement for clinical anxiety care or medication guidance.</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            For the complete evidence hub, read the{' '}
            <Link href="/guides/herbs/l-theanine" className="text-primary underline">
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
              The strongest reader promise is simple: L-theanine may help take the edge off while
              keeping the mind clear. That makes it useful for work stress, performance pressure,
              and caffeine-driven anxiousness.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Evidence Summary</h2>
          <EvidenceSummaryCard
            title="L-Theanine for Anxiety and Stress"
            evidenceLevel="Limited"
            humanEvidence="Small human studies report acute reductions in psychological and physiological stress markers. The best anxiety-adjacent evidence is in stress-task and high-arousal contexts, not large trials in diagnosed anxiety disorders."
            mechanisticEvidence="L-theanine is proposed to support alpha-wave activity and modulate glutamate and GABA-related pathways. This may help explain relaxed alertness without strong sedation."
            safetyProfile="Generally well tolerated at common doses. Use caution with blood-pressure medications, sedatives, sleep medications, prescription stimulants, pregnancy, breastfeeding, or psychiatric conditions."
          />
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Dosage and Timing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-xl p-5">
              <h3 className="font-semibold mb-2">Situational anxiety</h3>
              <p className="text-muted-foreground text-sm">200 mg, 30 to 60 minutes before the stressful event.</p>
            </div>
            <div className="border rounded-xl p-5">
              <h3 className="font-semibold mb-2">Caffeine jitters</h3>
              <p className="text-muted-foreground text-sm">100 mg L-theanine with 50 to 100 mg caffeine.</p>
            </div>
            <div className="border rounded-xl p-5">
              <h3 className="font-semibold mb-2">Evening tension</h3>
              <p className="text-muted-foreground text-sm">100 to 200 mg before bed when racing thoughts are the issue.</p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">L-Theanine vs Ashwagandha vs Magnesium</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              <strong>L-theanine</strong> is the fast, simple option for calm focus and acute
              overarousal. <strong>Ashwagandha</strong> is better suited for chronic stress patterns
              that build over weeks. <strong>Magnesium</strong> is a better fit when sleep quality,
              muscle tension, or mineral status is central.
            </p>
            <p>
              For deeper comparisons, read{' '}
              <Link href="/guides/herbs/ashwagandha" className="text-primary underline">
                Ashwagandha for Anxiety
              </Link>
              ,{' '}
              <Link href="/guides/magnesium-for-sleep" className="text-primary underline">
                Magnesium for Sleep
              </Link>
              , and{' '}
              <Link href="/compare/l-theanine-vs-magnesium" className="text-primary underline">
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
              <Link href="/guides/sleep/l-theanine-for-sleep" className="text-primary underline">
                L-Theanine for Sleep
              </Link>
              {' '}and{' '}
              <Link href="/guides/sleep/sleep-stack-guide" className="text-primary underline">
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
              Look for L-theanine products with clear milligram dosing and third-party testing when
              possible. Most readers do not need a complex stack to test whether L-theanine helps.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-xl p-5">
              <h3 className="font-semibold mb-2">L-Theanine 100 mg</h3>
              <a
                href={`https://www.amazon.com/s?k=L-Theanine+100+mg+third+party+tested&tag=${AFFILIATE_TAGS.amazon}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline text-sm"
              >
                Search on Amazon →
              </a>
            </div>
            <div className="border rounded-xl p-5">
              <h3 className="font-semibold mb-2">L-Theanine 200 mg</h3>
              <a
                href={`https://www.amazon.com/s?k=L-Theanine+200+mg+third+party+tested&tag=${AFFILIATE_TAGS.amazon}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline text-sm"
              >
                Search on Amazon →
              </a>
            </div>
            <div className="border rounded-xl p-5">
              <h3 className="font-semibold mb-2">Stress Support Supplements</h3>
              <a
                href={`https://www.amazon.com/s?k=stress+support+supplements&tag=${AFFILIATE_TAGS.amazon}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline text-sm"
              >
                Browse options →
              </a>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Sources and References</h2>
          <div className="p-6 bg-muted/50 rounded-xl text-sm">
            <p className="mb-4 font-medium">Key source categories include:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>L-theanine stress-response and anxiety-adjacent clinical trials</li>
              <li>Systematic reviews of theanine, stress, and anxiety research</li>
              <li>Safety and adverse event reporting from human studies</li>
              <li>Mechanistic and alpha-wave studies</li>
            </ul>
          </div>
        </section>

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
