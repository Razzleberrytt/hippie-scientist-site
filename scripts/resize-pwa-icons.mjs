import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const publicDir = path.join(process.cwd(), 'public');
const icon192Path = path.join(publicDir, 'icon-192x192.png');
const icon512Path = path.join(publicDir, 'icon-512x512.png');

async function resizeIcon(filePath, size) {
  if (!fs.existsSync(filePath)) {
    console.error(`Error: Icon file not found at ${filePath}`);
    return;
  }

  const metadata = await sharp(filePath).metadata();
  console.log(`Original ${path.basename(filePath)} dimensions: ${metadata.width}x${metadata.height}, size: ${fs.statSync(filePath).size} bytes`);

  if (metadata.width === size && metadata.height === size) {
    console.log(`Icon ${path.basename(filePath)} is already at the target size ${size}x${size}. Attempting re-compression.`);
  }

  // Create temporary buffer
  const buffer = await sharp(filePath)
    .resize(size, size)
    .png({ compressionLevel: 9, quality: 85 })
    .toBuffer();

  // Write resized icon back
  fs.writeFileSync(filePath, buffer);
  const newStats = fs.statSync(filePath);
  console.log(`Resized ${path.basename(filePath)} to ${size}x${size}, new size: ${newStats.size} bytes`);
}

async function main() {
  try {
    await resizeIcon(icon192Path, 192);
    await resizeIcon(icon512Path, 512);
    console.log('PWA Icons resized and optimized successfully.');
  } catch (error) {
    console.error('Error resizing PWA Icons:', error);
    process.exit(1);
  }
}

main();
