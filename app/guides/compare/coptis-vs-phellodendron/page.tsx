import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import CitationReadySummary from '@/components/seo/CitationReadySummary'
import FAQSchema from '@/components/seo/FAQSchema'
import References from '@/components/References'
import Disclaimer from '../../../../src/components/Disclaimer'

export const metadata: Metadata = buildPageMetadata({
  title: 'Coptis vs Phellodendron: Berberine Chemistry & Safety Compared',
  description: 'Evidence-informed comparison of Coptis and Phellodendron, including shared berberine alkaloids, plant parts, research context, and safety.',
  path: '/guides/compare/coptis-vs-phellodendron/',
})

const REFS = [
  { n: 1, text: 'Song D, et al. (2020). Biological properties and clinical applications of berberine.', url: 'https://pubmed.ncbi.nlm.nih.gov/32335802/' },
  { n: 2, text: 'Cicero AFG, et al. (2016). Berberine and Its Role in Chronic Disease.', url: 'https://pubmed.ncbi.nlm.nih.gov/27671811/' },
  { n: 3, text: 'Xu Z, et al. (2024). Convergent evolution of berberine biosynthesis.', url: 'https://pubmed.ncbi.nlm.nih.gov/39612339/' },
]

const ROWS = [
  { dimension: 'Common medicinal material', coptis: 'Rhizome/root material from Coptis species.', phellodendron: 'Bark from Phellodendron species.' },
  { dimension: 'Shared chemistry', coptis: 'Berberine and related isoquinoline alkaloids, including palmatine and coptisine depending on species/preparation.', phellodendron: 'Berberine and related alkaloids, including palmatine and jatrorrhizine depending on species/preparation.' },
  { dimension: 'Why they cluster', coptis: 'Strong overlap in alkaloid chemistry and inflammatory/metabolic research pathways.', phellodendron: 'Strong overlap in alkaloid chemistry and inflammatory/metabolic research pathways.' },
  { dimension: 'Not interchangeable', coptis: 'Different plant source, constituent ratios, preparations, and evidence context.', phellodendron: 'Different plant source, constituent ratios, preparations, and evidence context.' },
  { dimension: 'Main safety theme', coptis: 'Berberine-related interaction concerns, including antidiabetic drugs and CYP/P-gp substrates.', phellodendron: 'Similar berberine-related interaction concerns, plus preparation-specific uncertainty.' },
  { dimension: 'Pregnancy / infants', coptis: 'Avoid unsupervised use.', phellodendron: 'Avoid unsupervised use.' },
]

export default function CoptisVsPhellodendronPage() {
  return (
    <div className="container-page space-y-10 py-10">
      <AuthorityJsonLd title="Coptis vs Phellodendron" description="Evidence-informed comparison of Coptis and Phellodendron, emphasizing shared berberine alkaloids and safety context." url="https://thehippiescientist.net/guides/compare/coptis-vs-phellodendron/" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Compare', href: '/guides/compare/' }, { label: 'Coptis vs Phellodendron' }]} />

      <section className="max-w-4xl space-y-5">
        <p className="eyebrow-label">Educational Comparison · Berberine-Rich Botanicals</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">Coptis vs Phellodendron: Similar Alkaloids, Different Botanicals</h1>
        <p className="text-lg leading-8 text-muted">Coptis and Phellodendron are distinct medicinal plants that converge on a notably similar alkaloid profile. Both can contain berberine and related isoquinoline alkaloids, which explains why they cluster strongly in the Botanical Activity Atlas—but shared chemistry does not make the herbs interchangeable.</p>
      </section>

      <CitationReadySummary
        answer="Coptis and Phellodendron are different botanicals with substantial overlap in berberine-rich alkaloid chemistry. Coptis is generally represented by rhizome/root material, while Phellodendron is represented by bark. Their constituent ratios, preparations, traditional contexts, and evidence bases differ, so a shared berberine signal should not be treated as proof of equivalent effects."
        bestFor={[
          'Coptis: research navigation when the question centers on Coptis rhizome chemistry and its specific evidence base.',
          'Phellodendron: research navigation when bark-specific composition or Phellodendron evidence is the focus.',
          'Neither: as a casual substitute for the other based only on the presence of berberine.',
        ]}
        evidenceLevel="The chemical overlap is well supported, while clinical evidence for whole-herb interchangeability is much weaker and preparation-specific."
        safetyNote="Both warrant caution around pregnancy/breastfeeding, infants, antidiabetic drugs, and medications affected by CYP/P-gp pathways. Whole-herb preparations can differ substantially in dose and constituent ratios."
        notClaiming="This page does not claim that either herb treats diabetes, inflammatory disease, infection, or any other medical condition."
        referencesHref="#references"
      />

      <section className="card-premium p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">Side by side</h2>
        <div className="mt-6 overflow-x-auto"><table className="min-w-full border-collapse text-left text-sm"><thead><tr className="border-b border-brand-900/10"><th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink">Dimension</th><th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink">Coptis</th><th className="py-3 text-xs font-bold uppercase tracking-wider text-ink">Phellodendron</th></tr></thead><tbody>{ROWS.map((row) => <tr key={row.dimension} className="border-b border-brand-900/5 align-top last:border-0"><td className="py-3 pr-4 font-semibold text-ink">{row.dimension}</td><td className="py-3 pr-4 text-muted">{row.coptis}</td><td className="py-3 text-muted">{row.phellodendron}</td></tr>)}</tbody></table></div>
      </section>

      <section className="card-premium space-y-4 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">Why the chemistry overlap matters</h2>
        <div className="space-y-4 text-sm leading-7 text-muted">
          <p>Berberine is a prominent isoquinoline alkaloid associated with both Coptis and Phellodendron, and modern pharmacology literature frequently discusses the two within the same berberine-rich botanical context.<sup>[1][2][3]</sup></p>
          <p>The important limitation is that a purified compound and a whole botanical are not the same intervention. Species, plant part, extraction, alkaloid ratios, and dose all affect what a finished preparation actually contains.</p>
          <p>That makes this comparison most useful as a chemistry-and-evidence map—not as a recommendation to swap one herb for another.</p>
        </div>
      </section>

      <section className="card-premium space-y-4 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">Read the full profiles</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/herbs/coptis/" className="rounded-2xl border border-brand-900/10 bg-white/70 p-4 font-semibold text-brand-800">Coptis →</Link>
          <Link href="/herbs/phellodendron/" className="rounded-2xl border border-brand-900/10 bg-white/70 p-4 font-semibold text-brand-800">Phellodendron →</Link>
        </div>
      </section>

      <FAQSchema pagePath="/guides/compare/coptis-vs-phellodendron/" questions={[
        { question: 'Are Coptis and Phellodendron the same herb?', answer: 'No. They are distinct botanicals and commonly use different plant parts. They overlap strongly in berberine-related alkaloid chemistry, but their constituent ratios and preparations differ.' },
        { question: 'Do both Coptis and Phellodendron contain berberine?', answer: 'Yes, berberine is associated with both, alongside other related alkaloids. The exact amount varies by species, plant material, extraction, and product.' },
        { question: 'Can Coptis and Phellodendron be used interchangeably?', answer: 'The shared chemistry is not enough to establish interchangeability. Whole-herb evidence, traditional preparation, constituent ratios, and safety context differ.' },
      ]} />
      <Disclaimer />
      <References refs={REFS} />
    </div>
  )
}
