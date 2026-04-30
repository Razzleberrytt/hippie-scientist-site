export type DevMessageLevel = 'info' | 'warning' | 'error'

type DevMessageEntry = {
  level: DevMessageLevel
  message: string
  context: unknown[]
  ts: number
}

const MAX_DEV_MESSAGES = 100
const devMessageStore: DevMessageEntry[] = []

export function recordDevMessage(level: DevMessageLevel, message: string, ...context: unknown[]) {
  if (import.meta.env.MODE === 'production') return

  devMessageStore.push({
    level,
    message,
    context,
    ts: Date.now(),
  })

  if (devMessageStore.length > MAX_DEV_MESSAGES) {
    devMessageStore.splice(0, devMessageStore.length - MAX_DEV_MESSAGES)
  }
}

export function getDevMessages(): readonly DevMessageEntry[] {
  return devMessageStore
}

export function clearDevMessages() {
  devMessageStore.length = 0
}
