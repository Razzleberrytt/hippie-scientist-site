import { loadConfig } from '../config'

export function maybeStartTelegram() {
  const cfg = loadConfig()
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chat = process.env.TELEGRAM_CHAT_ID
  if (!token || !chat) {
    return false
  }
  if (cfg.DRY_RUN) {
    return false
  }
  try {
    process.stdout.write('[telegram] credentials detected\n')
  } catch {
    /* ignore */
  }
  return true
}
