/**
 * Substances the runtime deliberately does not publish.
 *
 * Controlled substances and DEA schedule-I material are parsed from the
 * workbook but withheld from `public/data`, so 25 workbook rows legitimately
 * never reach runtime. The workbook/runtime parity gate needs the same list to
 * tell a withheld row apart from one that was silently dropped — duplicating
 * it there would let the two copies drift, and parity would start reporting the
 * difference between two copies of a policy rather than a real gap.
 */

export const RESTRICTED_RUNTIME_TERMS = [
  '5-meo-dmt',
  '5 meo dmt',
  '7-hydroxymitragynine',
  '7 hydroxymitragynine',
  '7-oh-mitragynine',
  '7 oh mitragynine',
  '7-oh',
  'amanita muscaria',
  'anabasine',
  'anatabine',
  'dmt',
  'hawaiian baby woodrose',
  'harmaline',
  'harmine',
  'ibogaine',
  'ketamine',
  'kratom',
  'lobeline',
  'lsa',
  'mescaline',
  'mitragynine',
  'morning glory',
  'nicotiana glauca',
  'nicotiana tabacum',
  'noopept',
  'psilocybin',
  'salvinorin',
  'sinicuichi',
  'tetrahydroharmine',
  'thc',
  'thcv',
]
