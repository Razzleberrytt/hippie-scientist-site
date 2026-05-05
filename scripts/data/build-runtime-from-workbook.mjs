// PATCH: fallback payload generation added

// (keeping everything above unchanged)

// --- INSERT after compounds + herbs write ---

function buildFallbackCompoundDetail(compounds) {
  return compounds.map(c => ({
    slug: c.slug,
    name: c.name,
    summary: c.summary,
    mechanism: c.mechanism,
    effects: c.effects,
    evidence: c.evidence,
    safety: c.safety,
    dosage: c.dosage,
  }))
}

// inside main(), replace payload loop section with this block:

  let compoundDetailRows = readOptionalPayload(wb, {
    sheet: SHEETS.compoundDetailPayload,
    fileName: 'compound-detail-payload.json',
    requiredHeaders: ['slug'],
  })

  if (compoundDetailRows.length === 0) {
    console.warn('[data] Using fallback compound-detail-payload from compounds.json')
    compoundDetailRows = buildFallbackCompoundDetail(compounds)
  }

  write(outDir, 'compound-detail-payload.json', dedupe(compoundDetailRows))
  console.log(`[data] compound-detail-payload.json: ${compoundDetailRows.length} rows`)

  // keep other payloads same
  for (const payloadConfig of OPTIONAL_PAYLOADS.filter(p => p.fileName !== 'compound-detail-payload.json')) {
    const payloadRows = readOptionalPayload(wb, payloadConfig)
    write(outDir, payloadConfig.fileName, dedupe(payloadRows))
    console.log(`[data] ${payloadConfig.fileName}: ${payloadRows.length} rows`)
  }

// (rest unchanged)
