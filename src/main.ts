import { createServer } from 'node:http'

import { Bot } from './core/bot.ts'
import { getConfig } from './core/config.ts'
import { createLogger } from './core/logger.ts'
import { startAlerts } from './ops/alerts.ts'
import { startTelegramOps } from './ops/telegram.ts'

const logger = createLogger('Main')

function startHealthServer(port: number): void {
  const server = createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }))
      return
    }

    res.writeHead(404)
    res.end()
  })

  server.listen(port, () => {
    logger.info(`Health server listening on ${port}`)
  })
}

async function bootstrap(): Promise<void> {
  const config = getConfig()
  logger.info(`Booting SnipeBT (mode=${config.mode})`)

  const bot = Bot.create()
  const telegram = startTelegramOps()
  const alertHandle = startAlerts({ minLamports: config.alerts.lowBalanceLamports })

  await bot.start()
  startHealthServer(Number(process.env.PORT ?? 8080))

  const shutdown = async () => {
    logger.info('Shutting down...')
    if (alertHandle) {
      clearInterval(alertHandle)
    }

    if (telegram) {
      telegram.stopPolling()
    }

    await bot.stop()
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

bootstrap().catch(error => {
  logger.error('Fatal error while starting bot.', error)
  process.exit(1)
})
