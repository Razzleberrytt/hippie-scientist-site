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
  title: 'Guarana vs Yerba Mate: Caffeine, Energy & Focus Compared',
  description: 'Evidence-informed comparison of guarana (Paullinia cupana) and yerba mate (Ilex paraguariensis), including caffeine, cognition, exercise, and safety.',
  path: '/guides/compare/guarana-vs-yerba-mate/',
})

const REFS = [
  { n: 1, text: 'Haskell CF, et al. (2007). A double-blind, placebo-controlled, multi-dose evaluation of the acute behavioural effects of guarana in humans. J Psychopharmacol, 21(1): 65-70.', url: 'https://pubmed.ncbi.nlm.nih.gov/16533867/' },
  { n: 2, text: 'Pomportes L, et al. (2023). Effect of Guarana on Cognitive Performance: A Systematic Review and Meta-Analysis. Nutrients, 15(2): 434.', url: 'https://pubmed.ncbi.nlm.nih.gov/36678305/' },
  { n: 3, text: 'José MFB, et al. (2023). Physiological effects of yerba mate (Ilex paraguariensis): a systematic review. Nutr Rev, 81(9): 1163-1179.', url: 'https://pubmed.ncbi.nlm.nih.gov/36647770/' },
  { n: 4, text: 'Acute guarana compared with low-dose caffeine in a double-blind crossover study of cognitive and autonomic outcomes (2024). Nutrients.', url: 'https://pubmed.ncbi.nlm.nih.gov/38931247/' },
]

const ROWS = [
  { dimension: 'Plant part / format', guarana: 'Seed extract or powder, often standardized or added to supplements and drinks.', mate: 'Leaf-and-stem infusion traditionally consumed as a brewed beverage.' },
  { dimension: 'Shared stimulant', guarana: 'Caffeine is a major active constituent.', mate: 'Caffeine is a major active constituent.' },
  { dimension: 'Human evidence emphasis', guarana: 'Acute cognition and alertness; effects are small and inconsistent across tasks.', mate: 'Broader metabolic, antioxidant, exercise, and cardiometabolic literature; certainty varies.' },
  { dimension: 'Dose predictability', guarana: 'Extract labels can state caffeine content, but concentrations vary by product.', mate: 'Caffeine exposure varies with leaf amount, brand, water temperature, and repeated infusions.' },
  { dimension: 'Best comparison frame', guarana: 'More concentrated supplement-style stimulant source.', mate: 'Beverage-style stimulant with polyphenols and a broader food-pattern context.' },
  { dimension: 'Main caution', guarana: 'Total caffeine load, especially when stacked with coffee, energy drinks, or pre-workout products.', mate: 'Total caffeine load plus beverage temperature and preparation habits.' },
]

