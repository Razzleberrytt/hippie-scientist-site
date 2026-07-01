import Link from 'next/link'
import { buildPageMetadata, blogJsonLd, breadcrumbJsonLd, faqPageJsonLd, compactMetaTitle } from '../../../../src/lib/seo'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import EmailCapture from '@/components/EmailCapture'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'
import NewsletterCtaBlock from '@/components/NewsletterCtaBlock'
import LastUpdatedBadge from '../../../../src/components/editorial/LastUpdatedBadge'
import { AFFILIATE_TAGS } from '@/config/affiliate'

// ─── Article metadata ─────────────────────────────────────────────────────────

const SLUG = 'ashwagandha-for-anxiety'
const TITLE = 'Ashwagandha for Anxiety: Benefits, Dosage, Safety, and Research Review'
const DESCRIPTION =
  'An evidence-based review of ashwagandha for anxiety, including mechanisms, clinical research, dosage, safety, side effects, and how it compares with other natural anxiety supplements.'
const DATE = '2026-06-10'

export const metadata = buildPageMetadata({
  title: compactMetaTitle(TITLE),
  description: DESCRIPTION,
  path: `/articles/${SLUG}`,
  openGraphType: 'article',
})

// ─── FAQ data (also used for JSON-LD) ────────────────────────────────────────

