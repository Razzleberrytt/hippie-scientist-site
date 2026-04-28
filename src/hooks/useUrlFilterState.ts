"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  DEFAULT_FILTER_STATE,
  parseFilterStateFromSearchParams,
  toSearchParamsFromFilterState,
  type EntryFilterState,
} from "@/utils/filterModel";

export function useUrlFilterState(defaults: EntryFilterState = DEFAULT_FILTER_STATE) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useMemo(
    () => parseFilterStateFromSearchParams(searchParams, defaults),
    [defaults, searchParams]
  );

  const setState = (
    updater: EntryFilterState | ((prev: EntryFilterState) => EntryFilterState)
  ) => {
    const nextState = typeof updater === "function" ? updater(state) : updater;
    const nextParams = toSearchParamsFromFilterState(nextState);
    const queryString = nextParams.toString();

    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  };

  return [state, setState] as const;
}