export default function GuaranaVsYerbaMatePage() {
  return (
    <div className="container-page space-y-10 py-10">
      <AuthorityJsonLd title="Guarana vs Yerba Mate" description="Evidence-informed comparison of guarana and yerba mate for caffeine, energy, focus, and exercise context." url="https://thehippiescientist.net/guides/compare/guarana-vs-yerba-mate/" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Compare', href: '/guides/compare/' }, { label: 'Guarana vs Yerba Mate' }]} />

      <section className="max-w-4xl space-y-5">
        <p className="eyebrow-label">Educational Comparison · Stimulant Cluster</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">Guarana vs Yerba Mate: Which Caffeine Source Fits Better?</h1>
        <p className="text-lg leading-8 text-muted">Both are South American plants that naturally contain caffeine, but they are used very differently. Guarana is usually a concentrated seed extract; yerba mate is usually a brewed leaf beverage. That changes dose predictability, research context, and how easy it is to accidentally stack too much caffeine.</p>
      </section>

      <CitationReadySummary
        answer="Guarana and yerba mate both deliver caffeine, but guarana is usually consumed as a concentrated seed extract while yerba mate is usually consumed as a brewed leaf infusion. Guarana has human studies focused on acute cognition and alertness, with small and inconsistent effects beyond caffeine. Yerba mate has a broader literature spanning metabolism, antioxidant activity, exercise, and cardiometabolic outcomes, although evidence certainty is often low to moderate."
        bestFor={[
          'Guarana: when you want a compact, labeled stimulant extract and can track total caffeine carefully.',
          'Yerba mate: when you prefer a brewed beverage and want a food-like source of caffeine plus polyphenols.',
          'Either: only when total daily caffeine and other stimulant sources are counted together.',
        ]}
        evidenceLevel="Guarana cognition trials and meta-analysis suggest at most small acute effects, while yerba mate has a broader but heterogeneous evidence base with substantial risk-of-bias concerns in many studies."
        safetyNote="Both can cause caffeine-related insomnia, anxiety, palpitations, or blood-pressure effects. Yerba mate should not be consumed scalding hot; preparation temperature matters independently of the plant itself."
        notClaiming="This page is not claiming either botanical treats fatigue, attention disorders, obesity, or cardiovascular disease."
        referencesHref="#references"
      />

      <section className="card-premium p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">Side by side</h2>
        <div className="mt-6 overflow-x-auto"><table className="min-w-full border-collapse text-left text-sm"><thead><tr className="border-b border-brand-900/10"><th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink">Dimension</th><th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink">Guarana</th><th className="py-3 text-xs font-bold uppercase tracking-wider text-ink">Yerba mate</th></tr></thead><tbody>{ROWS.map((row) => <tr key={row.dimension} className="border-b border-brand-900/5 align-top last:border-0"><td className="py-3 pr-4 font-semibold text-ink">{row.dimension}</td><td className="py-3 pr-4 text-muted">{row.guarana}</td><td className="py-3 text-muted">{row.mate}</td></tr>)}</tbody></table></div>
      </section>

      <section className="card-premium space-y-4 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">What the human research actually says</h2>
        <div className="space-y-4 text-sm leading-7 text-muted">
          <p>Guarana has placebo-controlled human studies showing changes in alertness or some cognitive tasks, but the meta-analytic signal is small and does not support treating guarana as a uniquely powerful nootropic.<sup>[1][2][4]</sup></p>
          <p>Yerba mate has been studied across metabolism, body composition, exercise, mood, and cardiometabolic outcomes. A 2023 systematic review found promising signals but also substantial risk of bias, so it is better viewed as an interesting caffeinated beverage than as a proven therapeutic intervention.<sup>[3]</sup></p>
          <p>For everyday use, the most practical difference is format: guarana tends to concentrate stimulant exposure into a smaller serving, while yerba mate spreads caffeine across a beverage ritual whose dose changes with preparation.</p>
        </div>
      </section>

      <section className="card-premium space-y-4 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">Read the full profiles</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/herbs/guarana/" className="rounded-2xl border border-brand-900/10 bg-white/70 p-4 font-semibold text-brand-800">Guarana →</Link>
          <Link href="/herbs/yerba-mate/" className="rounded-2xl border border-brand-900/10 bg-white/70 p-4 font-semibold text-brand-800">Yerba Mate →</Link>
        </div>
      </section>

      <FAQSchema pagePath="/guides/compare/guarana-vs-yerba-mate/" questions={[
        { question: 'Which has more caffeine, guarana or yerba mate?', answer: 'There is no single reliable plant-versus-plant number because caffeine exposure depends on the guarana extract concentration and, for yerba mate, the amount of leaf, brand, brewing method, and repeated infusions. Compare labeled caffeine per serving whenever possible.' },
        { question: 'Is guarana better for focus than yerba mate?', answer: 'Not clearly. Guarana has acute cognition studies, but meta-analysis suggests only small effects overall. Yerba mate has less direct cognition-specific evidence and is better understood as a caffeinated beverage with additional polyphenols.' },
        { question: 'Can I use guarana and yerba mate together?', answer: 'They both add caffeine, so combining them can make total stimulant exposure easy to underestimate. Count the caffeine from both, plus coffee, tea, energy drinks, or pre-workout products.' },
      ]} />
      <Disclaimer />
      <References refs={REFS} />
    </div>
  )
}
