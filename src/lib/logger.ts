type LogMethod = (message?: unknown, ...optionalParams: unknown[]) => void

const isDevelopment = process.env.NODE_ENV !== 'production'

function getConsoleMethod(method: 'warn' | 'error'): LogMethod | undefined {
  if (!isDevelopment) return undefined

  const runtimeConsole = globalThis['console' as keyof typeof globalThis] as
    | Pick<Console, 'warn' | 'error'>
    | undefined

  return runtimeConsole?.[method]?.bind(runtimeConsole)
}

export const logger = {
  warn(message?: unknown, ...optionalParams: unknown[]) {
    getConsoleMethod('warn')?.(message, ...optionalParams)
  },
  error(message?: unknown, ...optionalParams: unknown[]) {
    getConsoleMethod('error')?.(message, ...optionalParams)
  },
}
