export function sourceAuthority(source = '') {
  const value = String(source).toLowerCase()

  if (value.includes('pubmed')) return 1
  if (value.includes('nih')) return 0.95
  if (value.includes('ods')) return 0.9
  if (value.includes('ema')) return 0.9
  if (value.includes('clinicaltrials')) return 0.85
  if (value.includes('pubchem')) return 0.8

  return 0.5
}
