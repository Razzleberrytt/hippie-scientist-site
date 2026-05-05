export async function runAgentQueue(tasks = []) {
  const results = []

  for (const task of tasks) {
    try {
      // sequential on purpose for safety + rate limiting
      // eslint-disable-next-line no-await-in-loop
      const result = await task()
      results.push(result)
    } catch (error) {
      results.push({
        status: 'failed',
        error: error?.message || 'unknown_error',
      })
    }
  }

  return results
}
