import fs from 'node:fs';
import path from 'node:path';

const blogDir = 'content/blog';
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.mdx') || f.endsWith('.md'));

console.log(`Found ${files.length} blog post files.`);

for (const file of files) {
  const filePath = path.join(blogDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.toLowerCase().includes('active compounds like')) {
      console.log(`File: ${file}:${idx + 1}\nLine: "${line.trim()}"\n`);
    }
  });
}
