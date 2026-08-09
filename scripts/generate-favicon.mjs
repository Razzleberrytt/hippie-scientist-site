import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourcePath = path.join(projectRoot, 'public', 'favicon.svg')
const outputPath = path.join(projectRoot, 'public', 'favicon.ico')
const sizes = [16, 32, 48]

const source = await readFile(sourcePath)
const images = await Promise.all(
  sizes.map((size) =>
    sharp(source)
      .resize(size, size)
      .png({ compressionLevel: 9, palette: true })
      .toBuffer(),
  ),
)

const directorySize = 6 + images.length * 16
const directory = Buffer.alloc(directorySize)
directory.writeUInt16LE(0, 0)
directory.writeUInt16LE(1, 2)
directory.writeUInt16LE(images.length, 4)

let imageOffset = directorySize
images.forEach((image, index) => {
  const entryOffset = 6 + index * 16
  const size = sizes[index]
  directory.writeUInt8(size === 256 ? 0 : size, entryOffset)
  directory.writeUInt8(size === 256 ? 0 : size, entryOffset + 1)
  directory.writeUInt8(0, entryOffset + 2)
  directory.writeUInt8(0, entryOffset + 3)
  directory.writeUInt16LE(1, entryOffset + 4)
  directory.writeUInt16LE(32, entryOffset + 6)
  directory.writeUInt32LE(image.length, entryOffset + 8)
  directory.writeUInt32LE(imageOffset, entryOffset + 12)
  imageOffset += image.length
})

await writeFile(outputPath, Buffer.concat([directory, ...images]))
console.log(`Generated ${path.relative(projectRoot, outputPath)} (${sizes.join(', ')}px)`)
