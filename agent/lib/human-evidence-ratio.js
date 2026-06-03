export function humanEvidenceRatio(rows = []) {
  if (!rows.length) {
    return {
      human_ratio: 0,
      human_count: 0,
      non_human_count: 0,
    }
  }

  const human = rows.filter(row => {
    const type = String(row.study_type || '').toLowerCase()

    return (
      type.includes('rct') ||
      type.includes('clinical') ||
      type.includes('meta') ||
      type.includes('systematic')
    )
  }).length

  const nonHuman = rows.length - human

  return {
    human_ratio: Number((human / rows.length).toFixed(2)),
    human_count: human,
    non_human_count: nonHuman,
  }
}
