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
  title: 'Oregano vs Thyme: Essential-Oil Chemistry Compared',
  description: 'Evidence-aware comparison of oregano and thyme, including thymol/carvacrol chemistry, culinary vs concentrated preparations, and safety differences.',
  path: '/guides/compare/oregano-vs-thyme/',
})

const REFS = [
  { n: 1, text: 'Sakkas H, et al. (2017). Antimicrobial activity of basil, oregano, and thyme essential oils.', url: 'https://pubmed.ncbi.nlm.nih.gov/27994215/' },
  { n: 2, text: 'Salehi B, et al. (2018). Thymol, thyme, and other plant sources: health and potential uses.', url: 'https://pubmed.ncbi.nlm.nih.gov/29785774/' },
  { n: 3, text: 'Kowalczyk A, et al. (2020). Thymol and thyme essential oil—new insights into selected therapeutic applications.', url: 'https://pubmed.ncbi.nlm.nih.gov/32917001/' },
]

const ROWS = [
  { dimension: 'Shared chemistry', oregano: 'Often rich in carvacrol and may contain substantial thymol depending on chemotype.', thyme: 'Often thymol-forward, though composition varies by species and chemotype.' },
  { dimension: 'Everyday use', oregano: 'Common culinary herb; concentrated oregano oil is a very different exposure from food use.', thyme: 'Common culinary herb and tea ingredient; essential oil is far more concentrated than food use.' },
  { dimension: 'Evidence emphasis', oregano: 'Much of the literature focuses on essential-oil chemistry and antimicrobial activity.', thyme: 'Essential-oil and thymol literature is comparatively well characterized, but human outcome evidence remains preparation-specific.' },
  { dimension: 'Main safety edge', oregano: 'Concentrated oil can irritate GI mucosa and skin.', thyme: 'Concentrated oil can irritate mucosa; high-dose extracts deserve anticoagulant caution.' },
]

export default function OreganoVsThymePage() {
  return (
    <div className="container-page space-y-10 py-10">
      <AuthorityJsonLd title="Oregano vs Thyme" description="Evidence-aware comparison of oregano and thyme chemistry and preparation safety." url="https://thehippiescientist.net/guides/compare/oregano-vs-thyme/" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Compare', href: '/guides/compare/' }, { label: 'Oregano vs Thyme' }]} />

      <section className="max-w-4xl space-y-5">
        <p className="eyebrow-label">Educational Comparison · Aromatic Herbs</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">Oregano vs Thyme: Similar Aromatic Chemistry, Different Emphasis</h1>
        <p className="text-lg leading-8 text-muted">Oregano and thyme overlap heavily in aromatic phenols such as thymol and carvacrol. The biggest practical distinction is often not the herb name—it is whether you are talking about food, tea, an extract, or a concentrated essential oil.</p>
      </section>

      <CitationReadySummary
        answer="Oregano and thyme share overlapping essential-oil chemistry, especially thymol and carvacrol, but their proportions vary by species, cultivar, and chemotype. Culinary use is generally much lower exposure than concentrated oils or extracts."
        bestFor={[
          'Comparing two closely related culinary/aromatic herbs.',
          'Understanding why essential-oil claims do not automatically apply to food or tea.',
          'Separating chemistry overlap from evidence for specific human outcomes.',
        ]}
        evidenceLevel="Laboratory and compositional evidence is much stronger than evidence that either herb, by itself, treats a specific disease in humans."
        safetyNote="Culinary use is generally low-risk. Concentrated essential oils can irritate skin and mucosa and should not be treated like ordinary food exposure."
        notClaiming="This page is not claiming oregano or thyme treats infection, insomnia, inflammation, or any diagnosed condition."
        referencesHref="#references"
      />

      <section className="card-premium p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">Side by side</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead><tr className="border-b border-brand-900/10"><th className="py-3 pr-4">Dimension</th><th className="py-3 pr-4">Oregano</th><th className="py-3">Thyme</th></tr></thead>
            <tbody>{ROWS.map((row) => <tr key={row.dimension} className="border-b border-brand-900/5 align-top last:border-0"><td className="py-3 pr-4 font-semibold text-ink">{row.dimension}</td><td className="py-3 pr-4 text-muted">{row.oregano}</td><td className="py-3 text-muted">{row.thyme}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="card-premium space-y-4 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">Why they look so similar in the atlas</h2>
        <div className="space-y-4 text-sm leading-7 text-muted">
          <p>Both herbs sit in the mint family and can produce essential oils rich in phenolic monoterpenes. Comparative laboratory work frequently studies oregano and thyme together because their oils overlap in antimicrobial chemistry.<sup>[1]</sup></p>
          <p><strong className="text-ink">Thyme</strong> is especially associated with thymol, which has a substantial chemistry and pharmacology literature.<sup>[2][3]</sup> <strong className="text-ink">Oregano</strong> is often more carvacrol-forward, although composition can shift dramatically by chemotype.</p>
          <p>That variation is why a bottle labeled “oregano oil” or “thyme oil” cannot be interpreted from the plant name alone. Concentration and constituent profile matter more than a simple herb-vs-herb ranking.</p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link href="/herbs/oregano/" className="card-premium p-5 font-semibold text-brand-800">Explore Oregano →</Link>
        <Link href="/herbs/thyme/" className="card-premium p-5 font-semibold text-brand-800">Explore Thyme →</Link>
      </section>

      <FAQSchema pagePath="/guides/compare/oregano-vs-thyme/" questions={[
        { question: 'Is oregano oil stronger than thyme oil?', answer: 'There is no universal answer. Essential-oil composition varies by chemotype and product, so constituent concentrations matter more than the common name on the bottle.' },
        { question: 'Do oregano and thyme contain the same compounds?', answer: 'They overlap substantially, especially in thymol and carvacrol chemistry, but the proportions and full constituent profiles differ.' },
        { question: 'Is using oregano or thyme in food the same as taking essential oil?', answer: 'No. Essential oils are concentrated preparations with very different exposure and safety considerations from culinary use.' },
      ]} />

      <div className="space-y-3"><AffiliateDisclosure /><Disclaimer /></div>
      <References refs={REFS} />
    </div>
  )
}
