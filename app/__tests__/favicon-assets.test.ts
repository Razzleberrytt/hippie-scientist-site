import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const projectRoot = process.cwd()
const faviconPath = path.join(projectRoot, 'public', 'favicon.ico')

describe('favicon assets', () => {
  it('ships a valid multi-size ICO at the conventional browser path', () => {
    const favicon = fs.readFileSync(faviconPath)

    expect([...favicon.subarray(0, 4)]).toEqual([0, 0, 1, 0])

    const imageCount = favicon.readUInt16LE(4)
    expect(imageCount).toBe(3)

    const sizes = Array.from({ length: imageCount }, (_, index) => {
      const entryOffset = 6 + index * 16
      const width = favicon.readUInt8(entryOffset) || 256
      const height = favicon.readUInt8(entryOffset + 1) || 256
      const byteLength = favicon.readUInt32LE(entryOffset + 8)
      const imageOffset = favicon.readUInt32LE(entryOffset + 12)

      expect(imageOffset + byteLength).toBeLessThanOrEqual(favicon.length)
      expect([...favicon.subarray(imageOffset, imageOffset + 8)]).toEqual([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      ])

      return `${width}x${height}`
    })

    expect(sizes).toEqual(['16x16', '32x32', '48x48'])
  })

  it('declares the ICO and scalable source in root metadata', () => {
    const layout = fs.readFileSync(path.join(projectRoot, 'app', 'layout.tsx'), 'utf8')

    expect(layout).toContain("url: '/favicon.ico'")
    expect(layout).toContain("url: '/favicon.svg'")
  })
})
