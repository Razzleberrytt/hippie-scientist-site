import Link from 'next/link'
import { buildPageMetadata, blogJsonLd, breadcrumbJsonLd, faqPageJsonLd } from '../../../src/lib/seo'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import EmailCapture from '@/components/EmailCapture'
import NewsletterCtaBlock from '@/components/NewsletterCtaBlock'
import LastUpdatedBadge from '../../../src/components/editorial/LastUpdatedBadge'
import { AFFILIATE_TAGS } from '@/config/affiliate'

const SLUG = 'l-theanine-for-anxiety'
const TITLE = 'L-Theanine for Anxiety: Benefits, Dosage, Safety, and Research Review'
const DESCRIPTION =
  'An evidence-based review of L-theanine for anxiety, stress, calm focus, dosage, safety, and how it compares with ashwagandha and magnesium.'
const DATE = '2026-06-10'

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/articles/${SLUG}`,
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'Does L-theanine help anxiety?',
    answer:
      'L-theanine has been studied for its potential to promote relaxation and reduce stress-related mental tension. Some research suggests it may support calm focus without heavy sedation, though results vary and more high-quality evidence is needed for anxiety specifically.',
  },
  {
    question: 'How long does it take for L-theanine to work?',
    answer:
      'Many people report effects within 30–60 minutes. Research often examines both acute (single-dose) effects and longer-term daily use. Individual responses differ.',
  },
  {
    question: 'Is L-theanine better than ashwagandha for anxiety?',
    answer:
      'They serve somewhat different roles. L-theanine is often discussed for more acute mental relaxation and calm focus, while ashwagandha has more research around chronic stress adaptation. Direct comparative studies are limited.',
  },
  {
    question: 'Can I combine L-theanine with ashwagandha?',
    answer:
      'Some people stack them for complementary effects (acute calm + longer-term stress support). There is limited published research on the specific combination. Start with one at a time and consult a clinician if you take medications.',
  },
  {
    question: 'Can I take L-theanine every day?',
    answer:
      'Daily use is common. Most studies examine consistent use over days to weeks. It is generally considered well-tolerated, but long-term safety data is still developing.',
  },
  {
    question: 'Is L-theanine sedating?',
    answer:
      'L-theanine is often described as promoting relaxation without strong sedation. Many people use it during the day for calm focus. Individual sensitivity varies.',
  },
]

export default function LTheanineForAnxietyPage() {
  const pageBreadcrumb = breadcrumbJsonLd([
    { name: 'Home', url: 'https://thehippiescientist.net' },
    { name: 'Anxiety', url: 'https://thehippiescientist.net/articles/natural-anxiety-relief' },
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

        <div className="mb-10 p-6 border rounded-xl bg-card">
          <h2 className="text-2xl font-semibold mb-4">Quick Verdict</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>• May help promote relaxation without heavy sedation.</li>
            <li>• Often discussed for racing thoughts and everyday stress.</li>
            <li>• May support calm focus during the day.</li>
            <li>• Usually well tolerated at typical supplemental doses.</li>
            <li>• Not a replacement for professional mental health care.</li>
          </ul>
        </div>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">What Is L-Theanine?</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              L-theanine is a non-protein amino acid primarily found in tea leaves (Camellia sinensis).
              It is best known for its potential to promote relaxation while supporting alertness and
              focus — a combination often described as &ldquo;calm focus.&rdquo;
            </p>
            <p>
              Unlike sedative compounds, L-theanine does not typically cause drowsiness. It is thought
              to influence brain wave activity (particularly alpha waves) and may interact with
              neurotransmitters involved in stress and mood regulation.
            </p>
            <p>
              It is commonly used as a standalone supplement or stacked with caffeine for focus, or
              with other calming compounds for stress support.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">How L-Theanine May Affect Anxiety</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              Research on L-theanine has explored its potential effects on relaxation, stress response,
              and mental tension. Some studies have looked at changes in alpha-wave activity, which is
              associated with a relaxed but alert mental state.
            </p>
            <p>
              It has been studied for its possible role in reducing subjective feelings of stress and
              supporting a sense of calm without strong sedation. There is also interest in how it may
              interact with caffeine to improve focus while mitigating jitteriness.
            </p>
            <p>
              Current evidence suggests L-theanine may be most relevant for situational or
              stress-related mental tension rather than severe clinical anxiety disorders. More robust
              research is needed.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Evidence Summary</h2>

          <EvidenceSummaryCard
            title="L-Theanine for Anxiety &amp; Stress"
            evidenceLevel="Limited"
            humanEvidence="Small human studies report acute reductions in physiological and psychological stress markers. EEG studies show increased alpha-wave activity associated with a relaxed-but-alert state. Most evidence is in non-clinical populations under task-based stress conditions, with limited data for diagnosed anxiety disorders."
            mechanisticEvidence="L-theanine is proposed to promote alpha-wave activity in the brain, modulate GABA and glutamate pathways, and support stress-response systems. Animal data suggest serotonergic and dopaminergic effects, but human neurochemistry work is mostly indirect."
            safetyProfile="Well tolerated in most populations at common supplemental doses. Potential interaction with blood-pressure medications. Use caution when combining with other sedating supplements. Limited long-term safety data available."
          />
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Dosage and Timing</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              Common supplemental doses in research and practice often range from 100–400 mg per day,
              sometimes taken as a single dose or split. Many studies examining relaxation or focus
              effects have used doses around 200 mg.
            </p>
            <p>
              Timing: Effects are often reported within 30–60 minutes. Some people take it in the
              morning or early afternoon for calm focus, while others use it in the evening.
            </p>
            <p>
              Consistency and individual response appear important. Many people experiment with timing
              and stacking (e.g., with caffeine or other supplements).
            </p>
          </div>

        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">L-Theanine vs Ashwagandha</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              <strong>L-Theanine</strong> is frequently discussed for more immediate or situational
              mental relaxation and calm focus. Effects may be noticed relatively quickly.
            </p>
            <p>
              <strong>Ashwagandha</strong> has more research around longer-term adaptation to chronic
              stress. It is typically used daily over weeks.
            </p>
            <p>
              Many people find the two complementary and use them at different times of day or for
              different aspects of stress and anxiety. See our comparison in{' '}
              <Link href="/articles/ashwagandha-for-anxiety" className="text-primary underline">
                Ashwagandha for Anxiety
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">L-Theanine vs Magnesium</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              <strong>L-Theanine</strong> is often chosen for mental relaxation and calm focus.
            </p>
            <p>
              <strong>Magnesium</strong> is frequently used for physical tension, muscle relaxation,
              and sleep support. Different forms of magnesium have varying effects.
            </p>
            <p>
              The two are sometimes stacked because they may address overlapping but distinct aspects
              of stress (mental vs physical). See related content in{' '}
              <Link href="/articles/magnesium-for-sleep" className="text-primary underline">
                Magnesium for Sleep
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Anxiety and Sleep Overlap</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              Stress and anxiety frequently affect sleep quality, and poor sleep can worsen daytime
              anxiety. L-theanine is sometimes used in the evening for its relaxing properties without
              strong next-day grogginess.
            </p>
            <p>For broader context, see:</p>
            <ul>
              <li>
                <Link href="/articles/l-theanine-for-sleep" className="text-primary underline">
                  L-Theanine for Sleep
                </Link>
              </li>
              <li>
                <Link href="/articles/best-herbs-for-sleep" className="text-primary underline">
                  Best Herbs for Sleep
                </Link>
              </li>
              <li>
                <Link href="/articles/sleep-stack-guide" className="text-primary underline">
                  Sleep Stack Guide
                </Link>
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Safety and Side Effects</h2>

          <SafetyNotice>
            <ul className="space-y-2">
              <li>L-theanine is generally well tolerated at typical supplemental doses.</li>
              <li>Some people may experience mild side effects such as headache or dizziness.</li>
              <li>
                Caution is advised when combining with medications that affect blood pressure or have
                sedative effects.
              </li>
              <li>
                Pregnancy and breastfeeding: Limited safety data — consult a healthcare provider.
              </li>
              <li>
                Always speak with a qualified clinician before starting, especially if you have
                medical conditions or take medications.
              </li>
            </ul>
          </SafetyNotice>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Who Might Consider L-Theanine?</h2>
          <div className="prose prose-lg max-w-none">
            <p>L-theanine may be worth considering for people who:</p>
            <ul>
              <li>Experience stress-related mental tension or racing thoughts</li>
              <li>Want support for calm focus during the day</li>
              <li>Prefer options that are generally non-sedating</li>
              <li>Are looking for a supplement that can be used as needed or daily</li>
            </ul>
            <p>It is not positioned as a primary treatment for clinical anxiety disorders.</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">What Not To Do</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li>
              • Do not expect dramatic or immediate results in all cases — individual responses vary.
            </li>
            <li>• Do not combine multiple new supplements at once without guidance.</li>
            <li>• Do not stop prescribed medications without medical supervision.</li>
            <li>
              • Do not ignore severe or worsening anxiety symptoms — seek professional support.
            </li>
          </ul>
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
            <Link
              href="/articles/natural-anxiety-relief"
              className="block p-4 border rounded-lg hover:bg-muted transition-colors"
            >
              Natural Anxiety Relief: Evidence-Based Approaches
            </Link>
            <Link
              href="/articles/ashwagandha-for-anxiety"
              className="block p-4 border rounded-lg hover:bg-muted transition-colors"
            >
              Ashwagandha for Anxiety
            </Link>
            <Link
              href="/articles/cbd-vs-ashwagandha-for-anxiety"
              className="block p-4 border rounded-lg hover:bg-muted transition-colors"
            >
              CBD vs Ashwagandha for Anxiety
            </Link>
            <Link
              href="/articles/anxiety-stack-guide"
              className="block p-4 border rounded-lg hover:bg-muted transition-colors"
            >
              Anxiety Stack Guide
            </Link>
            <Link
              href="/articles/l-theanine-for-sleep"
              className="block p-4 border rounded-lg hover:bg-muted transition-colors"
            >
              L-Theanine for Sleep
            </Link>
            <Link
              href="/articles/sleep-stack-guide"
              className="block p-4 border rounded-lg hover:bg-muted transition-colors"
            >
              Sleep Stack Guide
            </Link>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Buyer Guide</h2>
          <div className="prose prose-lg max-w-none">
            <p>Look for reputable brands with third-party testing when possible.</p>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-xl p-5">
              <h3 className="font-semibold mb-2">L-Theanine 100 mg</h3>
              <a
                href={`${AFFILIATE_TAGS.amazon}?k=L-Theanine+100+mg+third+party+tested`}
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
                href={`${AFFILIATE_TAGS.amazon}?k=L-Theanine+200+mg+third+party+tested`}
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
                href={`${AFFILIATE_TAGS.amazon}?k=stress+support+supplements`}
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
          <h2 className="text-3xl font-semibold mb-6">Sources &amp; References</h2>
          <div className="p-6 bg-muted/50 rounded-xl text-sm">
            <p className="mb-4 font-medium">
              References will be populated as the evidence pipeline completes. Key sources include:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>L-theanine anxiety and stress clinical trials (PMIDs, n-sizes, outcomes)</li>
              <li>Systematic reviews and meta-analyses</li>
              <li>Safety and adverse event data</li>
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
