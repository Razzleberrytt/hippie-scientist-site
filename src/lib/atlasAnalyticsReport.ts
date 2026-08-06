export type AtlasAnalyticsEvent = {
  type?: string
  context?: string
}

export type AtlasSourcePerformanceRow = {
  source: string
  sessions: number
  profileOpens: number
  profileOpenRate: number
  averageFilterDepth: number
  topFirstFilter: string
}

type SessionSummary = {
  source: string
  firstFilter: string
  distinctFilters: number
  profileOpened: boolean
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

  return {
    rows,
    attributedSessions: sessions.size,
    unattributedEvents,
  }
}
