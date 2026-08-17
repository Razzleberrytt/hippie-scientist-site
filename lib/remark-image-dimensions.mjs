/**
 * Stamp intrinsic width and height onto markdown images.
 *
 * Article bodies are MDX, and `![alt](/images/…jpg)` compiles to a bare `<img>`
 * with no dimensions. Nothing reserves space for it, so every one of the 19
 * article images reflows the page when it loads — text below jumps as the
 * picture appears. That is the layout shift Core Web Vitals measures.
 *
 * The dimensions are read from the file itself rather than guessed, so an image
 * that is later replaced with a different aspect ratio cannot silently keep a
 * stale ratio.
 *
 * Deliberately dependency-free. `unist-util-visit` and `image-size` are both
 * present in the tree but only as transitive dependencies of other packages, so
 * importing either would break on an unrelated dependency bump. The tree walk
 * and the header parsers below are small enough to own.
 */

import fs from 'node:fs'
import path from 'node:path'

/**
 * Intrinsic size from a JPEG's Start-Of-Frame marker.
 *
 * JPEG is a chain of segments: 0xFF, a marker byte, then a big-endian length.
 * Any SOF marker carries the dimensions, except the four that are not frame
 * descriptors: DHT, JPG, DAC, and the restart markers.
 *
 * @param {Buffer} buf
 * @returns {{ width: number, height: number } | null}
 */
function jpegSize(buf) {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null
  let offset = 2
  while (offset + 9 < buf.length) {
    if (buf[offset] !== 0xff) {
      offset += 1
      continue
    }
    const marker = buf[offset + 1]
    // SOF0-SOF15 carry frame dimensions; 0xC4, 0xC8 and 0xCC do not.
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) }
    }
    const length = buf.readUInt16BE(offset + 2)
    if (length < 2) return null
    offset += 2 + length
  }
  return null
}

/**
 * Intrinsic size from a PNG IHDR chunk, which is always first and fixed-offset.
 *
 * @param {Buffer} buf
 * @returns {{ width: number, height: number } | null}
 */
function pngSize(buf) {
  if (buf.length < 24) return null
  if (buf.readUInt32BE(0) !== 0x89504e47) return null
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
}

/**
 * @param {string} file
 * @returns {{ width: number, height: number } | null}
 */
export function readImageSize(file) {
  let buf
  try {
    // 64KB covers the header of every format handled here.
    const handle = fs.openSync(file, 'r')
    buf = Buffer.alloc(65536)
    const read = fs.readSync(handle, buf, 0, 65536, 0)
    fs.closeSync(handle)
    buf = buf.subarray(0, read)
  } catch {
    return null
  }
  return pngSize(buf) ?? jpegSize(buf)
}

/** Walk every node in an mdast tree. */
function visitImages(node, onImage) {
  if (!node || typeof node !== 'object') return
  if (node.type === 'image') onImage(node)
  for (const child of node.children ?? []) visitImages(child, onImage)
}

/**
 * Remark plugin. Sets `hProperties` on image nodes, which remark-rehype copies
 * onto the rendered element.
 *
 * @param {{ publicDir?: string }} [options]
 */
export default function remarkImageDimensions(options = {}) {
  const publicDir = options.publicDir ?? path.join(process.cwd(), 'public')
  const cache = new Map()

  return (tree) => {
    visitImages(tree, (node) => {
      const src = String(node.url ?? '')
      // Only site-local images can be measured; remote ones are left alone.
      if (!src.startsWith('/') || src.startsWith('//')) return

      if (!cache.has(src)) {
        cache.set(src, readImageSize(path.join(publicDir, src.split('?')[0])))
      }
      const size = cache.get(src)
      if (!size?.width || !size?.height) return

      node.data = node.data ?? {}
      node.data.hProperties = { ...(node.data.hProperties ?? {}), width: size.width, height: size.height }
    })
  }
}
