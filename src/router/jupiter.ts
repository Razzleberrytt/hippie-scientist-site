import { Buffer } from 'buffer'
import { loadConfig } from '../config'
import { fetchInput as fetch } from '../vendor/fetch'
import { connection } from '../solana/rpc'
import { opt } from '../vendor/resolve'

export type QuoteReq = {
  inputMint: string
  outputMint: string
  amount: string
  slippageBps: number
}
export type QuoteRes = any

export async function getQuote(q: QuoteReq): Promise<QuoteRes> {
  const { JUPITER_BASE_URL } = loadConfig()
  const url = new URL(`${JUPITER_BASE_URL}/quote`)
  Object.entries(q).forEach(([k, v]) => url.searchParams.set(k, String(v)))
  const r = await fetch(url.toString())
  if (!('ok' in (r as any)) || !(r as any).ok) return { error: 'quote_http_error' }
  return await (r as any).json()
}

/**
 * buildSwapTx:
 * Calls Jupiter /swap with a quote response + user public key to get a base64 tx.
 * NOTE: Exact fields follow Jupiter v6 docs; keep defensive parsing for offline mode.
 */
export async function buildSwapTx(params: {
  userPublicKey: string
  quoteResponse: any
  wrapAndUnwrapSol?: boolean
  asLegacyTransaction?: boolean
  computeUnitPriceMicroLamports?: number
}): Promise<{ swapTransaction?: string; error?: string }> {
  try {
    const { JUPITER_BASE_URL } = loadConfig()
    const url = `${JUPITER_BASE_URL}/swap`
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteResponse: params.quoteResponse,
        userPublicKey: params.userPublicKey,
        wrapAndUnwrapSol: params.wrapAndUnwrapSol ?? true,
        asLegacyTransaction: params.asLegacyTransaction ?? false,
        computeUnitPriceMicroLamports: params.computeUnitPriceMicroLamports,
      }),
    })
    if (!('ok' in (r as any)) || !(r as any).ok) return { error: 'swap_http_error' }
    const j = await (r as any).json()
    if (!j?.swapTransaction) return { error: 'no_swap_tx' }
    return { swapTransaction: j.swapTransaction as string }
  } catch (e: any) {
    return { error: `swap_build_err:${e?.message ?? e}` }
  }
}

export async function sendSwapBase64(b64: string): Promise<{ txSig?: string; error?: string }> {
  const web3 = opt<any>('@solana/web3.js')
  if (!web3) return { error: 'web3_missing_offline' }
  const conn = connection()
  if (!conn) return { error: 'connection_missing' }
  try {
    const tx = web3.Transaction.from(Buffer.from(b64, 'base64'))
    // User must sign: for now assume a local keypair via env secret provider later.
    // Fallback: send as-is if it's a "versioned" tx already signed by server.
    const sig = await conn.sendRawTransaction(tx.serialize(), {
      skipPreflight: true,
      maxRetries: 3,
    })
    return { txSig: sig }
  } catch (e: any) {
    return { error: `send_swap_err:${e?.message ?? e}` }
  }
}
