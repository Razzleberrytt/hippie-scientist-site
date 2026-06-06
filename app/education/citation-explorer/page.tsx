import type { Metadata } from 'next'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'

export const metadata: Metadata = {
  title: 'Scientific Evidence Citation Explorer',
  description: 'Explore the scientific studies, clinical trials, and research papers backing the mechanisms and claims on The Hippie Scientist.',
}

export default function CitationExplorerPage() {
  return (
    <main className="container-page py-10 space-y-10 max-w-4xl mx-auto">
      <AuthorityJsonLd
        title="Scientific Evidence Citation Explorer"
        description="Verify scientific citations, clinical trials, and GRADE evidence levels behind botanical monograph claims."
        url="https://thehippiescientist.net/education/citation-explorer"
        type="MedicalWebPage"
      />

      <section className="space-y-5">
        <p className="eyebrow-label">Evidence Verification</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Scientific Citation Explorer
        </h1>
        <p className="text-lg leading-8 text-[#46574d]">
          The Hippie Scientist operates under strict evidence-honesty standards. Every monograph claim maps to peer-reviewed human trials, RCTs, or metabolic pathway studies. Use this directory to check GRADE levels, sample sizes, and study parameters.
        </p>
      </section>

      {/* Methodology Section */}
      <section className="rounded-3xl border border-brand-900/10 bg-white/90 p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-ink">Our GRADE Certainty Guidelines</h2>
        <div className="grid gap-6 sm:grid-cols-2 text-sm text-[#46574d]">
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-800">High Certainty (GRADE A)</h3>
            <p className="leading-relaxed">Multiple robust, randomized controlled trials (RCTs) with consistent results, low risk of bias, and direct applicability to target populations.</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-800">Moderate Certainty (GRADE B)</h3>
            <p className="leading-relaxed">Trials with minor design limitations, inconsistent directions of findings, or smaller cohorts but strong biological plausibility.</p>
          </div>
        </div>
        <div className="pt-4 text-center border-t border-slate-100">
          <Link href="/education/evidence-hierarchy" className="text-emerald-700 font-semibold hover:underline">
            Read Evidence Hierarchy Manual →
          </Link>
        </div>
      </section>
    </main>
  )
}
