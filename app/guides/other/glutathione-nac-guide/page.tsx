import type { Metadata } from 'next'
import RecommendationSection from '@/components/RecommendationSection'
import { getRevenueProductSet } from '@/config/revenue-products'
import Link from 'next/link'
import Image from 'next/image'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import LegacyGuideFAQ from '@/components/LegacyGuideFAQ'
import LegacyGuideQuickAnswer from '@/components/LegacyGuideQuickAnswer'
import References from '@/components/References'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'NAC & Glutathione: Evidence by Indication (2026 Guide)',
  description: 'Evidence review of NAC and glutathione separating acetaminophen poisoning, respiratory disease, psychiatric research, oral glutathione pharmacology, and general detox claims.',
  path: '/guides/other/glutathione-nac-guide/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'Is NAC a general detox supplement?', answer: 'No. NAC has important indication-specific uses, including prescription use for acetaminophen poisoning and research in respiratory and psychiatric conditions. Those data do not establish a routine daily NAC protocol for general detox, liver cleansing, hangovers, or wellness.' },
  { question: 'Is oral glutathione useless because it is broken down in the gut?', answer: 'That claim is too categorical. A six-month randomized trial found oral glutathione increased glutathione stores in several tissues and blood compartments. Formulation can affect pharmacokinetics, but higher glutathione levels do not automatically prove a clinical benefit for a disease or wellness goal.' },
  { question: 'Does NAC reduce COPD exacerbations?', answer: 'The evidence is mixed. A 2024 meta-analysis reported fewer exacerbations in COPD and chronic bronchitis/pre-COPD, while another modern meta-analysis found no significant benefit across several COPD outcomes. The result depends on population, regimen, background treatment, and study selection.' },
  { question: 'Does NAC treat OCD or trichotillomania?', answer: 'NAC has been studied as an adjunct in psychiatric research, but results are condition-specific and should not be converted into a self-treatment protocol. The adult trichotillomania randomized trial is Grant et al. 2009 (PMID 19581567).' },
  { question: 'Is NAC the same thing as hospital treatment for acetaminophen overdose?', answer: 'No. Intravenous acetylcysteine is a prescription antidote used with laboratory monitoring and poison-control or hospital protocols after potentially hepatotoxic acetaminophen exposure. That indication does not imply that routine oral NAC supplementation prevents liver injury in healthy people.' },
]

