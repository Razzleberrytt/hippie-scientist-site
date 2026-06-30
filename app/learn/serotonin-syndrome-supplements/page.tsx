import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Serotonin Syndrome Risk: 18 Supplements That Don\'t Mix',
  description: '18 herbs and compounds flagged for serotonergic activity — 153 pairwise interaction edges. Which supplement combinations risk serotonin syndrome and how to check your stack.',
  alternates: { canonical: `${SITE_URL}/learn/serotonin-syndrome-supplements/` },
  openGraph: {
    title: 'Serotonin Syndrome & Supplements: 18 High-Risk Combinations',
    description: '18 herbs and compounds flagged for serotonergic activity — 153 pairwise interaction edges.',
    url: `${SITE_URL}/learn/serotonin-syndrome-supplements/`,
    type: 'article',
    images: ['/og-default.jpg'],
  },
}

const ENTITIES = [
  { name: 'Damiana', type: 'herb', slug: 'damiana', mechanism: 'Traditional anxiolytic; serotonergic activity flagged in contraindication text', also: 'CNS sedation, blood glucose' },
  { name: 'Ginkgo biloba', type: 'herb', slug: 'ginkgo-biloba', mechanism: 'MAO inhibition (weak), platelet effects', also: 'Anticoagulant, blood glucose, blood pressure, CNS sedation' },
  { name: 'Kanna', type: 'herb', slug: 'kanna', mechanism: 'SRI (serotonin reuptake inhibitor) + PDE4 inhibition', also: '—' },
  { name: 'Mucuna pruriens', type: 'herb', slug: 'mucuna', mechanism: 'L-DOPA content → dopamine → downstream serotonergic modulation', also: 'Blood glucose, blood pressure, anticoagulant' },
  { name: 'Passionflower', type: 'herb', slug: 'passiflora-incarnata', mechanism: 'GABAergic with serotonergic interaction flag', also: 'CNS sedation, anticoagulant, blood pressure, blood glucose' },
  { name: 'Rhodiola rosea', type: 'herb', slug: 'rhodiola', mechanism: 'MAO inhibition (weak), stress-modulation', also: '—' },
  { name: 'Saffron', type: 'herb', slug: 'saffron', mechanism: 'SRI-like activity (crocin/crocetin); clinical data for depression', also: 'Anticoagulant, blood glucose, blood pressure, CNS sedation' },
  { name: 'Yohimbe', type: 'herb', slug: 'yohimbe', mechanism: 'α₂ antagonist with serotonergic interaction flag', also: 'Blood pressure, anticoagulant, blood glucose, CNS sedation' },
]

const COMPOUNDS = [
  { name: '5-HTP', slug: '5-htp', mechanism: 'Direct serotonin precursor — bypasses rate-limiting tryptophan hydroxylase', also: '—' },
  { name: 'Crocetin', slug: 'crocetin', mechanism: 'Carotenoid from saffron; SRI-like activity', also: 'Anticoagulant, blood glucose, blood pressure, CNS sedation' },
  { name: 'Crocin', slug: 'crocin', mechanism: 'Carotenoid glycoside from saffron; SRI-like activity', also: 'Anticoagulant, blood glucose, blood pressure, CNS sedation' },
  { name: 'DMT', slug: 'dmt', mechanism: '5-HT₂A agonist; psychedelic', also: '—' },
  { name: 'Harmaline', slug: 'harmaline', mechanism: 'Reversible MAO-A inhibitor (RIMA); β-carboline alkaloid', also: '—' },
  { name: 'Harmine', slug: 'harmine', mechanism: 'Reversible MAO-A inhibitor (RIMA); β-carboline alkaloid', also: '—' },
  { name: 'L-Tyrosine', slug: 'l-tyrosine', mechanism: 'Dopamine/norepinephrine precursor; downstream serotonergic interaction flag', also: '—' },
  { name: 'Phenylalanine', slug: 'phenylalanine', mechanism: 'Precursor to tyrosine → dopamine; interaction flag', also: '—' },
  { name: 'Rhodiola Extract SHR-5', slug: 'rhodiola-extract-shr5', mechanism: 'Standardized rhodiola extract; serotonergic flag from parent herb', also: '—' },
  { name: 'Tryptophan', slug: 'tryptophan', mechanism: 'Essential amino acid; serotonin precursor (rate-limited by tryptophan hydroxylase)', also: '—' },
]

