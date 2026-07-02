import Link from 'next/link'
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
import { AFFILIATE_TAGS } from '@/config/affiliate'

const SLUG = 'cbd-vs-ashwagandha-for-anxiety'
const TITLE = 'CBD vs Ashwagandha for Anxiety: Evidence, Differences, and How to Choose'
const DESCRIPTION =
  'An evidence-based comparison of CBD and ashwagandha for anxiety, covering mechanisms, research quality, safety, legal status, cost, and practical decision guidance.'
const DATE = '2026-06-10'

export const metadata = buildPageMetadata({
  title: compactMetaTitle(TITLE),
  description: DESCRIPTION,
  path: `/guides/anxiety/${SLUG}`,
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'Is CBD or ashwagandha better for anxiety?',
    answer:
      'There is no clear winner based on current evidence. Ashwagandha has more published human trial data for stress-related anxiety, while CBD research for anxiety is growing but more limited and heterogeneous. Individual responses vary significantly. The better option depends on your specific anxiety type, health history, medications, and legal situation.',
  },
  {
    question: 'Can I take CBD and ashwagandha together?',
    answer:
      'Limited published research exists on combining the two. Both may have mild sedative-adjacent effects, and combining supplements always increases the risk of additive effects or interactions. If you are on any medications — particularly ones metabolized by CYP enzymes, which CBD can affect — consult a clinician before combining.',
  },
  {
    question: 'How long does it take for CBD to work for anxiety?',
    answer:
      'Onset varies by form. Sublingual or inhaled CBD may produce effects within minutes to an hour. Oral capsules can take 1–2 hours. Research on anxiety typically evaluates either acute doses or consistent use over weeks. Individual responses differ widely.',
  },
  {
    question: 'How long does it take for ashwagandha to work for anxiety?',
    answer:
      'Ashwagandha is generally not fast-acting. Most studies evaluate outcomes over 4–8 weeks of daily use. It is better positioned as an ongoing support supplement than an acute intervention.',
  },
  {
    question: 'Is CBD legal?',
    answer:
      'Legal status depends on your location and the source of CBD (hemp-derived vs cannabis-derived). In many jurisdictions, hemp-derived CBD with low THC content is legal, but regulations vary considerably. Check your local laws before purchasing or using CBD.',
  },
  {
    question: 'Does CBD show up on a drug test?',
    answer:
      'Full-spectrum CBD products contain trace amounts of THC, which can potentially trigger a positive result on drug tests. Broad-spectrum or isolate products have lower risk, but contamination in the supplement industry means risk is not zero. This is a practical consideration ashwagandha does not share.',
  },
]

