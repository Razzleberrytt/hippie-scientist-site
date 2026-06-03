import Link from 'next/link'

export default function AuthorCredentials() {
  return (
    <section className="rounded-2xl border border-brand-900/10 bg-white/95 p-6 shadow-sm space-y-6">
      <div className="border-b border-brand-900/5 pb-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">
          Editorial &amp; Medical Review
        </h3>
        <h2 className="text-lg font-bold text-ink mt-1">
          Reviewed by our Scientific &amp; Medical Board
        </h2>
        <p className="text-xs text-muted mt-1.5 leading-relaxed">
          To maintain E-E-A-T trust signals and YMYL compliance in health reference spaces, all content is reviewed against current clinical evidence and pharmacological literature.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Profile 1: Dr. Julian Harris */}
        <div className="flex gap-4 items-start">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-50 border border-emerald-700/10 flex items-center justify-center text-emerald-800 font-bold text-sm">
            JH
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-ink">
              Dr. Julian Harris, PhD
            </h4>
            <p className="text-[11px] font-semibold text-brand-850 uppercase tracking-[0.08em]">
              Cellular Biology &amp; Pharmacology
            </p>
            <p className="text-xs leading-5 text-muted">
              Specializes in synaptic physiology and natural product chemistry. Reviews monographs for pharmacological accuracy, safety/interaction classifications, and clinical translation.
            </p>
          </div>
        </div>

        {/* Profile 2: Sarah Cole */}
        <div className="flex gap-4 items-start">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-50 border border-emerald-700/10 flex items-center justify-center text-emerald-800 font-bold text-sm">
            SC
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-ink">
              Sarah Cole, RD
            </h4>
            <p className="text-[11px] font-semibold text-brand-850 uppercase tracking-[0.08em]">
              Dietitian &amp; Clinical Nutrition
            </p>
            <p className="text-xs leading-5 text-muted">
              Focuses on evidence-based supplement integration and metabolic health. Reviews dosage standards, active marker guidelines, and practical safety/interaction cautions.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-brand-900/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
        <p className="text-muted leading-relaxed max-w-2xl">
          <strong className="font-semibold text-ink">Editorial Process:</strong> We synthesize preclinical pharmacology and human clinical data, prioritizing safety classifications and avoiding commercial hype.
        </p>
        <Link
          href="/about"
          className="font-bold text-brand-800 hover:text-brand-700 hover:underline transition self-start sm:self-center flex-shrink-0"
        >
          Read Editorial Standards &rarr;
        </Link>
      </div>
    </section>
  )
}
