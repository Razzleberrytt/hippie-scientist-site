export type AtlasAnalyticsEvent = {
  type?: string
  context?: string
  item?: string
  slug?: string
}

export type AtlasSourcePerformanceRow = {
  source: string
  sessions: number
  profileOpens: number
  profileOpenRate: number
  averageFilterDepth: number
  topFirstFilter: string
}

export type AtlasRecoveryPerformanceRow = {
  action: string
  impressions: number
  acceptances: number
  acceptanceRate: number
  profileOpens: number
  postRecoveryProfileRate: number
  averageRestoredResults: number
}

export type RelatedBotanicalCardPerformanceRow = {
  sourceSlug: string
  targetSlug: string
  position: number
  impressions: number
  clicks: number
  ctr: number
  averageClickDepth: number
  deepExplorationRate: number
}

export type RelatedBotanicalReasonPerformanceRow = {
  reasonType: string
  impressions: number
  clicks: number
  ctr: number
  averageClickDepth: number
  deepExplorationRate: number
}

type SessionSummary = {
  source: string
  firstFilter: string
  distinctFilters: number
  profileOpened: boolean
}

type RecoverySessionSummary = {
  shown: Set<string>
  accepted: string | null
  restoredResults: number
  profileOpened: boolean
}

type RelatedExposure = {
  sessionId: string
  sourceSlug: string
  targetSlug: string
  position: number
  reasonTypes: string[]
}

type RelatedClick = RelatedExposure & {
  profileDepth: number
}

export function parseAtlasContext(context = '') {
  const values = new Map<string, string>()
  context.split(';').forEach((segment) => {
    const separator = segment.indexOf(':')
    if (separator < 1) return
    values.set(segment.slice(0, separator), segment.slice(separator + 1))
  })
  return values
}

export function buildAtlasSourcePerformance(events: AtlasAnalyticsEvent[]) {
  const atlasEvents = events.filter((event) => event.type?.startsWith('botanical_atlas_'))
  const sessions = new Map<string, SessionSummary>()
  let unattributedEvents = 0

  atlasEvents.forEach((event) => {
    const values = parseAtlasContext(event.context)
    const sessionId = values.get('session')
    if (!sessionId) {
      unattributedEvents += 1
      return
    }

    const current = sessions.get(sessionId) ?? {
      source: values.get('source') ?? 'direct_or_external',
      firstFilter: values.get('first_filter') ?? 'none',
      distinctFilters: 0,
      profileOpened: false,
    }

    current.source = values.get('source') ?? current.source
    if (current.firstFilter === 'none') current.firstFilter = values.get('first_filter') ?? 'none'
    current.distinctFilters = Math.max(current.distinctFilters, Number(values.get('distinct_filters') ?? 0) || 0)
    current.profileOpened = current.profileOpened
      || values.get('profile_opened') === 'yes'
      || event.type === 'botanical_atlas_profile_click'
    sessions.set(sessionId, current)
  })

  const grouped = new Map<string, SessionSummary[]>()
  sessions.forEach((session) => {
    const rows = grouped.get(session.source) ?? []
    rows.push(session)
    grouped.set(session.source, rows)
  })

  const rows: AtlasSourcePerformanceRow[] = Array.from(grouped.entries()).map(([source, sourceSessions]) => {
    const firstFilters = new Map<string, number>()
    sourceSessions.forEach((session) => {
      firstFilters.set(session.firstFilter, (firstFilters.get(session.firstFilter) ?? 0) + 1)
    })
    const topFirstFilter = Array.from(firstFilters.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] ?? 'none'
    const profileOpens = sourceSessions.filter((session) => session.profileOpened).length
    const averageFilterDepth = sourceSessions.reduce((sum, session) => sum + session.distinctFilters, 0) / sourceSessions.length

    return {
      source,
      sessions: sourceSessions.length,
      profileOpens,
      profileOpenRate: profileOpens / sourceSessions.length,
      averageFilterDepth,
      topFirstFilter,
    }
  }).sort((a, b) => b.profileOpenRate - a.profileOpenRate
    || b.averageFilterDepth - a.averageFilterDepth
    || b.sessions - a.sessions
    || a.source.localeCompare(b.source))

  return { rows, attributedSessions: sessions.size, unattributedEvents }
}