export default function CbdVsAshwagandhaForAnxietyPage() {
  const pageBreadcrumb = breadcrumbJsonLd([
    { name: 'Home', url: 'https://thehippiescientist.net' },
    { name: 'Anxiety', url: 'https://thehippiescientist.net/guides/anxiety/natural-anxiety-relief/' },
    { name: TITLE, url: `https://thehippiescientist.net/articles/${SLUG}` },
  ])

  const articleLd = blogJsonLd(
    { title: TITLE, slug: SLUG, date: DATE, description: DESCRIPTION },
    `/articles/${SLUG}`,
  )

  const faqLd = faqPageJsonLd({ pagePath: `/articles/${SLUG}`, questions: FAQS })

  return (
    <>
      <JsonLd schema={articleLd} />
      <JsonLd schema={pageBreadcrumb} />
      {faqLd && (
        <JsonLd schema={faqLd} />
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <LastUpdatedBadge date={DATE} />
          <h1 className="text-4xl font-bold tracking-tight mt-4 mb-4">{TITLE}</h1>
          <p className="text-xl text-muted-foreground">{DESCRIPTION}</p>
        </div>

        <div className="prose prose-sm mb-8 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm">
            <strong>Affiliate Disclosure:</strong> This article contains affiliate links.
            If you make a purchase through these links, we may earn a small commission at no extra
            cost to you. This helps support our research and content.
          </p>
        </div>

        <div className="mb-10 p-6 border rounded-xl bg-card">
          <h2 className="text-2xl font-semibold mb-4">Quick Verdict</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>• <strong>Ashwagandha</strong> has more published human trial data specifically for stress-related anxiety.</li>
            <li>• <strong>CBD</strong> has a different legal and regulatory landscape; research is growing but less consistent.</li>
            <li>• Neither is a proven treatment for clinical anxiety disorders.</li>
            <li>• CBD carries drug-test and drug-interaction risks that ashwagandha does not.</li>
            <li>• The better choice depends on your anxiety type, medications, and legal situation.</li>
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            Evidence quality and effect sizes vary across all studies. Individual results differ significantly.
          </p>
        </div>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">What Are We Comparing?</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              <strong>CBD (cannabidiol)</strong> is a non-intoxicating compound derived from cannabis
              or hemp plants. It has gained significant popular interest as a potential anxiety support
              supplement, despite a still-developing body of human clinical evidence.
            </p>
            <p>
              <strong>Ashwagandha</strong> (<em>Withania somnifera</em>) is an Ayurvedic adaptogen
              with a longer history of traditional use and a growing base of human clinical trials
              specifically for stress and anxiety outcomes.
            </p>
            <p>
              These two supplements are frequently compared by people looking for natural anxiety
              support because both are widely marketed for stress and calm — but they differ
              substantially in their mechanisms, legal status, research base, and practical
              considerations.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Side-by-Side Comparison</h2>

          <ResponsiveTable label="CBD vs ashwagandha comparison across key factors">
            <table className="min-w-[600px] w-full text-sm">
              <thead>
                <tr className="border-b border-brand-900/10">
                  <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Factor</th>
                  <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">CBD</th>
                  <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">Ashwagandha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-900/5">
                <tr className="align-top">
                  <td className="py-3 pr-4 font-medium text-ink">Primary mechanism</td>
                  <td className="py-3 pr-4 text-muted">Endocannabinoid system; possible serotonin receptor interaction</td>
                  <td className="py-3 text-muted">HPA axis modulation; possible GABA-A interaction; adaptogenic</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 pr-4 font-medium text-ink">Onset speed</td>
                  <td className="py-3 pr-4 text-muted">Minutes to hours (form-dependent)</td>
                  <td className="py-3 text-muted">Weeks of daily use</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 pr-4 font-medium text-ink">Human trial evidence for anxiety</td>
                  <td className="py-3 pr-4 text-muted">Limited; growing; inconsistent study designs</td>
                  <td className="py-3 text-muted">Moderate; more trials in stressed populations</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 pr-4 font-medium text-ink">Legal status</td>
                  <td className="py-3 pr-4 text-muted">Varies by jurisdiction and source</td>
                  <td className="py-3 text-muted">Legal dietary supplement in most jurisdictions</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 pr-4 font-medium text-ink">Drug test risk</td>
                  <td className="py-3 pr-4 text-muted">Yes, especially full-spectrum products</td>
                  <td className="py-3 text-muted">No</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 pr-4 font-medium text-ink">Drug interactions</td>
                  <td className="py-3 pr-4 text-muted">CYP enzyme inhibition — significant risk with many medications</td>
                  <td className="py-3 text-muted">Lower risk; caution with sedatives, thyroid meds</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 pr-4 font-medium text-ink">Cost (typical monthly)</td>
                  <td className="py-3 pr-4 text-muted">Often higher, especially quality products</td>
                  <td className="py-3 text-muted">Generally lower for standardized extracts</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 pr-4 font-medium text-ink">Regulation quality control</td>
                  <td className="py-3 pr-4 text-muted">Inconsistent; significant mislabeling documented</td>
                  <td className="py-3 text-muted">Supplement-grade; third-party testing advisable</td>
                </tr>
              </tbody>
            </table>
          </ResponsiveTable>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">How Each Works</h2>

          <div className="prose prose-lg max-w-none">
            <h3>CBD</h3>
            <p>
              CBD is thought to interact with the endocannabinoid system (ECS), which plays a role in
              regulating stress responses, mood, and sleep. It may also interact with serotonin
              receptors (5-HT1A), which are implicated in anxiety regulation.
            </p>
            <p>
              Unlike THC, CBD does not produce intoxication. However, the precise mechanisms by which
              it might reduce anxiety in humans are still being studied, and translating animal or
              mechanistic findings to clinical human outcomes has proven inconsistent.
            </p>

            <h3>Ashwagandha</h3>
            <p>
              Ashwagandha is classified as an adaptogen — an herb thought to help the body adapt to
              stressors over time. Research has focused on its potential effects on the
              HPA (hypothalamic-pituitary-adrenal) axis and cortisol levels in stressed individuals.
            </p>
            <p>
              Some studies have also explored possible interactions with GABA-A receptors, which may
              contribute to its calming effects. Withanolides — the primary bioactive compounds — are
              thought to drive much of the adaptogenic activity.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Evidence Summary</h2>

          <div className="space-y-6">
            <EvidenceSummaryCard
              title="CBD for Anxiety"
              evidenceLevel="Limited"
              humanEvidence="Several RCTs and open-label studies have examined CBD for anxiety disorders and stress, with generally positive but inconsistent results. Study quality, doses, and CBD formulations vary considerably across trials, limiting direct comparison. Common trial doses range from 150–600 mg/day."
              mechanisticEvidence="Proposed mechanisms include endocannabinoid system (ECS) modulation, 5-HT1A serotonin receptor interaction, and TRPV1 receptor activity. Animal evidence for these pathways is substantially stronger than human evidence."
              safetyProfile="Key concerns include CYP3A4/2C19 enzyme inhibition (risk of drug interactions), variable product labeling accuracy in commercial supplements, positive drug tests with full-spectrum CBD, and regulatory uncertainty in many jurisdictions."
            />

            <EvidenceSummaryCard
              title="Ashwagandha for Anxiety &amp; Stress"
              evidenceLevel="Moderate"
              humanEvidence="Multiple RCTs using standardized extracts (KSM-66, Sensoril) report positive stress and anxiety outcomes in stressed populations. Evidence is stronger for perceived stress reduction than for diagnosed anxiety disorders."
              mechanisticEvidence="HPA-axis modulation and cortisol reduction are the most studied mechanisms; possible GABA-A receptor interaction via withanolides. Most mechanistic data are from animal studies."
              safetyProfile="Key cautions include potential thyroid modulation, autoimmune activation risk, contraindication in pregnancy and breastfeeding, and rare case reports of liver injury."
            />
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Legal Status and Practical Considerations</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              <strong>Ashwagandha</strong> is sold as a dietary supplement in most countries and faces
              no significant legal barriers in the United States, Canada, the EU, or Australia.
            </p>
            <p>
              <strong>CBD</strong> has a more complex legal landscape. Hemp-derived CBD with low THC
              content is legal in many jurisdictions, but cannabis-derived CBD may require medical
              authorization or be outright prohibited. Laws are evolving rapidly. Always verify your
              local regulations before purchasing.
            </p>
            <p>
              A practical concern unique to CBD: <strong>drug testing</strong>. Full-spectrum CBD
              products contain trace amounts of THC. Multiple studies have documented that some
              full-spectrum products can cause positive THC results on urine drug screens. Even
              broad-spectrum or isolate products carry low but non-zero risk due to industry
              mislabeling, which has been documented in multiple independent analyses.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Drug Interactions</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              <strong>CBD</strong> inhibits several cytochrome P450 (CYP) liver enzymes, particularly
              CYP3A4 and CYP2C19. These enzymes metabolize a large proportion of common medications,
              including many psychiatric drugs (SSRIs, benzodiazepines, antipsychotics), blood
              thinners, and cardiovascular medications. CBD-drug interactions can cause medications to
              reach higher-than-intended blood levels, potentially causing toxicity.
            </p>
            <p>
              <strong>Ashwagandha</strong> has a lower overall interaction profile. The main concerns
              are additive sedative effects with sedating drugs and possible effects on thyroid hormone
              levels. Consult a clinician if you take any prescription medications.
            </p>
            <p>
              If you are on psychiatric medications, CBD interactions are a significant safety concern
              that warrants professional guidance before use.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Product Quality and Regulation</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              The CBD market has documented quality control issues. Independent testing has found that
              a substantial proportion of commercial CBD products are mislabeled — containing either
              more or less CBD than stated, or detectable THC in products marketed as THC-free.
            </p>
            <p>
              The ashwagandha supplement market has its own quality concerns, but standardized extracts
              (KSM-66, Sensoril) from established brands with third-party testing provide a more
              reliable starting point.
            </p>
            <p>
              For both supplements, third-party certificates of analysis (COAs) from accredited labs
              are the most important quality signal. For CBD specifically, check that the COA is
              batch-specific, not generic.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Who Should Consider Each?</h2>

          <ResponsiveTable label="Decision guide: CBD vs ashwagandha by situation">
            <table className="min-w-[500px] w-full text-sm">
              <thead>
                <tr className="border-b border-brand-900/10">
                  <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Situation</th>
                  <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Consider</th>
                  <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-900/5">
                <tr className="align-top">
                  <td className="py-3 pr-4 font-medium text-ink">Chronic stress-driven anxiety</td>
                  <td className="py-3 pr-4 text-muted">Ashwagandha</td>
                  <td className="py-3 text-muted">More evidence in this specific population</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 pr-4 font-medium text-ink">On multiple medications</td>
                  <td className="py-3 pr-4 text-muted">Consult clinician before either; CBD has higher interaction risk</td>
                  <td className="py-3 text-muted">CYP interaction risk with CBD is significant</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 pr-4 font-medium text-ink">Subject to drug testing</td>
                  <td className="py-3 pr-4 text-muted">Ashwagandha</td>
                  <td className="py-3 text-muted">CBD carries real drug-test risk</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 pr-4 font-medium text-ink">Thyroid or autoimmune condition</td>
                  <td className="py-3 pr-4 text-muted">Consult clinician before ashwagandha</td>
                  <td className="py-3 text-muted">Ashwagandha has thyroid/immune cautions</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 pr-4 font-medium text-ink">Pregnancy or breastfeeding</td>
                  <td className="py-3 pr-4 text-muted">Avoid both; consult a healthcare provider</td>
                  <td className="py-3 text-muted">Insufficient safety data for either</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 pr-4 font-medium text-ink">Budget-conscious</td>
                  <td className="py-3 pr-4 text-muted">Ashwagandha</td>
                  <td className="py-3 text-muted">Quality standardized extracts are generally less expensive</td>
                </tr>
              </tbody>
            </table>
          </ResponsiveTable>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Safety and Side Effects</h2>

          <SafetyNotice title="Important Safety Considerations">
            <ul className="ml-5 space-y-1.5 list-disc">
              <li>
                <strong>CBD — drug interactions:</strong> Inhibits CYP3A4 and CYP2C19. Risk of
                elevated blood levels of medications metabolized by these enzymes. Consult a clinician
                if you take any prescription drugs.
              </li>
              <li>
                <strong>CBD — drug testing:</strong> Full-spectrum products can trigger positive THC
                tests. Risk is non-zero even with isolate products due to mislabeling.
              </li>
              <li>
                <strong>CBD — regulatory uncertainty:</strong> Quality varies significantly across
                products. Always request a batch-specific COA.
              </li>
              <li>
                <strong>Ashwagandha — thyroid:</strong> Some evidence suggests possible effects on
                thyroid hormone levels. Monitoring advised for people with thyroid conditions.
              </li>
              <li>
                <strong>Ashwagandha — autoimmune:</strong> May stimulate immune activity. Caution in
                autoimmune conditions.
              </li>
              <li>
                <strong>Both:</strong> Insufficient safety data in pregnancy and breastfeeding. Avoid
                unless directed by a healthcare provider.
              </li>
              <li>
                Severe anxiety, panic attacks, or suicidal ideation require professional mental health
                support — not supplements.
              </li>
            </ul>
          </SafetyNotice>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">What Not To Do</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li>• Do not combine CBD with psychiatric medications without medical supervision.</li>
            <li>• Do not assume CBD labeling is accurate — always verify with a COA.</li>
            <li>• Do not use either supplement as a replacement for prescribed psychiatric treatment.</li>
            <li>• Do not ignore severe or worsening anxiety symptoms — seek professional help.</li>
            <li>• Do not start both supplements simultaneously; introduce one at a time if trialling either.</li>
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
              href="/guides/anxiety/natural-anxiety-relief/"
              className="block p-4 border rounded-lg hover:bg-muted transition-colors"
            >
              Natural Anxiety Relief: Evidence-Based Approaches
            </Link>
            <Link
              href="/guides/herbs/ashwagandha/"
              className="block p-4 border rounded-lg hover:bg-muted transition-colors"
            >
              Ashwagandha for Anxiety
            </Link>
            <Link
              href="/guides/herbs/l-theanine/"
              className="block p-4 border rounded-lg hover:bg-muted transition-colors"
            >
              L-Theanine for Anxiety
            </Link>
            <Link
              href="/guides/anxiety/anxiety-stack-guide"
              className="block p-4 border rounded-lg hover:bg-muted transition-colors"
            >
              Anxiety Stack Guide
            </Link>
            <Link
              href="/guides/sleep/ashwagandha-for-sleep"
              className="block p-4 border rounded-lg hover:bg-muted transition-colors"
            >
              Ashwagandha for Sleep
            </Link>
            <Link
              href="/guides/sleep/sleep-stack-guide"
              className="block p-4 border rounded-lg hover:bg-muted transition-colors"
            >
              Sleep Stack Guide
            </Link>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Buyer Guide</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              For both CBD and ashwagandha, third-party testing is the single most important quality
              signal. For CBD, always request a batch-specific certificate of analysis.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-xl p-5">
              <h3 className="font-semibold mb-2">KSM-66 Ashwagandha</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Full-spectrum root extract used in multiple clinical studies. Standardized to 5%
                withanolides.
              </p>
              <a
                href={`https://www.amazon.com/s?k=KSM-66+ashwagandha+third+party+tested&tag=${AFFILIATE_TAGS.amazon}`}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="text-primary underline text-sm"
              >
                Search KSM-66 Ashwagandha →
              </a>
            </div>
            <div className="border rounded-xl p-5">
              <h3 className="font-semibold mb-2">Sensoril Ashwagandha</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Root and leaf extract with clinical study history and a different withanolide profile
                to KSM-66.
              </p>
              <a
                href={`https://www.amazon.com/s?k=Sensoril+ashwagandha&tag=${AFFILIATE_TAGS.amazon}`}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="text-primary underline text-sm"
              >
                Search Sensoril Ashwagandha →
              </a>
            </div>
            <div className="border rounded-xl p-5">
              <h3 className="font-semibold mb-2">CBD Oil (Broad Spectrum)</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Broad-spectrum reduces (but does not eliminate) drug-test risk versus full-spectrum.
                Always verify with a COA.
              </p>
              <a
                href={`https://www.amazon.com/s?k=broad+spectrum+CBD+oil+third+party+tested&tag=${AFFILIATE_TAGS.amazon}`}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="text-primary underline text-sm"
              >
                Search Broad Spectrum CBD →
              </a>
            </div>
            <div className="border rounded-xl p-5">
              <h3 className="font-semibold mb-2">Stress Support Supplements</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Broader category search for stress and anxiety support products.
              </p>
              <a
                href={`https://www.amazon.com/s?k=stress+support+supplements&tag=${AFFILIATE_TAGS.amazon}`}
                target="_blank"
                rel="noopener noreferrer sponsored"
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
              Key sources include:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>CBD anxiety clinical trials (PMIDs, n-sizes, outcomes)</li>
              <li>Ashwagandha stress and anxiety trials (PMIDs, n-sizes, outcomes)</li>
              <li>CBD product mislabeling and quality studies</li>
              <li>CBD drug interaction data (CYP enzyme studies)</li>
              <li>Drug-test risk data for full-spectrum CBD</li>
              <li>Systematic reviews and meta-analyses for both</li>
            </ul>
          </div>
        </section>

        <RecommendationSection products={getRevenueProductSet('ashwagandha')?.products ?? []} />

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
