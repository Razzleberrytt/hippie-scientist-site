/**
 * One-line safety summary for the top of a monograph (THS-005, THS-008).
 *
 * Herb profiles carried this inline in their hero. Compound profiles had no
 * safety line at all above the fold — the first mention sat roughly 200 lines
 * further down the template — so the same ingredient class was presented with
 * two different safety hierarchies depending on which route a reader landed on.
 *
 * Owning it here keeps that hierarchy identical on both, and keeps the rule
 * that decides "how much safety text belongs above the fold" in one place
 * rather than in each page's local copy.
 *
 * This is a summary, never a verdict: it always links to the full safety
 * section rather than implying the one sentence is the whole picture.
 */

type ProfileSafetyLineProps = {
  /** Short classification, e.g. "Standard caution" or "Higher caution". */
  tone: string
  /** Full safety summary; only its first sentence is shown. */
  summary: string
  /** Anchor for the full safety section on the same page. */
  href?: string
}

/**
 * The neutral tone. Anything else is treated as elevated and rendered in amber,
 * so an unrecognised or newly added tone fails toward more caution rather than
 * less — an unknown safety state must never look like a clean one.
 */
const NEUTRAL_TONE = 'Standard caution'

function firstSentence(value: string): string {
  const sentences = value.match(/[^.!?]+[.!?]+|[^.!?]+$/g)
  return sentences?.[0]?.trim() ?? value.trim()
}

export default function ProfileSafetyLine({ tone, summary, href = '#safety' }: ProfileSafetyLineProps) {
  const text = firstSentence(summary ?? '')
  // With no safety text there is nothing honest to say in one line, and an
  // empty chip would read as reassurance.
  if (!text) return null

  const neutral = tone === NEUTRAL_TONE

  /* A left rule rather than a filled pill: tone still reads at a glance, but the
     hero keeps one surface instead of stacking a coloured panel inside it. */
  return (
    <div
      className={`border-l-[3px] py-0.5 pl-3 ${
        neutral ? 'border-emerald-700/60 dark:border-emerald-300/50' : 'border-amber-600/70 dark:border-amber-300/60'
      }`}
    >
      <p className="text-sm leading-6 text-muted">
        <span
          className={`font-semibold ${
            neutral ? 'text-emerald-800 dark:text-emerald-200' : 'text-amber-800 dark:text-amber-200'
          }`}
        >
          {tone}
        </span>{' '}
        — {text}{' '}
        <a href={href} className="font-semibold text-[color:var(--tone-ink)] underline-offset-4 hover:underline">
          Details
        </a>
      </p>
    </div>
  )
}
