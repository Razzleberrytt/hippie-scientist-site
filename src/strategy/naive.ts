import { getQuote, buildSwapTx, sendSwapBase64 } from '../router/jupiter'
import { allowedSize, basicSafetyChecks } from '../risk'
import { loadConfig } from '../config'

function log(message: string, data?: unknown) {
  try {
    const suffix =
      data === undefined ? '' : ` ${typeof data === 'string' ? data : JSON.stringify(data)}`
    process.stdout.write(`${message}${suffix}\n`)
  } catch {
    /* ignore */
  }
}

export async function runNaiveLoop(opts: {
  userPublicKey: string
  inputMint: string
  outputMint: string
  amountInAtomic: string // e.g. lamports
}) {
  const cfg = loadConfig()
  const equity = 1000 // TODO: read from wallet balance later
  const allowed = allowedSize(equity, Number(opts.amountInAtomic))
  const safe = basicSafetyChecks({
    equity,
    mint: opts.outputMint,
    estLiquidityUsd: 10_000,
    desiredSize: allowed,
    slippageBps: cfg.SLIPPAGE_BPS,
    computeUnitPrice: cfg.MAX_CU_PRICE,
  })
  if (!safe.ok) {
    log('[loop] blocked by risk:', safe)
    return
  }

  const quote = await getQuote({
    inputMint: opts.inputMint,
    outputMint: opts.outputMint,
    amount: String(Math.floor(allowed)),
    slippageBps: cfg.SLIPPAGE_BPS,
  })
  if ((quote as any)?.error) {
    log('[loop] quote error', quote)
    return
  }

  const built = await buildSwapTx({
    userPublicKey: opts.userPublicKey,
    quoteResponse: quote,
    computeUnitPriceMicroLamports: cfg.MAX_CU_PRICE,
  })
  if (built.error || !built.swapTransaction) {
    log('[loop] build error', built)
    return
  }

  const sent = await sendSwapBase64(built.swapTransaction)
  log('[loop] send result', sent)
}