function parseShownSuggestions(item = '') {
  return item.split(',').map((entry) => entry.split(':')[0]).filter(Boolean)
}

export function buildAtlasRecoveryPerformance(events: AtlasAnalyticsEvent[]) {
  const sessions = new Map<string, RecoverySessionSummary>()
  let unattributedEvents = 0

  events.filter((event) => event.type?.startsWith('botanical_atlas_')).forEach((event) => {
    const values = parseAtlasContext(event.context)
    const sessionId = values.get('session')
    if (!sessionId) {
      if (event.type === 'botanical_atlas_recovery_shown' || event.type === 'botanical_atlas_recovery_accepted') unattributedEvents += 1
      return
    }

    const current = sessions.get(sessionId) ?? {
      shown: new Set<string>(),
      accepted: null,
      restoredResults: 0,
      profileOpened: false,
    }

    if (event.type === 'botanical_atlas_recovery_shown') {
      parseShownSuggestions(event.item).forEach((action) => current.shown.add(action))
    }
    if (event.type === 'botanical_atlas_recovery_accepted') {
      current.accepted = event.item || values.get('recovery') || null
      current.restoredResults = Number(values.get('restored') ?? 0) || 0
    }
    current.profileOpened = current.profileOpened
      || event.type === 'botanical_atlas_profile_click'
      || values.get('profile_opened') === 'yes'
    sessions.set(sessionId, current)
  })

  const actions = new Map<string, { impressions: number; acceptances: number; profileOpens: number; restoredTotal: number }>()
  sessions.forEach((session) => {
    session.shown.forEach((action) => {
      const current = actions.get(action) ?? { impressions: 0, acceptances: 0, profileOpens: 0, restoredTotal: 0 }
      current.impressions += 1
      actions.set(action, current)
    })
    if (session.accepted) {
      const current = actions.get(session.accepted) ?? { impressions: 0, acceptances: 0, profileOpens: 0, restoredTotal: 0 }
      current.acceptances += 1
      current.restoredTotal += session.restoredResults
      if (session.profileOpened) current.profileOpens += 1
      actions.set(session.accepted, current)
    }
  })

  const rows: AtlasRecoveryPerformanceRow[] = Array.from(actions.entries()).map(([action, values]) => ({
    action,
    impressions: values.impressions,
    acceptances: values.acceptances,
    acceptanceRate: values.impressions ? values.acceptances / values.impressions : 0,
    profileOpens: values.profileOpens,
    postRecoveryProfileRate: values.acceptances ? values.profileOpens / values.acceptances : 0,
    averageRestoredResults: values.acceptances ? values.restoredTotal / values.acceptances : 0,
  })).sort((a, b) => b.postRecoveryProfileRate - a.postRecoveryProfileRate
    || b.acceptanceRate - a.acceptanceRate
    || b.impressions - a.impressions
    || a.action.localeCompare(b.action))

  return {
    rows,
    recoverySessions: Array.from(sessions.values()).filter((session) => session.shown.size || session.accepted).length,
    unattributedEvents,
  }
}

function parseReasonTypes(value = '') {
  return value.split('|').map((item) => item.trim()).filter(Boolean)
}

function parseRelatedShownItems(item = '', fallbackReasonTypes: string[] = []) {
  return item.split(',').map((entry) => {
    const [targetSlug = '', positionRaw = '0', , reasonsRaw = ''] = entry.split('~')
    return {
      targetSlug,
      position: Number(positionRaw) || 0,
      reasonTypes: parseReasonTypes(reasonsRaw).length ? parseReasonTypes(reasonsRaw) : fallbackReasonTypes,
    }
  }).filter((entry) => entry.targetSlug)
}

