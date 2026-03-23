import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  DEFAULT_FILTER_STATE,
  parseFilterStateFromSearchParams,
  toSearchParamsFromFilterState,
  type EntryFilterState,
} from '@/utils/filterModel'

export function useUrlFilterState(defaults: EntryFilterState = DEFAULT_FILTER_STATE) {
  const [searchParams, setSearchParams] = useSearchParams()

  const state = useMemo(
    () => parseFilterStateFromSearchParams(searchParams, defaults),
    [defaults, searchParams]
  )

  const setState = (updater: EntryFilterState | ((prev: EntryFilterState) => EntryFilterState)) => {
    const nextState = typeof updater === 'function' ? updater(state) : updater
    setSearchParams(toSearchParamsFromFilterState(nextState), { replace: true })
  }

  return [state, setState] as const
}