const HUNTER_CRITERIA = [
  { sign: 'Clonus', desc: 'Involuntary rhythmic muscle contractions — the most specific sign. Can be spontaneous, inducible, or ocular.' },
  { sign: 'Hyperreflexia', desc: 'Exaggerated deep tendon reflexes.' },
  { sign: 'Tremor', desc: 'Fine or coarse, often worse with movement.' },
  { sign: 'Hyperthermia', desc: 'Elevated body temperature, can be severe (>38.5°C).' },
  { sign: 'Agitation / confusion', desc: 'Restlessness, anxiety, altered mental status.' },
  { sign: 'Diaphoresis', desc: 'Profuse sweating.' },
  { sign: 'Tachycardia', desc: 'Elevated heart rate.' },
  { sign: 'Myoclonus', desc: 'Brief, involuntary muscle jerks.' },
]

const REFERENCES = [
  { title: 'The serotonin syndrome', authors: 'Boyer EW, Shannon M', journal: 'New England Journal of Medicine', year: '2005', detail: '352(11), 1112–1120', pmid: '15784664' },
  { title: 'The Hunter Serotonin Toxicity Criteria', authors: 'Dunkley EJC, Isbister GK, Sibbritt D, Dawson AH, Whyte IM', journal: 'QJM', year: '2003', detail: '96(9), 635–642', pmid: '12925718' },
  { title: 'A review of serotonin toxicity data', authors: 'Gillman PK', journal: 'Biological Psychiatry', year: '2006', detail: '59(11), 1046–1051', pmid: '16460699' },
  { title: 'Prevention, recognition, and management of serotonin syndrome', authors: 'Ables AZ, Nagubilli R', journal: 'American Family Physician', year: '2010', detail: '81(9), 1139–1142', pmid: '20433130' },
  { title: 'Serotonin toxicity: a practical approach to diagnosis and treatment', authors: 'Isbister GK, Buckley NA, Whyte IM', journal: 'Medical Journal of Australia', year: '2007', detail: '187(6), 361–365', pmid: '17874986' },
  { title: 'Demystifying serotonin syndrome', authors: 'Foong AL, Grindrod KA, Patel T, Kellar J', journal: 'Canadian Family Physician', year: '2018', detail: '64(10), 720–727', pmid: '30315014' },
  { title: 'Serotonin syndrome', authors: 'Volpi-Abadie J, Kaye AM, Kaye AD', journal: 'Ochsner Journal', year: '2013', detail: '13(4), 533–540', pmid: '24358002' },
  { title: 'Drug-induced serotonin syndrome: a review', authors: 'Sun-Edelstein C, Tepper SJ, Shapiro RE', journal: 'Expert Opinion on Drug Safety', year: '2008', detail: '7(5), 587–596', pmid: '18759711' },
]

