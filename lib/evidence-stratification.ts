type EvidenceStratum = {
  label: string
  description: string
  tone: 'strong' | 'moderate' | 'caution' | 'neutral'
}

function asText(value: any) {
  return String(value || '').trim()
}

function hasPattern(value: any, pattern: RegExp) {
  return pattern.test(asText(value))
}

export function getEvidenceStrata(record: any): EvidenceStratum[] {
  const evidence = asText(record?.evidence_tier || record?.evidenceTier || record?.confidence)
  const summary = asText(record?.summary || record?.description)
  const safety = asText(record?.safety?.notes || record?.safety || record?.interactions || record?.cautionSignals)
  const traditionalUse = asText(record?.traditional_use || record?.traditionalUse || record?.history)

  const strata: EvidenceStratum[] = []

  if (hasPattern(`${evidence} ${summary}`, /human|clinical|trial|meta|systematic|moderate|strong/i)) {
    strata.push({
      label: 'Human Evidence',
      description: 'Includes human-facing or clinically oriented research signals where available.',
      tone: 'strong',
    })
  }

  if (hasPattern(`${evidence} ${summary}`, /mechan|pathway|in vitro|cell|animal|preclinical/i)) {
    strata.push({
      label: 'Mechanistic Evidence',
      description: 'Mechanism-level findings help explain plausibility but should not be read as direct clinical proof.',
      tone: 'moderate',
    })
  }

  if (hasPattern(`${evidence} ${summary}`, /limited|emerging|preliminary|mixed|unclear|low/i)) {
    strata.push({
      label: 'Preliminary Findings',
      description: 'Evidence appears early, mixed, indirect, or not yet mature enough for stronger conclusions.',
      tone: 'neutral',
    })
  }

  if (hasPattern(traditionalUse, /traditional|ayurveda|tcm|folk|ethnobotanical|historical/i)) {
    strata.push({
      label: 'Traditional Use Context',
      description: 'Traditional-use context is separated from modern clinical evidence.',
      tone: 'neutral',
    })
  }

  if (hasPattern(safety, /caution|interaction|avoid|contra|pregnan|liver|bleed|anticoagul|warning/i)) {
    strata.push({
      label: 'Safety Considerations',
      description: 'Safety signals, cautions, or interaction context should be reviewed before practical use.',
      tone: 'caution',
    })
  }

  if (strata.length === 0) {
    strata.push({
      label: 'Evidence-Limited',
      description: 'This profile currently has limited structured evidence context available.',
      tone: 'neutral',
    })
  }

  return strata.slice(0, 5)
}

export function getEvidenceDisciplineSummary(strata: EvidenceStratum[]) {
  const labels = strata.map(item => item.label)

  if (labels.includes('Human Evidence') && labels.includes('Safety Considerations')) {
    return 'Evidence and safety are presented separately so stronger research signals do not obscure caution context.'
  }

  if (labels.includes('Mechanistic Evidence') && !labels.includes('Human Evidence')) {
    return 'This profile emphasizes mechanistic plausibility while avoiding stronger clinical claims where human evidence is limited.'
  }

  if (labels.includes('Preliminary Findings')) {
    return 'Findings are framed conservatively because the available evidence appears emerging, mixed, or incomplete.'
  }

  return 'Evidence is separated by type so users can distinguish clinical, mechanistic, traditional, preliminary, and safety context.'
}
