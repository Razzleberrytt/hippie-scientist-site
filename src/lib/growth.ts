import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

export type SavedEntityType = 'herb' | 'compound' | 'article' | 'blend'

export type SavedEntity = {
  id: string
  type: SavedEntityType
  slug: string
  title: string
  href: string
  note?: string
  savedAt: string
}

type AnalyticsEvent = {
  name: 'page_view' | 'detail_click' | 'favorite_toggle' | 'blend_created'
  at: string
  payload?: Record<string, string | number | boolean>
}

const SAVED_KEY = 'hs_saved_items_v1'
const EVENTS_KEY = 'hs_analytics_events_v1'
const PAGE_KEY = 'hs_page_views_v1'

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || 'null')
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function useSavedItems() {
  const [items, setItems] = useState<SavedEntity[]>([])

  useEffect(() => {
    setItems(readJson<SavedEntity[]>(SAVED_KEY, []))
  }, [])

  const save = (entry: Omit<SavedEntity, 'savedAt' | 'id'>) => {
    setItems(prev => {
      const existing = prev.find(item => item.type === entry.type && item.slug === entry.slug)
      if (existing) return prev
      const next: SavedEntity = {
        ...entry,
        id: `${entry.type}:${entry.slug}`,
        savedAt: new Date().toISOString(),
      }
      const updated = [next, ...prev].slice(0, 100)
      writeJson(SAVED_KEY, updated)
      return updated
    })
  }

  const remove = (type: SavedEntityType, slug: string) => {
    setItems(prev => {
      const updated = prev.filter(item => !(item.type === type && item.slug === slug))
      writeJson(SAVED_KEY, updated)
      return updated
    })
  }

  const toggle = (entry: Omit<SavedEntity, 'savedAt' | 'id'>) => {
    const exists = items.some(item => item.type === entry.type && item.slug === entry.slug)
    if (exists) {
      remove(entry.type, entry.slug)
      trackEvent('favorite_toggle', { action: 'removed', type: entry.type, slug: entry.slug })
      return false
    }
    save(entry)
    trackEvent('favorite_toggle', { action: 'saved', type: entry.type, slug: entry.slug })
    return true
  }

  const isSaved = (type: SavedEntityType, slug: string) =>
    items.some(item => item.type === type && item.slug === slug)

  return { items, save, remove, toggle, isSaved }
}

export function trackEvent(name: AnalyticsEvent['name'], payload: AnalyticsEvent['payload'] = {}) {
  const events = readJson<AnalyticsEvent[]>(EVENTS_KEY, [])
  const next = [{ name, at: new Date().toISOString(), payload }, ...events].slice(0, 250)
  writeJson(EVENTS_KEY, next)
}

export function useGrowthTracking() {
  const location = useLocation()

  useEffect(() => {
    const pages = readJson<string[]>(PAGE_KEY, [])
    const next = [...pages, `${location.pathname}${location.search}`].slice(-50)
    writeJson(PAGE_KEY, next)
    trackEvent('page_view', { path: location.pathname })
  }, [location.pathname, location.search])
}

export function useEmailCaptureTrigger() {
  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const viewed = readJson<string[]>(PAGE_KEY, [])
    if (new Set(viewed).size >= 2) {
      setShouldShow(true)
      return
    }

    const onScroll = () => {
      const max = Math.max(document.body.scrollHeight - window.innerHeight, 1)
      const ratio = window.scrollY / max
      if (ratio > 0.55) setShouldShow(true)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return shouldShow
}

export function useLearningProgress(pathId: string) {
  const key = `hs_learning_progress_${pathId}`
  const [completed, setCompleted] = useState<string[]>([])

  useEffect(() => {
    setCompleted(readJson<string[]>(key, []))
  }, [key])

  const toggleCompleted = (itemId: string) => {
    setCompleted(prev => {
      const next = prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
      writeJson(key, next)
      return next
    })
  }

  const progress = useMemo(() => completed.length, [completed.length])

  return { completed, toggleCompleted, progress }
}

export function getStoredEventsCount() {
  return readJson<AnalyticsEvent[]>(EVENTS_KEY, []).length
}
