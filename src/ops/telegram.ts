import TelegramBot from 'node-telegram-bot-api'

import { getConfig } from '../core/config.ts'
import { createLogger } from '../core/logger.ts'
import { liquidateAll } from '../liquidation/index.ts'
import { listOpen } from '../positions/index.ts'

const logger = createLogger('TelegramOps')

function formatPositionsMessage(): Promise<string> {
  return listOpen().then(positions => {
    if (positions.length === 0) {
      return 'No open positions.'
    }

    const lines = positions.map(position => {
      const price = position.entryPriceUsd ? `@$${position.entryPriceUsd?.toFixed(4)}` : ''
      return `• ${position.baseMint} ${price} (amount ${position.amount})`
    })

    return ['Open positions:', ...lines].join('\n')
  })
}

function verifyChat(chatId: number): boolean {
  const config = getConfig()
  if (!config.telegram.chatId) {
    return false
  }

  return String(chatId) === config.telegram.chatId
}

export function startTelegramOps(): TelegramBot | null {
  const config = getConfig()
  if (!config.telegram.enabled || !config.telegram.botToken) {
    logger.info('Telegram operations disabled: missing bot configuration.')
    return null
  }

  const bot = new TelegramBot(config.telegram.botToken, { polling: true })

  bot.onText(/^\/positions$/, async msg => {
    if (!verifyChat(msg.chat.id)) {
      return
    }

    const text = await formatPositionsMessage()
    await bot.sendMessage(msg.chat.id, text)
  })

  bot.onText(/^\/liquidate_all(?:\s+(\S+))?$/, async (msg, match) => {
    if (!verifyChat(msg.chat.id)) {
      return
    }

    const baseMint = match?.[1]
    if (config.dryRun) {
      logger.info('DRY-RUN blocked liquidation request.')
      await bot.sendMessage(msg.chat.id, 'DRY-RUN blocked')
      return
    }

    const results = await liquidateAll({
      userPublicKey: config.solana.walletPublicKey,
      baseMint,
    })

    if (results.length === 0) {
      await bot.sendMessage(msg.chat.id, 'No positions available for liquidation.')
      return
    }

    const summary = results
      .map(result => `${result.id}: ${result.status}${result.txId ? ` (${result.txId})` : ''}`)
      .join('\n')

    await bot.sendMessage(msg.chat.id, `Liquidation results:\n${summary}`)
  })

  bot.onText(/^\/sell\s+(\S+)\s+(\S+)/, async (msg, match) => {
    if (!verifyChat(msg.chat.id)) {
      return
    }

    const baseMint = match?.[1]
    const amountRaw = match?.[2]
    const amount = amountRaw ? Number(amountRaw) : NaN

    if (!baseMint || Number.isNaN(amount)) {
      await bot.sendMessage(msg.chat.id, 'Usage: /sell <MINT> <AMOUNT>')
      return
    }

    if (config.dryRun) {
      logger.info(`DRY-RUN blocked manual sell for ${baseMint} amount ${amount}`)
      await bot.sendMessage(msg.chat.id, 'DRY-RUN blocked')
      return
    }

    logger.info(`Manual sell requested for ${baseMint} amount ${amount}`)
    await bot.sendMessage(msg.chat.id, `Sell order queued for ${baseMint} (${amount}).`)
  })

  bot.on('polling_error', error => {
    logger.error('Telegram polling error', error)
  })

  logger.info('Telegram operations running.')
  return bot
}
