import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import { safeArray, safeSlug } from '@/lib/search-safe'
import type { RuntimeRecord } from '@/src/types/content'

export function buildRenderableRuntimeRecordIndex(records: RuntimeRecord[]) {
  const bySlug = new Map<string, RuntimeRecord>()

  for (const record of safeArray<RuntimeRecord>(records)) {
    const slug = safeSlug(record?.slug)
    if (!slug || bySlug.has(slug) || !getRuntimeVisibility(record).canRender) continue
    bySlug.set(slug, record)
  }

  return bySlug
}
