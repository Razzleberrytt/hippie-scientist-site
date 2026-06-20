import type { Metadata } from 'next'
import Link from 'next/link'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'

export const metadata: Metadata = {
  title: 'Natural Anxiolytics Beyond Ashwagandha',
  description: 'Compare calming botanicals and acute calm-support options like L-Theanine, Kava, and Kanna. Evidence-first, safety-aware analysis.',
  alternates: { canonical: '/guides/best-herbs-for-anxiety/' },
  openGraph: {
    title: 'Natural Anxiolytics Beyond Ashwagandha',
    description: 'Compare calming botanicals and acute calm-support options like L-Theanine, Kava, and Kanna. Evidence-first, safety-aware analysis.',
    url: '/guides/natural-anxiolytics-beyond-ashwagandha',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Natural Anxiolytics Beyond Ashwagandha',
    description: 'Compare calming botanicals like L-Theanine, Kava, and Kanna with evidence-first analysis.',
  },
}

const HEADINGS: Heading[] = [
  { id: 'compared', text: 'Four Calming Alternatives Compared', level: 2 },
  { id: 'evaluation', text: 'How to Structure Your Calm Evaluation', level: 2 },
  { id: 'summary', text: 'Evidence and Precaution Summary', level: 2 },
]

export default function NaturalAnxiolyticsPage() {
  const toc = <TableOfContents headings={HEADINGS} />
  const lTheanineProducts = getRevenueProductSet('l-theanine')

  const alternatives = [
    {
      name: 'L-Theanine',
      href: '/compounds/l-theanine',
      type: 'Amino Acid',
      onset: '30 to 90 minutes',
      mechanism: 'Promotes alpha brain waves, modulates glutamate receptors.',
      bestFor: 'Acute mental chatter, relaxing focus, mitigating caffeine jitters.',
      safety: 'Low risk. Well-tolerated even at higher doses.',
    },
    {
      name: 'Kava (Piper methysticum)',
      href: '/herbs/kava',
      type: 'Botanical Root Extract',
      onset: '20 to 60 minutes',
      mechanism: 'GABA-A receptor positive modulation, sodium/calcium channel blocker.',
      bestFor: 'Social tension, muscle relaxation, rapid situational anxiety relief.',
      safety: 'Moderate risk. Avoid with liver issues, alcohol, or daily chronic use.',
    },
    {
      name: 'Kanna (Sceletium tortuosum)',
      href: '/herbs/kanna',
      type: 'Botanical Extract',
      onset: '30 to 60 minutes',
      mechanism: 'Serotonin reuptake inhibitor (SRI) and PDE4 inhibitor.',
      bestFor: 'Mood elevation, cognitive quieting, stress-induced tension.',
      safety: 'High precaution. Do NOT stack with SSRIs, MAOIs, or serotonergics.',
    },
    {
      name: 'Lemon Balm (Melissa officinalis)',
      href: '/herbs/melissa-officinalis',
      type: 'Botanical Leaf Extract',
      onset: '30 to 90 minutes',
      mechanism: 'Inhibits GABA transaminase, preserving synaptic GABA levels.',
      bestFor: 'Bedtime racing thoughts, mild anxiety-linked restlessness.',
      safety: 'Low risk. May cause mild sedation or thyroid interaction at high doses.',
    },
  ]

  return (
    <ArticleLayout toc={toc} zone="supplement">
    <div className="space-y-8">
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 sm:p-10 shadow-sm">
        <p className="eyebrow-label">Discovery Guide</p>
        <h1 className="heading-premium mt-3 text-ink">
          Natural Anxiolytics Beyond Ashwagandha
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">
          While Ashwagandha is a highly popular adaptogen for long-term daily stress support, it is not a universal fit. Some individuals experience stomach upset, thyroid shifts, or mild emotional flattening (anhedonia) with chronic use. Others simply need acute, as-needed support rather than a daily regimen.
        </p>

        <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.14em]">
          <Link href="/herbs/ashwagandha" className="text-brand-700 hover:text-brand-800 hover:underline">
            Read Ashwagandha Profile →
          </Link>
          <Link href="/guides/best-herbs-for-anxiety" className="text-brand-700 hover:text-brand-800 hover:underline">
            Best Herbs for Anxiety Guide →
          </Link>
          <Link href="/compare/kanna-vs-ssris" className="text-brand-700 hover:text-brand-800 hover:underline">
            Kanna vs SSRIs Guide →
          </Link>
          <Link href="/compare/kava-vs-alcohol" className="text-brand-700 hover:text-brand-800 hover:underline">
            Kava vs Alcohol Guide →
          </Link>
        </div>
      </section>

      {/* Alternatives Grid */}
      <section id="compared" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold text-ink">Four Calming Alternatives Compared</h2>
        <p className="text-sm text-muted">Contrast these options based on their speed of effect, chemical pathways, and safety profiles.</p>
        
        <div className="grid gap-4 md:grid-cols-2">
          {alternatives.map((alt) => (
            <article key={alt.name} className="card-premium p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-ink">{alt.name}</h3>
                  <span className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-800 border border-brand-100/50">
                    {alt.type}
                  </span>
                </div>
                <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted">
                  <li><strong>Onset:</strong> {alt.onset}</li>
                  <li><strong>Mechanism:</strong> {alt.mechanism}</li>
                  <li><strong>Best For:</strong> {alt.bestFor}</li>
                  <li className="pt-2 border-t border-brand-900/5 text-[#5f4a24]">
                    <strong>Safety note:</strong> {alt.safety}
                  </li>
                </ul>
              </div>
              <Link
                href={alt.href}
                className="inline-flex items-center justify-between text-xs font-semibold text-brand-700 hover:text-brand-800 hover:underline"
              >
                <span>View full research profile</span>
                <span>→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Decision Guidance */}
      <section id="evaluation" className="scroll-mt-20 rounded-2xl border border-brand-900/10 bg-white/90 p-5 sm:p-6 space-y-4 shadow-sm">
        <h2 className="text-xl font-semibold text-ink">How to Structure Your Calm Evaluation</h2>
        <div className="grid gap-4 sm:grid-cols-3 text-sm">
          <div className="space-y-2">
            <h3 className="font-semibold text-ink">1. Identify Use Case</h3>
            <p className="text-muted text-xs leading-relaxed">
              Do you need immediate calm for an active presentation (L-Theanine), social winding down (Kava), or systemic bedtime relaxation (Lemon Balm)?
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-ink">2. Screen Medications</h3>
            <p className="text-muted text-xs leading-relaxed">
              Always consult your doctor. Avoid serotonergics (like Kanna) if taking SSRIs, and avoid GABA-acting stack combinations if taking sleep aids.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-ink">3. Assess Onset Limits</h3>
            <p className="text-muted text-xs leading-relaxed">
              Acute options act within an hour but decay quickly. Long-term adaptogens (like Ashwagandha) take weeks to reach steady state.
            </p>
          </div>
        </div>
      </section>

      {lTheanineProducts && (
        <RecommendationSection products={lTheanineProducts.products} />
      )}

      {/* Safety Layer */}
      <section id="summary" className="scroll-mt-20 rounded-2xl border border-amber-900/15 bg-amber-50/70 p-5 text-sm leading-6 text-amber-950">
        <h2 className="font-semibold text-amber-950">Evidence and Precaution Summary</h2>
        <p className="mt-2 text-xs">
          Calming supplements have varying degrees of clinical backing. While L-Theanine has moderate trial validation for acute stress relief, botanical profiles like Kanna and traditional Lemon Balm preparations rely on smaller human cohorts or mechanistic models.
        </p>
        <p className="mt-2 text-xs">
          Always review your personal contraindications, potential drug-supplement interactions, and consult with a qualified medical professional before introducing new supplements.
        </p>
        <div className="mt-4 flex gap-3">
          <Link href="/compare" className="text-xs font-bold text-amber-900 hover:text-amber-950 hover:underline">
            Side-by-Side Compare Tool →
          </Link>
          <Link href="/safety-checker" className="text-xs font-bold text-amber-900 hover:text-amber-950 hover:underline">
            Interactive Safety Checker →
          </Link>
        </div>
      </section>
    </div>
    </ArticleLayout>
  )
}
