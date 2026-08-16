import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import LegacyGuideFAQ from '@/components/LegacyGuideFAQ'
import LegacyGuideQuickAnswer from '@/components/LegacyGuideQuickAnswer'
import References from '@/components/References'
import EmailCapture from '../../../../components/EmailCapture'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'

export const metadata: Metadata = buildPageMetadata({
  title: 'Functional Mushrooms: Species, Extracts & Human Evidence (2026)',
  description: 'Evidence review of lion’s mane, reishi, Cordyceps, turkey tail and chaga that separates species, preparation, population and clinical outcome.',
  path: '/guides/other/functional-mushrooms-guide/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'Which functional mushroom is best?', answer: 'There is no universal best mushroom. Human evidence depends on the exact species or strain, preparation, population and outcome. A lion’s-mane fruiting-body powder, erinacine-enriched mycelium, Cordyceps Cs-4 preparation and turkey-tail PSK are not interchangeable interventions.' },
  { question: 'Is fruiting body always better than mycelium?', answer: 'No. Some research uses fruiting bodies, while other studies use cultured mycelium, isolated compounds or proprietary extracts. Product identity and composition matter, but “fruiting body only” is not a universal clinical-efficacy rule.' },
  { question: 'Does a high beta-glucan percentage prove a mushroom supplement works?', answer: 'No. Beta-glucan content can be useful composition information, but no single percentage threshold proves efficacy across mushroom species, preparations and outcomes. Clinical evidence still has to match the product and claim.' },
  { question: 'Does turkey tail treat cancer?', answer: 'Do not generalize that way. Cancer studies have evaluated specific Coriolus/Trametes versicolor preparations such as PSK as adjuncts to conventional treatment. A 2022 Cochrane review in colorectal cancer rated much of the evidence low or very low certainty. That evidence does not transfer automatically to an over-the-counter turkey-tail capsule or to cancer prevention.' },
  { question: 'Does Cordyceps reliably improve energy or endurance?', answer: 'Evidence is mixed and preparation-specific. Some trials and pooled analyses report aerobic-performance signals, while other randomized studies find no endurance benefit. “Cordyceps” is not one standardized intervention.' },
]

const MUSHROOM_REFS = [
  { n: 1, text: 'Menon A, et al. (2025). Benefits, side effects, and uses of Hericium erinaceus as a supplement: a systematic review. PMID 40959699.', url: 'https://pubmed.ncbi.nlm.nih.gov/40959699/' },
  { n: 2, text: 'Mori K, et al. (2009). Hericium erinaceus and mild cognitive impairment: randomized double-blind placebo-controlled trial. PMID 18844328.', url: 'https://pubmed.ncbi.nlm.nih.gov/18844328/' },
  { n: 3, text: 'Parcell AC, et al. (2004). Cordyceps sinensis (CordyMax Cs-4) supplementation does not improve endurance exercise performance. PMID 15118196.', url: 'https://pubmed.ncbi.nlm.nih.gov/15118196/' },
  { n: 4, text: 'Effects of fungal supplementation on endurance, immune function, and hematological profiles in adult athletes: systematic review and meta-analysis (2025). PMID 41280379.', url: 'https://pubmed.ncbi.nlm.nih.gov/41280379/' },
  { n: 5, text: 'Wieland LS, et al. (2022). Coriolus (Trametes) versicolor mushroom for people with colorectal cancer. Cochrane Database Syst Rev. PMID 36445793.', url: 'https://pubmed.ncbi.nlm.nih.gov/36445793/' },
  { n: 6, text: 'Jin X, et al. (2012). Ganoderma lucidum (Reishi mushroom) for cancer treatment. Cochrane Database Syst Rev. PMID 22696372.', url: 'https://pubmed.ncbi.nlm.nih.gov/22696372/' },
]

export default function FunctionalMushroomsPage() {
  const lionsManeProducts = getRevenueProductSet('lions-mane')
  const reishiProducts = getRevenueProductSet('reishi')

  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="Functional Mushrooms: Species, Extracts & Human Evidence" description="Species- and preparation-specific evidence review of functional mushrooms." url="https://thehippiescientist.net/guides/other/functional-mushrooms-guide" type="Article" citationUrls={MUSHROOM_REFS.map((ref) => ref.url)} />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Functional Mushrooms' }]} />

      <section className="space-y-5 max-w-4xl"><p className="eyebrow-label">Evidence Review · 6 References</p><h1 className="text-5xl font-bold tracking-tight text-ink">Functional Mushrooms: The Species Name Is Not Enough</h1><p className="text-lg leading-8 text-muted">“Lion’s mane,” “reishi,” “Cordyceps,” and “turkey tail” sound like single interventions. They are not. Human studies use different species, strains, cultured mycelia, fruiting-body powders, isolated compounds and proprietary extracts. The evidence should follow the exact preparation and outcome—not a mushroom-category marketing label.</p>
        <figure className="mt-6"><div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white"><Image src="/images/guides/reishi-mushroom.jpg" alt="Medicinal mushrooms on a dark surface" width={1536} height={1024} priority className="w-full h-auto" /></div><figcaption className="mt-3 text-center text-sm text-muted">Species, preparation, dose form and population determine whether a study applies to a product.</figcaption></figure></section>

      <LegacyGuideQuickAnswer referencesHref="#references">
        <p><strong>Do not choose a functional mushroom from a one-word goal like “brain,” “immunity,” or “energy.”</strong> Lion’s-mane cognition evidence comes from a small set of product-specific human trials [1,2]. Cordyceps exercise findings are mixed across preparations and populations [3,4]. Turkey-tail oncology evidence concerns specific adjunct extracts such as PSK and remains low-certainty in modern review—not ordinary OTC capsules [5]. Reishi immune or cancer biomarkers do not establish general disease prevention or treatment [6].</p>
      </LegacyGuideQuickAnswer>

      <section id="mushroom-evidence-map" data-answer-engine-table="true" className="card-premium scroll-mt-24 p-6 space-y-4 max-w-5xl border-l-4 border-brand-700 bg-brand-50/30"><p className="text-xs font-bold uppercase tracking-wider text-brand-700">At a Glance · Species + Preparation + Outcome</p><div className="overflow-x-auto"><table className="min-w-[980px] text-sm"><caption className="sr-only">Functional mushroom evidence by species, preparation, human outcome and limitation</caption><thead><tr className="border-b"><th scope="col" className="text-left py-3 pr-4 font-semibold text-ink">Mushroom / preparation</th><th scope="col" className="text-left py-3 pr-4 font-semibold text-ink">Human evidence lane</th><th scope="col" className="text-left py-3 pr-4 font-semibold text-ink">Main limitation</th><th scope="col" className="text-left py-3 font-semibold text-ink">Do not generalize to</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><th scope="row" className="py-3 pr-4 text-left font-medium text-ink"><Link href="/herbs/lions-mane/" className="text-brand-800 hover:underline">Lion’s mane / Hericium preparations</Link></th><td className="py-3 pr-4">Small human trials and a recent systematic review report cognitive/mood signals [1,2].</td><td className="py-3 pr-4">Few trials, small samples, heterogeneous preparations and populations.</td><td className="py-3">“NGF support” or broad neuroprotection from any lion’s-mane product.</td></tr>
          <tr className="border-b"><th scope="row" className="py-3 pr-4 text-left font-medium text-ink"><Link href="/herbs/cordyceps-sinensis/" className="text-brand-800 hover:underline">Cordyceps / Cs-4 / C. militaris products</Link></th><td className="py-3 pr-4">Some pooled athlete data suggest aerobic signals [4], while a controlled Cs-4 endurance study was null [3].</td><td className="py-3 pr-4">Species, blend composition, training status and outcomes vary.</td><td className="py-3">A universal “energy” or endurance effect.</td></tr>
          <tr className="border-b"><th scope="row" className="py-3 pr-4 text-left font-medium text-ink"><Link href="/herbs/turkey-tail/" className="text-brand-800 hover:underline">Turkey tail / Coriolus PSK-type extracts</Link></th><td className="py-3 pr-4">Adjunct oncology studies exist for standardized extracts such as PSK [5].</td><td className="py-3 pr-4">Modern Cochrane review found low/very-low certainty for many outcomes and older treatment regimens.</td><td className="py-3">OTC turkey-tail capsules, cancer prevention or replacement of oncology care.</td></tr>
          <tr className="border-b"><th scope="row" className="py-3 pr-4 text-left font-medium text-ink"><Link href="/herbs/reishi/" className="text-brand-800 hover:underline">Reishi / Ganoderma preparations</Link></th><td className="py-3 pr-4">Human oncology/immune-marker studies exist [6].</td><td className="py-3 pr-4">Evidence is insufficient to establish first-line cancer treatment or broad healthy-user immune benefit.</td><td className="py-3">“Immune boosting,” sleep treatment or disease prevention from any reishi extract.</td></tr>
          <tr><th scope="row" className="py-3 pr-4 text-left font-medium text-ink"><Link href="/herbs/chaga/" className="text-brand-800 hover:underline">Chaga</Link></th><td className="py-3 pr-4">Human clinical-outcome evidence is sparse compared with laboratory antioxidant literature.</td><td className="py-3 pr-4">Antioxidant assays and ORAC-style measurements are not clinical outcomes.</td><td className="py-3">Cancer, immunity or longevity benefit in humans.</td></tr>
        </tbody></table></div></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Fruiting body vs mycelium: identity matters, but slogans are not evidence</h2><p className="text-sm leading-7 text-muted">A product should clearly identify the species, fungal material, extraction method and measured constituents when possible. But “fruiting body only” is not a universal rule of clinical superiority. Some research uses fruiting bodies; other work uses cultured mycelium, erinacine-enriched material, PSK or proprietary preparations. The correct question is whether the consumer product resembles the intervention that produced the claimed human outcome.</p><p className="text-sm leading-7 text-muted">The same applies to beta-glucan percentages. Composition testing can help identify a product, but no single 25% or 30% threshold proves that a lion’s-mane, reishi, Cordyceps or turkey-tail product will reproduce a clinical study.</p></section>

      <section className="rounded-2xl border border-amber-900/15 bg-amber-50/70 p-6 text-amber-950 dark:border-amber-200/20 dark:bg-amber-950/20 dark:text-amber-50"><p className="text-xs font-bold uppercase tracking-[0.16em]">Cancer evidence boundary</p><h2 className="mt-2 text-2xl font-semibold">Adjunct extract evidence is not an OTC cancer recommendation</h2><p className="mt-3 text-sm leading-7">Turkey-tail/PSK and reishi cancer studies were conducted in defined cancer populations, often alongside conventional treatment [5,6]. Do not use those findings to recommend an ordinary mushroom supplement for cancer prevention, to substitute for oncology treatment, or to assume a retail extract is compositionally equivalent to a studied medicinal preparation.</p></section>

      {(lionsManeProducts || reishiProducts) && <section className="space-y-6">{lionsManeProducts && <RecommendationSection title="Lion’s mane sourcing examples" description="These are sourcing examples only. Verify species, fungal material, extraction and testing; retail products should not inherit a study’s cognitive claim unless the preparation is meaningfully comparable." products={lionsManeProducts.products} />}{reishiProducts && <RecommendationSection title="Reishi sourcing examples" description="These are sourcing examples only, not immune, sleep or cancer-treatment recommendations. Product identity and preparation matter." products={reishiProducts.products} />}</section>}

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold">Bottom line</h2><p className="text-sm leading-7 text-muted">Functional mushrooms are not one evidence category. The most reliable way to read this literature is preparation-first: identify the species and material, match the exact intervention to the population and outcome, and refuse to transfer evidence between unrelated retail extracts. Mechanisms and composition markers are useful—but they do not replace human outcome evidence.</p></section>
      <LegacyGuideFAQ questions={FAQS} pagePath="/guides/other/functional-mushrooms-guide/" />
      <section id="references" className="scroll-mt-24"><References refs={MUSHROOM_REFS} /></section>
      <EmailCapture headline="Get evidence reviews like this" description="Mushrooms, cognition, immunity — species and preparation before marketing." ctaLabel="Get the evidence" location="guide-mushrooms" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}
