import { getConfig } from './config'
import { createLogger } from './logger'
import { sendErrorAlert, sendTradeAlert } from '../alerts'
import { BaseStrategy, StrategyContext } from '../strategies/baseStrategy'
import { liquiditySniperStrategy } from '../strategies/liquiditySniper'

export type StrategyRegistry = Record<string, BaseStrategy>

const defaultStrategies: StrategyRegistry = {
  liquiditySniper: liquiditySniperStrategy,
}

export class Bot {
  private readonly logger = createLogger('Bot')
  private readonly strategy: BaseStrategy
  private readonly context: StrategyContext

  constructor(strategy: BaseStrategy, context: StrategyContext) {
    this.strategy = strategy
    this.context = context
  }

  static create(strategyName?: string, strategies: StrategyRegistry = defaultStrategies): Bot {
    const config = getConfig()
    const selectedName = strategyName ?? config.strategy.default
    const strategy = strategies[selectedName]

    if (!strategy) {
      throw new Error(`Strategy "${selectedName}" is not registered.`)
    }

    const context: StrategyContext = {
      config,
      logger: createLogger(`Strategy:${strategy.name}`),
      sendTradeAlert,
      sendErrorAlert,
    }

    return new Bot(strategy, context)
  }

  async start(): Promise<void> {
    this.logger.info(
      `Starting bot with strategy "${this.strategy.name}" (mode: ${this.context.config.mode})`
    )
    await this.strategy.initialize(this.context)
    await this.strategy.start(this.context)
  }

  async stop(): Promise<void> {
    this.logger.info(`Stopping bot with strategy "${this.strategy.name}"`)
    await this.strategy.stop(this.context)
  }
}
