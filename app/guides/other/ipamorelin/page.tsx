import { buildPageMetadata } from '../../../../src/lib/seo'
import Image from 'next/image'
import type { Metadata } from 'next'
import Link from 'next/link'
import AffiliateDisclosure from '../../../../components/AffiliateDisclosure'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import References from '@/components/References'

export const metadata: Metadata = buildPageMetadata({
  title: 'Ipamorelin: Human Evidence, FDA Status, and Safety (2026)',
  description:
    'Evidence-first review of ipamorelin, including preclinical selectivity, human GH-release pharmacology, neutral phase 2 efficacy, FDA compounding safety concerns, and current regulatory status.',
  path: '/guides/other/ipamorelin/',
})

const HEADINGS: Heading[] = [
  { id: 'understanding', text: 'What Is Ipamorelin?', level: 2 },
  { id: 'evidence', text: 'What the Evidence Can Show', level: 2 },
  { id: 'legal', text: 'FDA & Compounding Status', level: 2 },
  { id: 'safety', text: 'Safety Uncertainty', level: 2 },
  { id: 'bottom-line', text: 'Bottom Line', level: 2 },
]

const IPAMORELIN_REFS = [
  {
    n: 1,
    text: 'FDA. Certain Bulk Drug Substances for Use in Compounding that May Present Significant Safety Risks. Current ipamorelin acetate entry.',
    url: 'https://www.fda.gov/drugs/human-drug-compounding/certain-bulk-drug-substances-use-compounding-may-present-significant-safety-risks',
  },
  {
    n: 2,
    text: 'FDA. Bulk Drug Substances Used in Compounding Under Section 503A of the FD&C Act. Current framework and rulemaking process.',
    url: 'https://www.fda.gov/drugs/human-drug-compounding/bulk-drug-substances-used-compounding-under-section-503a-fdc-act',
  },
  {
    n: 3,
    text: 'Raun K, et al. Ipamorelin, the first selective growth hormone secretagogue. Eur J Endocrinol. 1998. Preclinical rat and swine pharmacology. PMID 9849822.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/9849822/',
    pmid: '9849822',
  },
  {
    n: 4,
    text: 'Gobburu JV, et al. Pharmacokinetic-pharmacodynamic modeling of ipamorelin, a growth hormone releasing peptide, in human volunteers. Pharm Res. 1999. PMID 10496658.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/10496658/',
    pmid: '10496658',
  },
  {
    n: 5,
    text: 'Beck DE, et al. Prospective, randomized, controlled, proof-of-concept study of the ghrelin mimetic ipamorelin for postoperative ileus in bowel resection patients. Int J Colorectal Dis. 2014. PMID 25331030.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/25331030/',
    pmid: '25331030',
  },
]

