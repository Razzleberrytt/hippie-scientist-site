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
  title: 'Coffee vs Green Tea: Caffeine, Focus & Safety Compared',
  description: 'Evidence-informed comparison of coffee and green tea, including caffeine exposure, L-theanine/catechins, alertness, preparation, and safety.',
  path: '/guides/compare/coffee-vs-green-tea/',
})

const REFS = [
  { n: 1, text: 'Sirotkin AV, et al. (2021). The anti-obesity and health-promoting effects of tea and coffee.', url: 'https://pubmed.ncbi.nlm.nih.gov/33992045/' },
  { n: 2, text: 'Socała K, et al. (2020). Neuroprotective Effects of Coffee Bioactive Compounds: A Review.', url: 'https://pubmed.ncbi.nlm.nih.gov/33374338/' },
  { n: 3, text: 'Zhao T, et al. (2022). Green Tea (Camellia sinensis): A Review of Its Phytochemistry, Pharmacology, and Toxicology.', url: 'https://pubmed.ncbi.nlm.nih.gov/35745040/' },
  { n: 4, text: 'Asher GN, et al. (2017). Common Herbal Dietary Supplement-Drug Interactions.', url: 'https://pubmed.ncbi.nlm.nih.gov/28762712/' },
]

const ROWS = [
  { dimension: 'Typical format', coffee: 'Brewed roasted coffee; caffeine varies by bean, roast, serving size, and method.', tea: 'Brewed Camellia sinensis leaves; caffeine varies by leaf amount, steep time, and preparation.' },
  { dimension: 'Key compounds', coffee: 'Caffeine plus chlorogenic acids and other coffee polyphenols.', tea: 'Caffeine plus catechins such as EGCG and naturally occurring L-theanine.' },
  { dimension: 'Stimulant feel', coffee: 'Often delivers a larger caffeine dose per serving and a more obvious acute stimulant effect.', tea: 'Usually lower caffeine per serving, with preparation-dependent exposure and additional tea constituents.' },
  { dimension: 'Evidence context', coffee: 'Large observational and mechanistic literature plus extensive caffeine research.', tea: 'Broad phytochemistry and cardiometabolic literature; concentrated extracts differ from brewed tea.' },
  { dimension: 'Main safety issue', coffee: 'Excess caffeine can worsen insomnia, anxiety, palpitations, reflux, or blood-pressure sensitivity.', tea: 'Caffeine still matters; high-dose green-tea extracts add a distinct liver-safety concern.' },
]

export default function CoffeeVsGreenTeaPage() {
  return (
    <div className="container-page space-y-10 py-10">
      <AuthorityJsonLd title="Coffee vs Green Tea" description="Evidence-informed comparison of coffee and green tea for caffeine, focus, preparation, and safety." url="https://thehippiescientist.net/guides/compare/coffee-vs-green-tea/" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Compare', href: '/guides/compare/' }, { label: 'Coffee vs Green Tea' }]} />

      <section className="max-w-4xl space-y-5">
        <p className="eyebrow-label">Educational Comparison · Caffeine Cluster</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">Coffee vs Green Tea: Which Caffeine Source Fits Better?</h1>
        <p className="text-lg leading-8 text-muted">Both can deliver caffeine, but they are not interchangeable. Coffee usually provides a more concentrated stimulant experience, while green tea combines caffeine with catechins and L-theanine and has a separate safety story when used as a concentrated extract.</p>
      </section>

      <CitationReadySummary
        answer="Coffee and green tea are both evidence-rich caffeinated beverages, but the practical tradeoff is usually caffeine dose and format. Coffee often produces a larger, more noticeable stimulant exposure per serving. Green tea usually delivers less caffeine while adding catechins and L-theanine; concentrated green-tea extracts should not be treated as equivalent to brewed tea because high doses have a distinct liver-safety concern."
        bestFor={[
          'Coffee: when a stronger, more obvious caffeine effect is desired and sleep/anxiety sensitivity is low.',
          'Green tea: when a lower-caffeine beverage with tea catechins and L-theanine better fits the goal.',
          'Either: when total daily caffeine from all sources is tracked rather than judged by beverage name alone.',
        ]}
        evidenceLevel="Both have large research literatures, but many long-term health associations are observational. Acute stimulation is primarily explained by caffeine exposure, while the non-caffeine constituents differ substantially."
        safetyNote="Coffee and tea can both aggravate insomnia, anxiety, palpitations, reflux, or blood-pressure sensitivity. High-dose green-tea extracts carry liver-safety concerns that do not map directly onto ordinary brewed tea."
        notClaiming="This comparison does not claim either beverage treats fatigue, attention disorders, cardiovascular disease, obesity, or another medical condition."
        referencesHref="#references"
      />

      <section className="card-premium p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">Side by side</h2>
        <div className="mt-6 overflow-x-auto"><table className="min-w-full border-collapse text-left text-sm"><thead><tr className="border-b border-brand-900/10"><th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink">Dimension</th><th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink">Coffee</th><th className="py-3 text-xs font-bold uppercase tracking-wider text-ink">Green tea</th></tr></thead><tbody>{ROWS.map((row) => <tr key={row.dimension} className="border-b border-brand-900/5 align-top last:border-0"><td className="py-3 pr-4 font-semibold text-ink">{row.dimension}</td><td className="py-3 pr-4 text-muted">{row.coffee}</td><td className="py-3 text-muted">{row.tea}</td></tr>)}</tbody></table></div>
      </section>

      <section className="card-premium space-y-4 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">The practical difference is dose, not the label</h2>
        <div className="space-y-4 text-sm leading-7 text-muted">
          <p>Coffee and green tea both sit inside broader food-and-beverage research literatures, but an individual serving can vary substantially. Bean or leaf amount, serving size, extraction time, and product format all change the actual exposure.<sup>[1][2][3]</sup></p>
          <p>Green tea also deserves a format distinction: brewed tea and concentrated catechin/EGCG extracts are not interchangeable from a safety perspective. The site tracks liver risk specifically for high-dose extract use.<sup>[3][4]</sup></p>
        </div>
      </section>

      <section className="card-premium space-y-4 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">Read the full profiles</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/herbs/coffea-arabica/" className="rounded-2xl border border-brand-900/10 bg-white/70 p-4 font-semibold text-brand-800">Coffee →</Link>
          <Link href="/herbs/camellia-sinensis/" className="rounded-2xl border border-brand-900/10 bg-white/70 p-4 font-semibold text-brand-800">Green Tea →</Link>
        </div>
      </section>

      <FAQSchema pagePath="/guides/compare/coffee-vs-green-tea/" questions={[
        { question: 'Does coffee always have more caffeine than green tea?', answer: 'Usually per typical serving, but not always. Serving size, brewing method, bean or leaf amount, and product concentration can change caffeine exposure substantially.' },
        { question: 'Is green tea automatically gentler than coffee?', answer: 'Not automatically. Brewed green tea often contains less caffeine, but caffeine sensitivity is individual, and concentrated green-tea extracts have separate liver-safety considerations.' },
        { question: 'Can I use both in the same day?', answer: 'Many people do, but the useful metric is total caffeine from every source, including coffee, tea, energy drinks, pre-workout products, and supplements.' },
      ]} />
      <Disclaimer />
      <References refs={REFS} />
    </div>
  )
}
