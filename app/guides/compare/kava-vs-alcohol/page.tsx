import type { Metadata } from 'next'
import Image from 'next/image'
import { buildPageMetadata } from '../../../../lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Kava vs Alcohol: Effects, Risks & Interactions',
  description: 'Compare kava and alcohol by calming effects, impairment, dependence risk, liver concerns, medication interactions, and the limits of current human evidence.',
  path: '/guides/compare/kava-vs-alcohol/',
})

import Link from 'next/link'
import FAQSchema from '@/components/seo/FAQSchema'
import References from '@/components/References'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import CitationReadySummary from '@/components/seo/CitationReadySummary'

const KAVA_VS_ALCOHOL_REFS = [
  { n: 1, text: 'Sarris J, et al. (2013). Kava in the treatment of generalized anxiety disorder. J Clin Psychopharmacol, 33(5): 643-648.', url: 'https://pubmed.ncbi.nlm.nih.gov/23635869/' },
  { n: 2, text: 'Pittler MH, Ernst E. (2003). Kava extract versus placebo for treating anxiety. Cochrane Database Syst Rev, (1): CD003383.', url: 'https://pubmed.ncbi.nlm.nih.gov/12535473/' },
  { n: 3, text: 'Teschke R, et al. (2011). Kava hepatotoxicity solution: a six-point plan for new kava standardization. Phytomedicine, 18(2-3): 96-103.', url: 'https://pubmed.ncbi.nlm.nih.gov/21112196/' },
  { n: 4, text: 'Rehm J, et al. (2010). Alcohol as a risk factor for liver cirrhosis: a systematic review. Drug Alcohol Rev, 29(4): 437-445.', url: 'https://pubmed.ncbi.nlm.nih.gov/20636661/' },
  { n: 5, text: 'Sarris J, et al. (2011). Kava for the treatment of generalized anxiety disorder. J Clin Psychopharmacol, 31(5): 592-598.', url: 'https://pubmed.ncbi.nlm.nih.gov/21849899/' },
  { n: 6, text: 'Sarris J, et al. (2020). Kava for generalised anxiety disorder: a 16-week randomised placebo-controlled trial in 171 adults. Aust N Z J Psychiatry, 54(3):288-297.', url: 'https://pubmed.ncbi.nlm.nih.gov/31813230/' },
  { n: 7, text: 'NCCIH. Kava: Usefulness and Safety. Includes liver-injury warnings for water-prepared beverages and sedative interactions.', url: 'https://www.nccih.nih.gov/health/kava' },
  { n: 8, text: 'NIH LiverTox. Kava Kava: Clinical and Research Information on Drug-Induced Liver Injury.', url: 'https://www.ncbi.nlm.nih.gov/books/NBK548637/' },
]

const KAVA_FAQ_ALTERNATIVE = 'Kava and alcohol have different effects and risks, but kava is not an established safe alternative or a treatment for alcohol use disorder. Kava may cause dizziness, sedation, and memory problems and has been linked to rare serious liver injury. Do not combine kava with alcohol.'
const KAVA_FAQ_LIVER = 'Yes. Kava-containing products have been associated with rare but sometimes severe liver injury, including liver failure, transplantation, and death. Some reports involve beverages prepared with water, not only solvent-extracted products. No cultivar or extraction method has been established as eliminating the risk. People with liver disease or who take medications should discuss kava risks with a clinician or pharmacist.'
const KAVA_FAQ_EFFECTS = 'Both may produce relaxation, but their effects vary between people and preparations. Kava can cause dizziness, sedation, and memory difficulties; it should not be characterized as reliably preserving judgment or coordination. Alcohol also impairs cognition and coordination.'

