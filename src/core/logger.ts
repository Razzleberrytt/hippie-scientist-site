/* eslint-disable no-console */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

let currentLevel: LogLevel = normalizeLogLevel(process.env.LOG_LEVEL)

function shouldLog(level: LogLevel): boolean {
  return LEVEL_WEIGHT[level] >= LEVEL_WEIGHT[currentLevel]
}

function serialize(value: unknown): string {
  if (typeof value === 'string') {
    return value
  }

  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function selectConsole(level: LogLevel): typeof console.log {
  switch (level) {
    case 'debug':
      return console.debug
    case 'info':
      return console.info
    case 'warn':
      return console.warn
    case 'error':
    default:
      return console.error
  }
}

export function normalizeLogLevel(value?: string | null): LogLevel {
  switch (value?.toLowerCase()) {
    case 'debug':
      return 'debug'
    case 'warn':
      return 'warn'
    case 'error':
      return 'error'
    case 'info':
    default:
      return 'info'
  }
}

export function setLogLevel(level: LogLevel): void {
  currentLevel = level
}

export function getLogLevel(): LogLevel {
  return currentLevel
}

export class Logger {
  constructor(private readonly context?: string) {}

  private format(level: LogLevel, message: unknown): string {
    const timestamp = new Date().toISOString()
    const context = this.context ? ` [${this.context}]` : ''
    const text = serialize(message)
    return `[${timestamp}] [${level.toUpperCase()}]${context} ${text}`
  }

  private emit(level: LogLevel, message: unknown, ...metadata: unknown[]): void {
    if (!shouldLog(level)) {
      return
    }

    const writer = selectConsole(level)
    const formatted = this.format(level, message)

    if (metadata.length > 0) {
      writer(formatted, ...metadata)
    } else {
      writer(formatted)
    }
  }

  debug(message: unknown, ...metadata: unknown[]): void {
    this.emit('debug', message, ...metadata)
  }

  info(message: unknown, ...metadata: unknown[]): void {
    this.emit('info', message, ...metadata)
  }

  warn(message: unknown, ...metadata: unknown[]): void {
    this.emit('warn', message, ...metadata)
  }

  error(message: unknown, ...metadata: unknown[]): void {
    this.emit('error', message, ...metadata)
  }
}

export function createLogger(context?: string): Logger {
  return new Logger(context)
}
