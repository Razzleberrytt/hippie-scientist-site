import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { Keypair } from '@solana/web3.js'

import { loadEnv } from '../config/env.schema.ts'
import { initializeRpc, setRpcEndpoint } from './rpc.ts'
import { createLogger, LogLevel, normalizeLogLevel, setLogLevel } from './logger.ts'

export type BotMode = 'dry-run' | 'live'

export interface TelegramConfig {
  botToken?: string
  chatId?: string
  enabled: boolean
}

export interface SolanaConfig {
  rpcUrl?: string
  keypairPath?: string
  commitment: string
  walletPublicKey?: string
}

export interface LiquiditySniperConfig {
  pollIntervalMs: number
  minLiquidityUsd: number
}

export interface StrategyConfig {
  default: string
  liquiditySniper: LiquiditySniperConfig
}

export interface RiskConfig {
  allowMints: string[]
  denyMints: string[]
  minLiquidityUsd: number
  maxOpenPositions: number
  maxTradesPerMinute: number
  baseInputMint: string
}

export interface AlertConfig {
  lowBalanceLamports: number
}

export interface BotConfig {
  environment: string
  mode: BotMode
  dryRun: boolean
  logLevel: LogLevel
  solana: SolanaConfig
  telegram: TelegramConfig
  strategy: StrategyConfig
  risk: RiskConfig
  alerts: AlertConfig
}

const logger = createLogger('Config')

let cachedConfig: BotConfig | null = null

function deriveWalletPublicKey(
  explicitPubkey: string | undefined,
  keypairPath: string | undefined
): string | undefined {
  if (explicitPubkey) {
    return explicitPubkey
  }

  if (!keypairPath) {
    return undefined
  }

  try {
    const resolvedPath = resolve(keypairPath)
    const contents = readFileSync(resolvedPath, 'utf-8')
    const secret = JSON.parse(contents) as number[]
    const keypair = Keypair.fromSecretKey(Uint8Array.from(secret))
    return keypair.publicKey.toBase58()
  } catch (error) {
    logger.warn('Unable to derive wallet public key from keypair path.', error)
    return undefined
  }
}

export function getConfig(): BotConfig {
  if (cachedConfig) {
    return cachedConfig
  }

  const env = loadEnv()
  const environment = env.NODE_ENV
  const logLevel = normalizeLogLevel(env.LOG_LEVEL)
  setLogLevel(logLevel)

  const mode: BotMode = env.BOT_MODE === 'live' ? 'live' : 'dry-run'
  const dryRun = mode !== 'live'

  initializeRpc(env.RPC_PRIMARY ?? env.SOLANA_RPC_URL, env.RPC_FALLBACKS)

  const rpcUrl = env.SOLANA_RPC_URL ?? env.RPC_PRIMARY
  if (rpcUrl) {
    setRpcEndpoint(rpcUrl, false)
  }

  const solana: SolanaConfig = {
    rpcUrl,
    keypairPath: env.SOLANA_KEYPAIR_PATH,
    commitment: env.SOLANA_COMMITMENT,
    walletPublicKey: deriveWalletPublicKey(env.SOLANA_WALLET_PUBKEY, env.SOLANA_KEYPAIR_PATH),
  }

  if (!solana.rpcUrl) {
    logger.warn(
      'SOLANA_RPC_URL or RPC_PRIMARY is not set. Network calls will fail until configured.'
    )
  }

  const telegramBotToken = env.TELEGRAM_BOT_TOKEN?.trim()
  const telegramChatId = env.TELEGRAM_CHAT_ID?.trim()

  const telegram: TelegramConfig = {
    botToken: telegramBotToken,
    chatId: telegramChatId,
    enabled: Boolean(telegramBotToken && telegramChatId),
  }

  const liquiditySniper: LiquiditySniperConfig = {
    pollIntervalMs: env.LIQUIDITY_SNIPER_POLL_INTERVAL_MS,
    minLiquidityUsd: env.LIQUIDITY_SNIPER_MIN_LIQUIDITY_USD,
  }

  const strategy: StrategyConfig = {
    default: env.DEFAULT_STRATEGY,
    liquiditySniper,
  }

  const risk: RiskConfig = {
    allowMints: env.ALLOW_MINTS,
    denyMints: env.DENY_MINTS,
    minLiquidityUsd: env.MIN_LIQ_USD,
    maxOpenPositions: env.MAX_OPEN_POSITIONS,
    maxTradesPerMinute: env.MAX_TRADES_PER_MIN,
    baseInputMint: env.BASE_INPUT_MINT,
  }

  const alerts: AlertConfig = {
    lowBalanceLamports: env.ALERT_LOW_BALANCE_LAMPORTS,
  }

  cachedConfig = {
    environment,
    mode,
    dryRun,
    logLevel,
    solana,
    telegram,
    strategy,
    risk,
    alerts,
  }

  return cachedConfig
}

export function reloadConfig(): BotConfig {
  cachedConfig = null
  return getConfig()
}
