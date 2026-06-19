import Link from 'next/link'
import type { GoalHubLink } from '../../lib/goal-hub-links'

type GoalHubSectionsProps = {
  goalSlug: string
  stack: GoalHubLink | null
  compares: GoalHubLink[]
  seoEntry: GoalHubLink | null
}

export default function GoalHubSections({
  goalSlug,
  stack,
  compares,
  seoEntry,
}: GoalHubSectionsProps) {
  const hasLinks = stack || compares.length > 0 || seoEntry
  if (!hasLinks) return null

  return (
    <section className='card-premium p-6 sm:p-8 space-y-6'>
      <div>
        <h2 className='text-xl font-semibold text-ink'>Explore stacks &amp; comparisons</h2>
        <p className='mt-2 text-sm leading-6 text-muted'>
          Continue from this goal into pre-built stacks and head-to-head comparisons — educational context only.
        </p>
      </div>

      {stack ? (
        <div className='rounded-2xl border border-brand-900/10 bg-white/70 p-5'>
          <p className='text-[10px] font-bold uppercase tracking-wider text-brand-700'>Stack</p>
          <Link href={stack.href} className='mt-2 block text-base font-semibold text-brand-800 hover:underline'>
            {stack.label} →
          </Link>
          {stack.note ? <p className='mt-2 text-sm text-muted'>{stack.note}</p> : null}
        </div>
      ) : null}

      {compares.length > 0 ? (
        <div>
          <p className='text-[10px] font-bold uppercase tracking-wider text-brand-700 mb-3'>
            Head-to-head compares
          </p>
          <ul className='grid gap-3 sm:grid-cols-2'>
            {compares.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className='block rounded-2xl border border-brand-900/10 bg-white/70 p-4 transition hover:border-brand-700/20 hover:shadow-sm'
                >
                  <span className='font-semibold text-brand-800'>{link.label}</span>
                  {link.note ? (
                    <span className='mt-2 block text-xs leading-relaxed text-muted line-clamp-2'>
                      {link.note}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {seoEntry ? (
        <p className='text-sm text-muted'>
          <Link href={seoEntry.href} className='font-semibold text-brand-800 hover:underline'>
            {seoEntry.label}
          </Link>
          {seoEntry.note ? ` — ${seoEntry.note}` : null}
        </p>
      ) : null}

      <p className='text-xs text-muted'>
        <Link href='/safety-checker' className='font-semibold text-brand-800 hover:underline'>
          Run the safety interaction checker
        </Link>{' '}
        before stacking multiple products for {goalSlug} support.
      </p>
    </section>
  )
}