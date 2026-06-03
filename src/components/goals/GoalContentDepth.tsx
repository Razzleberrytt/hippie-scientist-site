import type { GoalContentExtension } from '@/data/goal-content'

type GoalContentDepthProps = {
  content: GoalContentExtension
}

export default function GoalContentDepth({ content }: GoalContentDepthProps) {
  return (
    <>
      {content.evidenceRows.length > 0 ? (
        <section className='card-premium p-6 sm:p-8'>
          <h2 className='text-xl font-semibold text-ink'>Evidence at a glance</h2>
          <p className='mt-2 text-sm leading-6 text-muted'>
            Summary tiers for quick scanning — open each profile for full sourcing and study context.
          </p>
          <div className='mt-6 overflow-x-auto'>
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
        <section className='card-premium p-6 sm:p-8'>
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
        <section className='card-premium p-6 sm:p-8'>
          <h2 className='text-xl font-semibold text-ink'>Frequently asked questions</h2>
          <div className='mt-6 space-y-4'>
            {content.faqItems.map((item) => (
              <details
                key={item.question}
                className='group rounded-2xl border border-brand-900/10 bg-white/70 p-4'
              >
                <summary className='cursor-pointer font-semibold text-ink text-sm list-none flex justify-between gap-2'>
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
        <section className='rounded-2xl border border-amber-600/15 bg-amber-50/50 p-6'>
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