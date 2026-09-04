import { runWorkerPool, withTimeout } from './runtime-resilience.js'

const DEFAULT_TASK_TIMEOUT_MS = 2 * 60 * 1000

export async function runAgentQueue(tasks = [], {
  concurrency = 1,
  timeoutMs = DEFAULT_TASK_TIMEOUT_MS,
} = {}) {
  const rows = await runWorkerPool(tasks, async (task, index) => {
    if (typeof task !== 'function') {
      const error = new Error(`agent queue item ${index} is not executable`)
      error.code = 'INVALID_TASK'
      throw error
    }

    return withTimeout(
      () => task(),
      timeoutMs,
      `agent-queue:${index}`
    )
  }, {
    // Sequential remains the default for rate-limit safety, but callers may
    // opt into bounded parallelism when tasks are independent.
    concurrency,
  })

  return rows.map((row, index) => {
    if (row.ok) return row.value

    return {
      status: 'failed',
      index,
      code: row.error?.code || 'TASK_FAILED',
      error: row.error?.message || 'unknown_error',
    }
  })
}
