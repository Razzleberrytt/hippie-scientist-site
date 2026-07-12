import Link from 'next/link'

export default function AuthorCredentials() {
  return (
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
  )
}
