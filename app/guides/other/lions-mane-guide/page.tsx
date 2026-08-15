import type { Metadata } from 'next'
import RecommendationSection from '@/components/RecommendationSection'
import { getRevenueProductSet } from '@/config/revenue-products'
import Link from 'next/link'
import Image from 'next/image'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FAQSchema from '@/components/seo/FAQSchema'
import References from '@/components/References'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: "Lion's Mane: 2026 Cognition Evidence, Fruiting Body vs Mycelium",
  description:
    "Evidence-first lion's mane review: older-adult cognition trials, mostly null healthy-young-adult data, mood evidence, NGF mechanism limits, fruiting-body vs mycelium differences, and why beta-glucan percentages do not prove nootropic potency.",
  path: '/guides/other/lions-mane-guide/',
  openGraphType: 'article',
})

const FAQS = [
  {
    question: "Does lion's mane improve cognition?",
    answer:
      'Human evidence is preliminary and population-dependent. Small older-adult trials have reported cognitive signals, including a 30-person mild-cognitive-impairment trial and a later randomized study in older adults. Healthy-young-adult studies are less convincing: a 41-person pilot found one acute Stroop signal amid null/limited findings, and a 2025 18-person crossover found no significant global cognition or mood benefit.',
  },
  {
    question: "Does lion's mane raise nerve growth factor in the human brain?",
    answer:
      'The neurotrophic story is driven mainly by cell and animal research on Hericium compounds such as erinacines and hericenones. Human cognitive trials do not establish that oral retail lion’s mane reliably raises brain NGF or that NGF explains any clinical benefit. Mechanism should not be treated as a human biomarker result.',
  },
  {
    question: 'Is fruiting body better than mycelium?',
    answer:
      'There is no head-to-head human cognition trial proving one category is universally superior. Fruiting bodies and mycelia can contain different bioactive profiles: hericenones are associated mainly with fruiting bodies, while erinacines are especially associated with mycelium. The correct question is whether the commercial product matches the form and chemistry used in the trial supporting the claim.',
  },
  {
    question: 'Does a high beta-glucan percentage prove a lion’s mane product is better for cognition?',
    answer:
      'No. Beta-glucans can be useful mushroom quality markers, but the cognition/NGF marketing story often focuses on other compounds such as hericenones and erinacines. A beta-glucan number does not establish a clinically validated nootropic dose or prove equivalence to a specific trial extract.',
  },
  {
    question: "What dose of lion's mane should someone take for cognition?",
    answer:
      'There is no universally validated cognitive dose. Human studies have used different powders, extracts, forms, and durations. Their exposures should be treated as study descriptors rather than converted into a generic 500-to-3,000 mg start-and-titrate protocol.',
  },
  {
    question: "Does lion's mane treat depression or anxiety?",
    answer:
      'Not on current evidence. A small 2010 randomized study in 30 women reported some mood-related improvements after four weeks, and a 41-person healthy-young-adult pilot found only a trend toward lower subjective stress after 28 days. That is not an antidepressant evidence base.',
  },
] as const

const LIONSMANE_REFS = [
  {
    n: 1,
    text: "Mori K, et al. Improving effects of the mushroom Yamabushitake (Hericium erinaceus) on mild cognitive impairment: a double-blind placebo-controlled clinical trial. Phytother Res. 2009. Thirty participants. PMID 18844328.",
    url: 'https://pubmed.ncbi.nlm.nih.gov/18844328/',
  },
  {
    n: 2,
    text: "Saitsu Y, et al. Improvement of cognitive functions by oral intake of Hericium erinaceus. Biomed Res. 2019;40(4):125-131. Randomized 12-week fruiting-body study. PMID 31413233.",
    url: 'https://pubmed.ncbi.nlm.nih.gov/31413233/',
  },
  {
    n: 3,
    text: "Docherty S, et al. The Acute and Chronic Effects of Lion's Mane Mushroom Supplementation on Cognitive Function, Stress and Mood in Young Adults. Nutrients. 2023. Forty-one healthy adults. PMID 38004235.",
    url: 'https://pubmed.ncbi.nlm.nih.gov/38004235/',
  },
  {
    n: 4,
    text: "Surendran G, et al. Acute effects of a standardised extract of Hericium erinaceus on cognition and mood in healthy younger adults. Front Nutr. 2025. Eighteen-person double-blind crossover. PMID 40276537.",
    url: 'https://pubmed.ncbi.nlm.nih.gov/40276537/',
  },
  {
    n: 5,
    text: "Nagano M, et al. Reduction of depression and anxiety by 4 weeks Hericium erinaceus intake. Biomed Res. 2010. Thirty women. PMID 20834180.",
    url: 'https://pubmed.ncbi.nlm.nih.gov/20834180/',
  },
  {
    n: 6,
    text: "Four Weeks of Hericium erinaceus Supplementation Does Not Impact Markers of Metabolic Flexibility or Cognition. 2022. Twenty-four participants. PMID 36582308.",
    url: 'https://pubmed.ncbi.nlm.nih.gov/36582308/',
  },
  {
    n: 7,
    text: "Menon A, et al. Benefits, side effects, and uses of Hericium erinaceus as a supplement: a systematic review. Front Nutr. 2025. PMID 40959699.",
    url: 'https://pubmed.ncbi.nlm.nih.gov/40959699/',
  },
  {
    n: 8,
    text: "Spangenberg ET, et al. Unveiling the role of erinacines in the neuroprotective effects of Hericium erinaceus: a systematic review in preclinical models. Front Pharmacol. 2025. PMID 40626304.",
    url: 'https://pubmed.ncbi.nlm.nih.gov/40626304/',
  },
]

