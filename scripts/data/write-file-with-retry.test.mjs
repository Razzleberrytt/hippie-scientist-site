import { describe, expect, it, vi } from 'vitest'
import { writeFileSyncWithTransientRetry, writeFileWithTransientRetry } from './write-file-with-retry.mjs'

describe('writeFileWithTransientRetry', () => {
  it('retries transient Windows file locks and then succeeds', async () => {
    const transient = Object.assign(new Error('locked'), { code: 'UNKNOWN' })
    const writeFile = vi.fn()
      .mockRejectedValueOnce(transient)
      .mockRejectedValueOnce(transient)
      .mockResolvedValue(undefined)
    const delay = vi.fn().mockResolvedValue(undefined)

    await writeFileWithTransientRetry('generated.json', '{}\n', 'utf8', { writeFile, delay })

    expect(writeFile).toHaveBeenCalledTimes(3)
    expect(delay).toHaveBeenNthCalledWith(1, 25)
    expect(delay).toHaveBeenNthCalledWith(2, 50)
  })

  it('does not retry a non-transient failure', async () => {
    const failure = Object.assign(new Error('disk full'), { code: 'ENOSPC' })
    const writeFile = vi.fn().mockRejectedValue(failure)

    await expect(writeFileWithTransientRetry('generated.json', '{}\n', 'utf8', { writeFile }))
      .rejects.toBe(failure)
    expect(writeFile).toHaveBeenCalledTimes(1)
  })

  it('retries transient synchronous write locks', () => {
    const transient = Object.assign(new Error('locked'), { code: 'EBUSY' })
    const writeFileSync = vi.fn()
      .mockImplementationOnce(() => { throw transient })
      .mockImplementationOnce(() => undefined)
    const delay = vi.fn()

    writeFileSyncWithTransientRetry('generated.json', '{}\n', 'utf8', { writeFileSync, delay })

    expect(writeFileSync).toHaveBeenCalledTimes(2)
    expect(delay).toHaveBeenCalledWith(25)
  })
})
