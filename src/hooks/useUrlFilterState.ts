"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  DEFAULT_FILTER_STATE,
  parseFilterStateFromSearchParams,
  serializeFilterStateToSearchParams,
  type FilterState,
} from "../lib/filterState";

export function useUrlFilterState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filterState = useMemo(() => {
    return parseFilterStateFromSearchParams(searchParams);
  }, [searchParams]);

  function setFilterState(nextState: Partial<FilterState>) {
    const mergedState: FilterState = {
      ...DEFAULT_FILTER_STATE,
      ...filterState,
      ...nextState,
    };

    const nextParams = serializeFilterStateToSearchParams(mergedState);
    const queryString = nextParams.toString();

    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }

  function resetFilterState() {
    router.replace(pathname, { scroll: false });
  }

  return {
    filterState,
    setFilterState,
    resetFilterState,
  };
}
