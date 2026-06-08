'use client'

import { useCallback } from 'react'
import {
  RuntimeAnalyticsEvent,
  trackRuntimeEvent,
} from '@/lib/runtime-analytics'

export function useRuntimeAnalytics() {
  const track = useCallback((event: RuntimeAnalyticsEvent) => {
    trackRuntimeEvent(event)
  }, [])

  const trackProfileView = useCallback(
    (entity: string, entityType: RuntimeAnalyticsEvent['entityType']) => {
      track({
        type: 'profile_view',
        entity,
        entityType,
      })
    },
    [track],
  )

  const trackSemanticSearch = useCallback(
    (query: string) => {
      track({
        type: 'semantic_search',
        entity: query,
        entityType: 'pathway',
      })
    },
    [track],
  )

  const trackCompareInteraction = useCallback(
    (entity: string, metadata?: Record<string, unknown>) => {
      track({
        type: 'compare_interaction',
        entity,
        entityType: 'compare',
        metadata,
      })
    },
    [track],
  )

  const trackRailInteraction = useCallback(
    (entity: string, metadata?: Record<string, unknown>) => {
      track({
        type: 'rail_interaction',
        entity,
        metadata,
      })
    },
    [track],
  )

  const trackRecommendationInteraction = useCallback(
    (entity: string, metadata?: Record<string, unknown>) => {
      track({
        type: 'recommendation_interaction',
        entity,
        metadata,
      })
    },
    [track],
  )

  const trackExpansion = useCallback(
    (entity: string, metadata?: Record<string, unknown>) => {
      track({
        type: 'expand_section',
        entity,
        metadata,
      })
    },
    [track],
  )

  return {
    track,
    trackProfileView,
    trackSemanticSearch,
    trackCompareInteraction,
    trackRailInteraction,
    trackRecommendationInteraction,
    trackExpansion,
  }
}
