import { getConfig } from '../core/config.ts'
import { createLogger } from '../core/logger.ts'

const logger = createLogger('TelegramAlerts')

let hasWarnedMissingConfig = false

async function postMessage(text: string): Promise<boolean> {
  const { telegram } = getConfig()

  if (!telegram.enabled || !telegram.botToken || !telegram.chatId) {
    if (!hasWarnedMissingConfig) {
      logger.warn('Telegram alerts disabled: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set.')
      hasWarnedMissingConfig = true
    }

    return false
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${telegram.botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: telegram.chatId,
        text,
        disable_web_page_preview: true,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      logger.warn(
        `Failed to send Telegram alert: ${response.status} ${response.statusText} - ${errorText}`
      )
      return false
    }

    return true
  } catch (error) {
    logger.error('Failed to send Telegram alert.', error)
    return false
  }
}

function normalizeError(err: unknown): string {
  if (err instanceof Error) {
    return err.stack ?? err.message
  }

  if (typeof err === 'string') {
    return err
  }

  try {
    return JSON.stringify(err)
  } catch {
    return String(err)
  }
}

export async function sendTradeAlert(message: string): Promise<boolean> {
  return postMessage(`🚀 Trade Alert\n${message}`)
}

export async function sendErrorAlert(error: unknown): Promise<boolean> {
  const message = normalizeError(error)
  return postMessage(`⚠️ Bot Error\n${message}`)
}
