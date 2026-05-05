export function runValidationAgent(rows) {
  const approved = []
  const rejection_reasons = []

  for (const row of rows) {
    if (!row?.compound_slug || !row?.study_type || !row?.population) {
      rejection_reasons.push('missing_required_fields')
      continue
    }

    const source = String(row?.pmid_or_source || '')

    if (/^\d+$/.test(source) && source.length < 6) {
      rejection_reasons.push('invalid_pmid')
      continue
    }

    if (/mouse|mice|rat|murine/i.test(JSON.stringify(row))) {
      rejection_reasons.push('animal_only_evidence')
      continue
    }

    approved.push(row)
  }

  return {
    validation_status: approved.length ? 'approved' : 'rejected',
    rejection_reasons,
    approved_rows: approved,
  }
}
