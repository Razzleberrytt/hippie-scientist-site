/* eslint-disable no-console */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

let hasWarnedMissingConfig = false

type TradeAlertKind = 'BUY' | 'SELL' | 'TP' | 'SL'

type TradeAlertPayload = {
  symbol: string
  price: number
  pnlPct?: number
  tx?: string
}

function ensureConfigured(): boolean {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    if (!hasWarnedMissingConfig) {
      console.warn('Telegram alerts disabled: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set.')
      hasWarnedMissingConfig = true
    }
    return false
  }

  return true
}

async function postMessage(text: string) {
  if (!ensureConfigured()) {
    return
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        disable_web_page_preview: true,
      }),
    })

    if (!response.ok) {
      console.error(`Failed to send Telegram alert: ${response.status} ${response.statusText}`)
    }
  } catch (error) {
    console.error('Failed to send Telegram alert:', error)
  }
}

const KIND_PREFIX: Record<TradeAlertKind, string> = {
  BUY: '🟢 BUY',
  SELL: '🔴 SELL',
  TP: '✅ TAKE PROFIT',
  SL: '⚠️ STOP LOSS',
}

export async function sendTradeAlert(kind: TradeAlertKind, details: TradeAlertPayload) {
  const { symbol, price, pnlPct, tx } = details

  const segments = [`${KIND_PREFIX[kind]} ${symbol}`, `Price: $${price.toFixed(4)}`]

  if (typeof pnlPct === 'number') {
    const formatted = pnlPct >= 0 ? `+${pnlPct.toFixed(2)}%` : `${pnlPct.toFixed(2)}%`
    segments.push(`PnL: ${formatted}`)
  }

  if (tx) {
    segments.push(`Tx: https://solscan.io/tx/${tx}`)
  }

  await postMessage(segments.join('\n'))
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

export async function sendErrorAlert(err: unknown) {
  const message = normalizeError(err)
  await postMessage(`❗ Error\n${message}`)
}