const FAQS = [
  {
    question: 'Does ashwagandha help anxiety?',
    answer:
      'Ashwagandha has been studied for its potential to support stress-related anxiety. Some research suggests it may help with symptoms associated with chronic stress, though results vary and it is not a substitute for professional mental health care.',
  },
  {
    question: 'How long does it take for ashwagandha to work for anxiety?',
    answer:
      'Most studies evaluate ashwagandha over periods of 4–8 weeks or longer. It is generally not considered a fast-acting option and is typically used for ongoing support rather than immediate relief.',
  },
  {
    question: 'Is ashwagandha better than CBD for anxiety?',
    answer:
      'There is limited direct comparative research. Ashwagandha has a longer history of traditional use and some clinical trial data for stress, while CBD has different regulatory status and emerging but still developing evidence. Individual responses vary significantly.',
  },
  {
    question: 'Can I take ashwagandha with magnesium?',
    answer:
      'Many people combine ashwagandha with magnesium as part of a broader stress or sleep support routine. There are no well-documented major interactions, but it is best to introduce one supplement at a time and consult a clinician, especially if taking medications.',
  },
  {
    question: 'Can I take ashwagandha every day?',
    answer:
      'Daily use is common in research and traditional practice. Most studies use consistent daily dosing for several weeks. Long-term safety data is still limited, so periodic breaks or professional guidance is often recommended.',
  },
  {
    question: 'Is ashwagandha safe for long-term use?',
    answer:
      'Short- to medium-term use (up to several months) appears generally well-tolerated in studies. Long-term safety, particularly regarding liver, thyroid, and hormonal effects, requires more research. Regular monitoring and professional advice are advisable for extended use.',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AshwagandhaForAnxietyPage() {
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
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageBreadcrumb) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero / Header */}
        <div className="mb-8">
          <LastUpdatedBadge date={DATE} />
          <h1 className="text-4xl font-bold tracking-tight mt-4 mb-4">
            {TITLE}
          </h1>
          <p className="text-xl text-muted-foreground">
            {DESCRIPTION}
          </p>
        </div>

        {/* Affiliate Disclosure */}
        <div className="prose prose-sm mb-8 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm">
            <strong>Affiliate Disclosure:</strong> This article contains affiliate links.
            If you make a purchase through these links, we may earn a small commission at no extra cost to you.
            This helps support our research and content. We only recommend products we believe offer genuine value.
          </p>
        </div>

        {/* Fastest useful choice */}
        <div className="mb-10 p-6 border border-brand-700/30 rounded-xl bg-brand-50/60">
          <h2 className="text-2xl font-semibold mb-4">Fastest useful choice</h2>
          <p className="text-muted-foreground">
            <strong>Ashwagandha is not the fastest useful choice for anxiety.</strong>{' '}
            Onset is slow &mdash; meaningful effects typically require 6&ndash;8 weeks of consistent
            use at 300&ndash;600&nbsp;mg/day of a standardized extract (KSM-66 or Sensoril). If you
            need faster relief for racing thoughts or situational anxiety,{' '}
            <Link href="/guides/herbs/l-theanine" className="text-primary underline font-semibold">L-theanine</Link>{' '}
            (100&ndash;200&nbsp;mg) works within 30&ndash;60 minutes and is a cleaner first choice for
            acute anxiety. Ashwagandha is best reserved for chronic, stress-driven anxiety where you can
            commit to a multi-week course. See the{' '}
            <Link href="/guides/herbs/ashwagandha" className="text-primary underline font-semibold">ashwagandha article</Link>{' '}
            for the full evidence review and the{' '}
            <Link href="/guides/anxiety/natural-anxiety-relief" className="text-primary underline font-semibold">natural anxiety relief hub</Link>{' '}
            for how it fits alongside other options.
          </p>
        </div>

        {/* Quick Verdict */}
        <div className="mb-10 p-6 border rounded-xl bg-card">
          <h2 className="text-2xl font-semibold mb-4">Quick Verdict</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>• Ashwagandha is one of the most researched herbs for stress-related anxiety.</li>
            <li>• May be most useful when anxiety is strongly linked to chronic stress.</li>
            <li>• Usually evaluated over weeks, not days.</li>
            <li>• Not a replacement for emergency mental health care or prescribed treatment.</li>
            <li>• Conservative use and professional guidance are recommended, especially with medications or health conditions.</li>
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            Evidence quality and effect sizes vary across studies. Individual results differ significantly.
          </p>
        </div>

        {/* What Is Ashwagandha? */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">What Is Ashwagandha?</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              Ashwagandha (<em>Withania somnifera</em>) is a shrub native to India and parts of Africa and the Middle East.
              It has been used for centuries in Ayurvedic medicine as a <strong>rasayana</strong> (rejuvenative) and adaptogen.
            </p>
            <p>
              The root is the primary part used in supplements. Modern extracts are typically standardized to withanolides,
              a group of steroidal lactones believed to contribute to its biological activity.
            </p>
            <p>
              In contemporary use, ashwagandha is most commonly positioned as an adaptogen — an herb that may help the body
              adapt to physical and emotional stressors. This has led to significant interest in its potential role for
              stress-related anxiety and sleep support.
            </p>
          </div>
        </section>

        {/* How Ashwagandha May Affect Anxiety */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">How Ashwagandha May Affect Anxiety</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              Research on ashwagandha and anxiety has largely focused on its relationship with the stress response system.
            </p>
            <p>
              Some studies have examined its potential effects on the HPA axis (hypothalamic-pituitary-adrenal axis)
              and cortisol levels in people experiencing chronic stress. Lowering perceived stress may indirectly
              influence anxiety symptoms for certain individuals.
            </p>
            <p>
              There is also interest in how improved sleep quality (when present) might support emotional resilience
              and daytime anxiety levels, creating a potential bidirectional relationship between sleep and anxiety support.
            </p>
            <p>
              Current evidence suggests ashwagandha is more likely to be helpful for anxiety that has a strong
              stress-related component rather than acute panic or severe clinical anxiety disorders.
              More research is needed to clarify mechanisms and identify who is most likely to benefit.
            </p>
            <p className="text-sm text-muted-foreground">
              Language note: All statements use conservative phrasing (&ldquo;may&rdquo;, &ldquo;appears to&rdquo;,
              &ldquo;has been studied for&rdquo;) because definitive causal claims are not supported across the full body of evidence.
            </p>
          </div>
        </section>

        {/* Evidence Summary */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Evidence Summary</h2>

          <EvidenceSummaryCard
            title="Ashwagandha for Anxiety &amp; Stress"
            evidenceLevel="Moderate"
            humanEvidence="Randomized trials in adults with elevated stress or anxiety report improvements on standardized anxiety scales (e.g., PSS, GAD-7, HAM-A), with some cortisol-related signals. Most trials use KSM-66 or Sensoril extracts at 300–600 mg/day over 8–12 weeks. Evidence is stronger for perceived stress than for diagnosed anxiety disorders."
            mechanisticEvidence="Proposed HPA-axis modulation and cortisol reduction; possible GABA-A receptor interaction via withanolides. Most mechanistic data are from animal studies, with limited direct human neurochemistry work. Withanolide standardization varies across extracts."
            safetyProfile="Key cautions include potential thyroid modulation (monitor if thyroid conditions exist), autoimmune activation risk, contraindication in pregnancy and breastfeeding, and rare case reports of liver injury. Most trials show good tolerability at standard doses over short durations."
          />
        </section>

        {/* Dosage and Timing */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Dosage and Timing</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              Most human studies on ashwagandha for stress and anxiety have used daily doses in the range of
              <strong> 300–600 mg</strong> of a standardized root extract, often taken once or twice daily.
            </p>
            <p>
              Timing: Some people prefer morning dosing for daytime stress support, while others take it in the
              evening if sleep support is also a goal. Consistency appears more important than exact timing in available research.
            </p>
            <p>
              Extracts are typically standardized to withanolide content (e.g., 5% withanolides). Different
              branded extracts (KSM-66, Sensoril, etc.) have been used in trials with varying results.
            </p>
          </div>

        </section>

        {/* Ashwagandha vs L-Theanine */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Ashwagandha vs L-Theanine</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              <strong>Ashwagandha</strong> is generally positioned for longer-term stress adaptation and may take
              weeks to show noticeable effects. It is often chosen when chronic stress is a primary driver of anxiety.
            </p>
            <p>
              <strong>L-Theanine</strong> tends to act more acutely (within hours) and is frequently used for
              promoting calm focus or easing racing thoughts without sedation. It is popular for daytime use.
            </p>
            <p>
              Many people use them together or at different times of day. See our comparison in the{' '}
              <Link href="/guides/sleep/l-theanine-for-sleep" className="text-primary underline">L-Theanine for Sleep</Link>, the umbrella{' '}
              <Link href="/guides/herbs/l-theanine" className="text-primary underline">L-Theanine article</Link>, and the{' '}
              <Link href="/guides/anxiety/natural-anxiety-relief" className="text-primary underline">Natural Anxiety Relief</Link>{' '}
              hub. For the full{' '}
              <Link href="/guides/herbs/ashwagandha" className="text-primary underline">ashwagandha evidence review</Link>, see the umbrella article.
            </p>
          </div>
        </section>

        {/* Ashwagandha vs Magnesium */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Ashwagandha vs Magnesium</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              Magnesium is often used for muscle tension, sleep support, and general nervous system calming.
              It has a faster onset for some physical symptoms compared to ashwagandha.
            </p>
            <p>
              Ashwagandha&apos;s research focus is more on the stress response and perceived stress over time.
              The two are frequently stacked because they may address overlapping but distinct aspects of stress and sleep.
            </p>
            <p>
              See related content:{' '}
              <Link href="/guides/sleep/magnesium-for-sleep" className="text-primary underline">Magnesium for Sleep</Link> and{' '}
              <Link href="/guides/sleep/best-herbs-for-sleep" className="text-primary underline">Best Herbs for Sleep</Link>.
            </p>
          </div>
        </section>

        {/* Ashwagandha vs CBD */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Ashwagandha vs CBD</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              <strong>Regulatory status</strong>: Ashwagandha is sold as a dietary supplement in most jurisdictions.
              CBD has more complex and varying legal status depending on source (hemp vs cannabis) and location.
            </p>
            <p>
              <strong>Evidence base</strong>: Ashwagandha has a larger number of published human trials for stress,
              though many are small or industry-funded. CBD research for anxiety is growing but still relatively limited
              and heterogeneous.
            </p>
            <p>
              <strong>Practical considerations</strong>: Onset, duration, cost, drug testing concerns (CBD),
              and personal preference all play roles. There is currently insufficient high-quality head-to-head data
              to declare one clearly superior.
            </p>
            <p className="text-sm text-muted-foreground">
              This section uses deliberately conservative language due to limited comparative evidence.
            </p>
          </div>
        </section>

        {/* Safety and Side Effects */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Safety and Side Effects</h2>

          <SafetyNotice title="Important Safety Considerations for Ashwagandha">
            <ul className="ml-5 space-y-1.5 list-disc">
              <li>
                <strong>Pregnancy and breastfeeding:</strong> Generally advised to avoid due to insufficient safety data.
              </li>
              <li>
                <strong>Autoimmune conditions:</strong> May stimulate immune activity; caution is recommended.
              </li>
              <li>
                <strong>Thyroid disorders:</strong> Some evidence suggests possible effects on thyroid hormones — monitoring advised.
              </li>
              <li>
                <strong>Sedative medications or substances:</strong> Potential additive effects on drowsiness.
              </li>
              <li>
                <strong>Psychiatric medications (SSRIs, SNRIs, MAOIs, benzodiazepines, lithium):</strong> Limited interaction data; ashwagandha may have additive sedative or serotonergic effects &mdash; consult a clinician before combining.
              </li>
              <li>
                <strong>Liver safety:</strong> Rare case reports of hepatotoxicity have been noted with some ashwagandha products. Discontinue and seek medical attention if symptoms appear (jaundice, dark urine, severe fatigue, right-sided abdominal pain).
              </li>
              <li>
                Always speak with a qualified healthcare provider before starting, especially if you have medical conditions or take medications.
              </li>
            </ul>
          </SafetyNotice>

          <p className="mt-4 text-sm text-muted-foreground">
            This is not medical advice. Individual risk profiles vary.
          </p>
        </section>

        {/* Who Might Consider Ashwagandha? */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Who Might Consider Ashwagandha?</h2>
          <div className="prose prose-lg max-w-none">
            <p>Ashwagandha may be worth considering for people who:</p>
            <ul>
              <li>Experience anxiety that feels closely tied to chronic stress</li>
              <li>Have stress-related sleep difficulties</li>
              <li>Are looking for a non-stimulant, daily support option</li>
              <li>Prefer herbal approaches with a relatively long history of traditional use</li>
            </ul>
            <p>
              It is generally not positioned as a first-line solution for severe anxiety, panic disorders,
              or acute mental health crises.
            </p>
          </div>
        </section>

        {/* What Not To Do */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">What Not To Do</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li>• Do not expect overnight or dramatic results — most research shows effects building over weeks.</li>
            <li>• Do not start multiple new calming supplements at once (hard to know what is helping or causing issues).</li>
            <li>• Do not stop prescribed psychiatric medications without medical supervision.</li>
            <li>• Do not ignore severe or worsening anxiety symptoms — seek professional mental health support.</li>
            <li>• Do not use any supplement as a replacement for emergency mental health care or therapy when needed.</li>
          </ul>
        </section>

        {/* FAQ */}
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

        {/* Related Articles */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/guides/anxiety/natural-anxiety-relief" className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              Natural Anxiety Relief: Evidence-Based Approaches
            </Link>
            <Link href="/guides/anxiety/l-theanine-for-anxiety" className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              L-Theanine for Anxiety
            </Link>
            <Link href="/guides/anxiety/cbd-vs-ashwagandha-for-anxiety" className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              CBD vs Ashwagandha for Anxiety
            </Link>
            <Link href="/guides/anxiety/anxiety-stack-guide" className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              Anxiety Stack Guide
            </Link>
            <Link href="/guides/sleep/ashwagandha-for-sleep" className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              Ashwagandha for Sleep
            </Link>
            <Link href="/guides/herbs/l-theanine" className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              L-Theanine: Full Guide
            </Link>
            <Link href="/guides/anxiety" className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              Anxiety Goal Hub
            </Link>
          </div>
        </section>

        {/* Buyer Guide */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Buyer Guide: Choosing an Ashwagandha Supplement</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* KSM-66 */}
            <div className="border rounded-xl p-5">
              <h3 className="font-semibold mb-2">KSM-66 Ashwagandha</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Full-spectrum root extract used in many clinical studies. Often standardized to 5% withanolides.
              </p>
              <a
                href={`https://www.amazon.com/s?k=KSM-66+ashwagandha&tag=${AFFILIATE_TAGS.amazon}`}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="text-primary underline text-sm"
              >
                Search on Amazon →
              </a>
            </div>

            {/* Sensoril */}
            <div className="border rounded-xl p-5">
              <h3 className="font-semibold mb-2">Sensoril Ashwagandha</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Another well-studied extract (often leaf + root). May have slightly different withanolide profile.
              </p>
              <a
                href={`https://www.amazon.com/s?k=Sensoril+ashwagandha&tag=${AFFILIATE_TAGS.amazon}`}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="text-primary underline text-sm"
              >
                Search on Amazon →
              </a>
            </div>

            {/* Standardized Extract */}
            <div className="border rounded-xl p-5">
              <h3 className="font-semibold mb-2">Standardized Ashwagandha Extract</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Look for third-party testing, clear withanolide percentage, and reputable brands. Avoid products with unnecessary fillers.
              </p>
              <a
                href={`https://www.amazon.com/s?k=standardized+ashwagandha+extract+third+party+tested&tag=${AFFILIATE_TAGS.amazon}`}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="text-primary underline text-sm"
              >
                Search on Amazon →
              </a>
            </div>
          </div>
        </section>

        {/* Sources */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Sources &amp; References</h2>
          <div className="p-6 bg-muted/50 rounded-xl text-sm">
            <p className="mb-4 font-medium">Key sources include:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Anxiety-specific clinical trials (PMIDs + n-sizes + outcomes)</li>
              <li>Stress / cortisol trials</li>
              <li>Systematic reviews and meta-analyses</li>
              <li>Safety and adverse event reviews</li>
              <li>Liver safety case reports / studies</li>
              <li>Sleep–anxiety overlap evidence</li>
              <li>Medication interaction data (where available)</li>
            </ul>
          </div>
        </section>

        <RecommendationSection products={getRevenueProductSet('ashwagandha')?.products ?? []} />

        {/* Email Capture / Newsletter */}
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