export default function LionsManePage() {
  return (
    <div className="container-page space-y-10 py-10">
      <AuthorityJsonLd
        title="Lion's Mane: 2026 Cognition Evidence, Fruiting Body vs Mycelium"
        description="Evidence-calibrated review of lion's mane cognition, mood, neurotrophic mechanisms, product-form differences, and study-to-product applicability."
        url="https://thehippiescientist.net/guides/other/lions-mane-guide/"
        type="MedicalWebPage"
        faqItems={[...FAQS]}
        citationUrls={LIONSMANE_REFS.map((reference) => reference.url)}
      />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: "Lion's Mane" }]} />
      <FAQSchema pagePath="/guides/other/lions-mane-guide/" questions={[...FAQS]} />

      <section className="max-w-4xl space-y-5">
        <p className="eyebrow-label">Mushroom Evidence Review · Updated August 15, 2026</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Lion&apos;s Mane: Interesting Human Signals, Much Less Certainty Than the “Brain Mushroom” Hype
        </h1>
        <p className="text-lg leading-8 text-muted">
          Lion&apos;s mane (<em>Hericium erinaceus</em>) has compelling neurobiology and a small human cognition literature. The problem is translation: cell and animal findings about NGF, erinacines, and hericenones are often turned into strong claims about retail powders, healthy-young-adult focus, “brain repair,” and fruiting-body superiority that human trials have not established.
        </p>
        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
            <Image src="/images/guides/lions-mane.jpg" alt="Lion's mane mushroom on dark wood" width={1536} height={1024} priority className="h-auto w-full" />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">A mushroom species is not one standardized clinical intervention.</figcaption>
        </figure>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Evidence bottom line</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Older-adult cognition signals exist; healthy-young-adult evidence is weak and inconsistent</h2>
        <p className="text-sm leading-7 text-muted">
          In the classic 2009 randomized trial, 30 adults ages 50–80 with mild cognitive impairment received lion&apos;s mane or placebo. Cognitive scores improved during the 16-week intervention, then fell after supplementation stopped [1]. A 2019 randomized fruiting-body study also reported a signal, but only the MMSE among three cognitive tests showed a significant treatment effect [2].
        </p>
        <p className="text-sm leading-7 text-muted">
          The healthy-young-adult literature is much less impressive. A 41-person pilot found faster Stroop performance after an acute dose and only a trend toward lower stress after 28 days, alongside null and limited negative findings [3]. A 2025 18-person crossover found <strong>no significant effect on composite global cognition or mood</strong>; one pegboard result improved [4].
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-5 border-l-4 border-brand-700 bg-brand-50/30 p-6">
        <p className="eyebrow-label">Outcome ledger</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Do not give the whole mushroom one “cognition” grade</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-sm">
            <thead><tr className="border-b border-brand-900/10"><th className="py-2 pr-4 text-left font-semibold text-ink">Question</th><th className="py-2 pr-4 text-left font-semibold text-ink">Best human evidence</th><th className="py-2 text-left font-semibold text-ink">Current interpretation</th></tr></thead>
            <tbody className="text-muted">
              <tr className="border-b border-brand-900/5 align-top"><td className="py-3 pr-4 font-medium text-ink">Mild cognitive impairment</td><td className="py-3 pr-4">Small 30-person RCT [1]</td><td className="py-3"><strong>Preliminary positive signal</strong>; needs larger replication</td></tr>
              <tr className="border-b border-brand-900/5 align-top"><td className="py-3 pr-4 font-medium text-ink">Older-adult cognition</td><td className="py-3 pr-4">12-week randomized fruiting-body trial [2]</td><td className="py-3"><strong>Mixed across tests</strong>; MMSE signal only</td></tr>
              <tr className="border-b border-brand-900/5 align-top"><td className="py-3 pr-4 font-medium text-ink">Healthy-young-adult cognition</td><td className="py-3 pr-4">41-person pilot + 18-person crossover [3,4]</td><td className="py-3"><strong>Weak / task-specific</strong>, no global effect established</td></tr>
              <tr className="border-b border-brand-900/5 align-top"><td className="py-3 pr-4 font-medium text-ink">Mood / stress</td><td className="py-3 pr-4">30-woman 2010 RCT + 41-person pilot [5,3]</td><td className="py-3"><strong>Preliminary</strong>, not an antidepressant evidence base</td></tr>
              <tr className="align-top"><td className="py-3 pr-4 font-medium text-ink">NGF / neurogenesis mechanism</td><td className="py-3 pr-4">Predominantly cell/animal literature [8]</td><td className="py-3"><strong>Mechanistically interesting</strong>, not established human clinical mediation</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Mechanism boundary</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">“Stimulates NGF” is not the same as “repairs the human brain”</h2>
        <p className="text-sm leading-7 text-muted">
          Lion&apos;s mane research includes neurotrophic compounds such as hericenones and erinacines, and a 2025 systematic review of erinacines found extensive preclinical signals involving neurogenesis, antioxidant responses, inflammation, and behavior [8]. That literature is useful for generating hypotheses.
        </p>
        <p className="text-sm leading-7 text-muted">
          It does <strong>not</strong> establish that an oral retail product reliably raises NGF in the human hippocampus, remyelinates neurons, reverses neurodegeneration, or “repairs” the brain. Human cognition outcomes should be the endpoint—not a mechanism diagram used as a substitute for them.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Fruiting body vs mycelium</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">The right answer is chemistry + trial match, not a universal winner</h2>
        <p className="text-sm leading-7 text-muted">
          Fruiting bodies and mycelia are chemically different. Hericenones are commonly associated with fruiting bodies, while erinacines are especially studied from mycelium. That makes the blanket advice “fruiting body only is always better” scientifically awkward: some of the very compounds invoked in neurotrophic marketing are mycelial erinacines [8].
        </p>
        <p className="text-sm leading-7 text-muted">
          The more defensible product question is: <strong>what exact material was used in the human trial supporting this claim, and does the commercial product characterize the same material?</strong> A fruiting-body powder, a 10:1 fruiting-body extract, an erinacine-enriched mycelial preparation, and mycelium grown on grain should not be assumed interchangeable.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Beta-glucan trap</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">A mushroom quality marker is not automatically a nootropic potency marker</h2>
        <p className="text-sm leading-7 text-muted">
          Beta-glucan content can help characterize mushroom material and distinguish it from starch-heavy formulations. But the cognitive/NGF story often centers on <strong>hericenones and erinacines</strong>, not on a validated beta-glucan threshold.
        </p>
        <p className="text-sm leading-7 text-muted">
          Therefore “30% beta-glucans” should not be translated into “clinically stronger for cognition” unless comparative human evidence demonstrates that relationship. The same applies to “10:1 extract,” “full spectrum,” and “dual extracted”: process labels are not clinical outcomes.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Acute nootropic claim</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">The newest acute trial argues against a broad same-day focus claim</h2>
        <p className="text-sm leading-7 text-muted">
          The 2025 crossover study tested a standardized fruiting-body extract in 18 healthy adults ages 18–35. Ninety minutes after the intervention, there was <strong>no significant overall improvement in global cognition or mood</strong> [4]. One pegboard measure improved.
        </p>
        <p className="text-sm leading-7 text-muted">
          A single task-specific result in a tiny study is not enough to market lion&apos;s mane as a reliable same-day focus enhancer. It is also a direct counterweight to claims that lion&apos;s mane necessarily “works cumulatively, not acutely”: the literature is testing both acute and chronic questions, and neither has established a universal response timeline.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Mood evidence</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Interesting small studies should stay attached to their populations</h2>
        <p className="text-sm leading-7 text-muted">
          A 2010 randomized study assigned 30 women to lion&apos;s-mane-containing cookies or placebo for four weeks and reported improvements on some depression/indefinite-complaint measures [5]. That is a useful signal, but it was not a trial in major depressive disorder and does not establish antidepressant efficacy.
        </p>
        <p className="text-sm leading-7 text-muted">
          The 41-person healthy-adult pilot found a trend toward reduced subjective stress after 28 days that narrowly missed conventional statistical significance (p=0.051) [3]. Calling the mood evidence “promising but preliminary” is more accurate than calling lion&apos;s mane a treatment for anxiety or depression.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Study dose ≠ consumer protocol</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Milligrams are meaningless without the preparation</h2>
        <p className="text-sm leading-7 text-muted">
          Human studies have used dry mushroom powder, fruiting-body preparations, standardized extracts, cookies containing mushroom material, and different intervention durations. A raw gram number cannot be compared across these products as though they were the same exposure.
        </p>
        <p className="text-sm leading-7 text-muted">
          This page therefore no longer recommends “start at 500 mg and titrate to 3,000 mg,” a minimum polysaccharide percentage, or a preferred morning schedule. Those details were more precise than the human evidence allows.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Safety</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Short trials look reasonably tolerable; long-term and interaction evidence remain limited</h2>
        <p className="text-sm leading-7 text-muted">
          The 2025 systematic review describes gastrointestinal discomfort, headache, and allergic reactions among reported potential adverse effects [7]. Human trials remain relatively small, which limits the ability to detect uncommon harms or characterize long-term safety.
        </p>
        <p className="text-sm leading-7 text-muted">
          “No well-documented interaction” should not be converted into “proven interaction-free,” particularly for concentrated extracts, people with mushroom allergy, pregnancy/breastfeeding, complex medical conditions, or multiple medications.
        </p>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Evidence applicability</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">What can we responsibly say?</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[700px] w-full text-sm">
            <thead><tr className="border-b border-brand-900/10"><th className="py-2 pr-4 text-left font-semibold text-ink">Claim</th><th className="py-2 text-left font-semibold text-ink">Status</th></tr></thead>
            <tbody className="text-muted">
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">Lion&apos;s mane has human cognition trials</td><td className="py-3"><strong>Yes, but small and heterogeneous</strong></td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">It reliably improves cognition in healthy young adults</td><td className="py-3"><strong>No</strong></td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">It directly repairs the human brain or remyelinates neurons</td><td className="py-3"><strong>Not established</strong></td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">Fruiting body is universally superior to mycelium</td><td className="py-3"><strong>Not established</strong></td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">A beta-glucan threshold predicts cognitive efficacy</td><td className="py-3"><strong>No validated threshold</strong></td></tr>
              <tr className="border-b border-brand-900/5"><td className="py-3 pr-4">It is a proven antidepressant/anxiolytic treatment</td><td className="py-3"><strong>No</strong></td></tr>
              <tr><td className="py-3 pr-4">One universal cognitive dose is established</td><td className="py-3"><strong>No</strong></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <p className="eyebrow-label">Research gaps</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">What would actually distinguish a clinically useful product?</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-muted">
          <li>Large preregistered cognition trials with prespecified primary endpoints.</li>
          <li>Direct comparisons of fruiting body, mycelium, and chemically standardized extracts.</li>
          <li>Quantification of hericenones/erinacines in the exact products tested clinically.</li>
          <li>Pharmacokinetic evidence connecting oral preparations to active compounds in humans.</li>
          <li>Replicated healthy-adult outcomes rather than isolated task-level positives.</li>
          <li>Longer-term safety and medication-interaction data.</li>
          <li>Evidence that any compositional marker—beta-glucans, hericenones, erinacines—predicts clinical response.</li>
        </ol>
      </section>

      <section className="card-premium max-w-4xl space-y-4 p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2>
        <p className="text-sm leading-7 text-muted">
          Lion&apos;s mane remains one of the more scientifically interesting functional mushrooms, but that should raise the evidence standard rather than lower it. Small older-adult cognition trials are encouraging; healthy-young-adult results are weak and task-specific; NGF/erinacine biology is still mostly preclinical; and product-form claims are far ahead of head-to-head human evidence. The competitive edge is not declaring a winner between fruiting body and mycelium—it is <strong>matching each claim to the exact material and human outcome that actually supports it.</strong>
        </p>
      </section>

      <References refs={LIONSMANE_REFS} />

      <div className="max-w-4xl rounded-xl border border-brand-900/10 bg-brand-50/40 p-4 text-xs leading-6 text-muted">
        <strong className="text-ink">Commercial-links boundary:</strong> products below are sourcing options, not proof that a retail powder or extract matches the form, chemistry, dose, or cognitive outcome of any study above. Beta-glucan percentages and “fruiting body” labels are not validated nootropic-efficacy scores.
      </div>
      <div className="max-w-4xl">
        <RecommendationSection products={getRevenueProductSet('lions-mane')?.products ?? []} />
      </div>
      <EmailCapture headline="Get evidence reviews like this" description="Mushrooms, nootropics, drugs, and supplements—with product chemistry kept attached to the actual human evidence." ctaLabel="Get the evidence" location="guide-lions-mane" />
      <div className="flex items-center justify-between border-t border-brand-900/10 pt-4">
        <Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link>
        <Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link>
      </div>
    </div>
  )
}
