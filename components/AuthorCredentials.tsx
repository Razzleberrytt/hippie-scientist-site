import Link from 'next/link'
import ProfileFeedback from '@/components/profile/ProfileFeedback'

export default function AuthorCredentials() {
  return (
    <div className="space-y-5">
      <section aria-label="Author" className="flex items-center gap-3">
        <div aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-700/10 text-sm font-bold text-brand-800">
          WR
        </div>
        <div>
          <p className="text-sm font-semibold text-[color:var(--hs-ink)]">
            By <Link href="/info/about/" className="underline decoration-brand-700/40 underline-offset-2 hover:text-brand-700">Willie B. Randolph III</Link>
          </p>
          <p className="mt-0.5 text-xs leading-5 text-muted">
            Founder &amp; Head Researcher · Oak Ridge, TN · Last reviewed August 2026
          </p>
        </div>
      </section>
      <section className="border-y border-brand-700/15 py-5">
        <div className="relative flex flex-col gap-2 pl-4 before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:rounded-full before:bg-brand-700/30 sm:flex-row sm:items-center sm:justify-between dark:before:bg-[var(--accent-teal)]/40">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">
              Editorial Review
            </h3>
            <p className="mt-1 text-xs leading-5 text-muted">
              Checked against primary sources, cited evidence, and contraindication language before publication.
              Evidence claims, safety language, and affiliate modules are reviewed independently. Not personal medical advice.
            </p>
          </div>
          <Link
            href="/info/about/"
            className="shrink-0 self-start text-xs font-bold text-brand-800 transition hover:text-brand-700 hover:underline sm:self-center"
          >
            Editorial Standards &rarr;
          </Link>
        </div>
      </section>
      <ProfileFeedback />
    </div>
  )
}