export default function Page() {
  const toc = <TableOfContents headings={HEADINGS} />
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Guides', href: '/guides' },
    { label: 'Ipamorelin: Human Evidence, FDA Status, and Safety' },
  ]

  return (
    <ArticleLayout toc={toc} zone="harm-reduction">
      <div className="space-y-8">
        <AuthorityBreadcrumbs items={breadcrumbs} />

        <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
          <p className="eyebrow-label">Experimental peptide · Reviewed August 16, 2026</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">Ipamorelin: Human Evidence, FDA Status, and Safety</h1>
          <p className="detail-reading mt-4 text-muted">
            Ipamorelin has real human growth-hormone pharmacology, but the evidence is far narrower than the anti-aging, recovery, sleep, or body-composition claims used to market it. One commonly cited “selectivity” paper is preclinical, not human.
          </p>
          <figure className="mt-6">
            <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
              <Image
                src="/images/guides/ipamorelin.jpg"
                alt="A research peptide vial with a sterile syringe on a clinical surface"
                width={1536}
                height={1024}
                priority
                className="h-auto w-full"
              />
            </div>
            <figcaption className="mt-3 text-center text-sm text-muted">
              Human GH-release pharmacology exists; broad wellness benefit and long-term safety are not established.
            </figcaption>
          </figure>
        </section>

        <section className="rounded-2xl border border-rose-900/15 bg-rose-50/80 p-5 text-sm leading-6 text-rose-950">
          <p className="font-semibold">Unapproved-drug notice</p>
          <p className="mt-2">
            Ipamorelin is not an FDA-approved finished drug product. Clinic availability, a compounded preparation, or “research use only” labeling does not establish FDA approval, broad clinical effectiveness, product quality, or long-term safety [1,2].
          </p>
        </section>

        <AffiliateDisclosure />

        <section className="prose-section space-y-6">
          <div id="understanding" className="scroll-mt-20">
            <h2 className="mb-4 mt-8 text-2xl font-semibold text-ink">What Is Ipamorelin?</h2>
            <p className="text-muted leading-relaxed">
              Ipamorelin is a synthetic ghrelin-receptor agonist and growth-hormone secretagogue. Its early selectivity reputation came from preclinical experiments in rat pituitary cells, rats, and swine—not from a broad human safety program [3]. Human volunteer data later confirmed that ipamorelin can produce an episodic GH response after intravenous administration [4].
            </p>
          </div>

          <div id="evidence" className="scroll-mt-20 space-y-4">
            <h2 className="mb-4 mt-8 text-2xl font-semibold text-ink">What the Evidence Can Show</h2>
            <div className="overflow-x-auto rounded-2xl border border-brand-900/10">
              <table id="ipamorelin-evidence-table" data-answer-engine-table className="w-full min-w-[860px] text-left text-sm">
                <caption className="sr-only">Ipamorelin evidence by study type and conclusion</caption>
                <thead className="bg-brand-50/70 text-ink">
                  <tr>
                    <th scope="col" className="p-3">Question</th>
                    <th scope="col" className="p-3">Best current evidence</th>
                    <th scope="col" className="p-3">What it supports</th>
                    <th scope="col" className="p-3">Main boundary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-900/10 text-muted">
                  <tr>
                    <th scope="row" className="p-3 font-semibold text-ink">Is ipamorelin selectively GH-releasing?</th>
                    <td className="p-3">Rat/swine pharmacology [3]</td>
                    <td className="p-3">Preclinical mechanism/selectivity signal</td>
                    <td className="p-3">Not a human safety conclusion</td>
                  </tr>
                  <tr>
                    <th scope="row" className="p-3 font-semibold text-ink">Does ipamorelin raise GH in humans?</th>
                    <td className="p-3">Human PK/PD dose-escalation study [4]</td>
                    <td className="p-3">Episodic GH release and pharmacokinetic characterization</td>
                    <td className="p-3">Does not establish recovery, sleep, anti-aging, or physique benefit</td>
                  </tr>
                  <tr>
                    <th scope="row" className="p-3 font-semibold text-ink">Has a controlled clinical outcome trial been done?</th>
                    <td className="p-3">Randomized placebo-controlled phase 2 postoperative-ileus trial [5]</td>
                    <td className="p-3">Direct patient-outcome evidence exists</td>
                    <td className="p-3">Key and secondary efficacy outcomes were not significantly different from placebo</td>
                  </tr>
                  <tr>
                    <th scope="row" className="p-3 font-semibold text-ink">Are CJC-1295 + ipamorelin stacks validated?</th>
                    <td className="p-3">No robust replicated controlled outcome program identified</td>
                    <td className="p-3">Mechanistic rationale only</td>
                    <td className="p-3">Not an established combination therapy</td>
                  </tr>
                  <tr>
                    <th scope="row" className="p-3 font-semibold text-ink">Are broad wellness outcomes proven?</th>
                    <td className="p-3">Evidence gap</td>
                    <td className="p-3">No reliable conclusion</td>
                    <td className="p-3">Marketing claims substantially outrun direct human outcomes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div id="legal" className="scroll-mt-20">
            <h2 className="mb-4 mt-8 text-2xl font-semibold text-ink">FDA &amp; Compounding Status — Checked August 16, 2026</h2>
            <p className="text-muted leading-relaxed">
              Ipamorelin is not FDA-approved as a finished drug product. FDA's current significant-safety-risk page lists <strong>ipamorelin acetate in category 2 under the 503B interim policy</strong> and also includes it in the withdrawn-nomination section [1].
            </p>
            <p className="text-muted leading-relaxed">
              FDA's compounding categories and bulks-list decisions are specific regulatory processes. A clinic offering, prescription, compounded vial, or peptide-market listing should not be translated into a claim that ipamorelin is FDA-approved or broadly authorized for human use [1,2].
            </p>
          </div>

          <div id="safety" className="scroll-mt-20">
            <h2 className="mb-4 mt-8 text-2xl font-semibold text-ink">Safety Uncertainty</h2>
            <ul className="list-disc space-y-2 pl-5 text-muted leading-relaxed">
              <li>FDA flags potential immunogenicity, aggregation, peptide-impurity, and characterization concerns for compounded ipamorelin acetate [1].</li>
              <li>FDA reports serious adverse events, including death, in an intravenous ipamorelin study conducted for gastric-motility purposes. FDA separately states that safety information is lacking for certain other injectable routes [1].</li>
              <li>The published 2014 randomized postoperative-ileus trial reported short-term tolerability but did not show a significant efficacy advantage over placebo; that trial should not be used to establish long-term safety or broad wellness benefit [5].</li>
              <li>The preclinical selectivity paper cannot be converted into a blanket statement that ipamorelin is a “clean” or low-risk secretagogue in humans [3].</li>
            </ul>
          </div>

          <div id="bottom-line" className="scroll-mt-20">
            <h2 className="mb-4 mt-8 text-2xl font-semibold text-ink">Bottom Line</h2>
            <p className="text-muted leading-relaxed">
              Ipamorelin can trigger GH release in humans, but the evidence does not establish the broad anti-aging, recovery, sleep, fat-loss, or physique outcomes commonly marketed. Its classic selectivity study is preclinical, the available controlled clinical trial was neutral on efficacy, and FDA continues to flag important compounding safety uncertainties.
            </p>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/guides/" className="text-sm font-medium text-emerald-700 hover:underline">Back to guides &rarr;</Link>
          <Link href="/compounds/ipamorelin/" className="text-sm font-medium text-emerald-700 hover:underline">View Ipamorelin compound profile &rarr;</Link>
          <Link href="/guides/other/cjc-1295/" className="text-sm font-medium text-emerald-700 hover:underline">Read the CJC-1295 guide &rarr;</Link>
        </div>
      </div>
      <References refs={IPAMORELIN_REFS} />
    </ArticleLayout>
  )
}
