const STATUS = {
  publish: 'PUBLISH',
  noindex: 'NOINDEX',
  needsReview: 'NEEDS_REVIEW',
  blocked: 'BLOCKED',
}

const PUBLISH_DECISIONS = new Set([
  'full_public_runtime',
  'primary_runtime_priority',
  'publish',
  'publishable',
  'ready',
  'limited',
])

const NOINDEX_DECISIONS = new Set([
  'hidden_until_grounded',
  'research_archive_runtime',
])

const BLOCKED_DECISIONS = new Set([
  'hide',
  'hidden',
  'blocked',
  'block',
  'alias_redirect_only',
])

function text(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function lower(value) {
  return text(value).toLowerCase()
}

function list(value) {
  if (Array.isArray(value)) return value.flatMap(list)
  return text(value)
    .split(/[\n|;,]+/)
    .map(item => text(item))
    .filter(Boolean)
}

function hasStableSlug(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(text(value))
}

function hasMeaningfulText(value, minLength) {
  return text(value).length >= minLength
}

function hasAnyListValue(...values) {
  return values.some(value => list(value).length > 0)
}

function addScore(state, points, reason) {
  state.score += points
  state.reasons.push(reason)
}

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)))
}

function finish(status, score, reasons) {
  const publish = status === STATUS.publish

  return {
    status,
    score: clampScore(score),
    robots: publish ? 'index,follow' : 'noindex,follow',
    sitemap_included: publish,
    reasons: [...new Set(reasons)].sort((a, b) => a.localeCompare(b)),
  }
}

export function scoreIndexability(record, context = {}) {
  const state = {
    score: 0,
    reasons: [],
  }

  const entityType = lower(context.type || context.entityType || record?.entityType)
  const slug = text(record?.slug)
  const name = text(record?.name)
  const decision = lower(record?.runtime_export_decision)
  const profileStatus = lower(record?.profile_status)
  const summaryQuality = lower(record?.summary_quality)
  const evidence = lower(record?.evidence_tier || record?.evidenceTier || record?.evidence_grade)
  const robots = lower(record?.robots)
  const effects = list(record?.primary_effects || record?.effects)

  if (!slug || !hasStableSlug(slug)) {
    return finish(STATUS.blocked, 0, ['invalid-slug'])
  }

  if (!name || name.length <= 1) {
    return finish(STATUS.blocked, 0, ['invalid-name'])
  }

  if (BLOCKED_DECISIONS.has(decision) || robots === 'noindex,nofollow') {
    return finish(STATUS.blocked, 0, [`blocked-decision:${decision || 'robots'}`])
  }

  if (NOINDEX_DECISIONS.has(decision)) {
    return finish(STATUS.noindex, 0, [`noindex-decision:${decision}`])
  }

  addScore(state, 15, 'identity-present')

  if (hasMeaningfulText(record?.summary || record?.description || record?.short_description, 80)) {
    addScore(state, 20, 'summary-depth')
  } else if (hasMeaningfulText(record?.summary || record?.description || record?.short_description, 40)) {
    addScore(state, 10, 'summary-present')
  } else {
    state.reasons.push('summary-too-thin')
  }

  if (effects.length >= 2) {
    addScore(state, 10, 'effect-coverage')
  } else if (effects.length === 1) {
    addScore(state, 5, 'effect-present')
  } else {
    state.reasons.push('effects-missing')
  }

  if (hasAnyListValue(record?.mechanisms, record?.mechanism, record?.mechanism_targets, record?.pathways)) {
    addScore(state, 10, 'mechanism-context')
  } else {
    state.reasons.push('mechanism-missing')
  }

  if (hasMeaningfulText(record?.safety || record?.safety_notes || record?.safetySummary, 20) || hasAnyListValue(record?.contraindications, record?.interactions, record?.side_effects)) {
    addScore(state, 10, 'safety-context')
  } else {
    state.reasons.push('safety-context-missing')
  }

  if (/^(complete|near_complete|top50_authority_patched|commercial_ready)$/i.test(profileStatus)) {
    addScore(state, 20, `profile-status:${profileStatus}`)
  } else if (/^(partial|moderate)$/i.test(profileStatus)) {
    addScore(state, 8, `profile-status:${profileStatus}`)
  } else if (profileStatus) {
    state.reasons.push(`profile-status:${profileStatus}`)
  } else {
    state.reasons.push('profile-status-missing')
  }

  if (/^(strong|moderate|medium)$/i.test(summaryQuality)) {
    addScore(state, 15, `summary-quality:${summaryQuality}`)
  } else if (summaryQuality) {
    state.reasons.push(`summary-quality:${summaryQuality}`)
  } else {
    state.reasons.push('summary-quality-missing')
  }

  if (evidence && !/^(insufficient|none|avoid)$/i.test(evidence)) {
    addScore(state, 10, 'evidence-signal')
  } else {
    state.reasons.push('evidence-signal-missing')
  }

  if (PUBLISH_DECISIONS.has(decision) || decision === 'limited') {
    addScore(state, 10, `export-decision:${decision}`)
  } else if (decision) {
    state.reasons.push(`export-decision:${decision}`)
  } else {
    state.reasons.push('export-decision-missing')
  }

  if (hasAnyListValue(record?.topic_clusters, record?.ecosystem_tags, record?.related_topics, record?.semantic_neighbors)) {
    addScore(state, 5, 'semantic-connectivity')
  }

  if (/research[-\s]?pending/i.test(effects.join(' '))) {
    state.score = Math.min(state.score, 45)
    state.reasons.push('research-pending-effect')
  }

  if (/^(weak|minimal|thin|stub|research_needed|none)$/i.test(summaryQuality)) {
    state.score = Math.min(state.score, 60)
    state.reasons.push('weak-summary-quality')
  }

  if (/^(minimal|research_only)$/i.test(profileStatus)) {
    state.score = Math.min(state.score, entityType === 'compound' ? 50 : 45)
    state.reasons.push('non-publishable-profile-status')
  }

  const finalScore = clampScore(state.score)

  if (finalScore >= 75) {
    return finish(STATUS.publish, finalScore, state.reasons)
  }

  if (finalScore >= 45) {
    return finish(STATUS.needsReview, finalScore, state.reasons)
  }

  return finish(STATUS.noindex, finalScore, state.reasons)
}
