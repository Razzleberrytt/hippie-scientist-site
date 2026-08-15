import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FAQSchema from '@/components/seo/FAQSchema'
import References from '@/components/References'

export const metadata: Metadata = buildPageMetadata({
  title: 'Methylene Blue as a Nootropic: Evidence, SSRI Risk & Product Grade',
  description:
    'Evidence-first methylene blue guide: the tiny healthy-human cognition trial, MAO-A and serotonin-syndrome risk, G6PD contraindication, medical-vs-aquarium product distinctions, and why biohacker dosing claims outrun the evidence.',
  path: '/guides/other/methylene-blue-nootropic/',
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'Is methylene blue a proven nootropic?',
    answer:
      'No. A randomized double-blind placebo-controlled fMRI study in 26 healthy adults found changes in brain activity/connectivity and some short-term memory-related outcomes after a single low oral exposure. That is an interesting proof-of-concept study, not a replicated evidence base showing reliable everyday cognitive enhancement.',
  },
  {
    question: 'Can methylene blue interact with antidepressants?',
    answer:
      'Yes. Methylene blue is a potent reversible monoamine oxidase A inhibitor. Current U.S. prescribing information warns that serotonin syndrome has occurred with concomitant serotonergic drugs, including SSRIs and SNRIs, and with some opioids and dextromethorphan. This interaction can be serious or fatal.',
  },
  {
    question: 'Is low-dose methylene blue automatically safe with an SSRI?',
    answer:
      'No reliable oral “safe nootropic threshold” has been established for people taking serotonergic medications. Published serotonin-toxicity reports and MAO-A pharmacology are strong enough that co-use should not be improvised from internet dose charts.',
  },
  {
    question: 'Why does G6PD deficiency matter?',
    answer:
      'Current methylene blue injection labeling lists G6PD deficiency as a contraindication because of hemolytic-anemia risk. A person should not assume they are protected simply because they have never previously had a hemolytic episode.',
  },
  {
    question: 'Can aquarium or fish-grade methylene blue be used by people?',
    answer:
      'Animal- or aquarium-intended products should not be treated as human drug products. FDA warns generally that animal drugs should not be substituted for human medicines because their safety, effectiveness, manufacturing, purity, potency, handling, and labeling may not meet standards for human use.',
  },
  {
    question: 'What dose should someone take for cognition?',
    answer:
      'There is no validated consumer nootropic dose. Clinical methemoglobinemia dosing and experimental cognition-study exposure answer different questions and should not be converted into a self-treatment protocol.',
  },
] as const

const METHYLENE_BLUE_REFS = [
  {
    n: 1,
    text: 'Current U.S. prescribing information: Methylene Blue Injection. Serotonin-syndrome warning; G6PD-deficiency contraindication; methemoglobinemia indication context.',
    url: 'https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=8c56fbad-a449-4ed4-a55f-1694e4e8e26a',
  },
  {
    n: 2,
    text: 'Ramsay RR, Dunford C, Gillman PK. Methylene blue and serotonin toxicity: inhibition of monoamine oxidase A confirms a theoretical prediction. Br J Pharmacol. 2007. PMID 17721552.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/17721552/',
  },
  {
    n: 3,
    text: 'Ng BKW, Cameron AJD. The role of methylene blue in serotonin syndrome: a systematic review. Psychosomatics. 2010. PMID 20484716.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/20484716/',
  },
  {
    n: 4,
    text: 'Zuschlag ZD, et al. Serotonin Toxicity and Urinary Analgesics: case report and systematic literature review of methylene-blue-induced serotonin syndrome. Psychosomatics. 2018. PMID 30104021.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/30104021/',
  },
  {
    n: 5,
    text: 'Rodriguez P, et al. Multimodal Randomized Functional MR Imaging of the Effects of Methylene Blue in the Human Brain. Radiology. 2016. Twenty-six healthy adults. PMID 27351678.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/27351678/',
  },
  {
    n: 6,
    text: 'Methylene blue modulates functional connectivity in the human brain. Brain Imaging Behav. 2017. PMID 26961091.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/26961091/',
  },
  {
    n: 7,
    text: 'U.S. Food and Drug Administration. Ornamental Fish Drugs and You: animal drugs should not be substituted for medicines used in people.',
    url: 'https://www.fda.gov/animal-veterinary/animal-health-literacy/ornamental-fish-drugs-and-you',
  },
]

