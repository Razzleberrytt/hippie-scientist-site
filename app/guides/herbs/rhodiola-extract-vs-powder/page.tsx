import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import StructuredData from '@/components/StructuredData'
import FAQAccordion from '@/components/FAQAccordion'
import EvidenceSummaryBox from '@/components/EvidenceSummaryBox'
import DosageBox from '@/components/DosageBox'
import ComparisonTable from '@/components/ComparisonTable'
import AffiliateProductBox from '@/components/AffiliateProductBox'
import { getRevenueProductSet } from '@/config/revenue-products'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import EmailCapture from '@/components/EmailCapture'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import References from '@/components/References'

const SLUG = 'rhodiola-extract-vs-powder'
const PAGE_URL = 'https://thehippiescientist.net/guides/herbs/rhodiola-extract-vs-powder'
const TITLE = 'Rhodiola Extract vs Powder: What Human Studies Actually Tested'
const DESCRIPTION =
  'Compare rhodiola extract with root powder: what human studies actually tested, what standardization can and cannot tell you, current EMA context, safety, and evidence gaps.'
const DATE_PUBLISHED = '2024-06-09'
const DATE_MODIFIED = '2026-08-11'

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/guides/herbs/${SLUG}`,
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'Can I mix rhodiola extract and powder?',
    answer:
      'There is no established clinical advantage to combining them. Mixing forms also makes it harder to compare your product with a study because extracts and powders are not interchangeable by milligram weight.',
  },
  {
    question: 'Is a generic rhodiola capsule the same as SHR-5?',
    answer:
      'No. SHR-5 is a specific proprietary extract used in several clinical trials. A generic capsule may use a different extraction process, plant material, or marker specification, so results from SHR-5 cannot simply be transferred to every rhodiola product.',
  },
  {
    question: 'Why does powder have so little research?',
    answer:
      'Clinical studies often use characterized extracts because the tested intervention is easier to define and reproduce. The human outcome studies reviewed for this page largely evaluated named or standardized extracts, leaving direct evidence for retail whole-root powder sparse.',
  },
  {
    question: 'Does a standardized extract work better than powder?',
    answer:
      'That has not been established in head-to-head clinical trials. Standardization can make a product easier to characterize and compare with a study, but it does not prove that the extract is clinically superior to whole-root powder.',
  },
  {
    question: 'Does the whole herb have benefits that extracts miss?',
    answer:
      'Whole-root powder retains the ground plant material, but direct trials have not shown that this produces better clinical outcomes than an extract. A whole-herb preference is a product preference, not a demonstrated efficacy advantage.',
  },
]

const COMPARISON_HEADERS = ['Feature', 'Characterized Extract', 'Root Powder']
const COMPARISON_ROWS = [
  { attribute: 'Product definition', values: ['May declare extract ratio or marker compounds', 'Ground root/rhizome with natural batch variation'] },
  { attribute: 'Human evidence', values: ['Several named extracts studied; overall evidence remains limited', 'Little direct outcome evidence located'] },
  { attribute: 'Dose comparison', values: ['Compare only with the specific extract studied', 'No reliable milligram-for-milligram conversion from extract trials'] },
  { attribute: 'What the form tells you', values: ['Potentially better traceability to a specific study intervention', 'A whole-root format'] },
  { attribute: 'What the form does not prove', values: ['Clinical effectiveness or equivalence to another extract', 'Clinical superiority or inferiority to an extract'] },
]

const DOSAGE_ROWS = [
  { form: 'SHR-5 extract', range: 'Study-specific', notes: 'Trials used specific SHR-5 regimens; those amounts do not automatically apply to another extract' },
  { form: 'Other characterized extracts', range: 'Study-specific', notes: 'Check the exact extract, preparation, and study before comparing milligram amounts' },
  { form: 'Root powder', range: 'No evidence-based equivalent', notes: 'Do not convert an extract trial dose to powder from capsule weight alone' },
]

const HEADINGS: Heading[] = [
  { id: 'comparison', text: 'Quick Comparison', level: 2 },
  { id: 'research', text: 'What the Research Actually Used', level: 2 },
  { id: 'dosage', text: 'How Trial Doses Translate', level: 2 },
  { id: 'quality', text: 'How to Read a Rhodiola Label', level: 2 },
  { id: 'safety', text: 'Safety Considerations', level: 2 },
  { id: 'faq', text: 'Common Questions', level: 2 },
]

const RHODIOLA_EXTRACT_VS_POWDER_REFS = [
  { n: 1, text: 'Panossian A, et al. (2010). Rhodiola rosea: traditional use, composition, and clinical trials. Phytomedicine, 17(7): 481-493.', url: 'https://pubmed.ncbi.nlm.nih.gov/20378318/' },
  { n: 2, text: 'Olsson EM, et al. (2009). Rhodiola rosea for stress-related fatigue. Planta Med, 75(2): 105-112.', url: 'https://pubmed.ncbi.nlm.nih.gov/19016404/' },
  { n: 3, text: 'Darbinyan V, et al. (2000). Rhodiola rosea in stress-induced fatigue. Phytomedicine, 7(5): 365-371.', url: 'https://pubmed.ncbi.nlm.nih.gov/11081987/' },
  { n: 4, text: 'Ishaque S, et al. (2012). Rhodiola rosea for physical and mental fatigue: a systematic review. BMC Complement Altern Med, 12:70.', url: 'https://pubmed.ncbi.nlm.nih.gov/22643043/' },
  { n: 5, text: 'Duncan J, et al. (2014). Rhodiola rosea for mental and physical fatigue in nursing students: a randomized controlled trial. PLoS One, 9(9):e108416.', url: 'https://pubmed.ncbi.nlm.nih.gov/25268730/' },
  { n: 6, text: 'European Medicines Agency. Rhodiola rosea L., rhizoma et radix: European Union herbal monograph and public assessment summary, revision 1 (updated 2024).', url: 'https://www.ema.europa.eu/en/medicines/herbal/rhodiolae-roseae-rhizoma-et-radix' },
  { n: 7, text: 'National Center for Complementary and Integrative Health. Rhodiola: usefulness and safety.', url: 'https://www.nccih.nih.gov/health/rhodiola' },
]

export default function RhodiolaExtractVsPowderGuidePage() {
  const rhodiolaProductSet = getRevenueProductSet('rhodiola')
  const rhodiolaProducts = rhodiolaProductSet?.products.filter((product) => Boolean(product.asin)) ?? []
  const toc = <TableOfContents headings={HEADINGS} />

  return (
    <ArticleLayout toc={toc} zone="supplement">
      <div className="space-y-8">
        <AffiliateDisclosure variant="compact" className="mb-6" />
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
            { label: 'Rhodiola Extract vs Powder', href: `/guides/herbs/${SLUG}` },
          ]}
        />

        <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">
            Evidence Guide · Rhodiola Hub
          </p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-ink sm:text-5xl">
            Rhodiola Extract vs Powder
          </h1>
          <p className="mt-1 text-base font-medium text-brand-700">
            What Human Studies Tested — and What Form Alone Cannot Tell You
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">
            Human studies have mostly evaluated named or characterized rhodiola extracts rather than retail
            root powder. That makes some extracts easier to compare with the research, but it does not establish
            that extracts work better than powder—and the overall clinical evidence for rhodiola remains limited.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.14em]">
            <Link href="/guides/herbs/rhodiola-complete-guide/" className="text-brand-700 hover:text-brand-800 hover:underline">
              Complete Rhodiola Guide →
            </Link>
            <Link href="/herbs/rhodiola/" className="text-brand-700 hover:text-brand-800 hover:underline">
              Rhodiola Herb Profile →
            </Link>
          </div>

          <figure className="mt-6">
            <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
              <Image
                src="/images/guides/rhodiola-extract-vs-powder.jpg"
                alt="Rhodiola extract capsules next to raw rhodiola root powder"
                width={1536}
                height={1024}
                priority
                className="h-auto w-full"
              />
            </div>
            <figcaption className="mt-3 text-center text-sm text-muted">
              Extract and powder are different preparations; the label matters more than capsule weight alone.
            </figcaption>
          </figure>
        </section>

        <section id="comparison" className="scroll-mt-20 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Quick Comparison</h2>
          <div className="rounded-xl border border-emerald-200/50 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-950">
            <strong className="font-semibold">Bottom line: </strong>
            A characterized extract may let you match a product more closely to a clinical study. That is a
            traceability advantage, not proof that extracts are more effective than powder. Direct head-to-head
            evidence establishing superiority of either form is lacking.
          </div>
          <ComparisonTable headers={COMPARISON_HEADERS} rows={COMPARISON_ROWS} />
        </section>

        <section id="research" className="scroll-mt-20 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">What the Research Actually Used</h2>
          <p className="text-sm leading-6 text-muted">
            The human trials are not interchangeable. Their participants, preparations, comparators, durations,
            and outcomes differ enough that a positive result should stay attached to the exact intervention studied.
          </p>
          <ul className="space-y-3 text-sm leading-6 text-muted">
            <li>
              <strong className="text-ink">Stress-related fatigue:</strong> a 2009 randomized double-blind trial
              enrolled 60 adults ages 20–55 who met Swedish criteria for fatigue syndrome. Thirty received the
              proprietary SHR-5 extract at 576 mg/day and 30 received placebo for 28 days. Some fatigue, attention,
              and cortisol outcomes favored SHR-5, while several symptom measures improved in both groups.
            </li>
            <li>
              <strong className="text-ink">Night-duty physicians:</strong> a 2000 double-blind crossover trial
              studied 56 young, healthy physicians during night shifts. Participants used a repeated low-dose SHR-5
              regimen for a two-week treatment period versus placebo, with a washout and crossover; the primary
              signal was improved performance on a composite of mental-fatigue tests during the first treatment period.
            </li>
            <li>
              <strong className="text-ink">Shift-work nursing students:</strong> a later randomized placebo-controlled
              trial enrolled 48 nursing students ages 18–55. The rhodiola group used 364 mg at the start of the wakeful
              period, with up to one additional capsule within four hours, for 42 days. On the study&apos;s fatigue outcomes,
              the placebo group did better—an important reminder that the clinical literature is not uniformly positive.
            </li>
          </ul>
          <p className="text-sm leading-6 text-muted">
            The European Medicines Agency&apos;s current assessment is an important reality check: its conclusion
            for temporary relief of stress symptoms such as fatigue and weakness is based on long-standing
            traditional use, not sufficient clinical-trial evidence. The agency notes that the clinical studies
            it reviewed were small and had several shortcomings.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <EvidenceSummaryBox
              level="limited"
              outcome="Named or characterized extracts"
              takeaway="Specific extracts have been tested in small human trials, but the broader evidence base is not strong enough to treat standardization as proof of clinical effectiveness. Results apply most directly to the preparation studied."
              citationCount={6}
            />
            <EvidenceSummaryBox
              level="limited"
              outcome="Retail whole-root powder"
              takeaway="Direct human outcome evidence for retail whole-root powder was not identified in the sources reviewed for this page. That is an evidence gap, not evidence that powder is ineffective."
              citationCount={0}
            />
          </div>
        </section>

        <section id="dosage" className="scroll-mt-20 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">How Trial Doses Translate</h2>
          <DosageBox
            rows={DOSAGE_ROWS}
            disclaimer="Rhodiola preparations are not interchangeable by milligram weight. Trial amounts describe the exact preparation studied; they are not a universal rhodiola dose or personal treatment recommendation."
          />
        </section>

        <section id="quality" className="scroll-mt-20 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">How to Read a Rhodiola Label</h2>
          <ul className="space-y-2 text-sm leading-6 text-muted">
            <li><strong className="text-ink">Confirm the botanical and plant part</strong> — look for <em>Rhodiola rosea</em> root/rhizome rather than an unspecified rhodiola species.</li>
            <li><strong className="text-ink">Read the preparation details</strong> — an extract ratio, solvent, or declared marker compounds can make the product easier to characterize.</li>
            <li><strong className="text-ink">Look for transparent testing</strong> — credible independent certification or a lot-specific certificate of analysis can support identity and contaminant checks.</li>
            <li><strong className="text-ink">Be cautious with proprietary blends</strong> — they can make it impossible to determine how much rhodiola a serving actually contains.</li>
          </ul>
          <div className="rounded-xl border border-emerald-200/50 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-950">
            <strong className="font-semibold">What a better label gives you: </strong>
            more information about what is in the product and whether it resembles a studied preparation. It
            does not, by itself, demonstrate that the product will produce a clinical benefit.
          </div>
        </section>

        <div id="safety" className="scroll-mt-20">
          <SafetyNotice title="Rhodiola safety and interaction checks">
            <ul className="list-disc space-y-2 pl-5">
              <li>NCCIH describes rhodiola as possibly safe for up to 12 weeks; longer-term safety remains uncertain.</li>
              <li>Reported effects can include dizziness, headache, insomnia, and dry mouth or excess saliva.</li>
              <li>Ask a clinician or pharmacist before combining rhodiola with prescription medicines; supplement-drug interaction data are incomplete.</li>
              <li>Pregnancy and breastfeeding safety data are insufficient. Persistent fatigue, mood, or sleep symptoms deserve evaluation rather than self-treatment with a supplement.</li>
            </ul>
          </SafetyNotice>
        </div>

        {rhodiolaProducts.length > 0 && (
          <AffiliateProductBox
            slug="rhodiola"
            products={rhodiolaProducts}
            heading="Rhodiola Products with Direct Listings to Compare"
          />
        )}

        <References refs={RHODIOLA_EXTRACT_VS_POWDER_REFS} />

        <div id="faq" className="scroll-mt-20">
          <FAQAccordion faqs={FAQS} heading="Common Questions About Rhodiola Forms" />
        </div>

        <EmailCapture location="guides-rhodiola-extract-vs-powder" className="mt-6" />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-ink">More in the Rhodiola Hub</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link href="/guides/herbs/rhodiola-complete-guide/" className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/20 hover:bg-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">Pillar Guide</p>
              <p className="mt-1 text-sm font-semibold text-ink">Complete Rhodiola Guide</p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">Forms, claimed benefits, study context, and safety in one place.</p>
            </Link>
            <Link href="/guides/herbs/rhodiola-energy/" className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/20 hover:bg-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">Guide</p>
              <p className="mt-1 text-sm font-semibold text-ink">Rhodiola for Energy</p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">What human studies say about fatigue, stress, and performance.</p>
            </Link>
            <Link href="/guides/sleep/rhodiola-sleep-stack/" className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/20 hover:bg-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">Stack Guide</p>
              <p className="mt-1 text-sm font-semibold text-ink">Rhodiola + Magnesium for Sleep</p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">Evidence and safety context for a commonly discussed combination.</p>
            </Link>
          </div>
        </section>

        <div className="flex flex-wrap gap-4 border-t border-brand-900/10 pt-6 text-sm">
          <Link href="/guides/" className="font-medium text-brand-700 hover:text-brand-800 hover:underline">← All Guides</Link>
          <Link href="/herbs/" className="font-medium text-brand-700 hover:text-brand-800 hover:underline">Herb Library →</Link>
        </div>
      </div>
    </ArticleLayout>
  )
}
