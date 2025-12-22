import { getQuote } from '../router/jupiter'
import { loadConfig } from '../config'
import { insertQuote } from '../db'

export async function startCollector(opts: {
  inMint: string
  outMint: string
  amount: string
  intervalMs?: number
}) {
  const every = opts.intervalMs ?? 10_000
  const cfg = loadConfig()
  async function tick() {
    const t0 = Date.now()
    try {
      const q = await getQuote({
        inputMint: opts.inMint,
        outputMint: opts.outMint,
        amount: opts.amount,
        slippageBps: cfg.SLIPPAGE_BPS,
      })
      const t1 = Date.now()
      const out = q?.data?.[0]?.outAmount ?? q?.outAmount ?? null
      insertQuote({
        ts: Date.now(),
        inMint: opts.inMint,
        outMint: opts.outMint,
        amount: opts.amount,
        outAmount: out ?? undefined,
        slippageBps: cfg.SLIPPAGE_BPS,
        latencyMs: t1 - t0,
      })
    } catch (e) {
      /* swallow */
    }
    setTimeout(tick, every)
  }
  tick()
}
