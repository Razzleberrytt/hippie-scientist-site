import Link from 'next/link'

export default function AuthorCredentials() {
  return (
    <section className="rounded-2xl border border-brand-900/10 bg-white/95 p-6 shadow-sm space-y-6">
      <div className="border-b border-brand-900/5 pb-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">
          Editorial Review
        </h3>
        <h2 className="text-lg font-bold text-ink mt-1">
          Reviewed against source evidence and safety constraints
        </h2>
        <p className="text-xs text-muted mt-1.5 leading-relaxed">
          Profiles are checked against workbook source data, cited evidence, contraindication language, and static-export quality gates before publication. This is editorial review, not personal medical advice or a named clinician endorsement.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          'Evidence claims are matched to human, mechanistic, or traditional-use context.',
          'Safety language is kept conservative when interaction or population data is incomplete.',
          'Affiliate modules are separated from evidence ratings and caution language.',
        ].map((item) => (
          <div key={item} className="rounded-xl border border-brand-900/10 bg-[#fbfaf6] p-3">
            <p className="text-xs leading-5 text-muted">{item}</p>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-brand-900/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
        <p className="text-muted leading-relaxed max-w-2xl">
          <strong className="font-semibold text-ink">Editorial Process:</strong> We synthesize preclinical pharmacology, human clinical data, and source registry context while preserving uncertainty and avoiding commercial hype.
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
