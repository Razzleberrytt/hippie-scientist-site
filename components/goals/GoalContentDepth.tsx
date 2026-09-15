import type { GoalContentExtension } from '@/data/goal-content'

type GoalContentDepthProps = {
  content: GoalContentExtension
}

export default function GoalContentDepth({ content }: GoalContentDepthProps) {
  return (
    <>
      {content.evidenceRows.length > 0 ? (
        <section className='card-premium p-4 sm:p-8'>
          <h2 className='text-xl font-semibold text-ink'>Evidence at a glance</h2>
          <p className='mt-2 text-sm leading-6 text-muted'>
            Summary tiers for quick scanning — open each profile for full sourcing and study context.
          </p>

          <div className='mt-4 grid gap-3 sm:hidden' data-mobile-goal-evidence='true'>
            {content.evidenceRows.map((row) => (
              <article
                key={`${row.compound}-mobile`}
                className='overflow-hidden rounded-2xl border border-brand-900/10 bg-[var(--surface-card)]'
              >
                <div className='border-b border-brand-900/10 bg-brand-50/55 px-4 py-3 dark:border-white/10 dark:bg-[var(--surface-subtle)]'>
                  <h3 className='text-base font-bold leading-5 text-ink'>{row.compound}</h3>
                </div>
                <dl className='divide-y divide-brand-900/5 px-4 dark:divide-white/10'>
                  <div className='grid gap-1 py-3'>
                    <dt className='text-[0.66rem] font-bold uppercase tracking-[0.1em] text-brand-700 dark:text-[var(--accent-teal)]'>Evidence</dt>
                    <dd className='text-sm leading-6 text-muted'>{row.evidence}</dd>
                  </div>
                  <div className='grid gap-1 py-3'>
                    <dt className='text-[0.66rem] font-bold uppercase tracking-[0.1em] text-brand-700 dark:text-[var(--accent-teal)]'>Human data</dt>
                    <dd className='text-sm leading-6 text-muted'>{row.humanData}</dd>
                  </div>
                  <div className='grid gap-1 py-3'>
                    <dt className='text-[0.66rem] font-bold uppercase tracking-[0.1em] text-brand-700 dark:text-[var(--accent-teal)]'>Key limitation</dt>
                    <dd className='text-sm leading-6 text-muted'>{row.limitation}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>

          <div className='mt-6 hidden overflow-x-auto sm:block'>
            <table className='min-w-full text-left text-sm border-collapse'>
              <thead>
                <tr className='border-b border-brand-900/10'>
                  <th className='py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink'>Option</th>
                  <th className='py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink'>Evidence</th>
                  <th className='py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink'>Human data</th>
                  <th className='py-3 text-xs font-bold uppercase tracking-wider text-ink'>Key limitation</th>
                </tr>
              </thead>
              <tbody>
                {content.evidenceRows.map((row) => (
                  <tr key={row.compound} className='border-b border-brand-900/5 align-top last:border-0'>
                    <td className='py-3 pr-4 font-semibold text-ink'>{row.compound}</td>
                    <td className='py-3 pr-4 text-muted'>{row.evidence}</td>
                    <td className='py-3 pr-4 text-muted'>{row.humanData}</td>
                    <td className='py-3 text-muted'>{row.limitation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {content.dosingNotes.length > 0 ? (
        <section className='card-premium p-4 sm:p-8'>
          <h2 className='text-xl font-semibold text-ink'>Dosing context (verify your label)</h2>
          <ul className='mt-4 space-y-3 text-sm leading-relaxed text-muted'>
            {content.dosingNotes.map((item) => (
              <li key={item.compound}>
                <strong className='font-semibold text-ink'>{item.compound}:</strong> {item.note}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {content.faqItems.length > 0 ? (
        <section className='card-premium p-4 sm:p-8'>
          <h2 className='text-xl font-semibold text-ink'>Frequently asked questions</h2>
          <div className='mt-4 space-y-3 sm:mt-6 sm:space-y-4'>
            {content.faqItems.map((item) => (
              <details
                key={item.question}
                className='group rounded-2xl border border-brand-900/10 bg-white/70 p-4'
              >
                <summary className='flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold text-ink'>
                  {item.question}
                  <span className='text-brand-500 group-open:rotate-180 transition-transform' aria-hidden>
                    ▼
                  </span>
                </summary>
                <p className='mt-3 text-sm leading-7 text-muted'>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      {content.safetyBullets.length > 0 ? (
        <section className='rounded-2xl border border-amber-600/15 bg-amber-50/50 p-4 sm:p-6'>
          <h2 className='text-lg font-bold text-amber-950'>Safety checklist</h2>
          <ul className='mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-amber-900'>
            {content.safetyBullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  )
}