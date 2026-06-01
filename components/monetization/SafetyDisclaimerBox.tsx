type SafetyDisclaimerBoxProps = {
  compact?: boolean
  className?: string
}

export function SafetyDisclaimerBox({
  compact = false,
  className = '',
}: SafetyDisclaimerBoxProps) {
  return (
    <section className={`rounded-[1.25rem] border border-amber-900/15 bg-amber-50/70 p-5 text-amber-950 ${className}`}>
      <p className='text-sm font-semibold'>Supplement safety note</p>
      <p className={`${compact ? 'mt-1 text-xs leading-6' : 'mt-2 text-sm leading-7'}`}>
        Speak with a qualified clinician before using supplements, especially if you are pregnant, nursing, taking medication, or managing a health condition. This site is educational and does not provide diagnosis, treatment, or personal medical advice.
      </p>
    </section>
  )
}
