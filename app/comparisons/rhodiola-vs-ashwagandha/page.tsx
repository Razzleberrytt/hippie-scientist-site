import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import HumanVsMechanisticEvidence from '@/components/evidence/HumanVsMechanisticEvidence'
import TranslationalLimitationsCard from '@/components/evidence/TranslationalLimitationsCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'

const comparisons = [
  {
    category: 'Stress Response',
    rhodiola:
      'Rhodiola is commonly discussed in relation to fatigue resilience, stress endurance, attentional continuity, and stimulating adaptogenic systems.',
    ashwagandha:
      'Ashwagandha is more commonly associated with emotional regulation, calming recovery systems, stress physiology, and nervous-system downregulation.',
  },
  {
    category: 'Energy and Fatigue',
    rhodiola:
      'Rhodiola may be explored for fatigue-oriented cognition support, burnout resilience, and stress-related energy continuity.',
    ashwagandha:
      'Ashwagandha discussions more frequently emphasize recovery biology, restorative support, and stress-related nervous-system regulation.',
  },
  {
    category: 'Stimulation Profile',
    rhodiola:
      'Rhodiola is often described as more activating or stimulating depending on extract composition, dose, context, and individual variability.',
    ashwagandha:
      'Ashwagandha is generally framed as calmer or more recovery oriented, though experiences may vary substantially between individuals.',
  },
]

const relatedSystems = [
  {
    href: '/education/what-are-adaptogens',
    title: 'Adaptogens',
  },
  {
    href: '/protocols/stress-regulation',
    title: 'Stress Regulation',
  },
  {
    href: '/protocols/burnout-recovery',
    title: 'Burnout Recovery',
  },
  {
    href: '/comparisons/calm-focus-vs-stimulation',
    title: 'Calm Focus vs Stimulation',
  },
]

export default function RhodiolaVsAshwagandhaPage() {
  return (
    <main className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="Rhodiola vs Ashwagandha"
        description="Educational comparison of Rhodiola and Ashwagandha covering stress physiology, recovery biology, stimulation tradeoffs, fatigue systems, and adaptogenic neuropharmacology."
        url="https://thehippiescientist.net/comparisons/rhodiola-vs-ashwagandha"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Comparisons', href: '/comparisons' },
          { label: 'Rhodiola vs Ashwagandha' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Adaptogen Comparison</p>

          <h1 className="text-5xl font-bold tracking-tight text-ink">
            Rhodiola vs Ashwagandha
          </h1>
        </div>

        <p className="text-xl leading-9 text-[#46574d]">
          Rhodiola and Ashwagandha are two widely discussed adaptogenic herbs associated with stress-response physiology, fatigue systems, emotional regulation, recovery biology, cognition continuity, and nervous-system resilience.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Educational comparison between these herbs should emphasize contextual variability, evidence interpretation, stimulation tradeoffs, recovery-oriented neurobiology, and individual nervous-system differences rather than simplistic “better adaptogen” narratives.
        </p>
      </section>

      <EvidenceSummaryCard
        title="Adaptogenic stress-response comparison"
        evidenceLevel="Moderate"
        humanEvidence="Both Rhodiola and Ashwagandha have human research associated with stress resilience, fatigue systems, emotional regulation, and recovery-oriented neurobiology, though evidence quality and product standardization vary substantially."
        mechanisticEvidence="Mechanistic discussions commonly involve stress physiology, autonomic regulation, fatigue adaptation systems, inflammatory signaling, neuroendocrine pathways, and nervous-system resilience."
        safetyProfile="Stimulation sensitivity, medication interactions, endocrine effects, sleep continuity, emotional regulation, and individual variability may substantially influence experiences and tolerability."
      />

      <section className="space-y-6">
        <div className="space-y-2">
          <p className="eyebrow-label">Systems-Oriented Comparison</p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Tradeoffs and contextual differences
          </h2>
        </div>

        <div className="grid gap-6">
          {comparisons.map((comparison) => (
            <div
              key={comparison.category}
              className="card-premium p-8 space-y-6"
            >
              <h3 className="text-2xl font-semibold tracking-tight text-ink">
                {comparison.category}
              </h3>

              <div className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-3xl border border-emerald-200/50 bg-emerald-50/60 p-6 space-y-3">
                  <h4 className="text-xl font-semibold text-ink">
                    Rhodiola
                  </h4>

                  <p className="text-sm leading-7 text-[#46574d]">
                    {comparison.rhodiola}
                  </p>
                </div>

                <div className="rounded-3xl border border-blue-200/50 bg-blue-50/60 p-6 space-y-3">
                  <h4 className="text-xl font-semibold text-ink">
                    Ashwagandha
                  </h4>

                  <p className="text-sm leading-7 text-[#46574d]">
                    {comparison.ashwagandha}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <HumanVsMechanisticEvidence />

      <TranslationalLimitationsCard />

      <section className="card-premium p-8 space-y-6">
        <div className="space-y-2 max-w-3xl">
          <p className="eyebrow-label">Educational Interpretation</p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Different nervous systems may respond differently
          </h2>

          <p className="text-base leading-8 text-[#46574d]">
            Some individuals may prefer more activating stress-resilience approaches while others may respond better to calmer recovery-oriented systems. Sleep continuity, emotional regulation, burnout physiology, anxiety sensitivity, stress burden, medications, and lifestyle factors may all influence subjective outcomes.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="rounded-3xl border border-black/5 bg-white/60 p-6 space-y-3">
            <h3 className="text-xl font-semibold text-ink">
              Burnout-Oriented Systems
            </h3>

            <p className="text-sm leading-7 text-[#46574d]">
              Recovery-oriented stress support may involve different priorities than performance-oriented fatigue resilience.
            </p>
          </div>

          <div className="rounded-3xl border border-black/5 bg-white/60 p-6 space-y-3">
            <h3 className="text-xl font-semibold text-ink">
              Sleep and Recovery
            </h3>

            <p className="text-sm leading-7 text-[#46574d]">
              Sleep continuity and nervous-system recovery may substantially influence stress resilience and cognition continuity.
            </p>
          </div>

          <div className="rounded-3xl border border-black/5 bg-white/60 p-6 space-y-3">
            <h3 className="text-xl font-semibold text-ink">
              Evidence Variability
            </h3>

            <p className="text-sm leading-7 text-[#46574d]">
              Product quality, extraction methods, dosing systems, and evidence quality may vary significantly between preparations.
            </p>
          </div>
        </div>
      </section>

      <SafetyNotice>
        Adaptogenic herbs may interact with medications, endocrine systems, cardiovascular physiology, sleep regulation, or emotional-processing systems. Educational content is not a substitute for individualized medical guidance.
      </SafetyNotice>

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="eyebrow-label">Related Educational Systems</p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Continue exploring stress-response systems
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {relatedSystems.map((system) => (
            <Link
              key={system.href}
              href={system.href}
              className="card-premium p-6 transition hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                <p className="eyebrow-label">Related System</p>

                <h3 className="text-2xl font-semibold tracking-tight text-ink">
                  {system.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
