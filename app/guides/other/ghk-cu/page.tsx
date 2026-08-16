import { buildPageMetadata } from '../../../../src/lib/seo'
import Image from 'next/image'
import type { Metadata } from 'next'
import Link from 'next/link'
import AffiliateDisclosure from '../../../../components/AffiliateDisclosure'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import LegacyGuideFAQ from '@/components/LegacyGuideFAQ'
import LegacyGuideQuickAnswer from '@/components/LegacyGuideQuickAnswer'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import References from '@/components/References'

export const metadata: Metadata = buildPageMetadata({
  title: 'GHK-Cu (Copper Peptide): Topical, Hair & Injectable Evidence (2026)',
  description:
    'Evidence-first GHK-Cu review separating topical cosmetic studies, hair-combination research, wound-healing mechanisms, and non-approved injectable use.',
  path: '/guides/other/ghk-cu/',
})

const FAQS = [
  {
    question: 'Is GHK-Cu proven to reverse skin aging?',
    answer:
      'No. GHK-Cu has plausible fibroblast and extracellular-matrix biology and some human cosmetic studies, but the direct clinical literature is small and formulation-specific. A tiny randomized post-laser study, for example, does not establish that every copper-peptide serum reverses skin aging.',
  },
  {
    question: 'Does GHK-Cu regrow hair?',
    answer:
      'Human hair studies often test combination products rather than isolated GHK-Cu. Positive results from a formulation containing GHK plus 5-aminolevulinic acid, or from multi-ingredient injection/tattooing regimens, cannot be transferred automatically to a standalone copper-peptide product.',
  },
  {
    question: 'Is injectable GHK-Cu FDA-approved?',
    answer:
      'No. FDA currently lists GHK-Cu for injectable routes among withdrawn compounding nominations that may present significant safety risks. FDA cites potential immunogenicity and peptide-related impurity concerns and says human safety data are limited.',
  },
  {
    question: 'Does wound-healing research prove injectable GHK-Cu helps injuries?',
    answer:
      'No. Much of the wound-healing literature is cell, ex vivo, animal, or biomaterial research. That supports biological plausibility but does not establish a safe or effective systemic or injectable treatment for human injuries.',
  },
] as const

const GHK_CU_REFS = [
  {
    n: 1,
    text: 'Pickart L, Margolina A. Regenerative and protective actions of the GHK-Cu peptide. Int J Mol Sci. 2018;19(7):1987. PMID 29986401.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/29986401/',
  },
  {
    n: 2,
    text: 'Miller TA, et al. Effects of topical copper tripeptide complex on CO2 laser-resurfaced skin. Arch Facial Plast Surg. 2006;8(4):252-259. PMID 16847171.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/16847171/',
  },
  {
    n: 3,
    text: 'Lee SH, et al. Efficacy of a complex of 5-aminolevulinic acid and glycyl-histidyl-lysine peptide on hair growth. Ann Dermatol. 2016. PMID 27489425.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/27489425/',
  },
  {
    n: 4,
    text: 'Maquart FX, et al. Stimulation of collagen synthesis in fibroblast cultures by the tripeptide-copper complex GHK-Cu. FEBS Lett. 1988. PMID 3169264.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/3169264/',
  },
  {
    n: 5,
    text: 'Maquart FX, et al. Stimulation of sulfated glycosaminoglycan synthesis by GHK-Cu in normal human fibroblasts. FEBS Lett. 1992. PMID 1522753.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/1522753/',
  },
  {
    n: 6,
    text: 'U.S. Food and Drug Administration. Certain Bulk Drug Substances for Use in Compounding that May Present Significant Safety Risks — GHK-Cu (injectable routes).',
    url: 'https://www.fda.gov/drugs/human-drug-compounding/certain-bulk-drug-substances-use-compounding-may-present-significant-safety-risks',
  },
]

const HEADINGS: Heading[] = [
  { id: 'evidence-map', text: 'Evidence by Route and Formulation', level: 2 },
  { id: 'mechanism', text: 'Mechanism Is Not a Clinical Outcome', level: 2 },
  { id: 'regulatory', text: 'Injectable Regulatory Status', level: 2 },
  { id: 'safety', text: 'Safety Boundaries', level: 2 },
  { id: 'bottom-line', text: 'Bottom Line', level: 2 },
]

