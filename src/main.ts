import { loadConfig } from './config'
import { getDB } from './db'
import { startMetricsServer } from './telemetry/metrics'
import { maybeStartTelegram } from './ops/telegram'
import { startCollector } from './collector'
import { runNaiveLoop } from './strategy/naive'

async function main() {
  const cfg = loadConfig()
  getDB()
  startMetricsServer()
  maybeStartTelegram()

  try {
    process.stdout.write(
      `[SnipeBT] ${cfg.DRY_RUN ? 'DRY-RUN' : 'LIVE'} | /health /metrics on ${cfg.METRICS_PORT}\n`
    )
  } catch {
    /* ignore */
  }

  if (process.env.COLLECTOR_IN && process.env.COLLECTOR_OUT && process.env.COLLECTOR_AMT) {
    startCollector({
      inMint: process.env.COLLECTOR_IN!,
      outMint: process.env.COLLECTOR_OUT!,
      amount: process.env.COLLECTOR_AMT!,
      intervalMs: Number(process.env.COLLECTOR_MS ?? '10000'),
    })
  }

  if (
    process.env.NAIVE_USER_PUB &&
    process.env.NAIVE_IN &&
    process.env.NAIVE_OUT &&
    process.env.NAIVE_AMT
  ) {
    await runNaiveLoop({
      userPublicKey: process.env.NAIVE_USER_PUB!,
      inputMint: process.env.NAIVE_IN!,
      outputMint: process.env.NAIVE_OUT!,
      amountInAtomic: process.env.NAIVE_AMT!,
    })
  }
}

main().catch(e => {
  try {
    process.stderr.write(`${e instanceof Error ? (e.stack ?? e.message) : String(e)}\n`)
  } catch {
    /* ignore */
  }
  process.exit(1)
})
