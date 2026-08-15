import type { RuntimeRecord } from '../../src/types/content'

import { getAllCompounds } from '@/lib/server/runtime-data'
import { selectPublishedCompounds } from './library-selector'

export async function loadPublishedCompounds(): Promise<RuntimeRecord[]> {
  const compounds = (await getAllCompounds()) as unknown as RuntimeRecord[]
  return selectPublishedCompounds(compounds)
}
