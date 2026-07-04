import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/src/lib/seo'

export const metadata: Metadata = {
  title: '18 Supplements That Can Trigger Serotonin Syndrome',
  description: 'A data-derived list of 18 herbs and compounds flagged for serotonergic risk — what they are, why they\'re flagged, and what not to combine them with.',
  alternates: { canonical: `${SITE_URL}/learn/serotonin-syndrome-supplements/` },
  openGraph: {
    title: '18 Supplements That Can Trigger Serotonin Syndrome',
    description: 'A data-derived list of 18 herbs and compounds flagged for serotonergic risk.',
    url: `${SITE_URL}/learn/serotonin-syndrome-supplements/`,
    type: 'article',
    images: ['/og-default.jpg'],
  },
}

const ENTITIES = [
  { name: '5-HTP', slug: '5-htp', type: 'compound', flag: 'Direct serotonin precursor; explicit SSRI caution' },
  { name: 'Tryptophan', slug: 'tryptophan', type: 'compound', flag: 'Serotonin precursor; SSRI caution' },
  { name: 'Rhodiola', slug: 'rhodiola', type: 'herb', flag: 'SSRI caution (theoretical serotonergic effect)' },
  { name: 'Rhodiola Extract SHR-5', slug: 'rhodiola-extract-shr5', type: 'compound', flag: 'SSRI and stimulant caution' },
  { name: 'Saffron', slug: 'saffron', type: 'herb', flag: 'Explicit caution with serotonergic medications' },
  { name: 'Crocin', slug: 'crocin', type: 'compound', flag: 'Saffron\'s active compound; SSRI caution' },
  { name: 'Crocetin', slug: 'crocetin', type: 'compound', flag: 'Saffron\'s active compound; SSRI caution' },
  { name: 'Kanna', slug: 'kanna', type: 'herb', flag: 'Explicit serotonin-syndrome risk named in monograph; flagged against SSRIs, SNRIs, MAOIs, TCAs, lithium, tramadol' },
  { name: 'Passionflower', slug: 'passiflora-incarnata', type: 'herb', flag: 'SSRI caution, theoretical MAOI overlap' },
  { name: 'Damiana', slug: 'damiana', type: 'herb', flag: 'Additive CNS/serotonergic effect with stimulant or serotonergic stacks' },
  { name: 'Ginkgo', slug: 'ginkgo-biloba', type: 'herb', flag: 'SSRI caution (also separately flagged for anticoagulant risk)' },
  { name: 'Phenylalanine', slug: 'phenylalanine', type: 'compound', flag: 'SSRI caution' },
  { name: 'L-Tyrosine', slug: 'l-tyrosine', type: 'compound', flag: 'SSRI and stimulant caution' },
  { name: 'DMT', slug: 'dmt', type: 'compound', flag: 'SSRI caution' },
  { name: 'Harmaline', slug: 'harmaline', type: 'compound', flag: 'SSRI caution; MAOI-active alkaloid' },
  { name: 'Harmine', slug: 'harmine', type: 'compound', flag: 'SSRI caution; MAOI-active alkaloid' },
  { name: 'Mucuna', slug: 'mucuna', type: 'herb', flag: 'MAOI caution — hypertensive crisis mechanism, not serotonin syndrome (see note below)' },
  { name: 'Yohimbe', slug: 'yohimbe', type: 'herb', flag: 'MAOI caution — hypertensive crisis mechanism, not serotonin syndrome (see note below)' },
]

const SYMPTOMS = [
  'Agitation, restlessness, or confusion',
  'Rapid heart rate and high blood pressure',
  'Dilated pupils',
  'Loss of muscle coordination or twitching',
  'Heavy sweating, diarrhea, headache',
  'Shivering and goosebumps even without cold',
  'In severe cases: high fever, seizures, irregular heartbeat, or loss of consciousness',
]

const STACKS = [
  { combo: '5-HTP + Rhodiola', note: 'Both marketed individually as mood support; stacked, both carry the same serotonergic caution.' },
  { combo: 'Saffron + Tryptophan', note: 'A common sleep/mood combination; saffron\'s own monograph explicitly names serotonergic medications as a caution.' },
  { combo: 'Kanna + an existing SSRI prescription', note: 'Kanna is the only entity in this set whose own contraindication text names serotonin syndrome directly. If you\'re on an SSRI, this is the one to take most seriously.' },
  { combo: 'Yohimbe + Mucuna', note: 'A frequent pairing in libido and pre-workout stacks; flagged here, but via the hypertensive-crisis mechanism, not classic serotonin syndrome.' },
]

