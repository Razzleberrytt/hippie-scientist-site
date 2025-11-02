import { TelegramAlerts } from '../alerts/telegram'
import { MultiApiDiscovery } from '../discovery/multiApiDiscovery'
import { RiskManager } from '../risk/riskManager'
import { SessionTracker } from '../risk/sessionTracker'
import { RugcheckGate } from '../safety/rugcheck'
import { availableStrategies, createStrategies } from '../strategies'
import { TradingStrategy } from '../strategies/baseStrategy'
import { SessionConfig, StrategyConfig, TokenPair } from '../types/trading'
import { logger } from '../utils/logger'

export type SessionOptions = {
  envConfig: {
    telegramBotToken?: string
    telegramChatId?: string
    raydiumApiUrl: string
    jupiterApiUrl: string
    orcaApiUrl: string
    rugcheckApiUrl: string
    sessionTargetPct: number
    sessionTierPct: number
    accountRiskPct: number
    stopLossPct: number
    maxConcurrentTrades: number
    strategies: string[]
  }
  tokenPair: TokenPair
  accountBalance: number
  strategyConfigs: StrategyConfig[]
}

export class TradingSession {
  private alerts: TelegramAlerts
  private discovery: MultiApiDiscovery
  private strategies: TradingStrategy[]
  private risk: RiskManager
  private tracker: SessionTracker
  private rugcheck: RugcheckGate

  constructor(private options: SessionOptions) {
    const sessionConfig: SessionConfig = {
      maxConcurrentTrades: options.envConfig.maxConcurrentTrades,
      accountRiskPct: options.envConfig.accountRiskPct,
      stopLossPct: options.envConfig.stopLossPct,
      sessionTargetPct: options.envConfig.sessionTargetPct,
      sessionTierPct: options.envConfig.sessionTierPct,
    }
    this.alerts = new TelegramAlerts(
      options.envConfig.telegramBotToken,
      options.envConfig.telegramChatId
    )
    this.discovery = new MultiApiDiscovery(
      options.envConfig.raydiumApiUrl,
      options.envConfig.jupiterApiUrl,
      options.envConfig.orcaApiUrl
    )
    this.strategies = createStrategies(options.envConfig.strategies, options.strategyConfigs)
    this.risk = new RiskManager(sessionConfig)
    this.tracker = new SessionTracker(sessionConfig)
    this.rugcheck = new RugcheckGate(options.envConfig.rugcheckApiUrl)
  }

  availableStrategies(): string[] {
    return availableStrategies
  }

  async run(): Promise<void> {
    await logger.info(
      `Starting session for ${this.options.tokenPair.baseMint}/${this.options.tokenPair.quoteMint}`
    )
    await logger.info(
      `Active strategies: ${this.strategies.map(strategy => strategy.name).join(', ')}`
    )

    const liquidity = await this.discovery.discover(this.options.tokenPair, {
      minimumLiquidityUsd: 10000,
      slippageBps: 30,
    })

    if (!liquidity) {
      await this.alerts.notifyError(
        'No liquidity found across Raydium/Jupiter/Orca. Session aborted.'
      )
      return
    }

    const isSafe = await this.rugcheck.validateToken(this.options.tokenPair.baseMint)
    if (!isSafe) {
      await this.alerts.notifyError('Rugcheck rejected token. Session aborted.')
      return
    }

    for (const strategy of this.strategies) {
      const signal = strategy.evaluate(liquidity, {
        portfolioValue: this.options.accountBalance,
        accountBalance: this.options.accountBalance,
      })

      if (!signal) {
        continue
      }

      if (signal.confidence < 0.5) {
        await logger.info(`Skipping ${strategy.name} due to low confidence ${signal.confidence}`)
        continue
      }

      if (!this.risk.canEnter()) {
        await logger.warn('Max concurrent trades reached. Skipping signal.')
        break
      }

      const allocation = this.risk.allocationPerTrade(this.options.accountBalance)
      const size = allocation / liquidity.price
      const position = this.risk.registerFill(
        this.options.tokenPair.baseMint,
        liquidity.price,
        size
      )
      await this.alerts.notifyBuy(
        this.options.tokenPair.baseMint,
        position.entryPrice,
        position.size
      )
      await logger.success(
        `Entered ${this.options.tokenPair.baseMint} at ${position.entryPrice.toFixed(6)} size ${position.size.toFixed(4)}`
      )

      const stopLoss = this.risk.calculateStopLoss(position.entryPrice)
      await logger.info(
        `Stop loss set at ${stopLoss.toFixed(6)} (${this.options.envConfig.stopLossPct}% trailing)`
      )

      const pnlPct = (liquidity.price - position.entryPrice) / position.entryPrice
      if (pnlPct >= this.options.envConfig.sessionTargetPct / 100) {
        this.tracker.recordRealized(pnlPct)
        this.risk.closePosition(position.tokenMint)
        await this.alerts.notifySell(position.tokenMint, liquidity.price, position.size, pnlPct)
        await this.alerts.notifyPnl(this.tracker.summary().realized, this.tracker.nextTierTarget())
      } else {
        this.tracker.updateUnrealized(pnlPct)
      }
    }

    const summary = this.tracker.summary()
    await logger.info(
      `Session complete. Realized PnL ${(summary.realized * 100).toFixed(2)}%, Unrealized ${(summary.unrealized * 100).toFixed(2)}%`
    )
  }
}