const NAC_REFS = [
  { n: 1, text: 'DailyMed. Acetylcysteine Injection prescribing information. Indicated as an antidote for potentially hepatotoxic acetaminophen overdose.', url: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=9d305722-e74f-4f48-8d2c-0daa99144749' },
  { n: 2, text: 'Papi A, et al. (2024). N-acetylcysteine Treatment in COPD and Chronic Bronchitis/Pre-COPD: Distinct Meta-analyses. Arch Bronconeumol. PMID 38555190.', url: 'https://pubmed.ncbi.nlm.nih.gov/38555190/' },
  { n: 3, text: 'Huang C, et al. (2023). The efficacy of N-acetylcysteine in chronic obstructive pulmonary disease patients: a meta-analysis. Ther Adv Respir Dis. PMID 36927162.', url: 'https://pubmed.ncbi.nlm.nih.gov/36927162/' },
  { n: 4, text: 'Grant JE, et al. (2009). N-acetylcysteine, a glutamate modulator, in the treatment of trichotillomania: a double-blind, placebo-controlled study. Arch Gen Psychiatry. PMID 19581567.', url: 'https://pubmed.ncbi.nlm.nih.gov/19581567/' },
  { n: 5, text: 'Richie JP Jr, et al. (2015). Randomized controlled trial of oral glutathione supplementation on body stores of glutathione. Eur J Nutr. PMID 24791752.', url: 'https://pubmed.ncbi.nlm.nih.gov/24791752/' },
  { n: 6, text: 'Forman HJ, Zhang H, Rinna A. (2009). Glutathione: overview of its protective roles, measurement, and biosynthesis. Mol Aspects Med. PMID 18796312.', url: 'https://pubmed.ncbi.nlm.nih.gov/18796312/' },
]

export default function GlutathioneNACPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="NAC & Glutathione: Evidence by Indication"
        description="Indication-specific review of acetylcysteine and glutathione evidence."
        url="https://thehippiescientist.net/guides/other/glutathione-nac-guide"
        type="Article"
        citationUrls={NAC_REFS.map((ref) => ref.url)}
      />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'NAC & Glutathione' }]} />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Evidence Review · 6 References</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">NAC &amp; Glutathione: One Biochemical System, Several Different Clinical Questions</h1>
        <p className="text-lg leading-8 text-muted">N-acetylcysteine (NAC) can supply cysteine for glutathione synthesis, and glutathione is a major intracellular redox molecule. That biology is real. The mistake is turning it into one blanket consumer conclusion. Hospital antidote use, respiratory-disease trials, psychiatric studies, oral glutathione pharmacology, and vague “detox” claims are different evidence lanes.</p>
        <figure className="mt-6"><div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white"><Image src="/images/guides/glutathione-nac-guide.jpg" alt="NAC capsules on a clinical surface" width={1536} height={1024} priority className="w-full h-auto" /></div><figcaption className="mt-3 text-center text-sm text-muted">A biomarker pathway does not create one universal supplement indication.</figcaption></figure>
      </section>

      <LegacyGuideQuickAnswer referencesHref="#references">
        <p><strong>Do not treat NAC as a general-purpose detox protocol.</strong> Its clearest medical use is prescription acetylcysteine for potentially hepatotoxic acetaminophen overdose under monitored care [1]. Respiratory evidence is mixed across meta-analyses [2,3], psychiatric trials are condition-specific [4], and oral glutathione can increase glutathione stores in humans rather than being categorically “destroyed in the gut” [5]. None of those findings proves that a healthy person should take NAC or glutathione every day for detox, anti-aging, liver cleansing, or hangover prevention.</p>
      </LegacyGuideQuickAnswer>

      <section id="nac-evidence-by-indication" data-answer-engine-table="true" className="card-premium scroll-mt-24 p-6 space-y-4 max-w-5xl border-l-4 border-brand-700 bg-brand-50/30">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-700">At a Glance · Keep the Indications Separate</p>
        <div className="overflow-x-auto"><table className="min-w-[900px] text-sm"><caption className="sr-only">NAC and glutathione evidence by indication, what was studied, and the main limitation</caption><thead><tr className="border-b"><th scope="col" className="text-left py-3 pr-4 font-semibold text-ink">Question</th><th scope="col" className="text-left py-3 pr-4 font-semibold text-ink">What is supported</th><th scope="col" className="text-left py-3 pr-4 font-semibold text-ink">Main limitation</th><th scope="col" className="text-left py-3 font-semibold text-ink">What not to infer</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">Acetaminophen overdose</th><td className="py-3 pr-4">Prescription acetylcysteine is an antidote used to prevent or lessen hepatic injury after potentially hepatotoxic exposure [1].</td><td className="py-3 pr-4">This is monitored toxicology care with specific treatment algorithms.</td><td className="py-3">It does not establish a daily liver-protection supplement protocol.</td></tr>
          <tr className="border-b"><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">COPD / chronic bronchitis</th><td className="py-3 pr-4">Some meta-analyses report fewer exacerbations and symptom/QoL signals [2].</td><td className="py-3 pr-4">Other meta-analyses find no significant improvement in several COPD outcomes [3].</td><td className="py-3">Do not convert one pooled estimate into a universal dose or NNT.</td></tr>
          <tr className="border-b"><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">Trichotillomania / psychiatric research</th><td className="py-3 pr-4">An adult randomized trial found a condition-specific signal for trichotillomania [4].</td><td className="py-3 pr-4">Psychiatric evidence varies by diagnosis, trial, co-treatment, and population.</td><td className="py-3">A positive adjunct trial is not a self-treatment recipe for OCD-spectrum conditions.</td></tr>
          <tr className="border-b"><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">Oral glutathione</th><td className="py-3 pr-4">A six-month randomized trial found increases in glutathione stores in multiple compartments [5].</td><td className="py-3 pr-4">Biomarker change does not automatically equal a clinically important outcome.</td><td className="py-3">It is inaccurate to say oral glutathione is simply useless or completely destroyed.</td></tr>
          <tr><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">General detox / wellness</th><td className="py-3 pr-4">Glutathione has important endogenous redox and detoxification roles [6].</td><td className="py-3 pr-4">A physiologic pathway is not a validated supplement indication.</td><td className="py-3">Do not inherit evidence from poisoning, COPD, or psychiatric trials.</td></tr>
        </tbody></table></div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Why “NAC raises glutathione” is not the end of the evidence chain</h2>
        <p className="text-sm leading-7 text-muted">NAC can provide cysteine, a substrate relevant to glutathione synthesis [6]. That supports mechanism. It does not tell us whether supplementation improves a particular symptom, disease outcome, lifespan endpoint, or nonspecific feeling of “detox.” Each clinical claim needs its own human evidence.</p>
      </section>

      <section className="rounded-2xl border border-amber-900/15 bg-amber-50/70 p-6 text-amber-950 dark:border-amber-200/20 dark:bg-amber-950/20 dark:text-amber-50">
        <p className="text-xs font-bold uppercase tracking-[0.16em]">Safety boundary</p>
        <h2 className="mt-2 text-2xl font-semibold">Do not use supplement logic to manage poisoning or replace treatment</h2>
        <p className="mt-3 text-sm leading-7">Suspected acetaminophen overdose is time-sensitive medical care, not a supplement experiment. Likewise, COPD, psychiatric symptoms, pregnancy, asthma, significant liver or kidney disease, and medication use can materially change the risk/benefit question. A product sold as NAC is not interchangeable with a hospital acetylcysteine protocol [1].</p>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2>
        <p className="text-sm leading-7 text-muted">NAC and glutathione are biologically connected, but the evidence does not support one universal “NAC is better” or “glutathione is useless” rule. Use indication-specific evidence: prescription toxicology is one lane, respiratory trials another, psychiatric research another, and oral glutathione biomarker studies another. General detox and wellness claims require evidence of their own.</p>
      </section>

      <LegacyGuideFAQ questions={FAQS} pagePath="/guides/other/glutathione-nac-guide/" />
      <section id="references" className="scroll-mt-24"><References refs={NAC_REFS} /></section>
      <div className="max-w-4xl"><RecommendationSection title="NAC sourcing examples" description="Product links are sourcing examples, not a treatment, detox, or dosing recommendation. Match any use to the specific evidence and your medication/health context." products={getRevenueProductSet('nac')?.products ?? []} /></div>
      <EmailCapture headline="Get evidence reviews like this" description="NAC, glutathione, antioxidants — evidence by indication, not marketing shortcuts." ctaLabel="Get the evidence" location="guide-nac" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/safety-checker/" className="text-sm font-bold text-brand-800 hover:underline">Safety checker →</Link></div>
    </div>
  )
}
