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

const SLUG = 'ashwagandha-for-anxiety'
const TITLE = 'Ashwagandha for Anxiety: Benefits, Dosage, Safety, and Research Review'
const DESCRIPTION =
  'An evidence-based review of ashwagandha for anxiety, including mechanisms, clinical research, dosage, safety, side effects, and how it compares with other natural anxiety supplements.'
const PUBLISHED_DATE = '2026-06-10'
const UPDATED_DATE = '2026-08-11'

export const metadata = buildPageMetadata({
  title: compactMetaTitle(TITLE),
  description: DESCRIPTION,
  path: `/guides/anxiety/${SLUG}`,
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'Does ashwagandha help anxiety?',
    answer:
      'Ashwagandha has been studied for stress and anxiety-related outcomes. Some trials and meta-analyses report improvements, but studies use different extracts and populations and certainty is not uniform. It is not a substitute for professional mental health care.',
  },
  {
    question: 'How long does it take for ashwagandha to work for anxiety?',
    answer:
      'Most human trials evaluate ashwagandha over several weeks rather than as an immediate intervention. Those study durations do not establish a precise onset time for an individual, so avoid treating a fixed week-by-week timeline as guaranteed.',
  },
  {
    question: 'Is ashwagandha better than CBD for anxiety?',
    answer:
      'There is limited direct comparative research. Ashwagandha and CBD have different evidence bases, safety considerations, and regulatory contexts, so the available data do not establish a universal winner.',
  },
  {
    question: 'Can I take ashwagandha with magnesium?',
    answer:
      'This article does not establish that ashwagandha and magnesium are safe or beneficial to combine. Supplement interaction data can be incomplete. Introduce one product at a time and review the full combination with a pharmacist or other qualified health professional if you take medications or have a medical condition.',
  },
  {
    question: 'Can I take ashwagandha every day?',
    answer:
      'Many clinical studies use consistent daily dosing for several weeks, but that does not establish indefinite-use safety. Follow the specific product or study context and reassess ongoing use, especially if you take medications or have thyroid, autoimmune, liver, or other medical concerns.',
  },
  {
    question: 'Is ashwagandha safe for long-term use?',
    answer:
      'Short-term studies generally report tolerability in many participants, but long-term safety is not well established. Thyroid effects, pregnancy concerns, medication interactions, and rare liver-injury reports are reasons to review extended use with a qualified health professional.',
  },
]

const BUYING_CHECKLIST = [
  'Match the extract and serving size to the evidence you are actually using; do not treat all ashwagandha products as interchangeable.',
  'Prefer a label that clearly identifies the plant part, extract, serving size, and withanolide standardization.',
  'Look for credible third-party quality testing or a readily available certificate of analysis when possible.',
  'Avoid proprietary blends that hide the amount of ashwagandha or make it impossible to compare the serving with studied preparations.',
  'Review pregnancy, thyroid, autoimmune, liver, sedation, and medication cautions before shopping for a product.',
]

