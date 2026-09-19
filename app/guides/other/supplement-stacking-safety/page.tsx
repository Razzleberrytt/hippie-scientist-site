import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { buildPageMetadata } from '../../../../lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FAQSchema from '@/components/seo/FAQSchema'
import References from '@/components/References'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'Supplement Combination Safety: Interaction Screening (2026)',
  description: 'Evidence-first guide to screening supplement combinations for medication interactions, additive effects, missing data, and product-quality uncertainty.',
  path: '/guides/other/supplement-stacking-safety/',
  openGraphType: 'article',
})

const SEROTONERGIC_ATLAS_HREF = '/tools/botanical-activity-atlas/serotonergic-interaction-risk/?safety=Serotonergic&sort=evidence'

const FAQS = [
  {
    question: 'Can multiple supplements be taken together safely?',
    answer: 'Sometimes, but safety depends on the exact ingredients, doses, product quality, medicines, health conditions, and evidence for the combination. The absence of a known interaction is not proof that a combination has been studied or shown safe.',
  },
  {
    question: 'Which supplement combinations deserve the most caution?',
    answer: 'Combinations deserve extra scrutiny when ingredients affect the same physiologic system, when one ingredient has well-documented drug interactions, or when a person also uses prescription or over-the-counter medicines. Examples include serotonergic agents, sedatives, stimulants, anticoagulant or antiplatelet effects, blood-pressure effects, and blood-glucose effects.',
  },
  {
    question: 'How should supplement interactions be checked?',
    answer: 'Use ingredient-specific interaction information rather than a generic stack rule. Check each supplement against prescription and over-the-counter medicines, health conditions, pregnancy or breastfeeding status, and the other supplements in the combination. A pharmacist or other qualified health professional can help review a complete list.',
  },
  {
    question: 'Are adaptogen stacks generally safe?',
    answer: 'There is not enough direct combination evidence to label adaptogen stacks broadly safe. Individual ingredients may have different thyroid, blood-pressure, sedative, metabolic, pregnancy, or medication considerations, so each combination should be evaluated on its own evidence and interaction profile.',
  },
  {
    question: 'Does separating supplements by a week or two prevent interactions?',
    answer: 'No universal waiting period can establish that a combination is safe. Onset, half-life, enzyme effects, accumulation, and delayed adverse effects differ across ingredients and medicines. Timing can matter for some specific products, but it should not be used as a general interaction-clearance rule.',
  },
]

const STACKING_SAFETY_REFS = [
  { n: 1, text: 'FDA. FDA 101: Dietary Supplements. Current consumer safety guidance.', url: 'https://www.fda.gov/consumers/consumer-updates/fda-101-dietary-supplements' },
  { n: 2, text: 'FDA. Mixing Medications and Dietary Supplements Can Endanger Your Health.', url: 'https://www.fda.gov/consumers/consumer-updates/mixing-medications-and-dietary-supplements-can-endanger-your-health' },
  { n: 3, text: 'NCCIH. Herb-Drug Interactions: What the Science Says.', url: 'https://www.nccih.nih.gov/health/providers/digest/herb-drug-interactions-science' },
  { n: 4, text: 'NCCIH. St. John’s Wort: Usefulness and Safety.', url: 'https://www.nccih.nih.gov/health/st-johns-wort' },
  { n: 5, text: 'NCCIH. Kava: Usefulness and Safety.', url: 'https://www.nccih.nih.gov/health/kava' },
  { n: 6, text: 'Izzo AA, Ernst E. Interactions between herbal medicines and prescribed drugs. Drugs. 2009;69(13):1777-1798.', url: 'https://pubmed.ncbi.nlm.nih.gov/19719333/' },
  { n: 7, text: 'Boyer EW, Shannon M. The serotonin syndrome. N Engl J Med. 2005;352(11):1112-1120. Historical clinical review retained for context.', url: 'https://pubmed.ncbi.nlm.nih.gov/15784664/' },
  { n: 8, text: 'Gurley BJ. Clinically Relevant Herb-Drug Interactions: A 30-Year Historical Assessment. J Diet Suppl. 2025;22(1):78-104.', url: 'https://pubmed.ncbi.nlm.nih.gov/38504455/' },
  { n: 9, text: 'Pharmacokinetic and Pharmacodynamic Interactions between Food or Herbal Products and Oral Anticoagulants: Evidence Review, Practical Recommendations, and Knowledge Gaps. 2024.', url: 'https://pubmed.ncbi.nlm.nih.gov/39288907/' },
  { n: 10, text: 'Management of serotonin syndrome (toxicity). Br J Clin Pharmacol. 2024. Modern review of recognition, severity assessment, and management.', url: 'https://pubmed.ncbi.nlm.nih.gov/38926083/' },
  { n: 11, text: 'Li Y, et al. A Critical Review of Cytochrome P450 Enzyme Inhibition by Herbal Phytochemicals: Implications for Drug Interaction Prediction and Herbal Safety. 2026.', url: 'https://pubmed.ncbi.nlm.nih.gov/42394195/' },
]

