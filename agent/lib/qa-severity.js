export function severityLevel(issue = '') {
  const value = String(issue).toLowerCase()

  if (
    value.includes('corrupt') ||
    value.includes('malformed') ||
    value.includes('missing_sources')
  ) {
    return 'critical'
  }

  if (
    value.includes('duplicate') ||
    value.includes('conflict') ||
    value.includes('low_confidence')
  ) {
    return 'warning'
  }

  return 'info'
}