export default function AshwagandhaForAnxietyPage() {
  const pageBreadcrumb = breadcrumbJsonLd([
    { name: 'Home', url: 'https://thehippiescientist.net' },
    { name: 'Anxiety', url: 'https://thehippiescientist.net/guides/anxiety/natural-anxiety-relief/' },
    { name: TITLE, url: `https://thehippiescientist.net/guides/anxiety/${SLUG}/` },
  ])

  const articleLd = blogJsonLd(
    { title: TITLE, slug: SLUG, date: PUBLISHED_DATE, description: DESCRIPTION },
    `/guides/anxiety/${SLUG}/`,
  )

  const faqLd = faqPageJsonLd({ pagePath: `/guides/anxiety/${SLUG}/`, questions: FAQS })
  const products = getRevenueProductSet('ashwagandha')?.products ?? []

  return (
    <>
      <JsonLd schema={articleLd} />
      <JsonLd schema={pageBreadcrumb} />
      {faqLd ? <JsonLd schema={faqLd} /> : null}

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <LastUpdatedBadge date={UPDATED_DATE} />
          <h1 className="text-4xl font-bold tracking-tight mt-4 mb-4">{TITLE}</h1>
          <p className="text-xl text-muted-foreground">{DESCRIPTION}</p>

          <figure className="mt-6">
            <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
              <Image
                src="/images/guides/ashwagandha-for-anxiety.jpg"
                alt="Dried ashwagandha roots, leaves, and golden powder used in ashwagandha supplements"
                width={1536}
                height={1024}
                priority
                className="w-full h-auto"
              />
            </div>
            <figcaption className="mt-3 text-center text-sm text-muted-foreground">
              Ashwagandha (<em>Withania somnifera</em>) has been studied for stress and anxiety-related outcomes, with important extract and study differences.
            </figcaption>
          </figure>
        </div>

        <div className="prose prose-sm mb-8 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm">
            <strong>Affiliate Disclosure:</strong> This article contains affiliate links. If you make a purchase through these links, we may earn a small commission at no extra cost to you. Product examples appear only after the evidence and safety sections below.
          </p>
        </div>

        <div className="mb-10 p-6 border border-brand-700/30 rounded-xl bg-brand-50/60">
          <h2 className="text-2xl font-semibold mb-4">Timing and fit at a glance</h2>
          <p className="text-muted-foreground">
            <strong>Ashwagandha should not be treated as an acute anxiety treatment.</strong>{' '}
            Most human trials evaluate a specific extract over multiple weeks, so those trial durations are better read as study context than as a promised onset timeline. The evidence also does not establish that{' '}
            <Link href="/guides/herbs/l-theanine/" className="text-primary underline font-semibold">L-theanine</Link>{' '}
            is a universally faster or better choice for situational anxiety. If symptoms are severe, sudden, or impairing, prioritize clinical evaluation rather than trying to optimize supplement timing. For a broader decision path, review the{' '}
            <Link href="/guides/herbs/ashwagandha/" className="text-primary underline font-semibold">ashwagandha evidence review</Link>{' '}
            and the{' '}
            <Link href="/guides/anxiety/natural-anxiety-relief/" className="text-primary underline font-semibold">natural anxiety relief hub</Link>.
          </p>
        </div>

        <div className="mb-10 p-6 border rounded-xl bg-card">
          <h2 className="text-2xl font-semibold mb-4">Quick Verdict</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>• Multiple human trials have studied ashwagandha for stress and anxiety-related outcomes, but preparations and study quality vary.</li>
            <li>• The evidence is more relevant to ongoing stress-related symptoms than to acute panic or crisis care.</li>
            <li>• Trials generally evaluate use over weeks; they do not establish a guaranteed personal onset time.</li>
            <li>• It is not a replacement for emergency mental health care, therapy, or prescribed treatment.</li>
            <li>• Medication, pregnancy, thyroid, autoimmune, and liver context matter before use.</li>
          </ul>
        </div>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Is Ashwagandha the Right Tool for Your Anxiety Pattern?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-xl p-5 bg-card">
              <h3 className="font-semibold text-lg mb-2">More relevant evidence context</h3>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>Stress has been elevated for weeks rather than only during isolated events.</li>
                <li>Poor sleep and feeling persistently “on” are part of the same pattern.</li>
                <li>You can evaluate one clearly labeled extract consistently and track tolerance over time.</li>
                <li>You have reviewed pregnancy, thyroid, autoimmune, liver, and medication cautions first.</li>
              </ul>
            </div>
            <div className="border rounded-xl p-5 bg-muted/40">
              <h3 className="font-semibold text-lg mb-2">Choose a different first step</h3>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li><strong>Panic, crisis, or severe impairment:</strong> seek clinical support rather than self-treating.</li>
                <li><strong>One-off performance anxiety:</strong> the available ashwagandha literature does not establish acute relief.</li>
                <li><strong>Medication or complex health history:</strong> ask a pharmacist or prescriber to screen interactions.</li>
                <li><strong>Unclear cause:</strong> address caffeine, sleep loss, alcohol, and medical contributors first.</li>
              </ul>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            This framework is a fit check, not a diagnosis. The clinical literature mostly studies adults with elevated stress or anxiety over several weeks; it does not establish ashwagandha as an acute treatment or a replacement for anxiety care.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">What Is Ashwagandha?</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              Ashwagandha (<em>Withania somnifera</em>) is a shrub native to India and parts of Africa and the Middle East. It has been used for centuries in Ayurvedic medicine as a <strong>rasayana</strong> (rejuvenative) and adaptogen.
            </p>
            <p>
              The root is the primary part used in many supplements. Modern extracts may be standardized to withanolides, a group of steroidal lactones studied as possible contributors to its biological activity.
            </p>
            <p>
              In contemporary use, ashwagandha is commonly positioned as an adaptogen. That traditional and commercial framing is separate from the clinical question of whether a specific preparation improves a specific stress or anxiety outcome.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">How Ashwagandha May Affect Anxiety</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              Research on ashwagandha and anxiety has largely focused on its relationship with the stress response system.
            </p>
            <p>
              Some studies have examined HPA-axis and cortisol-related outcomes in people experiencing chronic stress. Those mechanistic and biomarker findings can support plausibility, but they do not by themselves prove an anxiety benefit.
            </p>
            <p>
              Sleep outcomes are also studied in some populations. When sleep improves, that may overlap with daytime wellbeing, but the sleep mechanism should not be treated as proof of an anxiety effect.
            </p>
            <p>
              Most of the available human evidence is more relevant to stress-related populations than to acute panic or severe clinical anxiety disorders. More research is needed to clarify preparation-specific effects and who is most likely to benefit.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Evidence Summary</h2>
          <EvidenceSummaryCard
            title="Ashwagandha for Anxiety &amp; Stress"
            evidenceLevel="Moderate"
            humanEvidence="Randomized trials and meta-analyses report possible improvements in stress and anxiety-related scales, but studies use varied populations, extracts, doses, and durations and show meaningful heterogeneity. The evidence is stronger for stress-related outcomes than for treating a diagnosed anxiety disorder."
            mechanisticEvidence="Proposed HPA-axis and cortisol-related effects, plus possible GABA-related mechanisms, are biologically interesting but do not establish clinical benefit or effect size on their own."
            safetyProfile="Important cautions include pregnancy, possible thyroid effects, autoimmune context, medication interactions, sedation, and rare reports of liver injury. Long-term safety is not well established."
          />
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Dosage and Timing</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              Human studies use preparation-specific regimens, commonly involving standardized extracts taken daily for several weeks. A dose used in one trial should not automatically be generalized to a different extract or product.
            </p>
            <p>
              Some products are taken once daily and others are divided across the day. Available research does not establish one universal morning-or-evening timing rule for anxiety outcomes.
            </p>
            <p>
              Check the exact extract, withanolide standardization, serving size, and study context before comparing doses. Use the product label and clinician/pharmacist guidance when medication or health conditions complicate the decision.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Ashwagandha vs L-Theanine</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              Ashwagandha studies often use multi-week protocols focused on stress-related outcomes. That does not establish a fixed personal onset time.
            </p>
            <p>
              L-theanine has a different evidence base, including some acute stress and attention paradigms, but those studies do not establish that it is a universally faster or superior anxiety treatment.
            </p>
            <p>
              Do not infer that the two are automatically compatible because their mechanisms differ. Review each profile and the full combination safety context before stacking. See the{' '}
              <Link href="/guides/herbs/l-theanine/" className="text-primary underline">L-Theanine article</Link>, the{' '}
              <Link href="/guides/anxiety/natural-anxiety-relief/" className="text-primary underline">Natural Anxiety Relief</Link>{' '}
              hub, and the{' '}
              <Link href="/guides/herbs/ashwagandha/" className="text-primary underline">ashwagandha evidence review</Link>.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Ashwagandha vs Magnesium</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              Magnesium is essential for neuromuscular function and is commonly marketed for relaxation and sleep. That physiology does not establish a faster anxiety effect than ashwagandha, and supplemental benefit can depend on baseline status and the outcome being measured.
            </p>
            <p>
              Ashwagandha research is more directly centered on stress-related outcomes, but there is not enough head-to-head evidence here to rank the two as anxiety treatments. Combining them also requires its own safety review rather than assuming separate mechanisms prove compatibility.
            </p>
            <p>
              See related content:{' '}
              <Link href="/guides/sleep/magnesium-for-sleep/" className="text-primary underline">Magnesium for Sleep</Link> and{' '}
              <Link href="/guides/sleep/best-herbs-for-sleep/" className="text-primary underline">Best Herbs for Sleep</Link>.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Ashwagandha vs CBD</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              <strong>Regulatory status:</strong> Ashwagandha is sold as a dietary supplement in the United States. CBD has a different and more complex federal/state regulatory context.
            </p>
            <p>
              <strong>Evidence base:</strong> Ashwagandha has multiple human trials for stress-related outcomes, though many are small and preparations vary. CBD research for anxiety uses different formulations and populations and remains heterogeneous.
            </p>
            <p>
              <strong>Practical considerations:</strong> Product quality, medication interactions, cost, regulatory context, and the exact outcome matter. There is insufficient high-quality head-to-head evidence to declare one universally superior.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Safety and Side Effects</h2>
          <SafetyNotice title="Important Safety Considerations for Ashwagandha">
            <ul className="ml-5 space-y-1.5 list-disc">
              <li><strong>Pregnancy and breastfeeding:</strong> Avoid use unless a qualified clinician specifically advises otherwise.</li>
              <li><strong>Autoimmune conditions:</strong> Review use with a clinician because immune-related effects are a concern.</li>
              <li><strong>Thyroid disorders:</strong> Some evidence suggests effects on thyroid hormones; monitoring may be appropriate.</li>
              <li><strong>Sedative medications or substances:</strong> Additive drowsiness is a practical concern.</li>
              <li><strong>Psychiatric and other medications:</strong> Interaction data are incomplete; ask a pharmacist or prescriber to review the full regimen rather than assuming compatibility.</li>
              <li><strong>Liver safety:</strong> Rare liver-injury reports have been published. Stop use and seek medical care for jaundice, dark urine, severe fatigue, or significant abdominal symptoms.</li>
            </ul>
          </SafetyNotice>
          <p className="mt-4 text-sm text-muted-foreground">This is educational information, not individualized medical advice.</p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Who Might Consider Ashwagandha?</h2>
          <div className="prose prose-lg max-w-none">
            <p>The available evidence may be more relevant when:</p>
            <ul>
              <li>Stress-related symptoms have persisted rather than appearing only during one isolated event.</li>
              <li>Stress and sleep difficulties overlap.</li>
              <li>You can test one clearly labeled preparation at a time and track benefit and side effects.</li>
              <li>You have already reviewed medication and health-condition cautions.</li>
            </ul>
            <p>
              It should not be positioned as a first-line solution for severe anxiety, panic disorders, or acute mental health crises.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">What Not To Do</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li>• Do not turn multi-week trial durations into a guaranteed onset timeline.</li>
            <li>• Do not start multiple new calming supplements at once; it becomes harder to identify benefit or side effects.</li>
            <li>• Do not stop prescribed psychiatric medications without medical supervision.</li>
            <li>• Do not ignore severe or worsening anxiety symptoms; seek professional mental health support.</li>
            <li>• Do not assume two supplements are safe together because each looks low-risk alone.</li>
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
            <Link href="/guides/anxiety/natural-anxiety-relief/" className="block p-4 border rounded-lg hover:bg-muted transition-colors">Natural Anxiety Relief: Evidence-Based Approaches</Link>
            <Link href="/guides/anxiety/l-theanine-for-anxiety/" className="block p-4 border rounded-lg hover:bg-muted transition-colors">L-Theanine for Anxiety</Link>
            <Link href="/guides/anxiety/cbd-vs-ashwagandha-for-anxiety/" className="block p-4 border rounded-lg hover:bg-muted transition-colors">CBD vs Ashwagandha for Anxiety</Link>
            <Link href="/guides/anxiety/anxiety-stack-guide/" className="block p-4 border rounded-lg hover:bg-muted transition-colors">Anxiety Stack Guide</Link>
            <Link href="/guides/sleep/ashwagandha-for-sleep/" className="block p-4 border rounded-lg hover:bg-muted transition-colors">Ashwagandha for Sleep</Link>
            <Link href="/guides/herbs/l-theanine/" className="block p-4 border rounded-lg hover:bg-muted transition-colors">L-Theanine: Full Guide</Link>
            <Link href="/guides/anxiety/" className="block p-4 border rounded-lg hover:bg-muted transition-colors">Anxiety Goal Hub</Link>
          </div>
        </section>

        <section className="mb-12 rounded-2xl border border-brand-900/10 bg-white/90 p-6 shadow-sm">
          <p className="eyebrow-label">Buyer checklist</p>
          <h2 className="mt-1 text-3xl font-semibold text-ink">What to check before buying ashwagandha</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Product selection comes after fit and safety. Use these checks before comparing the curated examples below.
          </p>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-muted-foreground">
            {BUYING_CHECKLIST.map((item) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden="true" className="font-bold text-brand-700">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {products.length > 0 ? (
          <RecommendationSection
            title="Curated ashwagandha product examples"
            products={products}
            trackingProductSlug="ashwagandha"
            trackingLocation="guide-ashwagandha-anxiety"
          />
        ) : null}

        <section className="my-12">
          <h2 className="text-3xl font-semibold mb-6">Sources &amp; References</h2>
          <div className="p-6 bg-muted/50 rounded-xl text-sm">
            <p className="mb-4 font-medium">Key human evidence and safety sources used for this review:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/39348746/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Arumugam et al. (2024), systematic review and meta-analysis</a>{' '}
                — nine randomized trials; supports a possible stress/anxiety signal but does not establish which extract works best.
              </li>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/36017529/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Akhgarjand et al. (2022), systematic review and dose-response meta-analysis</a>{' '}
                — found high between-study heterogeneity and rated certainty low for both outcomes.
              </li>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/34559859/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Cheah et al. (2021), sleep systematic review and meta-analysis</a>{' '}
                — informs the sleep-overlap discussion, not acute anxiety relief.
              </li>
              <li>
                <a href="https://doi.org/10.1097/HC9.0000000000000270" target="_blank" rel="noopener noreferrer" className="text-primary underline">Philips et al. (2023), ashwagandha-associated liver injury case series</a>{' '}
                — a safety signal from case reports, not an estimate of how often injury occurs.
              </li>
            </ul>
          </div>
        </section>

        <div className="my-12">
          <NewsletterCtaBlock />
          <div className="mt-6"><EmailCapture /></div>
        </div>
      </div>
    </>
  )
}