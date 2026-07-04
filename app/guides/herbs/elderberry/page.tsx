import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import StructuredData from '@/components/StructuredData'
import FAQAccordion from '@/components/FAQAccordion'
import EvidenceSummaryBox from '@/components/EvidenceSummaryBox'
import DosageBox from '@/components/DosageBox'
import SafetyBox from '@/components/SafetyBox'
import MechanismBox from '@/components/MechanismBox'
import AffiliateProductBox from '@/components/AffiliateProductBox'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import EmailCapture from '@/components/EmailCapture'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import References from '@/components/References'

const SLUG = 'elderberry'
const PAGE_URL = 'https://thehippiescientist.net/guides/elderberry'
const TITLE = 'Elderberry for Colds and Flu: Evidence & Guidance'
const DESCRIPTION =
  'Evidence-based review of elderberry (Sambucus nigra) for upper respiratory infections: meta-analyses, mechanisms, the cyanogenic-glycoside safety issue, quality, and dosing.'
const DATE_PUBLISHED = '2024-06-09'
const DATE_MODIFIED = '2026-06-14'

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/guides/herbs/${SLUG}`,
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'Does elderberry actually shorten colds and flu?',
    answer:
      'Moderate evidence suggests elderberry can modestly reduce the duration and severity of upper respiratory symptoms when started at symptom onset. A 2019 meta-analysis (Hawkins et al.) found a significant reduction versus placebo, with effects more pronounced for influenza than the common cold. It is supportive, not a cure.',
  },
  {
    question: 'Can elderberry prevent getting sick?',
    answer:
      'Evidence for prevention is weak and limited to very few trials. Most of the benefit shown in the literature is for treatment started early in an illness, not for stopping infections from occurring. Do not rely on it in place of vaccination.',
  },
  {
    question: 'Why are raw elderberries dangerous?',
    answer:
      'Raw or unripe elderberries — along with the leaves, stems, and bark — contain cyanogenic glycosides that can release cyanide and cause nausea, vomiting, and more serious toxicity. Only properly cooked or processed commercial products (syrups, standardized extracts, lozenges) should be used; avoid homemade preparations from fresh plant material.',
  },
  {
    question: 'When should I start taking it and for how long?',
    answer:
      'Begin at the first sign of symptoms — most clinical studies showing benefit started treatment early. It is typically used short-term (about 5–7 days or until symptoms resolve). Higher-than-recommended doses have not been shown to help more and may increase side-effect risk.',
  },
  {
    question: 'Who should be cautious with elderberry?',
    answer:
      'People with autoimmune conditions should use caution, since elderberry may stimulate immune activity. It is generally best avoided in pregnancy and breastfeeding due to insufficient safety data, and children should only use products specifically formulated and dosed for pediatric use. Check with a pharmacist if you take immune-modulating medications.',
  },
]

const DOSAGE_ROWS = [
  { form: 'Standardized syrup (e.g., Sambucol-type)', range: 'Per label, at symptom onset', notes: 'Most clinically studied format; begin early in illness' },
  { form: 'Lozenges', range: 'Per label', notes: 'Used in some influenza trials' },
  { form: 'Capsules / extract', range: 'Per label', notes: 'Look for stated anthocyanin standardization' },
  { form: 'Duration of use', range: '~5–7 days', notes: 'Short-term during acute illness; limited data on long-term daily use' },
]

const SAFETY_NOTES = [
  {
    severity: 'warning' as const,
    text: 'Raw or unripe elderberries and the leaves, stems, and bark contain cyanogenic glycosides that can release cyanide. Use only properly cooked or processed commercial products — never homemade preparations from fresh plant material.',
  },
  {
    severity: 'caution' as const,
    text: 'Because elderberry may stimulate immune activity, people with autoimmune conditions should consult a healthcare provider before use.',
  },
  {
    severity: 'caution' as const,
    text: 'Insufficient safety data in pregnancy and breastfeeding — generally best avoided unless advised by a provider. Children should only use products specifically formulated for pediatric use.',
  },
  {
    severity: 'info' as const,
    text: 'Mild gastrointestinal upset (nausea, diarrhea) is occasionally reported. Elderberry should not replace proven medical care, including antiviral medication when indicated or annual influenza vaccination.',
  },
]

const MECHANISM_POINTS = [
  {
    label: 'Anthocyanins',
    description:
      'High levels of anthocyanins (notably cyanidin-3-sambubioside and cyanidin-3-glucoside) provide antioxidant activity and have shown antiviral effects against influenza viruses in vitro.',
  },
  {
    label: 'Possible Viral Entry Inhibition',
    description:
      'Laboratory studies suggest elderberry flavonoids may inhibit viral entry into host cells or reduce viral replication, though human mechanistic data remain limited.',
  },
  {
    label: 'Immune Modulation',
    description:
      'Extracts may influence cytokine production and temper excessive inflammation, so clinical benefit likely reflects mild antiviral plus immune-modulating effects rather than direct pathogen eradication.',
  },
]

const HEADINGS: Heading[] = [
  { id: 'research', text: 'What the Research Shows', level: 2 },
  { id: 'mechanism', text: 'How It Works', level: 2 },
  { id: 'dosage', text: 'Dosage & Forms', level: 2 },
  { id: 'quality', text: 'Quality Matters', level: 2 },
  { id: 'safety', text: 'Safety & Precautions', level: 2 },
  { id: 'faq', text: 'Common Questions', level: 2 },
]

const ELDERBERRY_REFS = [
  { n: 1, text: 'Zakay-Rones Z, et al. (2004). Elderberry for influenza A and B. J Int Med Res, 32(2): 132-140.', url: 'https://pubmed.ncbi.nlm.nih.gov/15080016/' },
  { n: 2, text: 'Tiralongo E, et al. (2016). Elderberry reduces cold duration in air travelers. Nutrients, 8(4): 182.', url: 'https://pubmed.ncbi.nlm.nih.gov/27023596/' },
  { n: 3, text: 'Hawkins J, et al. (2019). Black elderberry for upper respiratory symptoms. Complement Ther Med, 42: 361-365.', url: 'https://pubmed.ncbi.nlm.nih.gov/30670267/' },
  { n: 4, text: 'Krawitz C, et al. (2011). Elderberry flavonoids inhibit H1N1 in vitro. BMC Complement Altern Med, 11: 16.', url: 'https://pubmed.ncbi.nlm.nih.gov/21352539/' },
]

export default function ElderberryGuidePage() {
  const elderberryProducts = getRevenueProductSet('elderberry')
  const toc = <TableOfContents headings={HEADINGS} />

  return (
    <ArticleLayout toc={toc} zone="supplement">
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
          { label: 'Elderberry', href: `/guides/${SLUG}` },
        ]}
      />

      <div className="space-y-8">
      <AffiliateDisclosure variant="compact" className="mb-6" />
      {/* Hero */}
      <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">
          Evidence Guide
        </p>
        <h1 className="mt-3 text-3xl font-black leading-tight text-ink sm:text-5xl">
          Elderberry (<em>Sambucus nigra</em>)
        </h1>
        <p className="mt-1 text-base font-medium text-brand-700">
          Clinical Evidence for Colds and Flu, Plus the Safety You Need to Know
        </p>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">
          Meta-analyses of randomized trials suggest elderberry can reduce the duration and severity of upper
          respiratory symptoms — most consistently when supplementation begins at symptom onset. It is generally
          well tolerated when properly prepared, but raw or unripe berries and other plant parts can be toxic.
          This is not medical advice.
        </p>

        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
            <Image
              src="/images/guides/elderberry.jpg"
              alt="Dark purple elderberries with leaves and a jar of elderberry syrup"
              width={1536}
              height={1024}
              priority
              className="w-full h-auto"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            Elderberry (Sambucus nigra) — evidence, uses, and safety.
          </figcaption>
        </figure>
      </section>

      {/* Evidence */}
      <section id="research" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">What the Research Shows</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <EvidenceSummaryBox
            level="moderate"
            outcome="Duration & severity of URI symptoms"
            takeaway="Hawkins et al. (2019), a meta-analysis of RCTs, found elderberry significantly reduced duration and severity of upper respiratory symptoms versus placebo — more pronounced for influenza than the common cold."
            citationCount={3}
          />
          <EvidenceSummaryBox
            level="moderate"
            outcome="Influenza-type symptoms"
            takeaway="Harnett et al. (2020) concluded mono-herbal elderberry may reduce influenza-type symptoms (fever, headache, congestion), with overall evidence quality rated moderate."
            citationCount={1}
          />
          <EvidenceSummaryBox
            level="moderate"
            outcome="Treatment (symptom onset)"
            takeaway="Wieland et al. (2021) identified several trials showing reduced symptom duration when treatment began early in the illness course."
            citationCount={1}
          />
          <EvidenceSummaryBox
            level="limited"
            outcome="Prevention of infection"
            takeaway="Evidence for preventing colds or flu is weak and limited to one trial. Elderberry should not be relied on as a preventive and is no substitute for vaccination."
            citationCount={1}
          />
        </div>
      </section>

      {/* Mechanism */}
      <section id="mechanism" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">How It Works</h2>
        <MechanismBox
          summary="Elderberry's proposed benefits are attributed to its high anthocyanin and flavonoid content, which show antioxidant and immunomodulatory properties in laboratory studies. Human mechanistic data remain limited, and most clinical benefit is thought to come from mild antiviral plus immune-modulating effects."
          points={MECHANISM_POINTS}
        />
      </section>

      {/* Dosage */}
      <section id="dosage" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Dosage &amp; Forms</h2>
        <DosageBox
          rows={DOSAGE_ROWS}
          disclaimer="Follow product label instructions and begin at the first sign of symptoms. Higher doses are not proven more effective. General guidance, not medical advice."
        />
      </section>

      {/* Quality callout */}
      <section id="quality" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Quality Matters</h2>
        <p className="text-sm leading-6 text-muted">
          Elderberry is sold as a dietary supplement and is not subject to pre-market drug approval, so quality
          varies widely. Look for clear sourcing and processing information, standardization of anthocyanin
          content where stated, and third-party testing when available. Be aware that many products add other
          ingredients (echinacea, zinc, vitamin C) that can affect results.
        </p>
      </section>

      {/* Safety */}
      <section id="safety" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Safety &amp; Precautions</h2>
        <SafetyBox notes={SAFETY_NOTES} />
      </section>

      {/* Products */}
      {elderberryProducts && (
        <AffiliateProductBox
          slug="elderberry"
          products={elderberryProducts.products}
          heading="Elderberry Product Picks"
        />
      )}

      {elderberryProducts && (
      <>
        <References refs={ELDERBERRY_REFS} />
          <RecommendationSection products={elderberryProducts.products} />
      </>
      )}

      {/* FAQ */}
      <div id="faq" className="scroll-mt-20">
        <FAQAccordion faqs={FAQS} heading="Common Questions About Elderberry" />
      </div>

      <EmailCapture location="guides-elderberry" className="mt-6" />

      {/* Related */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-ink">Related Guides</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/guides/turmeric-curcumin" className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/20 hover:bg-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">Guide</p>
            <p className="mt-1 text-sm font-semibold text-ink">Turmeric &amp; Curcumin</p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">Anti-inflammatory evidence, bioavailability, and form comparison.</p>
          </Link>
          <Link href="/guides/passionflower" className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/20 hover:bg-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">Guide</p>
            <p className="mt-1 text-sm font-semibold text-ink">Passionflower</p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">Evidence for anxiety and sleep, with safety and dosing context.</p>
          </Link>
          <Link href="/herbs/" className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/20 hover:bg-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">Library</p>
            <p className="mt-1 text-sm font-semibold text-ink">Herb Library</p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">Browse full herb profiles with mechanism maps and safety data.</p>
          </Link>
        </div>
      </section>

      {/* Bottom nav */}
      <div className="flex flex-wrap gap-4 border-t border-brand-900/10 pt-6 text-sm">
        <Link href="/guides/" className="font-medium text-brand-700 hover:text-brand-800 hover:underline">← All Guides</Link>
        <Link href="/herbs/" className="font-medium text-brand-700 hover:text-brand-800 hover:underline">Herb Library →</Link>
      </div>
      </div>{/* end space-y-8 */}
    </ArticleLayout>
  )
}
