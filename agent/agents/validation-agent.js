const INVALID_TERMS = [
  'mouse',
  'mice',
  'murine',
  'rat',
  'rodent',
  'in vitro',
]

export function runValidationAgent(rows = []) {
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

    const blob = JSON.stringify(row).toLowerCase()

    if (INVALID_TERMS.some(term => blob.includes(term))) {
      rejection_reasons.push('non_human_or_preclinical_evidence')
      continue
    }

    if (/cure|proven|guaranteed|miracle/i.test(blob)) {
      rejection_reasons.push('overconfident_language')
      continue
    }

    approved.push(row)
  }

  return {
    validation_status: approved.length ? 'approved' : 'rejected',
    rejection_reasons: [...new Set(rejection_reasons)],
    approved_rows: approved,
  }
}