export default function Page() {
  const toc = <TableOfContents headings={HEADINGS} />

  return (
    <ArticleLayout toc={toc}>
      <div className="space-y-8">
        <AuthorityJsonLd
          title="GHK-Cu (Copper Peptide): Topical, Hair and Injectable Evidence"
          description="Evidence-first review separating topical cosmetic studies, combination hair research, wound-healing mechanisms and non-approved injectable GHK-Cu."
          url="https://thehippiescientist.net/guides/other/ghk-cu/"
          type="MedicalWebPage"
          citationUrls={GHK_CU_REFS.map((ref) => ref.url)}
        />
        <AuthorityBreadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Guides', href: '/guides/' },
            { label: 'GHK-Cu' },
          ]}
        />

        <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
          <p className="eyebrow-label">Peptide Evidence Review · Updated August 16, 2026</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">GHK-Cu: Route, Formulation, and Outcome Matter More Than the Peptide Name</h1>
          <p className="detail-reading mt-4 text-muted">
            GHK-Cu has real biological activity and some human cosmetic research, but the evidence is routinely overgeneralized. Topical cosmetic studies, combination hair products, cell-based wound-healing mechanisms, and injectable peptide use are four different evidence questions. They should not inherit one another's conclusions.
          </p>
          <figure className="mt-6">
            <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
              <Image src="/images/guides/ghk-cu.jpg" alt="Copper peptide research vial on a clinical surface" width={1536} height={1024} priority className="h-auto w-full" />
            </div>
            <figcaption className="mt-3 text-center text-sm text-muted">A copper-peptide mechanism is not the same thing as a validated injectable treatment.</figcaption>
          </figure>
        </section>

        <LegacyGuideQuickAnswer referencesHref="#references">
          <p>
            GHK-Cu has plausible collagen/extracellular-matrix biology and limited human cosmetic evidence [1,2,4,5]. Hair findings are often from combination formulations rather than isolated GHK-Cu [3]. Human evidence for systemic or injectable use is much thinner, and FDA currently flags injectable GHK-Cu as a withdrawn compounding nomination with potential immunogenicity and peptide-impurity concerns plus limited human safety data [6]. Do not transfer a topical or combination-product result into a systemic-regeneration claim.
          </p>
        </LegacyGuideQuickAnswer>

        <AffiliateDisclosure />

        <section id="evidence-map" data-answer-engine-table="true" className="max-w-5xl space-y-4 scroll-mt-24">
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Evidence by route and formulation</h2>
          <div className="overflow-x-auto rounded-2xl border border-brand-900/10 bg-white/90 dark:border-white/10 dark:bg-white/5">
            <table className="min-w-[860px] w-full text-left text-sm">
              <caption className="sr-only">GHK-Cu evidence by route, formulation, endpoint, and limitation</caption>
              <thead>
                <tr className="border-b border-brand-900/10 text-ink">
                  <th scope="col" className="p-4">Evidence lane</th>
                  <th scope="col" className="p-4">What was studied</th>
                  <th scope="col" className="p-4">What it can support</th>
                  <th scope="col" className="p-4">What it cannot prove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-900/10 text-muted">
                <tr>
                  <th scope="row" className="p-4 font-semibold text-ink">Topical cosmetic</th>
                  <td className="p-4">Small human studies of copper-tripeptide-containing regimens [2]</td>
                  <td className="p-4">Some formulation-specific cosmetic signal</td>
                  <td className="p-4">That every GHK-Cu serum reverses skin aging</td>
                </tr>
                <tr>
                  <th scope="row" className="p-4 font-semibold text-ink">Hair</th>
                  <td className="p-4">Combination products, including 5-ALA + GHK [3]</td>
                  <td className="p-4">That the tested combination produced a signal</td>
                  <td className="p-4">That isolated GHK-Cu is an established hair-loss treatment</td>
                </tr>
                <tr>
                  <th scope="row" className="p-4 font-semibold text-ink">Wound biology</th>
                  <td className="p-4">Fibroblasts, extracellular-matrix assays, animal/biomaterial models [1,4,5]</td>
                  <td className="p-4">Mechanistic plausibility</td>
                  <td className="p-4">A validated human injectable wound-healing protocol</td>
                </tr>
                <tr>
                  <th scope="row" className="p-4 font-semibold text-ink">Injectable/systemic</th>
                  <td className="p-4">Limited human exposure/safety information; FDA compounding review [6]</td>
                  <td className="p-4">Regulatory and safety uncertainty</td>
                  <td className="p-4">Anti-aging, injury-repair, or systemic-regeneration efficacy</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="mechanism" className="card-premium max-w-4xl space-y-4 p-6 scroll-mt-24">
          <h2 className="text-2xl font-semibold text-ink">Mechanism is not a clinical outcome</h2>
          <p className="text-sm leading-7 text-muted">
            GHK-Cu can influence collagen and glycosaminoglycan synthesis in cultured human fibroblasts [4,5]. Those experiments are useful for understanding why the peptide is interesting. They do not establish that raising exposure in a person improves wrinkles, hair density, injury recovery, longevity, or whole-body tissue regeneration.
          </p>
          <p className="text-sm leading-7 text-muted">
            The safest translation rule is simple: <strong>cell signal → plausible mechanism; human controlled outcome → clinical evidence.</strong> One should not be labeled as the other.
          </p>
        </section>

        <section id="regulatory" className="card-premium max-w-4xl space-y-4 border-l-4 border-amber-500 bg-amber-50/40 p-6 scroll-mt-24">
          <h2 className="text-2xl font-semibold text-ink">Injectable regulatory status</h2>
          <p className="text-sm leading-7 text-muted">
            FDA currently lists <strong>GHK-Cu for injectable routes</strong> among bulk substances whose compounding nominations were withdrawn and that may present significant safety risks [6]. FDA specifically cites potential immunogenicity from aggregation or peptide-related impurities and says human safety information is limited.
          </p>
          <p className="text-sm leading-7 text-muted">
            That status is not FDA drug approval, not a clinical endorsement, and not evidence that an injectable product sold online is safe, sterile, correctly characterized, or effective.
          </p>
        </section>

        <section id="safety" className="card-premium max-w-4xl space-y-4 p-6 scroll-mt-24">
          <h2 className="text-2xl font-semibold text-ink">Safety boundaries</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-muted">
            <li>Topical cosmetic exposure and injectable systemic exposure are not interchangeable safety questions.</li>
            <li>Combination-product studies cannot identify which ingredient caused an effect or adverse event unless the design isolates it.</li>
            <li>Systemic copper handling matters clinically; people with disorders of copper metabolism should not infer safety from topical cosmetic use.</li>
            <li>Research-use-only or compounding-market availability is not evidence of FDA approval or validated medical benefit.</li>
          </ul>
        </section>

        <section id="bottom-line" className="card-premium max-w-4xl space-y-4 p-6 scroll-mt-24">
          <h2 className="text-2xl font-semibold text-ink">Bottom line</h2>
          <p className="text-sm leading-7 text-muted">
            GHK-Cu is scientifically interesting and has more human cosmetic context than many experimental peptides, but the evidence is still narrower than the marketing. Topical cosmetic findings are formulation-specific; hair studies often involve combinations; wound-healing biology is largely preclinical; and injectable/systemic use remains non-approved with limited human safety information and active FDA concern [6].
          </p>
        </section>

        <LegacyGuideFAQ questions={[...FAQS]} pagePath="/guides/other/ghk-cu/" referencesHref="#references" />

        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/guides/" className="text-sm font-medium text-emerald-700 hover:underline">Back to guides →</Link>
          <Link href="/compounds/ghk-cu/" className="text-sm font-medium text-emerald-700 hover:underline">View GHK-Cu compound profile →</Link>
        </div>
      </div>
      <div id="references" className="scroll-mt-24">
        <References refs={GHK_CU_REFS} />
      </div>
    </ArticleLayout>
  )
}
