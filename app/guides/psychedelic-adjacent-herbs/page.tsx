import type { Metadata } from 'next'
import Link from 'next/link'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'

export const metadata: Metadata = {
  title: 'Psychedelic-Adjacent Herbs & Harm Reduction',
  description: 'Evidence-informed harm reduction guide for traditional, ritual, and dream-adjacent botanicals like Blue Lotus and Kanna.',
  alternates: { canonical: '/guides/psychedelic-adjacent-herbs' },
  openGraph: {
    title: 'Psychedelic-Adjacent Herbs & Harm Reduction',
    description: 'Evidence-informed harm reduction guide for traditional, ritual, and dream-adjacent botanicals like Blue Lotus and Kanna.',
    url: '/guides/psychedelic-adjacent-herbs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Psychedelic-Adjacent Herbs & Harm Reduction',
    description: 'Evidence-informed harm reduction guide for traditional and ritual botanicals.',
  },
}

const HEADINGS: Heading[] = [
  { id: 'profiles', text: 'Monitored Botanical Profiles', level: 2 },
  { id: 'harm-reduction', text: 'Core Harm Reduction Checkpoints', level: 2 },
  { id: 'disclaimer', text: 'Legal & Health Disclaimer', level: 2 },
]

export default function PsychedelicAdjacentHerbsPage() {
  const toc = <TableOfContents headings={HEADINGS} />

  const botanicals = [
    {
      name: 'Blue Lotus (Nymphaea caerulea)',
      href: '/herbs/blue-lotus',
      traditionalRole: 'Mild relaxation, dream enrichment, traditional Egyptian rituals.',
      activeConstituents: 'Apomorphine (dopamine receptor agonist) and nuciferine (dopamine/serotonin antagonist signals).',
      mechanisms: 'Dopaminergic activity and mild GABA-A pathway modulation.',
      safetyContext: 'Standard caution. Mild sedative profile. Avoid stacking with heavy central depressants or alcohol.',
    },
    {
      name: 'Kanna (Sceletium tortuosum)',
      href: '/herbs/kanna',
      traditionalRole: 'Mood elevation, cognitive quieting, stress resilience.',
      activeConstituents: 'Mesembrine and mesembrenone alkaloids.',
      mechanisms: 'Serotonin reuptake inhibitor (SRI) and PDE4 inhibitor.',
      safetyContext: 'High precaution. Do NOT stack with SSRIs, MAOIs, or other serotonergic agents due to Serotonin Syndrome risks.',
    },
  ]

  return (
    <ArticleLayout toc={toc} zone="harm-reduction">
    <div className="space-y-8">
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 sm:p-10 shadow-sm">
        <p className="eyebrow-label">Safety-Led Discovery</p>
        <h1 className="heading-premium mt-3 text-ink">
          Psychedelic-Adjacent Herbs
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">
          This guide provides a conservative, evidence-based review of traditional and ritual botanicals. These herbs are not substitutes for clinical care or regulated psychedelics, and they require strict attention to dosing, pharmacological interactions, and safety thresholds.
        </p>

        <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.14em]">
          <Link href="/psychoactive/serotonergic-stacking-risks" className="text-brand-700 hover:text-brand-800 hover:underline">
            Serotonergic Stacking Risks →
          </Link>
          <Link href="/compare/kanna-vs-ssris" className="text-brand-700 hover:text-brand-800 hover:underline">
            Kanna vs SSRIs Compare →
          </Link>
          <Link href="/disclaimer" className="text-brand-700 hover:text-brand-800 hover:underline">
            Safety Disclaimer →
          </Link>
        </div>
      </section>

      {/* Botanical Profiles */}
      <section id="profiles" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold text-ink">Monitored Botanical Profiles</h2>
        <p className="text-sm text-muted">Review traditional uses, chemical constituents, and safety limits for these herbs.</p>
        
        <div className="grid gap-4 md:grid-cols-2">
          {botanicals.map((bot) => (
            <article key={bot.name} className="card-premium p-6 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-lg font-bold text-ink">{bot.name}</h3>
                <p className="mt-2 text-xs font-semibold text-brand-700">Traditional Use: {bot.traditionalRole}</p>
                <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted">
                  <li><strong>Active Constituents:</strong> {bot.activeConstituents}</li>
                  <li><strong>Mechanisms:</strong> {bot.mechanisms}</li>
                  <li className="pt-2 border-t border-brand-900/5 text-[#5f4a24]">
                    <strong>Safety Context:</strong> {bot.safetyContext}
                  </li>
                </ul>
              </div>
              <Link
                href={bot.href}
                className="inline-flex items-center justify-between text-xs font-semibold text-brand-700 hover:text-brand-800 hover:underline"
              >
                <span>View full research profile</span>
                <span>→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Harm Reduction Principles */}
      <section id="harm-reduction" className="scroll-mt-20 rounded-2xl border border-brand-900/10 bg-white/90 p-5 sm:p-6 space-y-4 shadow-sm">
        <h2 className="text-xl font-semibold text-ink">Core Harm Reduction Checkpoints</h2>
        <div className="grid gap-4 sm:grid-cols-3 text-sm">
          <div className="space-y-2">
            <h3 className="font-semibold text-ink">1. Avoid Multi-Stacking</h3>
            <p className="text-muted text-xs leading-relaxed">
              Combining psychoactive-adjacent herbs with each other, alcohol, or central depressants increases unpredictable neurological side effects.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-ink">2. Screen for SSRI/MAOI Conflict</h3>
            <p className="text-muted text-xs leading-relaxed">
              Herbs that modify serotonin reuptake (like Kanna) can trigger a life-threatening increase in serotonin levels if mixed with clinical antidepressants.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-ink">3. Respect Potency Variations</h3>
            <p className="text-muted text-xs leading-relaxed">
              Natural extracts differ vastly in alkaloid concentration. Always start with the lowest possible dose to gauge individual sensitivity.
            </p>
          </div>
        </div>
      </section>

      {/* Safety Layer */}
      <section id="disclaimer" className="scroll-mt-20 rounded-2xl border border-amber-900/15 bg-amber-50/70 p-5 text-sm leading-6 text-amber-950">
        <h2 className="font-semibold text-amber-950">Legal & Health Disclaimer</h2>
        <p className="mt-2 text-xs">
          These pages are for educational and harm reduction purposes only. The Hippie Scientist does not advocate for the use of unregulated or illegal substances. Always review clinical contraindications and consult with a licensed physician before introducing any botanical supplements into your lifestyle.
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
