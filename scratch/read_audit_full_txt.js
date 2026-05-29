import fs from 'fs';
import path from 'path';

const filePath = 'C:\\Users\\Will\\.gemini\\antigravity\\brain\\bf13f34e-06a8-4394-8bb4-3964526fb24c\\scratch\\audit-full.txt';
try {
  const content = fs.readFileSync(filePath, 'utf16le');
  const destPath = 'c:\\hippies\\scratch\\audit-full-decoded.md';
  fs.writeFileSync(destPath, content, 'utf8');
  console.log('Successfully wrote decoded audit-full to', destPath);
} catch (e) {
  console.error(e);
}
