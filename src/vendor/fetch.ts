import { opt } from './resolve'

type FetchFn = typeof fetch

let cachedFetch: FetchFn | null = null

export async function fetchInput(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (!cachedFetch) {
    if (typeof fetch === 'function') {
      cachedFetch = fetch.bind(globalThis)
    } else {
      const nodeFetch = opt<FetchFn>('node-fetch')
      if (!nodeFetch) {
        throw new Error('fetch unavailable in this environment')
      }
      cachedFetch = nodeFetch as FetchFn
    }
  }
  return cachedFetch(input as any, init)
}
