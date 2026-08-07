import type { Metadata } from 'next'
import Link from 'next/link'

import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import CitationReadySummary from '@/components/seo/CitationReadySummary'
import FAQSchema from '@/components/seo/FAQSchema'
import References from '@/components/References'
import AffiliateDisclosure from '../../../../components/AffiliateDisclosure'
import Disclaimer from '../../../../src/components/Disclaimer'

export const metadata: Metadata = buildPageMetadata({
  title: 'Coptis vs Goldenseal: Berberine-Rich Herbs Compared',
  description: 'Evidence-aware comparison of Coptis and Goldenseal, including shared berberine chemistry, safety, interactions, and practical differences.',
  path: '/guides/compare/coptis-vs-goldenseal/',
})

const REFS = [
  { n: 1, text: 'Song D, et al. (2020). Biological properties and clinical applications of berberine.', url: 'https://pubmed.ncbi.nlm.nih.gov/32335802/' },
  { n: 2, text: 'Cheng W, et al. (2023). Herb-drug interactions and their impact on pharmacokinetics: an update.', url: 'https://pubmed.ncbi.nlm.nih.gov/36650621/' },
  { n: 3, text: 'Asher GN, et al. (2017). Common herbal dietary supplement-drug interactions.', url: 'https://pubmed.ncbi.nlm.nih.gov/28762712/' },
  { n: 4, text: 'Cicero AFG, et al. (2016). Berberine and its role in chronic disease.', url: 'https://pubmed.ncbi.nlm.nih.gov/27671811/' },
]

const ROWS = [
  { dimension: 'Shared chemistry', coptis: 'Berberine and palmatine are prominent shared alkaloids; Coptis also commonly carries coptisine.', goldenseal: 'Berberine and palmatine overlap with Coptis; hydrastine is a distinguishing Goldenseal constituent.' },
  { dimension: 'Site evidence emphasis', coptis: 'Inflammatory and metabolic signaling, with berberine-centered mechanistic evidence.', goldenseal: 'Inflammatory signaling plus a particularly important herb-drug interaction burden.' },
  { dimension: 'Medication caution', coptis: 'High. Caution with antidiabetic medicines, CYP/P-gp substrates, anticoagulants, and immunosuppressants.', goldenseal: 'High. Goldenseal is especially notable for clinically relevant interaction concerns involving CYP/P-gp pathways.' },
  { dimension: 'Pregnancy / infants', coptis: 'Avoid medicinal use in pregnancy/breastfeeding and infants without specialist oversight.', goldenseal: 'Avoid in pregnancy/breastfeeding and infants; berberine-containing products raise bilirubin-risk concerns.' },
]

export default function CoptisVsGoldensealPage() {
  return (
    <div className="container-page space-y-10 py-10">
      <AuthorityJsonLd title="Coptis vs Goldenseal" description="Evidence-aware comparison of two berberine-rich botanicals." url="https://thehippiescientist.net/guides/compare/coptis-vs-goldenseal/" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Compare', href: '/guides/compare/' }, { label: 'Coptis vs Goldenseal' }]} />

      <section className="max-w-4xl space-y-5">
        <p className="eyebrow-label">Educational Comparison · Alkaloid Cluster</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">Coptis vs Goldenseal: Similar Berberine Chemistry, Different Botanical Profiles</h1>
        <p className="text-lg leading-8 text-muted">These herbs overlap strongly in berberine-family alkaloids, which is exactly why they should not be treated as interchangeable or casually stacked. The useful comparison is chemistry, interaction burden, and preparation—not which one is “stronger.”</p>
      </section>

      <CitationReadySummary
        answer="Coptis and Goldenseal are chemically related because both contain berberine-family alkaloids, including berberine and palmatine. Coptis also commonly includes coptisine, while Goldenseal is distinguished by hydrastine. Both deserve substantial medication-interaction caution."
        bestFor={[
          'Understanding how two berberine-rich herbs overlap chemically.',
          'Comparing interaction burden before choosing a botanical product.',
          'Avoiding the assumption that two herbs sharing berberine are equivalent preparations.',
        ]}
        evidenceLevel="The strongest shared evidence is constituent- and mechanism-centered rather than proof that either whole herb treats a specific disease."
        safetyNote="Both can carry meaningful drug-interaction concerns. Avoid medicinal use in pregnancy/breastfeeding and infants, and review use with a clinician or pharmacist when taking prescription medicines."
        notClaiming="This page is not claiming either herb treats infection, diabetes, inflammatory disease, or any other diagnosed condition."
        referencesHref="#references"
      />

      <section className="card-premium p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">Side by side</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead><tr className="border-b border-brand-900/10"><th className="py-3 pr-4">Dimension</th><th className="py-3 pr-4">Coptis</th><th className="py-3">Goldenseal</th></tr></thead>
            <tbody>{ROWS.map((row) => <tr key={row.dimension} className="border-b border-brand-900/5 align-top last:border-0"><td className="py-3 pr-4 font-semibold text-ink">{row.dimension}</td><td className="py-3 pr-4 text-muted">{row.coptis}</td><td className="py-3 text-muted">{row.goldenseal}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="card-premium space-y-4 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">The practical distinction</h2>
        <div className="space-y-4 text-sm leading-7 text-muted">
          <p><strong className="text-ink">Coptis</strong> is useful to think of as a berberine-rich rhizome with additional alkaloids such as coptisine. Its evidence base on this site is concentrated around berberine biology, inflammatory signaling, and metabolic pathways.<sup>[1][2]</sup></p>
          <p><strong className="text-ink">Goldenseal</strong> also contains berberine, but its constituent profile includes hydrastine and its interaction story is especially important. Reviews of herbal supplement-drug interactions repeatedly flag Goldenseal as a botanical that can materially alter drug metabolism.<sup>[3][4]</sup></p>
          <p>Because both share potentially active alkaloids, combining them can increase exposure without creating a clearly proven benefit. That makes “which preparation is appropriate?” a better question than “can I stack both?”</p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link href="/herbs/coptis/" className="card-premium p-5 font-semibold text-brand-800">Explore Coptis →</Link>
        <Link href="/herbs/goldenseal/" className="card-premium p-5 font-semibold text-brand-800">Explore Goldenseal →</Link>
      </section>

      <FAQSchema pagePath="/guides/compare/coptis-vs-goldenseal/" questions={[
        { question: 'Do Coptis and Goldenseal both contain berberine?', answer: 'Yes. Both are berberine-rich botanicals and also overlap in palmatine. Their complete constituent profiles differ, so they should not be treated as identical products.' },
        { question: 'Can Coptis and Goldenseal be taken together?', answer: 'There is not a strong evidence base showing that combining the two improves outcomes, while overlapping alkaloids may increase interaction or tolerability concerns. Medication review is especially important.' },
        { question: 'Which has more drug-interaction concern?', answer: 'Both deserve caution. Goldenseal is particularly well known for herb-drug interaction concerns involving drug-metabolizing pathways, while Coptis also carries cautions with antidiabetic medicines and CYP/P-gp substrates.' },
      ]} />

      <div className="space-y-3"><AffiliateDisclosure /><Disclaimer /></div>
      <References refs={REFS} />
    </div>
  )
}
