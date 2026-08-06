import Link from 'next/link'
import { AtlasComparisonCallout } from '@/components/guides/AtlasComparisonCallout'

export type IntentRoute = {
  /** The user's situation, phrased as they'd recognize it ("Racing thoughts at bedtime"). */
  problem: string
  /** One-line editorial reason this route fits — the "why". Optional but recommended. */
  why?: string
  /** The destination page's short label ("L-Theanine for Sleep"). */
  cta: string
  /** Destination href. Must be a real, existing route. */
  href: string
}

type AtlasCalloutConfig = {
  title: string
  description: string
  href: string
  cta: string
  secondaryHref: string
  secondaryCta: string
}

function getAtlasCallout(items: IntentRoute[]): AtlasCalloutConfig | null {
  const isAnxietyHub = items.some((item) => item.href.startsWith('/guides/anxiety/'))
  if (isAnxietyHub) {
    return {
      title: 'Compare calming botanicals side by side',
      description:
        'Move beyond a flat recommendation list. Compare calming botanicals by evidence strength, noticeability, active chemistry, and safety context.',
      href: '/tools/botanical-activity-atlas/calming-botanicals/?effect=Calming&sort=evidence',
      cta: 'Compare calming botanicals',
      secondaryHref: '/tools/botanical-activity-atlas/',
      secondaryCta: 'Open the full atlas',
    }
  }

  const isSleepHub = items.some((item) => item.href.startsWith('/guides/sleep/'))
  if (isSleepHub) {
    return {
      title: 'Compare sleep-oriented botanicals by evidence',
      description:
        'See which botanicals carry explicit sedating or sleep-related effects, how noticeable they may be, and which safety signals deserve attention before stacking.',
      href: '/tools/botanical-activity-atlas/calming-botanicals/?effect=Sedating%20%2F%20sleep&sort=evidence',
      cta: 'Compare sleep botanicals',
      secondaryHref: '/tools/botanical-activity-atlas/',
      secondaryCta: 'Open the full atlas',
    }
  }

  const isFocusHub = items.some((item) => item.href.startsWith('/guides/focus/'))
  if (isFocusHub) {
    return {
      title: 'Compare cognition and focus botanicals',
      description:
        'Compare focus-oriented botanicals by evidence strength, active chemistry, noticeability, and pathway-derived versus explicit effects.',
      href: '/tools/botanical-activity-atlas/?effect=Cognition%20%2F%20focus&sort=evidence',
      cta: 'Compare focus botanicals',
      secondaryHref: '/tools/botanical-activity-atlas/',
      secondaryCta: 'Open the full atlas',
    }
  }

  return null
}

/**
 * DecisionRouter — the signature "field guide" routing module for hub pages.
 *
 * Instead of a flat directory of cards, it asks the reader to identify their
 * situation and routes each one to the single most relevant page. This is the
 * core of the decision-first hub standard: a hub should behave like an editor,
 * not a file cabinet.
 *
 * Reuse: give it an array of {problem, why, cta, href}. Intended for the
 * "Start here / what's your problem?" section of every goal hub (sleep,
 * anxiety, stress, focus). Keep routes pointed at real pages — each card is a
 * promise that the destination answers that specific problem.
 */
export function DecisionRouter({ items }: { items: IntentRoute[] }) {
  const atlasCallout = getAtlasCallout(items)

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <Link
            key={item.href + item.problem}
            href={item.href}
            className="group flex h-full flex-col rounded-2xl border border-brand-900/10 bg-white p-5 shadow-[0_1px_2px_rgba(13,23,18,0.06)] transition-all hover:-translate-y-0.5 hover:border-brand-700/30 hover:shadow-md dark:border-white/10 dark:bg-[var(--surface-card)]"
          >
            <span className="text-[0.7rem] font-bold uppercase tracking-wider text-brand-700">
              If your problem is
            </span>
            <span className="mt-1 text-base font-bold leading-snug text-ink">{item.problem}</span>
            {item.why ? <span className="mt-2 text-sm leading-6 text-muted">{item.why}</span> : null}
            <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-bold text-brand-800 transition group-hover:gap-1.5 dark:text-[var(--text-primary)]">
              Start with {item.cta}
              <span aria-hidden="true">→</span>
            </span>
          </Link>
        ))}
      </div>

      {atlasCallout ? (
        <div className="mt-6">
          <AtlasComparisonCallout {...atlasCallout} />
        </div>
      ) : null}
    </>
  )
}

export default DecisionRouter
