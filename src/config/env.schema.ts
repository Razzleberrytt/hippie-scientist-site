import { z } from 'zod'

const commaSeparated = z
  .string()
  .optional()
  .transform(
    value =>
      value
        ?.split(',')
        .map(entry => entry.trim())
        .filter(Boolean) ?? []
  )

export const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  LOG_LEVEL: z.string().optional(),
  BOT_MODE: z.enum(['dry-run', 'live']).default('dry-run'),
  RPC_PRIMARY: z.string().optional(),
  RPC_FALLBACKS: z.string().optional(),
  SOLANA_RPC_URL: z.string().optional(),
  SOLANA_KEYPAIR_PATH: z.string().optional(),
  SOLANA_COMMITMENT: z.string().default('confirmed'),
  SOLANA_WALLET_PUBKEY: z.string().optional(),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_ID: z.string().optional(),
  DEFAULT_STRATEGY: z.string().default('liquiditySniper'),
  LIQUIDITY_SNIPER_POLL_INTERVAL_MS: z.coerce.number().positive().default(5000),
  LIQUIDITY_SNIPER_MIN_LIQUIDITY_USD: z.coerce.number().nonnegative().default(10000),
  ALLOW_MINTS: commaSeparated,
  DENY_MINTS: commaSeparated,
  MIN_LIQ_USD: z.coerce.number().nonnegative().default(10000),
  MAX_OPEN_POSITIONS: z.coerce.number().nonnegative().default(3),
  MAX_TRADES_PER_MIN: z.coerce.number().nonnegative().default(6),
  BASE_INPUT_MINT: z.string().default('So11111111111111111111111111111111111111112'),
  ALERT_LOW_BALANCE_LAMPORTS: z.coerce.number().nonnegative().default(0),
})

export type EnvSchema = z.infer<typeof envSchema>

export function loadEnv(overrides: NodeJS.ProcessEnv = process.env): EnvSchema {
  return envSchema.parse(overrides)
}
