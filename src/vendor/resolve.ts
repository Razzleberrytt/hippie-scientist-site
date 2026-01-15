export function opt<T = unknown>(moduleName: string): T | null {
  try {
    const req = typeof require === 'function' ? require : undefined
    if (!req) return null
    return req(moduleName) as T
  } catch (err) {
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as any).code === 'MODULE_NOT_FOUND'
    ) {
      return null
    }
    return null
  }
}
