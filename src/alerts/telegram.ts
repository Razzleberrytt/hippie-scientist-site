import { logger } from '../utils/logger'

type AlertPayload = {
  title: string
  body: string
}

export class TelegramAlerts {
  constructor(
    private token?: string,
    private chatId?: string
  ) {}

  private async send(payload: AlertPayload): Promise<void> {
    if (!this.token || !this.chatId) {
      await logger.warn(`Telegram disabled: ${payload.title} :: ${payload.body}`)
      return
    }

    const message = `*${payload.title}*\n${payload.body}`
    const url = `https://api.telegram.org/bot${this.token}/sendMessage`

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Telegram returned ${response.status}: ${text}`)
      }

      await logger.info(`Telegram alert sent: ${payload.title}`)
    } catch (error) {
      await logger.error(`Failed to send Telegram alert: ${(error as Error).message}`)
    }
  }

  async notifyBuy(symbol: string, price: number, size: number): Promise<void> {
    await this.send({
      title: `BUY ${symbol}`,
      body: `Filled at ${price.toFixed(6)} for size ${size.toFixed(4)}`,
    })
  }

  async notifySell(symbol: string, price: number, size: number, pnlPct: number): Promise<void> {
    await this.send({
      title: `SELL ${symbol}`,
      body: `Filled at ${price.toFixed(6)} for size ${size.toFixed(4)}\nPnL: ${(pnlPct * 100).toFixed(2)}%`,
    })
  }

  async notifyPnl(sessionPnl: number, tierTarget: number): Promise<void> {
    await this.send({
      title: 'Session Update',
      body: `Session PnL is ${(sessionPnl * 100).toFixed(2)}%. Next tier target: ${(tierTarget * 100).toFixed(2)}%`,
    })
  }

  async notifyError(message: string): Promise<void> {
    await this.send({
      title: 'Error',
      body: message,
    })
  }
}
