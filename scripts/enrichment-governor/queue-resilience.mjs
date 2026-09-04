const uniqueByKey = rows => {
  const seen = new Map()
  for (const row of rows || []) {
    if (!row?.key) continue
    seen.set(row.key, row)
  }
  return [...seen.values()]
}

function releaseAtFor(record, config) {
  const lastFailureAt = Date.parse(record?.lastFailureAt || '')
  if (!Number.isFinite(lastFailureAt)) return null
  return lastFailureAt + Number(config?.cooldownHours || 0) * 3_600_000
}

export function evaluateQuarantine(record = {}, config = {}, now = Date.now()) {
  const failureThreshold = Math.max(1, Number(config.failureThreshold || 1))
  const failures = Math.max(0, Number(record.consecutiveFailures || 0))

  if (failures < failureThreshold) {
    return {
      quarantined: false,
      reason: 'below_failure_threshold',
      reviewEligible: false,
      releaseAt: null,
    }
  }

  const releaseAtMs = releaseAtFor(record, config)
  const releaseAt = Number.isFinite(releaseAtMs) ? new Date(releaseAtMs).toISOString() : null
  const cooldownElapsed = releaseAtMs === null || now >= releaseAtMs

  // Reaching the failure threshold is a durable state transition. A cooldown
  // ending only makes the case eligible for review; it never silently turns
  // the failed work item executable again.
  return {
    quarantined: true,
    reason: cooldownElapsed ? 'material_change_review_required' : 'cooldown_active',
    reviewEligible: cooldownElapsed,
    releaseAt,
  }
}

export function refreshQuarantineState(quarantine = {}, config = {}, now = Date.now()) {
  const cases = (quarantine.cases || []).map(record => {
    const decision = evaluateQuarantine(record, config, now)
    return {
      ...record,
      quarantined: decision.quarantined,
      quarantineReason: decision.reason,
      reviewEligible: decision.reviewEligible,
      releaseAt: decision.releaseAt || record.releaseAt || null,
      releaseRequiresMaterialChange: config.releaseRequiresMaterialChange !== false,
    }
  }).sort((a, b) => String(a.key || '').localeCompare(String(b.key || '')))

  return {
    ...quarantine,
    version: quarantine.version || 1,
    cases,
  }
}

export function quarantineCaseForKey(quarantine = {}, key, config = {}, now = Date.now()) {
  if (!key) return null
  const record = (quarantine.cases || []).find(row => row.key === key)
  if (!record) return null
  const decision = evaluateQuarantine(record, config, now)
  return decision.quarantined ? { ...record, ...decision } : null
}

function quarantineBlock(record, now) {
  return {
    key: record.key,
    reason: 'quarantined',
    blockedAt: record.blockedAt || new Date(now).toISOString(),
    releaseAt: record.releaseAt || null,
    reviewEligible: Boolean(record.reviewEligible),
    consecutiveFailures: Number(record.consecutiveFailures || 0),
    lastRootCause: record.lastRootCause || null,
  }
}

export function reconcileQueueWithQuarantine(queue = {}, quarantine = {}, config = {}, now = Date.now()) {
  const refreshed = refreshQuarantineState(quarantine, config, now)
  const activeCases = new Map(
    refreshed.cases
      .filter(record => record.quarantined)
      .map(record => [record.key, record])
  )

  const queued = (queue.queued || []).filter(row => !activeCases.has(row.key))
  const batched = (queue.batched || []).filter(row => !activeCases.has(row.key))
  const activeLeases = (queue.leases || []).filter(lease => {
    const expiresAt = Date.parse(lease.expiresAt || '')
    return Number.isFinite(expiresAt) && expiresAt > now
  })

  const existingNonQuarantineBlocks = (queue.blocked || []).filter(row => row.reason !== 'quarantined')
  const quarantineBlocks = [...activeCases.values()].map(record => quarantineBlock(record, now))
  const blocked = uniqueByKey([...existingNonQuarantineBlocks, ...quarantineBlocks])
    .sort((a, b) => String(a.key || '').localeCompare(String(b.key || '')))

  return {
    queue: {
      ...queue,
      leases: activeLeases,
      queued,
      batched,
      blocked,
    },
    quarantine: refreshed,
    metrics: {
      prunedExpiredLeases: Math.max(0, (queue.leases || []).length - activeLeases.length),
      quarantinedQueuedItems: Math.max(0, (queue.queued || []).length - queued.length),
      quarantinedBatchedItems: Math.max(0, (queue.batched || []).length - batched.length),
      activeQuarantineCases: activeCases.size,
    },
  }
}

export function releaseQuarantineRecord(record = {}, {
  config = {},
  materialChange,
  now = Date.now(),
} = {}) {
  if (!record?.key) return { ok: false, code: 'missing_case', reason: 'quarantine case is missing a key' }

  const decision = evaluateQuarantine(record, config, now)
  if (!decision.quarantined) {
    return {
      ok: true,
      released: false,
      reason: 'not_quarantined',
      record,
    }
  }

  if (!decision.reviewEligible) {
    return {
      ok: false,
      code: 'cooldown_active',
      reason: `quarantine cooldown remains active until ${decision.releaseAt || 'review time'}`,
      releaseAt: decision.releaseAt,
    }
  }

  const normalizedMaterialChange = String(materialChange || '').trim()
  if (config.releaseRequiresMaterialChange !== false && !normalizedMaterialChange) {
    return {
      ok: false,
      code: 'material_change_required',
      reason: 'quarantine release requires a documented material change',
    }
  }

  const releasedAt = new Date(now).toISOString()
  return {
    ok: true,
    released: true,
    record: {
      ...record,
      consecutiveFailures: 0,
      quarantined: false,
      quarantineReason: 'released_after_material_change',
      reviewEligible: false,
      releasedAt,
      releaseMaterialChange: normalizedMaterialChange || null,
      releaseRequiresMaterialChange: config.releaseRequiresMaterialChange !== false,
    },
  }
}
