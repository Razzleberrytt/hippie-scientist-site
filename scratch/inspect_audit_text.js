import fs from 'fs';
import path from 'path';

const filePath = 'C:\\Users\\Will\\.gemini\\antigravity\\brain\\bf13f34e-06a8-4394-8bb4-3964526fb24c\\scratch\\audit-text.txt';
try {
  // Let's check encoding of file. It might be UTF-16 LE
  const stat = fs.statSync(filePath);
  console.log('Size:', stat.size);
  
  const buf = fs.readFileSync(filePath);
  // Detect encoding
  if (buf[0] === 0xFF && buf[1] === 0xFE) {
    console.log('Detected UTF-16 LE');
    const content = buf.toString('utf16le');
    console.log('Content length:', content.length);
    console.log('First 200 chars:', JSON.stringify(content.slice(0, 200)));
  } else {
    console.log('No BOM detected. First 200 bytes as string (utf8):', JSON.stringify(buf.toString('utf8', 0, 200)));
  }
} catch (e) {
  console.error(e);
}