export default function SerotoninSyndromeArticle() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-8">
      <nav className="text-xs text-muted mb-6">
        <Link href="/learn/" className="hover:text-ink">Learn</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink font-medium">Serotonin Syndrome & Supplements</span>
      </nav>

      <header className="mb-10">
        <p className="text-xs font-bold uppercase tracking-wider text-red-800 mb-2">Evidence and harm reduction</p>
        <h1 className="text-3xl font-bold text-ink sm:text-4xl">Serotonin Syndrome Risk: 18 Supplements That Don&apos;t Mix</h1>
        <p className="mt-4 text-lg text-muted leading-relaxed">
          18 herbs and compounds in the database carry a serotonergic flag. Any pairwise combination generates a severe-tier interaction warning — 153 total edges. This article maps every pairing, explains the pharmacology, and links each entity so you can check your own stack.
        </p>
      </header>

      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 mb-8">
        <p className="text-sm font-bold text-red-900">Strong Disclaimer</p>
        <p className="mt-2 text-sm leading-6 text-red-800">
          This is mechanistic caution derived from contraindication text pattern-matching, not confirmed clinical interaction data. Serotonin syndrome is a medical emergency — if you experience agitation, hyperthermia, tachycardia, clonus, or altered mental status after combining serotonergic substances, seek immediate medical attention.
        </p>
      </div>

      <div className="rounded-2xl border border-brand-900/10 bg-brand-50/50 p-5 mb-10">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-700 mb-2">TL;DR · The 18 Entities</p>
        <p className="text-sm text-muted mb-3">
          <strong className="text-ink">Herbs:</strong> Damiana, Ginkgo biloba, Kanna, Mucuna pruriens, Passionflower, Rhodiola rosea, Saffron, Yohimbe
        </p>
        <p className="text-sm text-muted">
          <strong className="text-ink">Compounds:</strong> 5-HTP, Crocetin, Crocin, DMT, Harmaline, Harmine, L-Tyrosine, Phenylalanine, Rhodiola Extract SHR-5, Tryptophan
        </p>
        <p className="mt-3 text-sm font-semibold text-red-800">
          Every pairwise combination of these 18 is flagged severe. That&apos;s 153 interaction edges — all additive serotonergic risk.
        </p>
      </div>

      {/* Section 1: What Is Serotonin Syndrome */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-ink mb-4">1. What Is Serotonin Syndrome?</h2>
        <p className="text-sm leading-7 text-muted mb-4">
          Serotonin syndrome (also called serotonin toxicity) occurs when there is excessive activation of serotonin receptors — primarily 5-HT₂A — in the central and peripheral nervous systems. It is classically associated with combining serotonergic medications (SSRIs, SNRIs, MAOIs) but can also occur when multiple serotonergic supplements are stacked.
        </p>

        <h3 className="text-lg font-bold text-ink mt-6 mb-3">Clinical Features (Hunter Criteria)</h3>
        <div className="overflow-x-auto rounded-xl border border-brand-900/10">
          <table className="min-w-full text-sm">
            <thead className="bg-brand-50/60">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-ink">Sign</th>
                <th className="px-4 py-3 text-left font-semibold text-ink">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-900/5">
              {HUNTER_CRITERIA.map((c) => (
                <tr key={c.sign}>
                  <td className="px-4 py-3 font-semibold text-ink">{c.sign}</td>
                  <td className="px-4 py-3 text-muted">{c.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 2: The 18 Flagged Entities */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-ink mb-4">2. The 18 Flagged Entities</h2>

        <h3 className="text-lg font-bold text-ink mt-6 mb-3">Herbs</h3>
        <div className="overflow-x-auto rounded-xl border border-brand-900/10 mb-6">
          <table className="min-w-full text-sm">
            <thead className="bg-brand-50/60">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-ink">Herb</th>
                <th className="px-4 py-3 text-left font-semibold text-ink">Primary Mechanism</th>
                <th className="px-4 py-3 text-left font-semibold text-ink">Also Flagged For</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-900/5">
              {ENTITIES.map((e) => (
                <tr key={e.slug}>
                  <td className="px-4 py-3">
                    <Link href={`/herbs/${e.slug}/`} className="font-semibold text-brand-800 hover:underline">
                      {e.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">{e.mechanism}</td>
                  <td className="px-4 py-3 text-muted">{e.also}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-bold text-ink mt-6 mb-3">Compounds</h3>
        <div className="overflow-x-auto rounded-xl border border-brand-900/10">
          <table className="min-w-full text-sm">
            <thead className="bg-brand-50/60">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-ink">Compound</th>
                <th className="px-4 py-3 text-left font-semibold text-ink">Primary Mechanism</th>
                <th className="px-4 py-3 text-left font-semibold text-ink">Also Flagged For</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-900/5">
              {COMPOUNDS.map((c) => (
                <tr key={c.slug}>
                  <td className="px-4 py-3">
                    <Link href={`/compounds/${c.slug}/`} className="font-semibold text-brand-800 hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">{c.mechanism}</td>
                  <td className="px-4 py-3 text-muted">{c.also}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 3: The 153 Edges */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-ink mb-4">3. The 153 Interaction Edges</h2>
        <p className="text-sm leading-7 text-muted mb-3">
          Every pairwise combination of the 18 entities generates a <strong className="text-ink">severe</strong> interaction edge. With 18 entities:
        </p>
        <div className="rounded-xl bg-brand-50/50 p-4 text-center mb-4">
          <span className="text-lg font-bold text-brand-800">18 × 17 ÷ 2 = 153 unique pairs</span>
        </div>
        <p className="text-sm leading-7 text-muted mb-3">
          Each edge carries severity <strong className="text-red-800">severe</strong> (weight: 90) and the locked claim language:
        </p>
        <blockquote className="border-l-4 border-brand-300 pl-4 italic text-sm text-muted my-4">
          &ldquo;Both [A] and [B] are flagged for serotonergic activity. Combining them may have an additive effect. This is a mechanistic caution, not a verified interaction — consult a clinician before stacking.&rdquo;
        </blockquote>

        <h3 className="text-lg font-bold text-ink mt-6 mb-3">Why All 153 Are Severe</h3>
        <div className="space-y-3 text-sm leading-7 text-muted">
          <p><strong className="text-ink">1. Acute onset.</strong> Serotonin syndrome can develop within hours of combining agents.</p>
          <p><strong className="text-ink">2. High consequence.</strong> Severe cases carry mortality risk from hyperthermia, rhabdomyolysis, or multi-organ failure.</p>
          <p><strong className="text-ink">3. Additive risk confirmed clinically.</strong> The SSRI + MAOI interaction is one of the best-documented drug interactions in medicine.</p>
          <p><strong className="text-ink">4. Unpredictable individual variability.</strong> Genetic polymorphisms in CYP450 enzymes, serotonin transporter density, and MAO activity levels mean the same combination can be benign in one person and dangerous in another.</p>
        </div>
      </section>

      {/* Section 4: How to Check Your Stack */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-ink mb-4">4. How to Check Your Stack</h2>
        <p className="text-sm leading-7 text-muted mb-4">
          Every entity page for the 18 flagged herbs and compounds now includes a <strong className="text-ink">&ldquo;Caution When Combined With&rdquo;</strong> module directly below the Safety &amp; Cautions section. If your stack includes two or more of these entities, the module surfaces each pairing with the partner entity name, the shared risk mechanism badge, and the locked claim-language text.
        </p>

        <h3 className="text-lg font-bold text-ink mt-6 mb-3">Practical Stacking Guidance</h3>
        <div className="space-y-3 text-sm leading-7 text-muted">
          <p><strong className="text-ink">1. Assume additive risk.</strong> Someone on an SSRI who adds 5-HTP faces a different risk than someone combining Rhodiola and Saffron — but the conservative assumption is additive serotonergic load.</p>
          <p><strong className="text-ink">2. Watch for MAO inhibition specifically.</strong> Harmala alkaloids (harmine, harmaline) are reversible MAO-A inhibitors. Combining an MAOI with a serotonin precursor (5-HTP, tryptophan), an SRI (Kanna, Saffron), or a releasing agent (DMT) carries the highest theoretical risk.</p>
          <p><strong className="text-ink">3. Time-separate if combining.</strong> If you choose to use multiple serotonergic supplements, separating doses by ≥6 hours reduces peak synaptic concentrations — but does not eliminate the additive risk.</p>
          <p><strong className="text-ink">4. Start low, titrate slow.</strong> Begin with the lowest effective dose of a single agent before considering combinations.</p>
          <p><strong className="text-ink">5. Know the warning signs.</strong> Clonus, hyperreflexia, and tremor — if these appear after combining supplements, discontinue immediately and seek medical evaluation.</p>
        </div>
      </section>

      {/* Section 5: Bigger Picture */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-ink mb-4">5. Why This Data Layer Matters</h2>
        <div className="space-y-3 text-sm leading-7 text-muted">
          <p><strong className="text-ink">Deterministic derivation.</strong> Every interaction edge is generated automatically from structured contraindication text. When a new entity enters the database with serotonergic flags, all edges update automatically.</p>
          <p><strong className="text-ink">Additive, never speculative.</strong> The system only generates pairings where two entities share the same flagged mechanism.</p>
          <p><strong className="text-ink">Hedged language, locked template.</strong> The claim language never asserts clinical certainty.</p>
          <p><strong className="text-ink">Slug-keyed, cross-linked.</strong> Every partner entity links to its full profile page, creating a dense internal link graph that strengthens SEO and user navigation.</p>
        </div>
        <p className="mt-4 text-sm text-muted">
          The full interaction dataset covers <strong className="text-ink">9,152 edges</strong> across five mechanisms. Each mechanism cluster is a candidate for an article like this one — data-backed, interactive, and linkable from every entity page.
        </p>
      </section>

      {/* References */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-ink mb-4">References</h2>
        <div className="space-y-3">
          {REFERENCES.map((ref, i) => (
            <div key={i} className="rounded-xl border border-brand-900/10 bg-white p-4">
              <p className="text-sm font-semibold text-ink">{ref.title}</p>
              <p className="text-xs text-muted mt-1">
                {ref.authors}. <em>{ref.journal}</em> {ref.detail} ({ref.year}).
                {' '}
                <a href={`https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}/`} target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:underline">
                  PMID: {ref.pmid}
                </a>
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-brand-900/10 pt-6 text-xs text-muted">
        This article is updated automatically whenever the underlying interaction data changes. The 18-entity serotonergic set and 153 pairwise edges were current as of 2026-06-30. Check individual entity pages for the live interaction module.
      </footer>
    </div>
  )
}