const REFERENCES = [
  { title: 'The serotonin syndrome', authors: 'Boyer EW, Shannon M', journal: 'New England Journal of Medicine', year: '2005', detail: '352(11), 1112–1120', pmid: '15784664' },
  { title: 'The Hunter Serotonin Toxicity Criteria', authors: 'Dunkley EJC, Isbister GK, Sibbritt D, Dawson AH, Whyte IM', journal: 'QJM', year: '2003', detail: '96(9), 635–642', pmid: '12925718' },
  { title: 'A review of serotonin toxicity data', authors: 'Gillman PK', journal: 'Biological Psychiatry', year: '2006', detail: '59(11), 1046–1051', pmid: '16460699' },
  { title: 'Demystifying serotonin syndrome', authors: 'Foong AL, Grindrod KA, Patel T, Kellar J', journal: 'Canadian Family Physician', year: '2018', detail: '64(10), 720–727', pmid: '30315014' },
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
        <h1 className="text-3xl font-bold text-ink sm:text-4xl">18 Supplements That Can Trigger Serotonin Syndrome</h1>
        <p className="mt-4 text-lg text-muted leading-relaxed">
          And why most stack guides won&apos;t tell you.
        </p>
      </header>

      {/* Intro */}
      <section className="mb-10">
        <p className="text-sm leading-7 text-muted mb-4">
          Serotonin syndrome doesn&apos;t announce itself. It builds quietly across a stack — an SSRI prescription, a mood-support herb, a &ldquo;natural&rdquo; sleep aid — until the combination tips into agitation, rapid heart rate, and in severe cases, something that lands you in an emergency room. Most supplement content never mentions this risk, because most supplement content is written one ingredient at a time. Nobody&apos;s cross-referencing the whole catalog.
        </p>
        <p className="text-sm leading-7 text-muted">
          We did. Across our full reference set of 873 herbs and compounds, we built a deterministic interaction layer that flags every entity carrying a serotonergic contraindication and generates a caution edge for every pair that shares it. The serotonergic cluster is one of five mechanism groups in that layer — and at 18 entities and 153 flagged pairings, it&apos;s the smallest and most acute. This is that list.
        </p>
      </section>

      {/* How the list was built */}
      <section className="rounded-2xl border border-brand-900/10 bg-brand-50/50 p-5 mb-10">
        <h2 className="text-lg font-bold text-ink mb-2">How this list was built</h2>
        <p className="text-sm leading-7 text-muted">
          This isn&apos;t a curated &ldquo;things to watch out for&rdquo; roundup. It&apos;s the output of a keyword-matched derivation run against every entity&apos;s documented contraindications — anything flagging interaction with SSRIs, SNRIs, MAOIs, or serotonergic activity directly. Eighteen entities matched. Because every flagged entity is mechanistically linked to every other, that&apos;s <strong className="text-ink">153 individual pairwise cautions</strong> — far more than anyone tracking ingredients one page at a time would catch.
        </p>
        <p className="mt-3 text-sm text-muted">
          Every entity below links to its full monograph, including a live &ldquo;Caution When Combined With&rdquo; panel showing its specific flagged pairings.
        </p>
      </section>

      {/* The 18 entities */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-ink mb-4">The 18 flagged entities</h2>
        <div className="overflow-x-auto rounded-xl border border-brand-900/10">
          <table className="min-w-[560px] text-sm">
            <thead className="bg-brand-50/60">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-ink">Entity</th>
                <th className="px-4 py-3 text-left font-semibold text-ink">Type</th>
                <th className="px-4 py-3 text-left font-semibold text-ink">What it&apos;s flagged for</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-900/5">
              {ENTITIES.map((e) => (
                <tr key={e.slug}>
                  <td className="px-4 py-3">
                    <Link href={`/${e.type === 'compound' ? 'compounds' : 'herbs'}/${e.slug}/`} className="font-semibold text-brand-800 hover:underline">
                      {e.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">{e.type === 'compound' ? 'Compound' : 'Herb'}</td>
                  <td className="px-4 py-3 text-muted text-xs leading-5">{e.flag}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* MAOI distinction */}
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 mb-10">
        <h2 className="text-lg font-bold text-amber-900 mb-2">Not every &ldquo;MAOI flag&rdquo; means serotonin syndrome</h2>
        <p className="text-sm leading-7 text-amber-900">
          This is the distinction most lists skip, and it matters. Sixteen of these 18 entities are flagged for genuine serotonergic mechanisms — direct precursors (5-HTP, tryptophan), reuptake-adjacent botanicals (kanna, rhodiola, saffron), or MAOI-active alkaloids (harmaline, harmine). The risk there is classic serotonin syndrome.
        </p>
        <p className="mt-3 text-sm leading-7 text-amber-900">
          <strong>Mucuna and Yohimbe are different.</strong> Both surfaced in this cluster because their monographs explicitly caution against MAOIs — but the underlying danger is a <strong>hypertensive crisis</strong>, not serotonin syndrome. Mucuna is a levodopa source; combined with an MAOI, the concern is a dopaminergic/pressor reaction. Yohimbe is sympathomimetic; stacked with an MAOI or stimulant, the same pressor mechanism applies. Different physiology, same instruction: don&apos;t combine with MAOIs. We&apos;re keeping them in the list because the caution is real and the keyword match is accurate — but if you&apos;re trying to understand serotonin syndrome specifically, those two are the exception, not the rule.
        </p>
      </section>

      {/* Real stacks */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-ink mb-4">Where this actually shows up in real stacks</h2>
        <p className="text-sm leading-7 text-muted mb-4">
          These pairings aren&apos;t hypothetical. A few combinations we see constantly in mood, sleep, and libido stacks — each one a flagged pair in our data:
        </p>
        <div className="space-y-3">
          {STACKS.map((s) => (
            <div key={s.combo} className="rounded-xl border border-brand-900/10 bg-white p-4">
              <p className="text-sm font-semibold text-ink">{s.combo}</p>
              <p className="text-xs text-muted mt-1 leading-5">{s.note}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm leading-7 text-muted">
          None of this means any single ingredient is dangerous on its own at typical use. The risk is additive — it&apos;s the stack, or the stack on top of a prescription, that matters.
        </p>
      </section>

      {/* Recognizing symptoms */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-ink mb-4">Recognizing serotonin syndrome</h2>
        <p className="text-sm leading-7 text-muted mb-4">
          This is general safety information, not a diagnosis tool — if you suspect you or someone else is experiencing this, treat it as a medical emergency. Symptoms typically appear within hours of a new combination or dose increase and can include:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted mb-4">
          {SYMPTOMS.map((s) => <li key={s}>{s}</li>)}
        </ul>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-bold text-red-900">
            If severe symptoms appear, this warrants emergency medical attention — call emergency services rather than waiting it out.
          </p>
        </div>
      </section>

      {/* Interactive checker CTA */}
      <section className="rounded-2xl border border-brand-700/20 bg-brand-50/60 p-6 mb-10">
        <h2 className="text-xl font-bold text-ink mb-2">Use the interactive checker</h2>
        <p className="text-sm leading-7 text-muted mb-4">
          Every herb and compound page on the site now includes a live &ldquo;Caution When Combined With&rdquo; panel pulling directly from this same dataset — so instead of cross-referencing a static list, you can check any specific pairing on the entity&apos;s own page.
        </p>
        <Link
          href="/herbs/kanna/"
          className="inline-flex rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 transition"
        >
          Start with Kanna — it names serotonin syndrome explicitly →
        </Link>
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

      <footer className="border-t border-brand-900/10 pt-6 text-xs text-muted leading-relaxed">
        This article reflects mechanistic cautions derived from documented contraindications across our reference catalog, not clinical trial data on combined use. It&apos;s intended to inform, not replace, a conversation with a clinician or pharmacist — especially if you&apos;re currently taking an SSRI, SNRI, or MAOI. The 18-entity serotonergic set and 153 pairwise edges were current as of 2026-06-30.
      </footer>
    </div>
  )
}
