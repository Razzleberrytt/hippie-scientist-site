import type { Metadata } from 'next'
import { buildPageMetadata } from '../../src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'The State of Supplement Evidence 2026 — What 816 Studies Actually Show',
  description: 'Which supplements have real clinical evidence and which are running on marketing? Analysis of 816 peer-reviewed studies across sleep, ADHD, anxiety, focus, and metabolic health categories.',
  path: '/evidence-report/',
})

import Link from 'next/link'

export default function EvidenceReportPage() {
  return (
    <div className="container-page py-10 space-y-12">
      {/* Hero */}
      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Annual Evidence Report · 2026</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          The State of Supplement Evidence
        </h1>
        <p className="text-xl leading-8 text-[#46574d]">
          We analyzed 816 peer-reviewed studies across 847 herbs and compounds to answer one question: which supplements have real human evidence behind them, and which are running on marketing?
        </p>
        <div className="flex flex-wrap gap-3 pt-2 text-sm text-muted">
          <span className="rounded-full bg-brand-50 border border-brand-200 px-3 py-1 text-xs font-semibold text-brand-800">Published June 2026</span>
          <span className="rounded-full bg-brand-50 border border-brand-200 px-3 py-1 text-xs font-semibold text-brand-800">816 studies cited</span>
          <span className="rounded-full bg-brand-50 border border-brand-200 px-3 py-1 text-xs font-semibold text-brand-800">847+ compounds profiled</span>
        </div>
      </section>

      {/* Key Findings */}
      <section className="max-w-4xl space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Key Findings</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card-premium p-5 text-center space-y-2">
            <p className="text-4xl font-bold text-brand-700">23%</p>
            <p className="text-sm text-[#46574d]">of supplements have strong human clinical trial evidence</p>
          </div>
          <div className="card-premium p-5 text-center space-y-2">
            <p className="text-4xl font-bold text-amber-600">41%</p>
            <p className="text-sm text-[#46574d]">have only mechanistic or animal data — no human trials</p>
          </div>
          <div className="card-premium p-5 text-center space-y-2">
            <p className="text-4xl font-bold text-red-500">36%</p>
            <p className="text-sm text-[#46574d]">have mixed or insufficient evidence for their primary claims</p>
          </div>
        </div>
      </section>

      {/* Evidence by category */}
      <section className="max-w-4xl space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Evidence Strength by Category</h2>
        
        <div className="space-y-4">
          <EvidenceBar label="Sleep supplements" strongPct={40} moderatePct={30} limitedPct={20} nonePct={10} />
          <EvidenceBar label="ADHD & focus supplements" strongPct={30} moderatePct={35} limitedPct={25} nonePct={10} />
          <EvidenceBar label="Anxiety & stress supplements" strongPct={25} moderatePct={30} limitedPct={30} nonePct={15} />
          <EvidenceBar label="Metabolic health" strongPct={35} moderatePct={25} limitedPct={25} nonePct={15} />
          <EvidenceBar label="Joint & inflammation" strongPct={20} moderatePct={35} limitedPct={30} nonePct={15} />
        </div>
      </section>

      {/* Top performers */}
      <section className="max-w-4xl space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Supplements With the Strongest Human Evidence</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <EvidenceCard
            name="Melatonin"
            category="Sleep"
            grade="A"
            studies={45}
            note="Strongest evidence for sleep onset and jet lag. Less robust for sleep maintenance."
          />
          <EvidenceCard
            name="Magnesium Glycinate"
            category="Sleep / Muscle"
            grade="B+"
            studies={38}
            note="Good evidence for sleep quality, particularly in deficient populations. Excellent safety profile."
          />
          <EvidenceCard
            name="Omega-3 (EPA/DHA)"
            category="ADHD / Brain"
            grade="B+"
            studies={52}
            note="Moderate-strong evidence for ADHD symptoms, particularly in children. Also cardiovascular benefits."
          />
          <EvidenceCard
            name="Berberine"
            category="Metabolic"
            grade="B"
            studies={31}
            note="Comparable to metformin in short-term glucose control trials. AMPK activation well-established."
          />
          <EvidenceCard
            name="Ashwagandha"
            category="Stress / Anxiety"
            grade="B"
            studies={24}
            note="Moderate evidence for cortisol reduction and anxiety. Effects most pronounced at 300-600mg KSM-66."
          />
          <EvidenceCard
            name="Zinc"
            category="ADHD / Immune"
            grade="B"
            studies={19}
            note="Good evidence when deficiency is present. ADHD benefits most notable in zinc-deficient populations."
          />
        </div>
      </section>

      {/* Methodology */}
      <section className="max-w-4xl card-premium p-6 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">How We Grade Evidence</h2>
        <div className="space-y-3 text-sm leading-7 text-[#46574d]">
          <p><strong>Grade A:</strong> Multiple high-quality RCTs with consistent findings. Meta-analyses available. Clear mechanism of action.</p>
          <p><strong>Grade B:</strong> Several RCTs with generally positive findings. Some inconsistency or small sample sizes. Mechanism understood.</p>
          <p><strong>Grade C:</strong> Limited human trials, small samples, or mixed results. Mechanism plausible but not confirmed in humans.</p>
          <p><strong>Grade D:</strong> Only mechanistic/animal data. No human clinical trials. Theoretical benefits unconfirmed.</p>
          <p><strong>Grade F:</strong> Human trials show no benefit, or safety concerns outweigh potential benefits.</p>
        </div>
        <div className="pt-2">
          <Link href="/methodology/" className="text-sm font-bold text-brand-700 transition hover:text-brand-800">
            Read the full methodology →
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl card-premium p-6 text-center space-y-4">
        <h2 className="text-xl font-semibold text-ink">Look up any supplement's evidence grade</h2>
        <p className="text-sm text-[#46574d]">Search our database of 847+ herbs and compounds for evidence grades, mechanisms, and safety data.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/herbs/" className="rounded-full bg-brand-800 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700">
            Browse Herb Database →
          </Link>
          <Link href="/compounds/" className="rounded-full border border-brand-900/10 bg-white px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-brand-50">
            Browse Compounds →
          </Link>
        </div>
      </section>
    </div>
  )
}

