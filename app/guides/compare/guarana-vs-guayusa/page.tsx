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
  title: 'Guarana vs Guayusa: Caffeine, Energy & Safety Compared',
  description: 'Evidence-informed comparison of guarana and guayusa, including caffeine format, stimulant exposure, cognition research, and safety.',
  path: '/guides/compare/guarana-vs-guayusa/',
})

const REFS = [
  { n: 1, text: 'Torres EAFS, et al. (2022). Effects of the consumption of guarana on human health: A narrative review.', url: 'https://pubmed.ncbi.nlm.nih.gov/34755935/' },
  { n: 2, text: 'La Monica MB, et al. (2023). Acute Effects of Naturally Occurring Guayusa Tea and Nordic Lion\'s Mane Extracts on Cognitive Performance.', url: 'https://pubmed.ncbi.nlm.nih.gov/38140277/' },
  { n: 3, text: 'Wise G, et al. (2020). A critical review of the composition and history of safe use of guayusa: a stimulant and antioxidant novel food.', url: 'https://pubmed.ncbi.nlm.nih.gov/31366209/' },
]

const ROWS = [
  { dimension: 'Typical format', guarana: 'Seed powder or extract, often concentrated into capsules, blends, or energy products.', guayusa: 'Leaf infusion or tea-style product, usually consumed as a beverage.' },
  { dimension: 'Shared stimulant', guarana: 'Caffeine is a major constituent.', guayusa: 'Caffeine is a major constituent; theobromine may also contribute.' },
  { dimension: 'Dose predictability', guarana: 'Depends heavily on extract standardization and labeled caffeine content.', guayusa: 'Depends on leaf amount, steeping, serving size, and product labeling.' },
  { dimension: 'Research emphasis', guarana: 'Human literature includes cognition, alertness, and broader health outcomes.', guayusa: 'Smaller evidence base; available work includes composition, safe-use review, and acute cognition research.' },
  { dimension: 'Practical fit', guarana: 'More supplement-like and potentially easier to concentrate.', guayusa: 'More beverage-like and easier to sip gradually.' },
  { dimension: 'Main caution', guarana: 'Easy to underestimate total caffeine when stacked with coffee, energy drinks, or stimulant supplements.', guayusa: 'Still a meaningful caffeine source; insomnia, anxiety, palpitations, reflux, and blood-pressure effects remain possible.' },
]

export default function GuaranaVsGuayusaPage() {
  return (
    <div className="container-page space-y-10 py-10">
      <AuthorityJsonLd title="Guarana vs Guayusa" description="Evidence-informed comparison of guarana and guayusa for caffeine, energy, cognition, and safety." url="https://thehippiescientist.net/guides/compare/guarana-vs-guayusa/" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Compare', href: '/guides/compare/' }, { label: 'Guarana vs Guayusa' }]} />

      <section className="max-w-4xl space-y-5">
        <p className="eyebrow-label">Educational Comparison · Caffeine Sources</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">Guarana vs Guayusa: What’s Actually Different?</h1>
        <p className="text-lg leading-8 text-muted">Both are naturally caffeinated South American plants, but guarana is usually sold as a concentrated seed ingredient while guayusa is usually consumed as a brewed leaf beverage. The practical difference is less about one being “stronger” and more about format, dose transparency, and total stimulant exposure.</p>
      </section>

      <CitationReadySummary
        answer="Guarana and guayusa both deliver caffeine, but they usually arrive in different formats. Guarana is commonly used as a concentrated seed extract or powder, while guayusa is commonly brewed as a caffeinated leaf beverage. Guarana has the broader human literature; guayusa has a smaller evidence base that includes composition, safe-use review, and acute cognition research."
        bestFor={[
          'Guarana: when a labeled, compact stimulant ingredient fits the use case and total caffeine can be tracked carefully.',
          'Guayusa: when a tea-style caffeinated beverage is preferred over a concentrated extract.',
          'Either: only when caffeine from all other sources is counted too.',
        ]}
        evidenceLevel="Guarana has more human research overall. Guayusa has a smaller but growing evidence base, so claims should stay narrower."
        safetyNote="Both can contribute to insomnia, anxiety, palpitations, reflux, or blood-pressure effects in sensitive users. Avoid treating either as caffeine-free or inherently gentle."
        notClaiming="This page does not claim that either plant treats fatigue, ADHD, anxiety, or any medical condition."
        referencesHref="#references"
      />

      <section className="card-premium p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">Side by side</h2>
        <div className="mt-6 overflow-x-auto"><table className="min-w-full border-collapse text-left text-sm"><thead><tr className="border-b border-brand-900/10"><th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink">Dimension</th><th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink">Guarana</th><th className="py-3 text-xs font-bold uppercase tracking-wider text-ink">Guayusa</th></tr></thead><tbody>{ROWS.map((row) => <tr key={row.dimension} className="border-b border-brand-900/5 align-top last:border-0"><td className="py-3 pr-4 font-semibold text-ink">{row.dimension}</td><td className="py-3 pr-4 text-muted">{row.guarana}</td><td className="py-3 text-muted">{row.guayusa}</td></tr>)}</tbody></table></div>
      </section>

      <section className="card-premium space-y-4 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">What the evidence supports</h2>
        <div className="space-y-4 text-sm leading-7 text-muted">
          <p>Guarana has been studied across cognition and other health outcomes, but its effects should not be separated casually from its caffeine content.<sup>[1]</sup></p>
          <p>Guayusa contains caffeine and has a history of beverage use; published reviews describe its composition and stimulant profile, while acute cognition research remains comparatively limited.<sup>[2][3]</sup></p>
          <p>For most users, the highest-value comparison is practical: how much caffeine is actually consumed, how predictable the serving is, and whether other stimulant products are being stacked on top.</p>
        </div>
      </section>

      <section className="card-premium space-y-4 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">Read the full profiles</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/herbs/guarana/" className="rounded-2xl border border-brand-900/10 bg-white/70 p-4 font-semibold text-brand-800">Guarana →</Link>
          <Link href="/herbs/guayusa/" className="rounded-2xl border border-brand-900/10 bg-white/70 p-4 font-semibold text-brand-800">Guayusa →</Link>
        </div>
      </section>

      <FAQSchema pagePath="/guides/compare/guarana-vs-guayusa/" questions={[
        { question: 'Which has more caffeine, guarana or guayusa?', answer: 'There is no reliable universal answer because guarana extracts vary in concentration and guayusa caffeine depends on the leaf amount, brew, serving size, and product. Compare labeled caffeine per serving whenever possible.' },
        { question: 'Is guayusa smoother than guarana?', answer: 'Some users describe different subjective effects, but that is not enough to establish a dependable pharmacologic advantage. Dose, preparation, tolerance, and other ingredients can all change the experience.' },
        { question: 'Can guarana and guayusa be combined?', answer: 'They both add caffeine, so combining them can make stimulant exposure easy to underestimate. Count caffeine from both plus coffee, tea, energy drinks, pre-workout, or stimulant medications.' },
      ]} />
      <Disclaimer />
      <References refs={REFS} />
    </div>
  )
}
