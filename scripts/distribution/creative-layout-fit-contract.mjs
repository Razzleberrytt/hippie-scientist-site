const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')

export const CREATIVE_LAYOUT_PROFILES = Object.freeze({
  'vertical-video': Object.freeze({ width: 1080, height: 1920, safeTop: 220, safeBottom: 320, safeSide: 96, minBodyPx: 44, charsPerLine: 34, maxLinesPerPanel: 6, maxPanels: 6 }),
  'portrait-carousel': Object.freeze({ width: 1080, height: 1350, safeTop: 120, safeBottom: 160, safeSide: 80, minBodyPx: 42, charsPerLine: 38, maxLinesPerPanel: 7, maxPanels: 8 }),
  'square-social': Object.freeze({ width: 1080, height: 1080, safeTop: 96, safeBottom: 120, safeSide: 80, minBodyPx: 42, charsPerLine: 34, maxLinesPerPanel: 6, maxPanels: 6 }),
  pinterest: Object.freeze({ width: 1000, height: 1500, safeTop: 120, safeBottom: 160, safeSide: 72, minBodyPx: 42, charsPerLine: 36, maxLinesPerPanel: 8, maxPanels: 8 }),
})

const RESERVED_ROLES = new Set(['source', 'disclosure'])

function countWrappedLines(text, charsPerLine) {
  const words = clean(text).split(' ').filter(Boolean)
  if (!words.length) return 0
  let lines = 1
  let current = 0
  for (const word of words) {
    const length = word.length
    if (length > charsPerLine) {
      if (current > 0) lines += 1
      lines += Math.ceil(length / charsPerLine) - 1
      current = length % charsPerLine || charsPerLine
      continue
    }
    const next = current === 0 ? length : current + 1 + length
    if (next <= charsPerLine) current = next
    else {
      lines += 1
      current = length
    }
  }
  return lines
}

function normalizeBlocks(blocks) {
  if (!Array.isArray(blocks)) throw new Error('blocks must be an array')
  return blocks.map((block, index) => {
    const role = clean(block?.role)
    const text = clean(block?.text)
    if (!role) throw new Error(`blocks[${index}].role is required`)
    if (!text) throw new Error(`blocks[${index}].text is required`)
    return { role, text }
  })
}

export function measureCreativeLayoutFit({ profileId, blocks, minimumBodyPx } = {}) {
  const profile = CREATIVE_LAYOUT_PROFILES[clean(profileId)]
  if (!profile) throw new Error(`Unknown creative layout profile: ${profileId}`)
  const normalized = normalizeBlocks(blocks)
  const requestedMinimum = Number(minimumBodyPx ?? profile.minBodyPx)
  if (!Number.isFinite(requestedMinimum) || requestedMinimum < profile.minBodyPx) {
    throw new Error(`minimumBodyPx may not be smaller than ${profile.minBodyPx} for ${profileId}`)
  }

  const diagnostics = normalized.map((block) => {
    const lineCount = countWrappedLines(block.text, profile.charsPerLine)
    const panelCount = Math.max(1, Math.ceil(lineCount / profile.maxLinesPerPanel))
    return {
      role: block.role,
      text: block.text,
      lineCount,
      panelCount,
      action: panelCount > 1 ? 'paginate' : 'fit',
      rewriteAllowed: false,
      truncationAllowed: false,
      minimumBodyPx: requestedMinimum,
    }
  })

  const reserved = new Set(normalized.filter((block) => RESERVED_ROLES.has(block.role)).map((block) => block.role))
  const missingReservedRoles = [...RESERVED_ROLES].filter((role) => !reserved.has(role))
  const totalPanels = diagnostics.reduce((sum, item) => sum + item.panelCount, 0)
  const oversizedBlock = diagnostics.find((item) => item.panelCount > profile.maxPanels)

  let status = 'ready'
  const reasons = []
  if (missingReservedRoles.length) {
    status = 'blocked'
    reasons.push(`missing reserved trust roles: ${missingReservedRoles.join(', ')}`)
  }
  if (oversizedBlock) {
    status = 'blocked'
    reasons.push(`${oversizedBlock.role} exceeds maximum deterministic pagination capacity`)
  } else if (status !== 'blocked' && totalPanels > profile.maxPanels) {
    status = 'blocked'
    reasons.push(`total panels ${totalPanels} exceed profile maximum ${profile.maxPanels}`)
  } else if (status !== 'blocked' && diagnostics.some((item) => item.action === 'paginate')) {
    status = 'paginate'
  }

  return {
    version: 1,
    profileId: clean(profileId),
    status,
    reasons,
    geometry: {
      width: profile.width,
      height: profile.height,
      safeTop: profile.safeTop,
      safeBottom: profile.safeBottom,
      safeSide: profile.safeSide,
      minimumBodyPx: requestedMinimum,
      charsPerLine: profile.charsPerLine,
      maxLinesPerPanel: profile.maxLinesPerPanel,
      maxPanels: profile.maxPanels,
    },
    totalPanels,
    diagnostics,
    guardrails: {
      losslessGovernedCopyRequired: true,
      shrinkingBelowMinimumTypographyAllowed: false,
      clippingAllowed: false,
      truncationAllowed: false,
      paraphraseAllowed: false,
      sourceRegionReserved: true,
      disclosureRegionReserved: true,
    },
  }
}

export function validateCreativeLayoutFit(result) {
  const errors = []
  if (result?.version !== 1) errors.push('layout-fit version must be 1')
  if (!CREATIVE_LAYOUT_PROFILES[result?.profileId]) errors.push('layout-fit profile must be canonical')
  if (!['ready', 'paginate', 'blocked'].includes(result?.status)) errors.push('layout-fit status is invalid')
  if (result?.guardrails?.losslessGovernedCopyRequired !== true) errors.push('governed copy must remain lossless')
  if (result?.guardrails?.shrinkingBelowMinimumTypographyAllowed !== false) errors.push('minimum typography may not be reduced')
  if (result?.guardrails?.clippingAllowed !== false || result?.guardrails?.truncationAllowed !== false || result?.guardrails?.paraphraseAllowed !== false) errors.push('clipping, truncation, and paraphrase must remain prohibited')
  if (result?.guardrails?.sourceRegionReserved !== true || result?.guardrails?.disclosureRegionReserved !== true) errors.push('source and disclosure regions must remain reserved')
  for (const item of result?.diagnostics ?? []) {
    if (item?.rewriteAllowed !== false || item?.truncationAllowed !== false) errors.push(`${item?.role} may not rewrite or truncate governed copy`)
    if (!Number.isInteger(item?.lineCount) || item.lineCount < 1) errors.push(`${item?.role} must have a positive deterministic line count`)
    if (!Number.isInteger(item?.panelCount) || item.panelCount < 1) errors.push(`${item?.role} must have a positive deterministic panel count`)
  }
  return errors
}
