export function logInfo(message) {
  console.log(`[agent] ${message}`)
}

export function logWarn(message) {
  console.warn(`[agent:warn] ${message}`)
}

export function logError(message, error) {
  console.error(`[agent:error] ${message}`, error || '')
}
