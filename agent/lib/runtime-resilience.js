const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

export class TimeoutError extends Error {
  constructor(label, timeoutMs) {
    super(`${label} exceeded ${timeoutMs}ms timeout`)
    this.name = 'TimeoutError'
    this.code = 'TASK_TIMEOUT'
    this.timeoutMs = timeoutMs
  }
}

export async function withTimeout(task, timeoutMs, label = 'task') {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) return task()

  let timer
  try {
    return await Promise.race([
      Promise.resolve().then(task),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new TimeoutError(label, timeoutMs)), timeoutMs)
        timer.unref?.()
      }),
    ])
  } finally {
    clearTimeout(timer)
  }
}

export function isTransientError(error) {
  if (!error) return false
  if (error.name === 'AbortError' || error.name === 'TimeoutError') return true
  if (error.code === 'TASK_TIMEOUT') return true
  if (['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'EAI_AGAIN', 'ENETUNREACH'].includes(error.code)) return true

  const status = Number(error.status || error.statusCode)
  return status === 408 || status === 425 || status === 429 || status >= 500
}

export async function retryWithBackoff(task, {
  attempts = 3,
  baseDelayMs = 250,
  maxDelayMs = 2_000,
  shouldRetry = isTransientError,
  onRetry = () => {},
} = {}) {
  const totalAttempts = Math.max(1, Number(attempts) || 1)
  let lastError

  for (let attempt = 1; attempt <= totalAttempts; attempt += 1) {
    try {
      return await task(attempt)
    } catch (error) {
      lastError = error
      if (attempt >= totalAttempts || !shouldRetry(error)) throw error

      const delay = Math.min(maxDelayMs, baseDelayMs * (2 ** (attempt - 1)))
      onRetry({ attempt, delay, error })
      await sleep(delay)
    }
  }

  throw lastError
}

export class CircuitBreaker {
  constructor({ failureThreshold = 3, cooldownMs = 60_000 } = {}) {
    this.failureThreshold = Math.max(1, Number(failureThreshold) || 1)
    this.cooldownMs = Math.max(0, Number(cooldownMs) || 0)
    this.state = new Map()
  }

  canRun(key, now = Date.now()) {
    const row = this.state.get(key)
    if (!row || row.failures < this.failureThreshold) return { allowed: true, state: 'closed' }

    const reopenAt = row.openedAt + this.cooldownMs
    if (now >= reopenAt) return { allowed: true, state: 'half_open', reopenAt }
    return { allowed: false, state: 'open', reopenAt }
  }

  recordSuccess(key) {
    this.state.delete(key)
  }

  recordFailure(key, now = Date.now()) {
    const current = this.state.get(key) || { failures: 0, openedAt: 0 }
    const failures = current.failures + 1
    const next = {
      failures,
      openedAt: failures >= this.failureThreshold ? now : current.openedAt,
    }
    this.state.set(key, next)
    return next
  }

  snapshot() {
    return Object.fromEntries([...this.state.entries()].map(([key, value]) => [key, { ...value }]))
  }
}

export async function runWorkerPool(items, worker, {
  concurrency = 4,
  onItemError = () => {},
} = {}) {
  const input = Array.from(items || [])
  if (!input.length) return []

  const results = new Array(input.length)
  let nextIndex = 0
  const width = Math.max(1, Math.min(input.length, Number(concurrency) || 1))

  async function runWorker() {
    while (true) {
      const index = nextIndex
      nextIndex += 1
      if (index >= input.length) return

      const item = input[index]
      try {
        results[index] = {
          ok: true,
          value: await worker(item, index),
        }
      } catch (error) {
        const normalized = error instanceof Error ? error : new Error(String(error))
        results[index] = {
          ok: false,
          error: normalized,
        }
        await onItemError({ item, index, error: normalized })
      }
    }
  }

  await Promise.all(Array.from({ length: width }, () => runWorker()))
  return results
}
