import fs from 'node:fs';
import path from 'node:path';

function getHerbKeys(allowlist) {
  return Object.keys(allowlist);
}

function main() {
  const allowlistPath = 'lib/compound-herb-allowlist.json';
  if (!fs.existsSync(allowlistPath)) {
    console.error(`[validate-blog-compound-associations] Missing allowlist at ${allowlistPath}`);
    process.exit(0);
  }

  const allowlist = JSON.parse(fs.readFileSync(allowlistPath, 'utf8'));
  const blogDir = 'content/blog';
  
  if (!fs.existsSync(blogDir)) {
    console.log('[validate-blog-compound-associations] No blog folder found.');
    process.exit(0);
  }

  const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.mdx') || f.endsWith('.md'));
  const warnings = [];

  const patterns = [
    /active compounds like\s+([a-zA-Z0-9\-\s',]+?)(?=[.,\n_"]|$)/gi,
    /primary actives include\s+([a-zA-Z0-9\-\s',]+?)(?=[.,\n_"]|$)/gi,
    /compounds like\s+([a-zA-Z0-9\-\s',]+?)(?=[.,\n_"]|$)/gi
  ];

  for (const file of files) {
    const filePath = path.join(blogDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const lowerFile = file.toLowerCase();

    // Determine the herb of the file
    let herbKey = null;
    for (const key of Object.keys(allowlist)) {
      if (lowerFile.includes(key)) {
        herbKey = key;
        break;
      }
    }

    if (!herbKey) {
      // Try to find the herb in content
      for (const key of Object.keys(allowlist)) {
        if (content.toLowerCase().includes(key)) {
          herbKey = key;
          break;
        }
      }
    }

    if (!herbKey) {
      continue; // Skip files that don't match any known herb
    }

    const allowed = allowlist[herbKey] || [];

    for (const pattern of patterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const parsedCompound = match[1].trim().toLowerCase();
        
        // Check if this parsed compound is in the allowed list for the herb
        const isAllowed = allowed.some(allowedComp => {
          return parsedCompound.includes(allowedComp) || allowedComp.includes(parsedCompound);
        });

        if (!isAllowed) {
          warnings.push(`[WARNING] File: ${file} | Herb: "${herbKey}" | Compound: "${match[1].trim()}" is not in the allowlist.`);
        }
      }
    }
  }

  console.log('[validate-blog-compound-associations] Run finished.');
  if (warnings.length > 0) {
    console.warn(`[validate-blog-compound-associations] Found ${warnings.length} warning(s):`);
    warnings.forEach(w => console.warn(`  ${w}`));
  } else {
    console.log('[validate-blog-compound-associations] PASS: All compound-herb associations are correct according to allowlist.');
  }

  // Non-blocking exit
  process.exit(0);
}

main();
