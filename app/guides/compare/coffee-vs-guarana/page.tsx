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
  title: 'Coffee vs Guarana: Caffeine Sources Compared',
  description: 'Evidence-aware comparison of coffee and guarana for caffeine exposure, energy, timing, product variability, and stimulant safety.',
  path: '/guides/compare/coffee-vs-guarana/',
})

const REFS = [
  { n: 1, text: 'Socała K, et al. (2020). Neuroprotective effects of coffee bioactive compounds: a review.', url: 'https://pubmed.ncbi.nlm.nih.gov/33374338/' },
  { n: 2, text: 'Safe S, et al. (2023). Health benefits of coffee consumption and mechanisms of action.', url: 'https://pubmed.ncbi.nlm.nih.gov/36769029/' },
  { n: 3, text: 'Torres EAFS, et al. (2022). Effects of the consumption of guarana on human health: a narrative review.', url: 'https://pubmed.ncbi.nlm.nih.gov/34755935/' },
  { n: 4, text: 'Jagim AR, et al. (2023). ISSN position stand: energy drinks and energy shots.', url: 'https://pubmed.ncbi.nlm.nih.gov/36862943/' },
]

const ROWS = [
  { dimension: 'Main stimulant', coffee: 'Caffeine, alongside chlorogenic acids and many other coffee compounds.', guarana: 'Caffeine is the dominant stimulant; commercial extracts can be highly concentrated.' },
  { dimension: 'Dose transparency', coffee: 'Cup-to-cup caffeine varies by bean, roast, brew method, and serving size.', guarana: 'Product variability can be even harder to judge unless the label explicitly states caffeine content.' },
  { dimension: 'Typical context', coffee: 'Beverage consumed for alertness, taste, and routine.', guarana: 'Often appears in supplements, energy blends, powders, or beverages.' },
  { dimension: 'Main safety edge', coffee: 'Excess caffeine can worsen anxiety, insomnia, palpitations, or blood-pressure response.', guarana: 'Same caffeine risks, plus a greater chance of accidental stimulant stacking in multi-ingredient products.' },
]

export default function CoffeeVsGuaranaPage() {
  return (
    <div className="container-page space-y-10 py-10">
      <AuthorityJsonLd title="Coffee vs Guarana" description="Evidence-aware comparison of two common caffeine sources." url="https://thehippiescientist.net/guides/compare/coffee-vs-guarana/" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Compare', href: '/guides/compare/' }, { label: 'Coffee vs Guarana' }]} />

      <section className="max-w-4xl space-y-5">
        <p className="eyebrow-label">Educational Comparison · Stimulant Cluster</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">Coffee vs Guarana: Same Core Stimulant, Different Delivery</h1>
        <p className="text-lg leading-8 text-muted">Both ultimately deliver caffeine. The practical difference is usually the matrix and the label: coffee is a familiar beverage with variable caffeine per cup, while guarana often appears as a concentrated ingredient inside supplements and energy products.</p>
      </section>

      <CitationReadySummary
        answer="Coffee and guarana are both meaningful caffeine sources. Neither has a special exemption from caffeine's stimulant effects: dose, timing, individual sensitivity, and total daily intake matter more than whether the caffeine came from coffee beans or guarana seed."
        bestFor={[
          'Comparing ordinary coffee with guarana-containing supplements or energy products.',
          'Understanding why total caffeine matters more than a “natural energy” label.',
          'Avoiding accidental stimulant stacking from multiple caffeine sources.',
        ]}
        evidenceLevel="Coffee has a broad observational and mechanistic literature. Guarana has a smaller human evidence base, with many practical effects likely driven substantially by caffeine exposure."
        safetyNote="Both can contribute to insomnia, anxiety, tremor, palpitations, and blood-pressure elevation. Guarana products should disclose caffeine content clearly before they are combined with coffee, energy drinks, stimulant medicines, or other caffeine sources."
        notClaiming="This page is not claiming coffee or guarana treats fatigue, ADHD, cognitive impairment, or any diagnosed condition."
        referencesHref="#references"
      />

      <section className="card-premium p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">Side by side</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead><tr className="border-b border-brand-900/10"><th className="py-3 pr-4">Dimension</th><th className="py-3 pr-4">Coffee</th><th className="py-3">Guarana</th></tr></thead>
            <tbody>{ROWS.map((row) => <tr key={row.dimension} className="border-b border-brand-900/5 align-top last:border-0"><td className="py-3 pr-4 font-semibold text-ink">{row.dimension}</td><td className="py-3 pr-4 text-muted">{row.coffee}</td><td className="py-3 text-muted">{row.guarana}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="card-premium space-y-4 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">The important variable is total caffeine</h2>
        <div className="space-y-4 text-sm leading-7 text-muted">
          <p><strong className="text-ink">Coffee</strong> contains caffeine within a complex beverage matrix that also includes chlorogenic acids and many other bioactive compounds.<sup>[1][2]</sup> That makes coffee more than purified caffeine, but caffeine still explains much of the acute alerting effect.</p>
          <p><strong className="text-ink">Guarana</strong> is a caffeine-rich seed commonly used in energy products and supplements. Human-health reviews emphasize both its stimulant potential and the importance of understanding actual caffeine exposure.<sup>[3]</sup></p>
          <p>The biggest practical hazard is stacking: coffee in the morning, a guarana-containing pre-workout later, then an energy drink can become a much larger caffeine load than any one label suggests. Energy-product guidance therefore focuses heavily on disclosed caffeine dose and total intake.<sup>[4]</sup></p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link href="/herbs/coffea-arabica/" className="card-premium p-5 font-semibold text-brand-800">Explore Coffee →</Link>
        <Link href="/herbs/guarana/" className="card-premium p-5 font-semibold text-brand-800">Explore Guarana →</Link>
      </section>

      <FAQSchema pagePath="/guides/compare/coffee-vs-guarana/" questions={[
        { question: 'Is guarana stronger than coffee?', answer: 'Not inherently. The relevant comparison is caffeine dose. A concentrated guarana extract can deliver more caffeine than a cup of coffee, but products vary widely.' },
        { question: 'Does guarana contain caffeine?', answer: 'Yes. Guarana seed is naturally caffeine-rich, and many guarana products are used specifically for their stimulant caffeine content.' },
        { question: 'Can you use coffee and guarana together?', answer: 'They can add together as caffeine sources. Combining them increases total stimulant exposure and can raise the chance of insomnia, anxiety, tremor, palpitations, or blood-pressure effects.' },
      ]} />

      <div className="space-y-3"><AffiliateDisclosure /><Disclaimer /></div>
      <References refs={REFS} />
    </div>
  )
}
