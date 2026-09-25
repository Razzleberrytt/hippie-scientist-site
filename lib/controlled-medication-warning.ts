export type ControlledMedicationWarning = {
  title: string
  body: string
  items: string[]
  suppressAffiliate: boolean
}

function flagEnabled(value: unknown) {
  if (value === true) return true
  const normalized = String(value ?? '').trim().toLowerCase()
  return normalized === 'true' || normalized === 'yes' || normalized === '1'
}

function clean(value: unknown) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

export function getControlledMedicationWarning(
  record: Record<string, unknown> | null | undefined,
): ControlledMedicationWarning | null {
  if (!record || !flagEnabled(record.controlled_substance)) return null

  const legalStatus = clean(record.legal_status)
  const statusSentence = legalStatus
    ? `${legalStatus.replace(/[.!?]+$/, '')}.`
    : 'This profile is flagged as a controlled substance in the canonical data.'

  return {
    title: 'Controlled medication safety warning',
    body:
      `${statusSentence} This research-only reference has not completed profile-level contraindication, interaction, or dosing review, so blank safety fields must not be interpreted as evidence of safety.`,
    items: [
      'Use only in lawful prescribing and dispensing contexts under qualified clinical supervision.',
      'Do not use this page to start, stop, change, share, source, or dose a controlled medication.',
      'Consult the current product-specific prescribing information for boxed warnings, contraindications, interactions, and monitoring requirements.',
    ],
    suppressAffiliate: true,
  }
}
