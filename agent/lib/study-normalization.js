export function normalizeStudyRow(row = {}) {
  return {
    compound_slug: row.compound_slug || row.slug || '',
    study_type: String(row.study_type || 'unknown').toLowerCase(),
    effect_direction: row.effect_direction || '',
    sample_size: Number(row.sample_size || 0),
    duration: row.duration || '',
    dose: row.dose || '',
    pmid_or_source: row.pmid_or_source || '',
  }
}

export function normalizeStudyBatch(rows = []) {
  return rows.map(normalizeStudyRow)
}
