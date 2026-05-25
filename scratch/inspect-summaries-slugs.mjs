import fs from 'node:fs';
import path from 'node:path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (file.endsWith('.json')) {
      results.push(filePath);
    }
  });
  return results;
}

const jsonFiles = walk('public/data');
console.log(`Found ${jsonFiles.length} JSON files to inspect.`);

for (const file of jsonFiles) {
  try {
    const content = JSON.parse(fs.readFileSync(file, 'utf8'));
    const records = Array.isArray(content) ? content : (typeof content === 'object' && content !== null ? [content] : []);
    
    // We also check keys in case the file is an object map
    if (typeof content === 'object' && content !== null && !Array.isArray(content)) {
      for (const [key, value] of Object.entries(content)) {
        if (key.includes(' ')) {
          console.log(`Unslugified key found: "${key}" in ${file}`);
        }
        if (value && typeof value === 'object') {
          if (value.slug && value.slug.includes(' ')) {
            console.log(`Unslugified slug in map object: "${value.slug}" under key "${key}" in ${file}`);
          }
        }
      }
    }

    for (const record of records) {
      if (record && typeof record === 'object') {
        if (record.slug && typeof record.slug === 'string' && record.slug.includes(' ')) {
          console.log(`Unslugified slug found: "${record.slug}" in ${file}`);
        }
        // Also check if any nested records have slugs with spaces
        for (const [key, val] of Object.entries(record)) {
          if (Array.isArray(val)) {
            for (const item of val) {
              if (item && typeof item === 'object' && item.slug && typeof item.slug === 'string' && item.slug.includes(' ')) {
                console.log(`Unslugified nested slug found: "${item.slug}" under key "${key}" in ${file}`);
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.error(`Error parsing ${file}:`, err.message);
  }
}