export function buildRelatedBotanicalPerformance(events: AtlasAnalyticsEvent[]) {
  const exposures = new Map<string, RelatedExposure>()
  const clicks = new Map<string, RelatedClick>()
  let unattributedEvents = 0

  events.forEach((event) => {
    if (event.type !== 'related_botanicals_shown' && event.type !== 'related_botanical_click') return
    const values = parseAtlasContext(event.context)
    const sessionId = values.get('session')
    const sourceSlug = event.slug || 'unknown'
    if (!sessionId) {
      unattributedEvents += 1
      return
    }

    if (event.type === 'related_botanicals_shown') {
      const fallbackReasonTypes = parseReasonTypes(values.get('reason_types'))
      parseRelatedShownItems(event.item, fallbackReasonTypes).forEach((item) => {
        const key = `${sessionId}|${sourceSlug}|${item.targetSlug}`
        if (!exposures.has(key)) exposures.set(key, { sessionId, sourceSlug, ...item })
      })
      return
    }

    const targetSlug = event.item || 'unknown'
    const key = `${sessionId}|${sourceSlug}|${targetSlug}`
    const click: RelatedClick = {
      sessionId,
      sourceSlug,
      targetSlug,
      position: Number(values.get('position') ?? 0) || 0,
      reasonTypes: parseReasonTypes(values.get('reason_types')),
      profileDepth: Number(values.get('profile_depth') ?? 0) || 0,
    }
    const prior = clicks.get(key)
    if (!prior || click.profileDepth > prior.profileDepth) clicks.set(key, click)
  })

  const cardStats = new Map<string, {
    sourceSlug: string
    targetSlug: string
    position: number
    impressions: number
    clicks: number
    clickDepthTotal: number
    deepClicks: number
  }>()

  exposures.forEach((exposure, key) => {
    const groupKey = `${exposure.sourceSlug}|${exposure.targetSlug}|${exposure.position}`
    const current = cardStats.get(groupKey) ?? {
      sourceSlug: exposure.sourceSlug,
      targetSlug: exposure.targetSlug,
      position: exposure.position,
      impressions: 0,
      clicks: 0,
      clickDepthTotal: 0,
      deepClicks: 0,
    }
    current.impressions += 1
    const click = clicks.get(key)
    if (click) {
      current.clicks += 1
      current.clickDepthTotal += click.profileDepth
      if (click.profileDepth >= 3) current.deepClicks += 1
    }
    cardStats.set(groupKey, current)
  })

  const cardRows: RelatedBotanicalCardPerformanceRow[] = Array.from(cardStats.values()).map((values) => ({
    sourceSlug: values.sourceSlug,
    targetSlug: values.targetSlug,
    position: values.position,
    impressions: values.impressions,
    clicks: values.clicks,
    ctr: values.impressions ? values.clicks / values.impressions : 0,
    averageClickDepth: values.clicks ? values.clickDepthTotal / values.clicks : 0,
    deepExplorationRate: values.clicks ? values.deepClicks / values.clicks : 0,
  })).sort((a, b) => b.deepExplorationRate - a.deepExplorationRate
    || b.ctr - a.ctr
    || b.impressions - a.impressions
    || a.sourceSlug.localeCompare(b.sourceSlug)
    || a.targetSlug.localeCompare(b.targetSlug))

  const reasonStats = new Map<string, { impressions: number; clicks: number; clickDepthTotal: number; deepClicks: number }>()
  exposures.forEach((exposure, key) => {
    const click = clicks.get(key)
    Array.from(new Set(exposure.reasonTypes)).forEach((reasonType) => {
      const current = reasonStats.get(reasonType) ?? { impressions: 0, clicks: 0, clickDepthTotal: 0, deepClicks: 0 }
      current.impressions += 1
      if (click) {
        current.clicks += 1
        current.clickDepthTotal += click.profileDepth
        if (click.profileDepth >= 3) current.deepClicks += 1
      }
      reasonStats.set(reasonType, current)
    })
  })

  const reasonRows: RelatedBotanicalReasonPerformanceRow[] = Array.from(reasonStats.entries()).map(([reasonType, values]) => ({
    reasonType,
    impressions: values.impressions,
    clicks: values.clicks,
    ctr: values.impressions ? values.clicks / values.impressions : 0,
    averageClickDepth: values.clicks ? values.clickDepthTotal / values.clicks : 0,
    deepExplorationRate: values.clicks ? values.deepClicks / values.clicks : 0,
  })).sort((a, b) => b.deepExplorationRate - a.deepExplorationRate
    || b.ctr - a.ctr
    || b.impressions - a.impressions
    || a.reasonType.localeCompare(b.reasonType))

  return {
    cardRows,
    reasonRows,
    attributedImpressions: exposures.size,
    attributedClicks: clicks.size,
    unattributedEvents,
  }
}
