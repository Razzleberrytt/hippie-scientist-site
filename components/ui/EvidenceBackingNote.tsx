/**
 * Discloses, at the point of the claim, when a profile's evidence grade is not
 * demonstrated by the studies actually recorded on that profile.
 *
 * The grade is editorial and can legitimately reflect literature wider than the
 * citation set we happen to have recorded — semaglutide is genuinely Grade A
 * whether or not this repository has stored a single trial for it. So the fix
 * is not to overwrite the grade with something lower; that would replace a
 * correct judgement with an incorrect one.
 *
 * The problem is silence. The hero quick-stat states an evidence strength as
 * settled fact, and the only place the backing gap was disclosed is the
 * collapsed "Study design details" block — which renders only when
 * `evidence_design_match` and `evidence_risk_of_bias` are both present. 141
 * records carry `evidence_grade_backed: false`; 112 of them lack those two
 * fields, so they asserted Grade A or B with no qualification anywhere on the
 * page (13 at A, 99 at B).
 *
 * This renders the gap next to the grade, uncollapsed, on both monograph
 * templates. A reader who sees "Moderate Human Evidence" can see in the same
 * glance that no human outcome study is recorded here to show it.
 */

/**
 * The backing gaps the evidence pipeline emits, mapped to what each one means
 * for a reader. Keep the wording about *our record*, not about the substance:
 * "none recorded here" is true and checkable; "no evidence exists" would not be.
 */
const GAP_TEXT: Record<string, string> = {
  'no-claims-recorded': 'No studies are recorded on this profile yet.',
  'no-human-study-recorded': 'No human outcome study is recorded on this profile yet.',
  'single-human-study-for-grade-a': 'Only one human study is recorded on this profile.',
}

/**
 * Fallback for a gap reason added upstream that this component has not been
 * taught yet. Saying less but staying accurate beats rendering nothing: an
 * unrecognised gap is still a gap, and silence is the failure mode being fixed.
 */
const UNKNOWN_GAP_TEXT = 'The recorded studies on this profile do not demonstrate this grade.'

type EvidenceBackingNoteProps = {
  /**
   * `evidence_grade_backed`. Only `false` produces output — `true` and
   * `undefined` are both "nothing to disclose", so callers can pass the field
   * straight through without guarding.
   */
  backed?: boolean | null
  /** `evidence_grade_backing_gap`, e.g. `no-human-study-recorded`. */
  gap?: string | null
  /** Anchor to the evidence section, so the note leads somewhere. */
  href?: string
}

export default function EvidenceBackingNote({
  backed,
  gap,
  href = '#evidence',
}: EvidenceBackingNoteProps) {
  // Absent data is not a gap. Only an explicit `false` is a statement that the
  // pipeline checked the grade against the record and found it unsupported.
  if (backed !== false) return null

  const text = (gap && GAP_TEXT[gap]) || UNKNOWN_GAP_TEXT

  return (
    <p className="mt-1 text-[11px] leading-snug text-muted">
      <a
        href={href}
        className="underline decoration-dotted underline-offset-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40 focus-visible:rounded"
      >
        {text}
      </a>
    </p>
  )
}