export default function StackingSafetyPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Supplement Combination Safety"
        description="Evidence-first guide to screening supplement combinations for interactions and uncertainty."
        url="https://thehippiescientist.net/guides/other/supplement-stacking-safety"
        type="Article"
        citationUrls={STACKING_SAFETY_REFS.map((ref) => ref.url)}
      />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Combination Safety' }]} />
      <FAQSchema pagePath="/guides/other/supplement-stacking-safety/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Safety Review · 11 References · Reviewed September 19, 2026</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">Supplement Combination Safety: Screen the Risks Before the Stack</h1>
        <p className="text-lg leading-8 text-muted">
          A supplement combination is not automatically safer because every ingredient is sold over the counter or described as natural. FDA notes that problems can occur when supplements are combined with each other or with medicines, and many potential combinations have never been tested directly. The useful question is not “Is this stack safe?” in the abstract; it is “What interaction signals, evidence gaps, and person-specific risks apply to these exact ingredients?”
        </p>
        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-[var(--surface-card)]">
            <Image src="/images/guides/supplement-stacking-safety.jpg" alt="Supplement bottles with caution concept" width={1536} height={1024} priority className="w-full h-auto" />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">Combination safety depends on the exact ingredients, medicines, and evidence—not a generic stacking rule.</figcaption>
        </figure>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl border-l-4 border-red-500 bg-red-50/30">
        <p className="text-xs font-bold uppercase tracking-wider text-red-700">Core safety boundary</p>
        <p className="text-sm leading-7 text-red-900">
          <strong>No combination gets a blanket “safe” label here.</strong> A missing interaction report can mean “not studied,” not “no interaction.” Medication use, pregnancy or breastfeeding, surgery, liver or kidney disease, cardiovascular conditions, and product quality can materially change the risk picture. FDA advises discussing supplements with a health professional, particularly when medicines are involved [1,2].
        </p>
      </section>

      <section className="card-premium p-6 space-y-5 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Five interaction screens that matter</h2>

        <div className="rounded-xl border border-red-300 bg-red-50 p-4">
          <p className="text-sm font-black uppercase tracking-wider text-red-800">1. Serotonergic overlap</p>
          <div className="mt-3 space-y-2 text-sm leading-7 text-red-900">
            <p>
              St. John&apos;s wort has documented drug-interaction risk and can contribute to serious serotonin-related effects with some antidepressants [3,4,8]. A modern serotonin-toxicity review confirms that drug interactions can precipitate toxicity and that diagnosis is primarily clinical, but it does not establish a quantified risk for every unstudied supplement pair [10]. Other serotonergic supplements or medicines may create additive concerns, but mechanism alone does not prove the magnitude of a specific pairwise interaction.
            </p>
            <p><strong>Higher-priority review:</strong> antidepressants, MAO inhibitors, tramadol and other serotonergic medicines, plus supplements marketed for serotonin support.</p>
            <Link href={SEROTONERGIC_ATLAS_HREF} className="mt-3 inline-flex min-h-[44px] items-center rounded-full bg-red-800 px-5 text-sm font-bold text-white transition hover:bg-red-900">Compare serotonergic-risk botanicals →</Link>
          </div>
        </div>

        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm font-black uppercase tracking-wider text-amber-800">2. Sedative overlap</p>
          <div className="mt-3 space-y-2 text-sm leading-7 text-amber-900">
            <p>
              Multiple sedating ingredients can increase impairment or drowsiness. NCCIH specifically advises against combining kava with substances that have sedative effects, including benzodiazepines or alcohol [5]. Similar caution is appropriate when several products independently cause sedation, even when direct trials of the exact combination are absent.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm font-black uppercase tracking-wider text-amber-800">3. Cardiovascular or stimulant overlap</p>
          <div className="mt-3 space-y-2 text-sm leading-7 text-amber-900">
            <p>
              Ingredients that can raise heart rate or blood pressure deserve extra scrutiny when combined with other stimulants, decongestants, or prescription medicines that affect the cardiovascular system. The actual risk depends on the ingredients, dose, baseline health, and co-medications; a broad “stimulant stack” rule cannot substitute for those specifics.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm font-black uppercase tracking-wider text-amber-800">4. Bleeding, glucose, or blood-pressure overlap</p>
          <div className="mt-3 space-y-2 text-sm leading-7 text-amber-900">
            <p>
              FDA gives examples in which supplements and medicines can combine to increase bleeding risk or alter drug effects [2]. A 2024 evidence review of food/herbal interactions with oral anticoagulants found that randomized evidence is sparse and the available literature is limited by small samples, conflicting results, and heterogeneous herbal products [9]. That supports ingredient-specific screening rather than a blanket claim that every “blood-thinning” herb predictably increases bleeding. Similar additive concerns can arise when several products affect blood glucose or blood pressure, especially when prescription anticoagulants, diabetes medicines, or antihypertensives are present.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-brand-900/10 bg-[var(--surface-subtle)]/70 p-4">
          <p className="text-sm font-black uppercase tracking-wider text-muted">5. Pharmacokinetic interactions</p>
          <div className="mt-3 space-y-2 text-sm leading-7 text-muted">
            <p>
              Some supplements change drug metabolism or transport rather than simply adding the same effect. St. John&apos;s wort remains a well-documented clinical example: it can lower exposure to multiple medicines by inducing drug-metabolizing enzymes and transporters [2-4,8]. A 2026 CYP450 review catalogs many additional herbal phytochemicals with enzyme effects, while also emphasizing that clinical interaction data remain scarce for many herbs [11]. That makes CYP activity a screening signal—not permission to convert an in-vitro inhibition finding into a proven human interaction.
            </p>
          </div>
        </div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">What not to infer from missing evidence</h2>
        <div className="space-y-3 text-sm leading-7 text-muted">
          <p><strong>No interaction listed ≠ interaction ruled out.</strong> Many supplement-supplement combinations lack direct clinical testing.</p>
          <p><strong>Same mechanism ≠ proven dangerous interaction.</strong> Mechanistic overlap is a screening signal, not proof of a clinically important interaction. In-vitro CYP inhibition or induction should not be presented as a proven human interaction without supporting clinical evidence [11]. It should prompt a closer evidence review rather than a fabricated certainty.</p>
          <p><strong>“Common stack” ≠ validated stack.</strong> Popularity, anecdotal use, or simultaneous sale in a product bundle does not establish combination efficacy or safety.</p>
          <p><strong>A fixed waiting period ≠ clearance.</strong> There is no universal one-week, two-week, or four-week rule that proves one supplement has been assessed or cleared before another is added. Pharmacokinetics and delayed effects differ substantially.</p>
          <p><strong>Individual ingredient evidence ≠ combination evidence.</strong> Two separately studied ingredients do not automatically produce a studied or beneficial combination.</p>
        </div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">A better combination-check workflow</h2>
        <div className="space-y-3 text-sm leading-7 text-muted">
          <p><strong>1. Inventory everything.</strong> Include prescription medicines, over-the-counter medicines, supplements, energy products, and relevant substances—not only the products you think are “medications.”</p>
          <p><strong>2. Check each ingredient, not just the product name.</strong> Multi-ingredient blends can hide duplicate stimulants, sedatives, minerals, or botanicals.</p>
          <p><strong>3. Review high-consequence contexts first.</strong> Pregnancy or breastfeeding, upcoming surgery, anticoagulants, transplant medicines, seizure medicines, antidepressants, cardiovascular drugs, and diabetes medicines deserve especially careful review.</p>
          <p><strong>4. Separate known evidence from mechanistic caution.</strong> A documented clinical interaction should be labeled differently from a plausible additive mechanism.</p>
          <p><strong>5. Use a pharmacist or qualified health professional when medicines are involved.</strong> FDA and NCCIH both emphasize medication-supplement interaction review [1-4].</p>
        </div>
        <Link href="/safety-checker/" className="inline-flex min-h-[44px] items-center rounded-full border border-brand-900/10 px-5 text-sm font-bold text-brand-800 transition hover:bg-brand-50">Open the safety checker →</Link>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2>
        <p className="text-sm leading-7 text-muted">
          Supplement-combination safety is an evidence and interaction-screening problem, not a recipe problem. Prioritize documented medication interactions and high-consequence physiologic overlap, mark mechanism-only concerns as uncertain, and do not convert popularity or a generic waiting period into a safety claim. Recent interaction reviews reinforce both sides of that boundary: clinically important herb-drug interactions exist, but evidence quality and directness vary substantially by ingredient and medication [8,9,11]. When medication use or important health conditions are part of the picture, use a complete ingredient list for professional interaction review [1-5].
        </p>
        <Link href={SEROTONERGIC_ATLAS_HREF} className="inline-flex min-h-[44px] items-center rounded-full border border-brand-900/10 px-5 text-sm font-bold text-brand-800 transition hover:bg-brand-50">Compare serotonergic-risk botanicals →</Link>
      </section>

      <References refs={STACKING_SAFETY_REFS} />
      <EmailCapture headline="Get evidence reviews like this" description="Safety guides, interaction context, and evidence boundaries without stack hype." ctaLabel="Get the evidence" location="guide-stacking-safety" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between">
        <Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link>
        <Link href="/safety-checker/" className="text-sm font-bold text-brand-800 hover:underline">Safety checker →</Link>
      </div>
    </div>
  )
}
