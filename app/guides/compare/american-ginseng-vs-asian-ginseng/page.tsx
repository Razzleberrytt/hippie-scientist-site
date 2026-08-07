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
  title: 'American Ginseng vs Asian Ginseng: What Is the Difference?',
  description: 'Evidence-informed comparison of American ginseng (Panax quinquefolius) and Asian ginseng (Panax ginseng), including chemistry, evidence, use cases, and safety.',
  path: '/guides/compare/american-ginseng-vs-asian-ginseng/',
})

const REFS = [
  { n: 1, text: 'Szczuka D, et al. (2019). Panax ginseng and Panax quinquefolius: From pharmacology to toxicology. Food Chem Toxicol, 125: 395-411.', url: 'https://pubmed.ncbi.nlm.nih.gov/28698154/' },
  { n: 2, text: 'Qi LW, et al. (2011). Ginsenosides from American ginseng: chemical and pharmacological diversity. Phytochemistry, 72(8): 689-699.', url: 'https://pubmed.ncbi.nlm.nih.gov/21396670/' },
  { n: 3, text: 'Jovanovski E, et al. (2020). Vascular effects of combined enriched Korean Red ginseng and American ginseng in hypertension and type 2 diabetes: a randomized controlled trial. Complement Ther Med, 49: 102338.', url: 'https://pubmed.ncbi.nlm.nih.gov/32147072/' },
  { n: 4, text: 'Review of randomized controlled trials of American ginseng extract on human neurocognitive function (2025). Nutr Neurosci.', url: 'https://pubmed.ncbi.nlm.nih.gov/41017752/' },
]

const ROWS = [
  { dimension: 'Species', american: 'Panax quinquefolius', asian: 'Panax ginseng' },
  { dimension: 'Shared chemistry', american: 'Ginsenosides, including Rb1, Rg1, and Rg3.', asian: 'Ginsenosides, including Rb1, Rg1, and Rg3.' },
  { dimension: 'Key chemistry difference', american: 'Distinct ginsenoside proportions and compounds such as pseudoginsenoside F11 help distinguish it chemically.', asian: 'Different ginsenoside proportions and processing forms, including white and red ginseng.' },
  { dimension: 'Human evidence emphasis', american: 'Smaller clinical literature; trials include cognition, fatigue, and metabolic outcomes.', asian: 'Broader clinical literature across fatigue, cognition, metabolic, and other outcomes.' },
  { dimension: 'Best comparison frame', american: 'Useful when you want the American species specifically and its distinct extract chemistry.', asian: 'Useful when you want the more extensively studied Panax species and red/white ginseng preparations.' },
  { dimension: 'Safety', american: 'Can affect glucose control and may interact with medications; product standardization matters.', asian: 'Can affect glucose control, sleep, blood pressure, and medication response; product standardization matters.' },
]

export default function AmericanVsAsianGinsengPage() {
  return (
    <div className="container-page space-y-10 py-10">
      <AuthorityJsonLd title="American Ginseng vs Asian Ginseng" description="Evidence-informed comparison of Panax quinquefolius and Panax ginseng." url="https://thehippiescientist.net/guides/compare/american-ginseng-vs-asian-ginseng/" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Compare', href: '/guides/compare/' }, { label: 'American Ginseng vs Asian Ginseng' }]} />

      <section className="max-w-4xl space-y-5">
        <p className="eyebrow-label">Educational Comparison · Ginseng Cluster</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">American Ginseng vs Asian Ginseng: What Is the Difference?</h1>
        <p className="text-lg leading-8 text-muted">They are close botanical relatives and share major ginsenoside families, but they are not interchangeable. The useful distinction is species, extract chemistry, preparation, and which human evidence base you actually want to follow.</p>
      </section>

      <CitationReadySummary
        answer="American ginseng (Panax quinquefolius) and Asian ginseng (Panax ginseng) share many ginsenosides but differ in their relative chemical profiles, preparations, and depth of clinical research. Asian ginseng has the broader human evidence base, while American ginseng has a smaller but growing literature including cognition, fatigue, and metabolic outcomes."
        bestFor={[
          'American ginseng: when you specifically want Panax quinquefolius and its distinct ginsenoside profile.',
          'Asian ginseng: when you want the more extensively studied Panax species or red/white ginseng preparations.',
          'Either: only after checking medication interactions, glucose effects, and product standardization.',
        ]}
        evidenceLevel="Both species have human research, but trial designs, extracts, doses, and outcomes vary substantially. Asian ginseng has been studied more extensively overall."
        safetyNote="Both species can affect glucose control and may interact with medicines. Asian ginseng may also be stimulating for some people. Product standardization matters because ginsenoside profiles differ across preparations."
        notClaiming="This page is not claiming either ginseng treats diabetes, cognitive impairment, fatigue disorders, or other diseases."
        referencesHref="#references"
      />

      <section className="card-premium p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">Side by side</h2>
        <div className="mt-6 overflow-x-auto"><table className="min-w-full border-collapse text-left text-sm"><thead><tr className="border-b border-brand-900/10"><th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink">Dimension</th><th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink">American ginseng</th><th className="py-3 text-xs font-bold uppercase tracking-wider text-ink">Asian ginseng</th></tr></thead><tbody>{ROWS.map((row) => <tr key={row.dimension} className="border-b border-brand-900/5 align-top last:border-0"><td className="py-3 pr-4 font-semibold text-ink">{row.dimension}</td><td className="py-3 pr-4 text-muted">{row.american}</td><td className="py-3 text-muted">{row.asian}</td></tr>)}</tbody></table></div>
      </section>

      <section className="card-premium space-y-4 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">The chemistry is similar—but not identical</h2>
        <div className="space-y-4 text-sm leading-7 text-muted">
          <p>Both species contain ginsenosides, which is why the relationship engine connects them so strongly. Their relative ginsenoside patterns differ, however, and those differences are useful for authentication and may contribute to different pharmacological profiles.<sup>[1][2]</sup></p>
          <p>The practical takeaway is to compare standardized extracts rather than assuming every product labeled “ginseng” is equivalent. Species, processing, and declared ginsenoside content matter more than the front-label word alone.</p>
        </div>
      </section>

      <section className="card-premium space-y-4 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">Read the full profiles</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/herbs/panax-quinquefolius/" className="rounded-2xl border border-brand-900/10 bg-white/70 p-4 font-semibold text-brand-800">American Ginseng →</Link>
          <Link href="/herbs/panax-ginseng/" className="rounded-2xl border border-brand-900/10 bg-white/70 p-4 font-semibold text-brand-800">Asian Ginseng →</Link>
        </div>
      </section>

      <FAQSchema pagePath="/guides/compare/american-ginseng-vs-asian-ginseng/" questions={[
        { question: 'Are American ginseng and Asian ginseng the same thing?', answer: 'No. American ginseng is Panax quinquefolius and Asian ginseng is Panax ginseng. They are related species that share major ginsenoside families but differ in chemical proportions, preparations, and research history.' },
        { question: 'Which ginseng has more research?', answer: 'Asian ginseng has the broader clinical literature overall. American ginseng has a smaller but meaningful body of human research, including studies of cognition, fatigue, metabolic outcomes, and combined ginseng preparations.' },
        { question: 'Can I treat them as interchangeable?', answer: 'Not reliably. Species, extract standardization, processing, and ginsenoside profile can differ enough that results from one preparation should not automatically be assumed for another.' },
      ]} />
      <Disclaimer />
      <References refs={REFS} />
    </div>
  )
}
