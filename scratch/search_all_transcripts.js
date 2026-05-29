import fs from 'fs';
import path from 'path';
import readline from 'readline';

const brainDir = 'C:\\Users\\Will\\.gemini\\antigravity\\brain';

async function scanFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let index = 0;
  for await (const line of rl) {
    index++;
    if (line.includes('Here is the complete audit report for **The Hippie Scientist**')) {
      try {
        const obj = JSON.parse(line);
        console.log(`File: ${path.basename(path.dirname(path.dirname(filePath)))}, Step ${index}: type=${obj.type}, content length=${obj.content ? obj.content.length : 'none'}`);
        if (obj.content && obj.content.length > 5000) {
          const outFile = `c:\\hippies\\scratch\\found-untruncated-audit-${path.basename(path.dirname(path.dirname(filePath)))}-${index}.md`;
          fs.writeFileSync(outFile, obj.content, 'utf8');
          console.log(`Saved long version to ${outFile}`);
        }
      } catch (e) {
        console.log(`Step ${index} JSON Parse Error: ${e.message}`);
      }
    }
  }
}

async function run() {
  const dirs = fs.readdirSync(brainDir);
  for (const d of dirs) {
    const transcriptPath = path.join(brainDir, d, '.system_generated', 'logs', 'transcript.jsonl');
    if (fs.existsSync(transcriptPath)) {
      await scanFile(transcriptPath);
    }
    // Also scan any jsonl files in logs directory
    const logsDir = path.join(brainDir, d, '.system_generated', 'logs');
    if (fs.existsSync(logsDir)) {
      fs.readdirSync(logsDir).forEach(async (f) => {
        if (f.endsWith('.jsonl') && f !== 'transcript.jsonl') {
          await scanFile(path.join(logsDir, f));
        }
      });
    }
  }
}

run().catch(console.error);
