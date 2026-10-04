import type { RuntimeRecord } from '../../types/content'

import { getAllCompounds } from '@/lib/server/runtime-data'
import { selectCanonicalCompounds, selectPublishedCompounds } from './library-selector'

async function loadRuntimeCompounds(): Promise<RuntimeRecord[]> {
  return (await getAllCompounds()) as unknown as RuntimeRecord[]
}

export async function loadCanonicalCompounds(): Promise<RuntimeRecord[]> {
  return selectCanonicalCompounds(await loadRuntimeCompounds())
}

export async function loadPublishedCompounds(): Promise<RuntimeRecord[]> {
  return selectPublishedCompounds(await loadRuntimeCompounds())
}
