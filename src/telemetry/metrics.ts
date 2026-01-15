import { createServer, IncomingMessage, ServerResponse } from 'http'
import { loadConfig } from '../config'
import { opt } from '../vendor/resolve'

type CounterLike = {
  inc: (value?: number) => void
  value: () => number
  name: string
  help: string
}

function createFallbackCounter(name: string, help: string): CounterLike {
  let total = 0
  return {
    name,
    help,
    inc(value = 1) {
      total += value
    },
    value() {
      return total
    },
  }
}

const prom = opt<any>('prom-client')
const registry = prom ? new prom.Registry() : null

function mkCounter(name: string, help: string) {
  if (prom && registry) {
    const counter = new prom.Counter({ name, help, registers: [registry] })
    return counter
  }
  return createFallbackCounter(name, help)
}

export const tradesSubmitted = mkCounter(
  'snipebt_trades_submitted_total',
  'Number of trade submission attempts'
)

export const tradesConfirmed = mkCounter(
  'snipebt_trades_confirmed_total',
  'Number of trades confirmed on-chain'
)

let started = false
let healthStatus = 'ok'

function renderFallback(): string {
  const counters = [tradesSubmitted, tradesConfirmed]
  return counters
    .map(counter => {
      if ('metrics' in counter) {
        return (counter as any).metrics()
      }
      return `# HELP ${counter.name} ${counter.help}\n# TYPE ${counter.name} counter\n${counter.name} ${counter.value()}`
    })
    .join('\n\n')
}

export function startMetricsServer() {
  if (started) return
  const { METRICS_PORT } = loadConfig()
  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    if (!req.url) {
      res.writeHead(400)
      res.end()
      return
    }
    if (req.url.startsWith('/health')) {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ status: healthStatus }))
      return
    }
    if (req.url.startsWith('/metrics')) {
      try {
        if (registry) {
          const body = await registry.metrics()
          res.writeHead(200, { 'Content-Type': registry.contentType })
          res.end(body)
        } else {
          res.writeHead(200, { 'Content-Type': 'text/plain' })
          res.end(renderFallback())
        }
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' })
        res.end(String(err))
      }
      return
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('not found')
  })
  server.listen(METRICS_PORT, () => {
    try {
      process.stdout.write(`[metrics] listening on ${METRICS_PORT}\n`)
    } catch {
      /* noop */
    }
  })
  started = true
}

export function setHealthStatus(status: string) {
  healthStatus = status
}
