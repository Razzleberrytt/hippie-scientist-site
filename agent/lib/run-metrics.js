import fs from 'node:fs'
import path from 'node:path'

const metricsPath = path.join(process.cwd(), 'ops', 'agent-review', 'run-metrics.json')

export function writeRunMetrics(metrics = {}) {
  fs.mkdirSync(path.dirname(metricsPath), { recursive: true })

  const payload = {
    generated_at: new Date().toISOString(),
    compounds_processed: metrics.compounds_processed || 0,
    patches_generated: metrics.patches_generated || 0,
    cache_hits: metrics.cache_hits || 0,
    cache_misses: metrics.cache_misses || 0,
    ai_calls: metrics.ai_calls || 0,
    workflows: metrics.workflows || [],
  }

  fs.writeFileSync(metricsPath, JSON.stringify(payload, null, 2))

  return payload
}
