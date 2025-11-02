import { StrategyConfig } from '../types/trading'
import { TradingStrategy } from './baseStrategy'
import { MomentumStrategy } from './momentumStrategy'
import { MeanReversionStrategy } from './meanReversionStrategy'
import { SniperStrategy } from './sniperStrategy'

const registry: Record<string, () => TradingStrategy> = {
  momentum: () => new MomentumStrategy(),
  meanReversion: () => new MeanReversionStrategy(),
  sniper: () => new SniperStrategy(),
}

export const availableStrategies = Object.keys(registry)

export const createStrategies = (names: string[], configs: StrategyConfig[]): TradingStrategy[] => {
  const activeNames = names.length > 0 ? names : availableStrategies
  return activeNames
    .map(name => {
      const factory = registry[name]
      if (!factory) {
        return null
      }
      const strategy = factory()
      const config = configs.find(item => item.name === name)
      if (config) {
        strategy.configure(config)
      }
      return strategy
    })
    .filter((strategy): strategy is TradingStrategy => Boolean(strategy))
}
