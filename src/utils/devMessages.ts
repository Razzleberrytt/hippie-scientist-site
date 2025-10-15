const STORE_KEY = '__HIPPIE_SCIENTIST_DEV_MESSAGES__'

type DevMessageLevel = 'warning' | 'error'

type DevMessage = {
  level: DevMessageLevel
  message: string
  detail?: string
  timestamp: number
}

function serialiseDetail(detail: unknown): string {
  if (detail instanceof Error) {
    const stack = detail.stack
    return stack ? stack : `${detail.name}: ${detail.message}`
  }
  if (typeof detail === 'string') {
    return detail
  }
  if (detail === null || detail === undefined) {
    return String(detail)
  }
  if (typeof detail === 'object') {
    try {
      return JSON.stringify(detail, null, 2)
    } catch {
      return Object.prototype.toString.call(detail)
    }
  }
  return String(detail)
}

export function recordDevMessage(
  level: DevMessageLevel,
  message: string,
  ...details: unknown[]
): void {
  if (!import.meta.env.DEV) return

  const globalTarget = globalThis as Record<string, DevMessage[] | undefined>
  const existing = globalTarget[STORE_KEY] ?? []
  const detail = details.length ? details.map(serialiseDetail).join('\n---\n') : undefined
  const entry: DevMessage = {
    level,
    message,
    detail,
    timestamp: Date.now(),
  }
  existing.push(entry)
  globalTarget[STORE_KEY] = existing
}

export type { DevMessage, DevMessageLevel }
