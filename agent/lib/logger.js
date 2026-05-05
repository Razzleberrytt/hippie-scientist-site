const LEVELS = new Set(['info', 'warn', 'error', 'skip'])

function format(level, message, meta) {
  const safeLevel = LEVELS.has(level) ? level : 'info'
  const suffix = meta ? ` ${JSON.stringify(meta)}` : ''
  return `[agent:${safeLevel}] ${message}${suffix}`
}

export function logInfo(message, meta) {
  console.log(format('info', message, meta))
}

export function logWarn(message, meta) {
  console.warn(format('warn', message, meta))
}

export function logSkip(message, meta) {
  console.warn(format('skip', message, meta))
}

export function logError(message, error) {
  const meta = error?.message ? { error: error.message } : error
  console.error(format('error', message, meta))
}
