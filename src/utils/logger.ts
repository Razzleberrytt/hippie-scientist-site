import { appendFile, mkdir } from 'fs/promises'
import { dirname } from 'path'

const logFilePath = process.env.LOG_FILE ?? 'logs/session.log'

const ensureDirectory = async (filePath: string): Promise<void> => {
  const dir = dirname(filePath)
  await mkdir(dir, { recursive: true })
}

const write = async (level: string, message: string): Promise<void> => {
  const timestamp = new Date().toISOString()
  const line = `[${timestamp}] [${level}] ${message}\n`
  process.stdout.write(line)
  try {
    await appendFile(logFilePath, line, 'utf8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      await ensureDirectory(logFilePath)
      await appendFile(logFilePath, line, 'utf8')
    }
  }
}

export const logger = {
  info: (message: string) => write('INFO', message),
  warn: (message: string) => write('WARN', message),
  error: (message: string) => write('ERROR', message),
  success: (message: string) => write('SUCCESS', message),
}