export default function KavaVsAlcoholPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Kava vs Alcohol"
        description="Educational comparison of kava and alcohol, calming neuropharmacology, stress-response systems, and safety considerations.
      "
        url="https://thehippiescientist.net/guides/compare/kava-vs-alcohol"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Compare', href: '/guides/compare' },
          { label: 'Kava vs Alcohol' },
        ]}
      />

      <section className="space-y-4 max-w-4xl">
        <p className="eyebrow-label">Educational Comparison</p>

        <h1 className="text-4xl font-bold tracking-tight text-ink">
          Kava vs Alcohol
        </h1>

        <p className="text-lg leading-8 text-muted">
          Educational comparison of kava and alcohol through the lens of neuropharmacology, inhibitory signaling, stress-response systems, sedation, and harm reduction.
        </p>

        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
            <Image
              src="/images/guides/kava-vs-alcohol.jpg"
              alt="A cup of kava and kava root beside a glass of wine, compared for relaxation"
              width={1536}
              height={1024}
              priority
              className="w-full h-auto"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            Kava vs alcohol — relaxation, risks, and the real trade-offs.
          </figcaption>
        </figure>
      </section>

      <CitationReadySummary
        answer="Kava may produce relaxation, but evidence for treating anxiety is mixed and it can cause sedation or memory difficulties. Kava products have been linked to rare serious liver injury, including some water-prepared beverages. Do not combine kava with alcohol."
        bestFor={[
          'Kava: traditionally used for relaxation, but efficacy evidence is mixed and serious liver-injury and sedative risks limit its use.',
          'Alcohol: broadly familiar and legal, but carries well-documented dependence, liver, and cognitive-impairment risks with regular use.',
          'Neither: combining kava and alcohol, since both affect GABA signaling and can amplify sedation and liver strain.',
        ]}
        evidenceLevel="An earlier six-week trial found a benefit for generalized anxiety symptoms, while a 2020 sixteen-week trial in 171 adults found no significant improvement over placebo. Liver injury has been reported with multiple preparations, including some water-based beverages; no preparation has been proven to eliminate that risk."
        safetyNote="Do not combine kava with alcohol or other sedatives. Kava has been linked to rare severe liver injury; people with liver disease or taking medications should seek clinician or pharmacist advice before considering it."
        notClaiming="This page is not claiming kava is a safe substitute for alcohol use disorder treatment or that it is risk-free for the liver."
        referencesHref="#references"
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card-premium p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Kava</h2>
          <p className="text-sm leading-7 text-muted">
            Kava (Piper methysticum) contains kavalactones with central nervous system activity and a long history of traditional Pacific Island ceremonial and social use. Relaxation is reported, but dizziness, sedation, memory problems, and severe liver injury are important safety concerns.
          </p>
          <Link href="/herbs/kava/" className="chip-readable">
            Explore Kava
          </Link>
        </div>

        <div className="card-premium p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Alcohol</h2>
          <p className="text-sm leading-7 text-muted">
            Alcohol is a CNS depressant with broad effects across GABA, glutamate, dopamine, and opioid systems. While socially accepted, it carries well-documented risks including dependence, liver damage, impaired cognition, and increased cancer risk with regular use.
          </p>
        </div>
      </section>

      {/* Mechanism comparison */}
      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">How they work on the brain</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="font-semibold text-ink">Kava: GABA-A modulation</h3>
            <p className="mt-2 text-sm leading-7 text-muted">
              Kavalactones act on several central nervous system pathways, but pharmacologic plausibility does not establish reliable anxiety relief or freedom from impairment. Serious liver injury has been linked to several kava product types, including some beverages prepared with water.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-ink">Alcohol: Broad-spectrum depressant</h3>
            <p className="mt-2 text-sm leading-7 text-muted">
              Alcohol enhances GABA-A activity while suppressing glutamate (NMDA) signaling. The dual action produces sedation, disinhibition, and at higher doses, significant cognitive and motor impairment. Chronic use leads to receptor adaptation, tolerance, and withdrawal risk.
            </p>
          </div>
        </div>
        <div className="mt-4 p-4 rounded-xl bg-amber-50/60 border border-amber-200">
          <p className="text-sm font-bold text-amber-900">Key safety note</p>
          <p className="mt-1 text-sm leading-6 text-amber-800">Do not combine kava with alcohol. Both substances affect GABA signaling and overlapping use can amplify sedation, impair liver function, and increase accident risk. If you currently drink alcohol regularly, discuss any change with a clinician before introducing kava.</p>
        </div>
      </section>

      {/* Practical comparison */}
      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Practical differences at a glance</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[560px] text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 pr-4 font-semibold">Factor</th>
                <th className="text-left py-3 pr-4 font-semibold">Kava</th>
                <th className="text-left py-3 font-semibold">Alcohol</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              <tr className="border-b"><td className="py-3 pr-4">Onset</td><td className="py-3 pr-4">15–30 min</td><td className="py-3">10–20 min</td></tr>
              <tr className="border-b"><td className="py-3 pr-4">Duration</td><td className="py-3 pr-4">2–4 hours</td><td className="py-3">Dose-dependent (1–4+ hours)</td></tr>
              <tr className="border-b"><td className="py-3 pr-4">Cognitive effects</td><td className="py-3 pr-4">May cause sedation, dizziness, or memory difficulties</td><td className="py-3">Impaired judgment, memory, coordination</td></tr>
              <tr className="border-b"><td className="py-3 pr-4">Dependence risk</td><td className="py-3 pr-4">Dependence and withdrawal risk less well characterized</td><td className="py-3">Moderate to high (physical + psychological)</td></tr>
              <tr className="border-b"><td className="py-3 pr-4">Liver concerns</td><td className="py-3 pr-4">Rare serious liver injury reported, including with water-prepared beverages</td><td className="py-3">Well-established dose-dependent toxicity</td></tr>
              <tr><td className="py-3 pr-4">Sleep impact</td><td className="py-3 pr-4">May improve sleep quality</td><td className="py-3">Fragments sleep architecture</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Frequently asked questions</h2>
        <div className="space-y-4 text-sm leading-7 text-muted">
          <div>
            <h3 className="text-lg font-semibold text-ink">Is kava a safe alternative to alcohol?</h3>
            <p>{KAVA_FAQ_ALTERNATIVE}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-ink">Can kava damage your liver?</h3>
            <p>{KAVA_FAQ_LIVER}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-ink">Does kava feel like alcohol?</h3>
            <p>{KAVA_FAQ_EFFECTS}</p>
          </div>
        </div>
      </section>

      <FAQSchema
        pagePath="/guides/compare/kava-vs-alcohol/"
        questions={[
          { question: 'Is kava a safe alternative to alcohol?', answer: KAVA_FAQ_ALTERNATIVE },
          { question: 'Can kava damage your liver?', answer: KAVA_FAQ_LIVER },
          { question: 'Does kava feel like alcohol?', answer: KAVA_FAQ_EFFECTS },
        ]}
      />

      <section className="surface-subtle rounded-3xl p-6 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          Harm reduction considerations
        </h2>

        <p className="text-sm leading-7 text-muted">
          Psychoactive substances may affect coordination, cognition, sedation levels, medication interactions, sleep architecture, and behavioral risk. Educational comparison should prioritize conservative interpretation and safety awareness.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link href="/learn/harm-reduction/" className="chip-readable">
            Harm Reduction
          </Link>

          <Link href="/learn/gaba/" className="chip-readable">
            GABA Pathway
          </Link>

          <Link href="/safety-checker/" className="chip-readable">
            Safety Checker
          </Link>

          <Link href="/info/dosing/" className="chip-readable">
            Dosing Guide
          </Link>
        </div>
      </section>
      <References refs={KAVA_VS_ALCOHOL_REFS} />
    </div>
  )
}
