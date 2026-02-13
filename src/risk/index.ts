export function allowedSize(equityUsd: number, desiredAtomic: number): number {
  if (!Number.isFinite(equityUsd) || equityUsd <= 0) return 0
  const cap = equityUsd * 0.05 // limit to 5% of equity for demo
  const target = Number.isFinite(desiredAtomic) ? desiredAtomic : 0
  return Math.max(0, Math.min(target, cap))
}

type SafetyInput = {
  equity: number
  mint: string
  estLiquidityUsd: number
  desiredSize: number
  slippageBps: number
  computeUnitPrice?: number
}

type SafetyResult = { ok: true } | { ok: false; reason: string }

export function basicSafetyChecks(input: SafetyInput): SafetyResult {
  if (!Number.isFinite(input.equity) || input.equity <= 0) {
    return { ok: false, reason: 'no_equity' }
  }
  if (!Number.isFinite(input.desiredSize) || input.desiredSize <= 0) {
    return { ok: false, reason: 'invalid_size' }
  }
  if (input.desiredSize > input.estLiquidityUsd * 0.25) {
    return { ok: false, reason: 'size_vs_liquidity' }
  }
  if (!Number.isFinite(input.slippageBps) || input.slippageBps <= 0) {
    return { ok: false, reason: 'slippage_invalid' }
  }
  if (input.slippageBps > 5_000) {
    return { ok: false, reason: 'slippage_high' }
  }
  if (input.computeUnitPrice && input.computeUnitPrice > 1_000_000) {
    return { ok: false, reason: 'cu_price_high' }
  }
  if (!input.mint) {
    return { ok: false, reason: 'missing_mint' }
  }
  return { ok: true }
}
