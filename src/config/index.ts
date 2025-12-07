export type AppConfig = {
  DRY_RUN: boolean
  RPC_PRIMARY?: string
  RPC_BACKUP?: string
  JUPITER_BASE_URL: string
  SLIPPAGE_BPS: number
  MAX_CU_PRICE?: number
  DB_PATH?: string
  METRICS_PORT: number
}

let cache: AppConfig | null = null

function boolFromEnv(name: string, fallback: boolean): boolean {
  const v = process.env[name]
  if (!v) return fallback
  return ['1', 'true', 'yes', 'on'].includes(v.toLowerCase())
}

function numFromEnv(name: string, fallback: number): number {
  const v = process.env[name]
  if (!v) return fallback
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

export function loadConfig(): AppConfig {
  if (cache) return cache
  cache = {
    DRY_RUN: boolFromEnv('DRY_RUN', true),
    RPC_PRIMARY: process.env.RPC_PRIMARY ?? process.env.RPC_URL ?? undefined,
    RPC_BACKUP: process.env.RPC_BACKUP ?? process.env.BACKUP_RPC_URL ?? undefined,
    JUPITER_BASE_URL: process.env.JUPITER_BASE_URL ?? 'https://quote-api.jup.ag/v6',
    SLIPPAGE_BPS: numFromEnv('SLIPPAGE_BPS', 50),
    MAX_CU_PRICE: process.env.MAX_CU_PRICE ? numFromEnv('MAX_CU_PRICE', 0) : undefined,
    DB_PATH: process.env.DB_PATH ?? undefined,
    METRICS_PORT: numFromEnv('METRICS_PORT', 8080),
  }
  return cache
}

export function reloadConfig(): AppConfig {
  cache = null
  return loadConfig()
}
