function emit(level, message, meta = null) {
  const suffix = meta ? ` ${JSON.stringify(meta)}` : ''
  console[level](`[agent:${level}] ${message}${suffix}`)
}

export const logger = {
  info(message, meta) {
    emit('log', message, meta)
  },

  warn(message, meta) {
    emit('warn', message, meta)
  },

  error(message, meta) {
    emit('error', message, meta)
  },

  success(message, meta) {
    emit('log', `SUCCESS: ${message}`, meta)
  },

  skip(message, meta) {
    emit('warn', `SKIP: ${message}`, meta)
  },
}

export const logInfo = logger.info
export const logWarn = logger.warn
export const logError = logger.error
export const logSkip = logger.skip