export default function MethyleneBlueNootropicPage() {
  return (
    <div className="container-page space-y-10 py-10">
      <AuthorityJsonLd
        title="Methylene Blue as a Nootropic: Evidence, SSRI Risk and Product Grade"
        description="Evidence-calibrated review of methylene blue cognition claims, MAO-A pharmacology, serotonin-syndrome risk, G6PD contraindication, and product-grade distinctions."
        url="https://thehippiescientist.net/guides/other/methylene-blue-nootropic/"
        type="MedicalWebPage"
        faqItems={[...FAQS]}
        citationUrls={METHYLENE_BLUE_REFS.map((reference) => reference.url)}
      />
      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides/' },
          { label: 'Methylene Blue as a Nootropic' },
        ]}
      />
      <FAQSchema pagePath="/guides/other/methylene-blue-nootropic/" questions={[...FAQS]} />

      <section className="max-w-4xl space-y-5">
        <p className="eyebrow-label">Drug / Nootropic Evidence Review · Updated August 15, 2026</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Methylene Blue as a Nootropic: Tiny Cognition Evidence, Very Real Drug Interactions
        </h1>
        <p className="text-lg leading-8 text-muted">
          Methylene blue is increasingly sold into the biohacking world as a mitochondrial or cognitive enhancer. That framing can hide the most important fact: methylene blue is a pharmacologically active drug/dye with potent monoamine-oxidase-A activity, a current prescription label with serious interaction warnings, and only a very small healthy-human cognition literature.
        </p>
      </section>

      <section className="rounded-2xl border border-rose-900/15 bg-rose-50/80 p-5 text-sm leading-7 text-rose-950 max-w-4xl">
        <p className="font-semibold">High-priority medication warning</p>
        <p className="mt-2">
          Methylene blue can precipitate serotonin syndrome when combined with serotonergic drugs. Current U.S. labeling specifically warns about serotonergic medicines including SSRIs and SNRIs and also notes risk with some opioids and dextromethorphan [1]. This page does not provide a washout schedule, interaction workaround, or “safe low dose” for combining them.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Evidence bottom line</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">The safety signal is stronger than the nootropic signal</h2>
        <p className="text-sm leading-7 text-muted">
          The best-known randomized healthy-human cognition study enrolled only <strong>26 adults</strong>. It used a double-blind placebo-controlled design with functional MRI before and after a single low oral exposure and reported brain-activation/connectivity changes plus some memory-related signals [5,6].
        </p>
        <p className="text-sm leading-7 text-muted">
          That is useful proof-of-concept research. It does not establish durable cognitive enhancement, an everyday nootropic dose, long-term safety in healthy users, benefit in ADHD, dementia prevention, or superiority to conventional sleep, exercise, or medical treatment.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-5 border-l-4 border-brand-700 bg-brand-50/30 p-6">
        <p className="eyebrow-label">Drug-vs-supplement identity</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Why “just another supplement” is the wrong category</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-sm">
            <thead>
              <tr className="border-b border-brand-900/10">
                <th className="py-2 pr-4 text-left font-semibold text-ink">Question</th>
                <th className="py-2 text-left font-semibold text-ink">Evidence-based answer</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              <tr className="border-b border-brand-900/5 align-top"><td className="py-3 pr-4 font-medium text-ink">Is there a U.S. prescription methylene-blue drug product?</td><td className="py-3">Yes. Current labeling covers methylene blue injection used in methemoglobinemia [1].</td></tr>
              <tr className="border-b border-brand-900/5 align-top"><td className="py-3 pr-4 font-medium text-ink">Is cognition an approved indication?</td><td className="py-3">No.</td></tr>
              <tr className="border-b border-brand-900/5 align-top"><td className="py-3 pr-4 font-medium text-ink">Does it have clinically relevant enzyme pharmacology?</td><td className="py-3">Yes. Methylene blue is a potent reversible MAO-A inhibitor [2].</td></tr>
              <tr className="border-b border-brand-900/5 align-top"><td className="py-3 pr-4 font-medium text-ink">Can serious serotonergic interactions occur?</td><td className="py-3">Yes; current labeling and case literature document serotonin syndrome [1,3,4].</td></tr>
              <tr className="align-top"><td className="py-3 pr-4 font-medium text-ink">Does online “supplement-style” marketing change those facts?</td><td className="py-3">No.</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Mechanism with consequences</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">MAO-A inhibition is not just a nootropic mechanism graphic</h2>
        <p className="text-sm leading-7 text-muted">
          Laboratory work showed that methylene blue is a potent, tight-binding reversible inhibitor of human MAO-A [2]. MAO-A helps metabolize serotonin and other monoamines. This pharmacology provides a mechanistic explanation for the serotonin toxicity reported when methylene blue is combined with serotonin-enhancing drugs.
        </p>
        <p className="text-sm leading-7 text-muted">
          A systematic review identified a cluster of acute neuropsychiatric/autonomic reactions after methylene-blue exposure in people taking serotonin-reuptake inhibitors [3]. A later review collected 50 unique reported serotonin-syndrome cases associated with methylene blue and serotonergic antidepressants, plus an oral-agent case showing that oral exposure should not be assumed interaction-free [4].
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 border-l-4 border-amber-500 bg-amber-50/40 p-6">
        <p className="eyebrow-label">G6PD safety boundary</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">A genetic red-cell vulnerability changes the risk</h2>
        <p className="text-sm leading-7 text-muted">
          Current methylene blue injection labeling lists <strong>glucose-6-phosphate dehydrogenase (G6PD) deficiency</strong> as a contraindication because of hemolytic-anemia risk [1]. This is not a niche theoretical warning: methylene blue depends on redox pathways that behave differently in G6PD-deficient red blood cells.
        </p>
        <p className="text-sm leading-7 text-muted">
          That is another reason a “start low and see how you feel” biohacker framework is inappropriate. A person can have G6PD deficiency without already knowing it, and hemolysis is not something to screen for by subjective response after exposure.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Product-grade integrity</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">USP human drug, compounded product, research chemical, and aquarium product are not synonyms</h2>
        <p className="text-sm leading-7 text-muted">
          A labeled human prescription drug is manufactured and tested to defined pharmaceutical specifications. An aquarium- or animal-intended dye/product is not made equivalent by having “methylene blue” on the label.
        </p>
        <p className="text-sm leading-7 text-muted">
          FDA warns consumers not to substitute animal drugs for human medicines because unapproved animal products may not have been evaluated for human safety/effectiveness and may not meet human-drug expectations for manufacturing, purity, potency, handling, storage, or labeling [7]. That general warning is directly relevant to the online practice of sourcing aquarium products for self-experimentation.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Nootropic evidence</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">What the 26-person trial can—and cannot—tell us</h2>
        <p className="text-sm leading-7 text-muted">
          The randomized healthy-adult imaging study is interesting because it paired cognitive tasks with functional MRI and measured acute changes after methylene blue [5]. A related analysis reported altered functional connectivity in networks linked to perception and memory [6].
        </p>
        <p className="text-sm leading-7 text-muted">
          But a small acute mechanistic study is several steps away from a practical recommendation. It does not establish:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-muted">
          <li>long-term benefit or safety in healthy users;</li>
          <li>a reliable effect on work, school, or daily executive function;</li>
          <li>a safe consumer dose across medications and genotypes;</li>
          <li>benefit for ADHD, depression, “brain fog,” or dementia prevention;</li>
          <li>that repeated use is better than a single experimental exposure.</li>
        </ul>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Evidence applicability</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Claims we can and cannot make</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[700px] w-full text-sm">
            <thead>
              <tr className="border-b border-brand-900/10"><th className="py-2 pr-4 text-left font-semibold text-ink">Claim</th><th className="py-2 text-left font-semibold text-ink">Current status</th></tr>
            </thead>
            <tbody className="text-muted">
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">Methylene blue has human brain-imaging/cognition data</td><td className="py-3"><strong>Yes, but very small</strong></td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">It is an established everyday nootropic</td><td className="py-3"><strong>No</strong></td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">It is a potent MAO-A inhibitor</td><td className="py-3"><strong>Yes</strong></td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">Serotonin syndrome with serotonergic drugs is a credible risk</td><td className="py-3"><strong>Yes</strong></td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">G6PD deficiency is a labeled contraindication for the prescription injection</td><td className="py-3"><strong>Yes</strong></td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">Aquarium-grade material is interchangeable with human drug product</td><td className="py-3"><strong>No</strong></td></tr>
              <tr><td className="py-3 pr-4">A validated oral nootropic dose exists</td><td className="py-3"><strong>No</strong></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Unanswered questions</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">What would turn biohacker interest into useful evidence?</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-muted">
          <li>Can the healthy-human memory/cognition findings replicate in much larger trials?</li>
          <li>Do any acute laboratory effects persist with repeated exposure?</li>
          <li>What is the long-term adverse-event profile of oral exposure in otherwise healthy adults?</li>
          <li>How should oral pharmacokinetics be connected to MAO-A inhibition and serotonin-toxicity risk?</li>
          <li>Do common online compounded or non-prescription products match the identity and purity of studied material?</li>
          <li>Are there any populations in whom benefit clearly exceeds the interaction and hematologic risks?</li>
        </ol>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2>
        <p className="text-sm leading-7 text-muted">
          Methylene blue is scientifically interesting, but current “nootropic” enthusiasm is built on a much smaller human cognition base than the marketing suggests. The high-value facts are the ones biohacker pages often push below the fold: potent MAO-A activity, documented serotonin toxicity with serotonergic drugs, a labeled G6PD contraindication, and major differences between pharmaceutical human products and aquarium/research material. Until larger cognitive trials exist, this belongs in a drug-safety and emerging-evidence category—not a casual supplement stack.
        </p>
      </section>

      <References refs={METHYLENE_BLUE_REFS} />

      <div className="max-w-4xl rounded-xl border border-rose-900/15 bg-rose-50/70 p-4 text-xs leading-6 text-rose-950">
        <strong>No purchase links:</strong> because methylene blue has clinically important drug-interaction and hematologic risks and cognition is not an approved indication, this guide intentionally does not link to retail methylene-blue products or provide self-dosing instructions.
      </div>

      <div className="flex items-center justify-between border-t border-brand-900/10 pt-4">
        <Link
          href="/guides/other/"
          className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50"
        >
          ← More topic guides
        </Link>
        <Link href="/learn/interactions/" className="text-sm font-bold text-brand-800 hover:underline">
          Interaction guide →
        </Link>
      </div>
    </div>
  )
}
