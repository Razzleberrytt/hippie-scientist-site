import { AbstractStrategy, StrategyContext } from './baseStrategy'
import { MarketQuote, TradeSignal } from '../types/trading'

const WINDOW = 5

export class MeanReversionStrategy extends AbstractStrategy {
  private window: number[] = []

  constructor() {
    super('meanReversion')
  }

  evaluate(quote: MarketQuote, _context: StrategyContext): TradeSignal | null {
    this.window.push(quote.price)
    if (this.window.length > WINDOW) {
      this.window.shift()
    }
    if (this.window.length < WINDOW) {
      return null
    }

    const mean = this.window.reduce((sum, value) => sum + value, 0) / this.window.length
    const deviation = (quote.price - mean) / mean

    if (deviation <= -0.02) {
      return {
        strategy: this.name,
        action: 'BUY',
        confidence: Math.min(1, Math.abs(deviation) * 8),
        targetPrice: mean,
        stopLossPrice: quote.price * 0.8,
      }
    }

    if (deviation >= 0.02) {
      return {
        strategy: this.name,
        action: 'SELL',
        confidence: Math.min(1, Math.abs(deviation) * 8),
        targetPrice: mean,
        stopLossPrice: quote.price * 1.2,
      }
    }

    return null
  }
}
