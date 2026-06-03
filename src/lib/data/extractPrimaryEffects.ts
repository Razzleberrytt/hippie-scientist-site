import { extractPrimaryEffects as extractPrimaryEffectsFromDataTrust } from '@/lib/dataTrust'

export function extractPrimaryEffects(value: unknown, maxItems = 3): string[] {
  return extractPrimaryEffectsFromDataTrust(value, maxItems)
}
