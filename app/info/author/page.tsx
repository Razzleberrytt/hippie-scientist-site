import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About the Author — The Hippie Scientist',
  description:
    'Willie B. Randolph III is the independent author behind The Hippie Scientist. Learn about the editorial philosophy, methodology, and the person behind the database.',
  alternates: {
    canonical: '/author/',
  },
}

export default function AuthorPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 px-4 py-8 sm:py-12">
      {/* Header */}
      <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10">
        <p className="eyebrow-label">Author</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Willie B. Randolph III
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Age 34, father of two little girls, and based in Oak Ridge, Tennessee. He synthesizes peer-reviewed botanical science for curious, health-conscious readers in plain language, conservative claims, and honest uncertainty.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/about/"
            className="rounded-full bg-brand-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
          >
            Editorial standards
          </Link>
          <Link
            href="/herbs/"
            className="rounded-full border border-brand-900/20 px-5 py-3 text-sm font-semibold text-ink transition hover:border-brand-700 hover:bg-brand-50"
          >
            Herb library
          </Link>
        </div>
      </section>

      {/* Identity */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-[1.5rem] border border-brand-900/10 bg-white/85 p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-ink">Independent Research Project</h2>
          <p className="text-sm leading-6 text-muted">
            This site is a one-person project. Content is researched, written, and maintained by a single author with a background in evidence synthesis and a deep interest in natural compounds.
            It is not affiliated with any supplement brand, clinical institution, or commercial research group.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-brand-900/10 bg-white/85 p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-ink">Editorial Stance</h2>
          <p className="text-sm leading-6 text-muted">
            Every profile separates human clinical evidence from mechanistic or animal-model plausibility.
            Dosing and safety language is kept conservative. Affiliate revenue is disclosed and structurally
            separated from evidence grades — no brand can pay to change a rating or suppress a caution.
          </p>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-brand-900/10 bg-gradient-to-br from-white to-emerald-50/60 p-6 shadow-sm sm:p-8">
        <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Personal snapshot</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink">Willie B. Randolph III</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
              Oak Ridge, Tennessee. Age 34. Father of two little girls. The work here is built around making supplement research feel premium, readable, and honest enough to trust when the stakes are health and money.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl border border-brand-900/10 bg-white/95 px-3 py-3">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-brand-700">Age</p>
              <p className="mt-1 text-lg font-semibold text-ink">34</p>
            </div>
            <div className="rounded-2xl border border-brand-900/10 bg-white/95 px-3 py-3">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-brand-700">Family</p>
              <p className="mt-1 text-lg font-semibold text-ink">2 girls</p>
            </div>
            <div className="rounded-2xl border border-brand-900/10 bg-white/95 px-3 py-3">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-brand-700">City</p>
              <p className="mt-1 text-lg font-semibold text-ink">Oak Ridge</p>
            </div>
          </div>
        </div>
      </section>

      {/* Credentials / approach */}
      <section className="rounded-[1.5rem] border border-brand-900/10 bg-white/85 p-6 sm:p-8 shadow-sm space-y-5">
        <div>
          <p className="eyebrow-label">Approach</p>
          <h2 className="mt-1 text-2xl font-bold text-ink">How Content Is Produced</h2>
        </div>
        <ul className="space-y-3 text-sm leading-6 text-muted list-none">
          <li className="flex gap-3">
            <span className="text-emerald-700 font-bold flex-shrink-0">1.</span>
            <span><strong className="font-semibold text-ink">Workbook sourcing:</strong> All ingredient data originates in a master spreadsheet with structured fields for evidence, safety, mechanisms, dosing context, and interactions — preventing ad-hoc additions without a paper trail.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-emerald-700 font-bold flex-shrink-0">2.</span>
            <span><strong className="font-semibold text-ink">Evidence grading:</strong> Human randomized controlled trials and meta-analyses rank highest. Mechanistic studies and traditional use are labeled separately. Preclinical data is never presented as proven human outcome.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-emerald-700 font-bold flex-shrink-0">3.</span>
            <span><strong className="font-semibold text-ink">Safety-first publication:</strong> Interaction risks, population exclusions, dosing uncertainty, and legal status warnings are surfaced before product recommendations. High-caution substances suppress affiliate CTAs programmatically.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-emerald-700 font-bold flex-shrink-0">4.</span>
            <span><strong className="font-semibold text-ink">Ongoing review:</strong> Profiles are revisited when new RCT-level evidence is published. The last-reviewed date is displayed on each profile.</span>
          </li>
        </ul>
      </section>

      {/* Contact / corrections */}
      <section className="rounded-[1.5rem] border border-brand-900/10 bg-white/85 p-6 shadow-sm space-y-3">
        <h2 className="text-lg font-bold text-ink">Corrections & Feedback</h2>
        <p className="text-sm leading-6 text-muted max-w-2xl">
          Found an error, outdated citation, or evidence summary that overstates what the data supports? Please reach out. Corrections improve the resource for everyone and are taken seriously.
        </p>
        <Link
          href="/contact/"
          className="inline-block rounded-full border border-brand-900/20 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-brand-700 hover:bg-brand-50"
        >
          Send a correction →
        </Link>
      </section>

      {/* Navigation */}
      <nav aria-label="Content links" className="flex flex-wrap gap-3 text-sm">
        <Link href="/herbs/" className="text-brand-800 hover:underline font-semibold">Herb library</Link>
        <span className="text-muted">·</span>
        <Link href="/compounds/" className="text-brand-800 hover:underline font-semibold">Compound library</Link>
        <span className="text-muted">·</span>
        <Link href="/goals/" className="text-brand-800 hover:underline font-semibold">Goal guides</Link>
        <span className="text-muted">·</span>
        <Link href="/about/" className="text-brand-800 hover:underline font-semibold">About</Link>
        <span className="text-muted">·</span>
        <Link href="/disclaimer/" className="text-brand-800 hover:underline font-semibold">Disclaimer</Link>
      </nav>
    </div>
  )
}
