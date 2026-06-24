export function chipClassFor(tag: string) {
  const t = (tag || '').toLowerCase()
  const base = 'pill bg-white/10 text-white/80'
  if (/(psychedelic|entheogen|hallucin|vision)/.test(t))
    return `${base} bg-fuchsia-500/15 text-fuchsia-200`
  if (/(adaptogen|tonic)/.test(t)) return `${base} bg-emerald-500/15 text-emerald-200`
  if (/(stimulant|energ)/.test(t)) return `${base} bg-amber-500/15 text-amber-200`
  if (/(sedative|anxiolytic|calm)/.test(t)) return `${base} bg-blue-500/15 text-blue-200`
  if (/(dream|oneiro|lucid)/.test(t)) return `${base} bg-sky-500/15 text-sky-200`
  if (/(visionary|shamanic|ritual)/.test(t)) return `${base} bg-indigo-500/15 text-indigo-200`
  if (/(toxic|caution|restricted|poison)/.test(t)) return `${base} bg-rose-500/15 text-rose-200`
  return base
}

const SCIENTIFIC_TAG_ALIASES: Record<string, string> = {
  calming: 'calming',
  calm: 'calming',
  sedative: 'calming',
  anxiolytic: 'calming',
  stimulating: 'stimulating',
  stimulant: 'stimulating',
  energizing: 'stimulating',
  adaptogen: 'adaptogen',
  serotonergic: 'serotonergic',
  serotonin: 'serotonergic',
  dopaminergic: 'dopaminergic',
  dopamine: 'dopaminergic',
}

export function normalizeScientificTags(tags: string[] = []): string[] {
  const seen = new Set<string>()
  const normalized: string[] = []

  tags.forEach(tag => {
    const cleaned = (tag || '')
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
    if (!cleaned) return
    const canonical = SCIENTIFIC_TAG_ALIASES[cleaned] || cleaned
    if (!seen.has(canonical)) {
      seen.add(canonical)
      normalized.push(canonical)
    }
  })

  return normalized
}
