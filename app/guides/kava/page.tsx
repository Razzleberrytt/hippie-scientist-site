import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../src/lib/seo'
import StructuredData from '@/components/StructuredData'
import FAQAccordion from '@/components/FAQAccordion'
import EvidenceSummaryBox from '@/components/EvidenceSummaryBox'
import SafetyBox from '@/components/SafetyBox'
import MechanismBox from '@/components/MechanismBox'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'

// NOTE: This is intentionally a HARM-REDUCTION / educational guide, not a supplement
// recommendation. The source content explicitly does not recommend or endorse kava use
// and documents serious hepatotoxicity risk. Per the project's two-zone architecture,
// NO AffiliateProductBox is added here even though a revenue-products set technically exists.

const SLUG = 'kava'
const PAGE_URL = 'https://thehippiescientist.net/guides/kava'
const TITLE = 'Kava: Clinical Evidence for Anxiety, Hepatotoxicity Risk, and Harm Reduction'
const DESCRIPTION =
  'Evidence review of kava (Piper methysticum) for anxiety: kavalactones, GABA mechanism, the serious liver-injury risk, noble vs tudei cultivars, and harm-reduction guidance.'
const DATE_PUBLISHED = '2024-06-09'
const DATE_MODIFIED = '2026-06-14'

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/guides/${SLUG}`,
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'Does kava actually work for anxiety?',
    answer:
      'Moderate-quality evidence supports short-term anxiolytic effects in generalized anxiety disorder over 4–8 weeks, with effect sizes generally in the moderate range in positive trials. However, not all trials are positive, and results are more consistent with standardized extracts delivering roughly 120–280 mg kavalactones daily. Longer-term data are lacking.',
  },
  {
    question: 'Why is kava considered dangerous?',
    answer:
      'Kava carries a well-documented risk of serious liver injury, ranging from mild enzyme elevations to severe hepatitis and acute liver failure requiring transplantation or resulting in death. The FDA issued a consumer advisory in 2002 and a 2020 scientific memorandum concluding kava is not safe as a recreational or relaxation beverage. This is why the substance is treated as harm-reduction content rather than a casual supplement.',
  },
  {
    question: 'Are noble cultivars and water extracts safer?',
    answer:
      'The risk appears meaningfully lower with traditional water-based extracts of noble cultivars than with many commercial solvent (acetone/ethanol) extracts — but it is not eliminated. Tudei varieties contain higher levels of certain compounds and are generally avoided in traditional contexts. Cultivar and extraction method are among the most important variables for both efficacy and safety.',
  },
  {
    question: 'What monitoring is recommended if someone uses kava anyway?',
    answer:
      'Anyone considering kava should do so only under medical supervision, with baseline liver function testing and periodic monitoring — especially with extended use. Discontinue immediately and seek medical attention at any sign of liver injury: jaundice, dark urine, pale stools, unusual fatigue, or abdominal pain.',
  },
  {
    question: 'Who should absolutely avoid kava?',
    answer:
      'Kava should be avoided by anyone with a history of liver disease, regular alcohol consumers, pregnant or breastfeeding individuals, and those taking medications with significant hepatic metabolism or narrow therapeutic windows. Combining kava with other sedating substances increases the risk of excessive sedation.',
  },
]

const SAFETY_NOTES = [
  {
    severity: 'warning' as const,
    text: 'Kava has been associated with severe hepatotoxicity, including liver failure requiring transplantation or resulting in death. The FDA concluded (2020) that kava is not safe for use as a recreational or relaxation beverage. This article reviews the literature but does not recommend or endorse kava use.',
  },
  {
    severity: 'warning' as const,
    text: 'Avoid entirely if you have any history of liver disease, drink alcohol regularly, are pregnant or breastfeeding, or take medications with significant hepatic metabolism or narrow therapeutic indices.',
  },
  {
    severity: 'caution' as const,
    text: 'Kavalactones inhibit several cytochrome P450 enzymes (CYP2C9, CYP2C19, CYP3A4), creating potential for clinically relevant drug interactions. Combining kava with other sedatives increases sedation risk.',
  },
  {
    severity: 'caution' as const,
    text: 'If kava is used despite the risks, it should only be under medical supervision with baseline and periodic liver function testing. Stop immediately and seek care at any sign of liver injury (jaundice, dark urine, pale stools, fatigue, abdominal pain).',
  },
  {
    severity: 'info' as const,
    text: 'For most individuals, safer and better-studied alternatives exist for managing anxiety. Traditional ceremonial use of water-based noble kava has a very different risk profile from daily use of concentrated commercial extracts — the two should not be conflated.',
  },
]

const MECHANISM_POINTS = [
  {
    label: 'GABA-A Modulation',
    description:
      'Kavalactones act primarily as positive allosteric modulators of GABA-A receptors, with affinity for subtypes associated with anxiolysis rather than heavy sedation.',
  },
  {
    label: 'Additional Targets',
    description:
      'Proposed secondary mechanisms include inhibition of voltage-gated sodium channels, weak monoamine oxidase inhibition, and modulation of dopaminergic and noradrenergic signaling.',
  },
  {
    label: 'Pharmacokinetics',
    description:
      'Kavalactones are absorbed relatively rapidly (peak 1–3 hours), metabolized by CYP enzymes, and eliminated via renal and fecal routes. Dividing the daily dose may produce more stable plasma levels.',
  },
]

const HEADINGS: Heading[] = [
  { id: 'evidence', text: 'Clinical Evidence', level: 2 },
  { id: 'mechanism', text: 'Mechanisms & Pharmacokinetics', level: 2 },
  { id: 'liver-risk', text: 'Factors That Influence Liver Risk', level: 2 },
  { id: 'safety', text: 'Safety & Harm Reduction', level: 2 },
  { id: 'faq', text: 'Common Questions', level: 2 },
  { id: 'alternatives', text: 'Better-Studied Alternatives', level: 2 },
]

export default function KavaGuidePage() {
  const toc = <TableOfContents headings={HEADINGS} />

  return (
    <ArticleLayout toc={toc} zone="harm-reduction">
      <StructuredData
        pageUrl={PAGE_URL}
        headline={TITLE}
        description={DESCRIPTION}
        datePublished={DATE_PUBLISHED}
        dateModified={DATE_MODIFIED}
        faqs={FAQS}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides' },
          { label: 'Kava', href: `/guides/${SLUG}` },
        ]}
      />

      <div className="space-y-8">
      {/* Hero */}
      <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">
          Harm-Reduction Guide
        </p>
        <h1 className="mt-3 text-3xl font-black leading-tight text-ink sm:text-5xl">
          Kava (<em>Piper methysticum</em>)
        </h1>
        <p className="mt-1 text-base font-medium text-brand-700">
          Clinical Evidence for Anxiety, Hepatotoxicity Risk &amp; Practical Harm Reduction
        </p>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">
          Multiple randomized controlled trials suggest kava can produce moderate reductions in generalized
          anxiety over 4–8 weeks. But kava also carries a well-established risk of serious liver injury. This is
          an educational, harm-reduction review of the evidence — it is not medical advice and does not recommend
          or endorse kava use.
        </p>
      </section>

      {/* Strong disclaimer up front */}
      <div className="rounded-2xl border border-red-200/60 bg-red-50/70 p-5 text-sm leading-6 text-red-950">
        <p className="font-bold uppercase tracking-[0.12em] text-red-800">Important safety notice</p>
        <p className="mt-2">
          Kava has been linked to numerous reports of liver toxicity, ranging from mild enzyme elevations to
          severe hepatitis, cirrhosis, and acute liver failure requiring transplantation or resulting in death.
          Risk factors may include preparation method, cultivar, dose, duration, genetic susceptibility,
          pre-existing liver conditions, and concurrent alcohol or medication use. Professional medical guidance
          and monitoring are strongly recommended for anyone considering its use.
        </p>
      </div>

      {/* Evidence */}
      <section id="evidence" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Clinical Evidence</h2>
        <p className="text-sm leading-6 text-muted">
          Kava is one of the more extensively researched herbal options for anxiety, but the evidence is mixed
          and must be weighed against a serious safety signal.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <EvidenceSummaryBox
            level="moderate"
            outcome="Generalized anxiety disorder (short-term)"
            takeaway="The 2015 K-GAD RCT (75 participants) found a significant reduction in HAM-A scores versus placebo with a moderate effect size, strongest in those with higher baseline anxiety. Several other well-designed trials were null."
            citationCount={7}
          />
          <EvidenceSummaryBox
            level="moderate"
            outcome="Pooled meta-analytic anxiety effect"
            takeaway="Smith & Leiras (2018) found kava superior to placebo in 3 of 7 RCTs, with pooled responder rates favoring kava. Ooi et al. (2018) concluded a moderate anxiolytic effect, noting few high-quality trials."
            citationCount={2}
          />
          <EvidenceSummaryBox
            level="limited"
            outcome="Sleep & secondary outcomes"
            takeaway="Evidence for primary sleep benefit is weak and largely secondary to anxiety reduction. Some older trials reported improved sleep latency, but direct studies in primary insomnia are limited."
            citationCount={2}
          />
          <EvidenceSummaryBox
            level="limited"
            outcome="Long-term efficacy & safety"
            takeaway="Most positive data come from 4–8 week trials using 120–280 mg kavalactones daily. Longer-term efficacy and safety data are lacking, and the hepatotoxicity risk grows more uncertain with extended use."
            citationCount={1}
          />
        </div>
      </section>

      {/* Mechanism */}
      <section id="mechanism" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Mechanisms &amp; Pharmacokinetics</h2>
        <MechanismBox
          summary="The six major kavalactones — kavain, dihydrokavain, methysticin, dihydromethysticin, yangonin, and desmethoxyyangonin — are concentrated in the root and lower stem and drive most of kava's pharmacology. Quality and preparation method are among the most important variables affecting both efficacy and safety."
          points={MECHANISM_POINTS}
        />
      </section>

      {/* Risk factors */}
      <section id="liver-risk" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Factors That Influence Liver Risk</h2>
        <ul className="space-y-2 text-sm leading-6 text-muted">
          <li><strong className="text-ink">Preparation method:</strong> traditional water-based extracts of noble cultivars appear lower-risk than many commercial acetone/ethanol extracts.</li>
          <li><strong className="text-ink">Cultivar type:</strong> noble varieties have a long history of traditional use; tudei varieties contain higher levels of certain compounds and are generally avoided.</li>
          <li><strong className="text-ink">Dose &amp; duration:</strong> positive trials used 120–280 mg kavalactones daily for 4–8 weeks; higher doses and longer use have less safety data.</li>
          <li><strong className="text-ink">Individual factors:</strong> pre-existing liver disease, CYP enzyme variation, alcohol use, and certain medications increase susceptibility.</li>
          <li><strong className="text-ink">Product quality:</strong> adulteration, contamination, and poor standardization remain ongoing concerns in the commercial market.</li>
        </ul>
      </section>

      {/* Safety */}
      <section id="safety" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Safety &amp; Harm Reduction</h2>
        <SafetyBox notes={SAFETY_NOTES} />
      </section>

      {/* FAQ */}
      <div id="faq" className="scroll-mt-20">
        <FAQAccordion faqs={FAQS} heading="Common Questions About Kava" />
      </div>

      {/* Related — safer alternatives, no affiliate */}
      <section id="alternatives" className="scroll-mt-20 space-y-4">
        <h2 className="text-xl font-semibold text-ink">Better-Studied, Lower-Risk Alternatives</h2>
        <p className="text-sm text-muted">
          For most people managing anxiety, the options below have more favorable risk profiles than kava.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/guides/passionflower" className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/20 hover:bg-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">Guide</p>
            <p className="mt-1 text-sm font-semibold text-ink">Passionflower</p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">Modest anxiety reduction with a more favorable safety profile.</p>
          </Link>
          <Link href="/guides/ashwagandha" className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/20 hover:bg-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">Guide</p>
            <p className="mt-1 text-sm font-semibold text-ink">Ashwagandha</p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">Adaptogen with the strongest stress/anxiety evidence base.</p>
          </Link>
          <Link href="/guides/natural-anxiolytics-beyond-ashwagandha" className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/20 hover:bg-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">Guide</p>
            <p className="mt-1 text-sm font-semibold text-ink">Natural Anxiolytics</p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">Evidence-ranked anxiolytic options beyond the usual picks.</p>
          </Link>
        </div>
      </section>

      {/* Bottom nav */}
      <div className="flex flex-wrap gap-4 border-t border-brand-900/10 pt-6 text-sm">
        <Link href="/guides" className="font-medium text-brand-700 hover:text-brand-800 hover:underline">← All Guides</Link>
        <Link href="/herbs" className="font-medium text-brand-700 hover:text-brand-800 hover:underline">Herb Library →</Link>
      </div>
      </div>{/* end space-y-8 */}
    </ArticleLayout>
  )
}