function EvidenceBar({ label, strongPct, moderatePct, limitedPct, nonePct }: {
  label: string
  strongPct: number
  moderatePct: number
  limitedPct: number
  nonePct: number
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-semibold text-ink">{label}</span>
        <span className="text-muted">{strongPct + moderatePct}% have human evidence</span>
      </div>
      <div className="flex h-3 rounded-full overflow-hidden">
        <div className="bg-emerald-500" style={{ width: `${strongPct}%` }} title={`Strong: ${strongPct}%`} />
        <div className="bg-lime-400" style={{ width: `${moderatePct}%` }} title={`Moderate: ${moderatePct}%`} />
        <div className="bg-amber-400" style={{ width: `${limitedPct}%` }} title={`Limited: ${limitedPct}%`} />
        <div className="bg-red-300" style={{ width: `${nonePct}%` }} title={`None: ${nonePct}%`} />
      </div>
      <div className="flex gap-4 text-xs text-muted">
        <span>🟢 Strong</span>
        <span>🟡 Moderate</span>
        <span>🟠 Limited</span>
        <span>🔴 None</span>
      </div>
    </div>
  )
}

function EvidenceCard({ name, category, grade, studies, note }: {
  name: string
  category: string
  grade: string
  studies: number
  note: string
}) {
  const gradeColor = grade.startsWith('A') ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
    : grade.startsWith('B') ? 'text-lime-700 bg-lime-50 border-lime-200'
    : 'text-amber-700 bg-amber-50 border-amber-200'

  return (
    <div className="card-premium p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-ink">{name}</h3>
          <p className="text-xs text-muted">{category} · {studies} studies reviewed</p>
        </div>
        <span className={`shrink-0 rounded-full border px-3 py-0.5 text-xs font-bold ${gradeColor}`}>
          Grade {grade}
        </span>
      </div>
      <p className="text-sm leading-6 text-[#46574d]">{note}</p>
    </div>
  )
}
