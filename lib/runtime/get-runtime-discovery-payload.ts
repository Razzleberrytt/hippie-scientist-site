import {
  getContextFromRecord,
} from '@/lib/runtime/get-context-from-record'

import {
  getDiverseDiscoveryItems,
} from '@/lib/runtime/get-diverse-discovery-items'

export function getRuntimeDiscoveryPayload(record: any) {
  const context = getContextFromRecord(record)

  const recommendations = getDiverseDiscoveryItems(context, 5)

  return {
    context,
    recommendations,
  }
}
