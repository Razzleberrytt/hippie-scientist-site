import { extractPrimaryEffects as extractPrimaryEffectsFromDataTrust } from '../dataTrust'

export function extractPrimaryEffects(value: unknown, maxItems = 3): string[] {
  return extractPrimaryEffectsFromDataTrust(value, maxItems)
}
