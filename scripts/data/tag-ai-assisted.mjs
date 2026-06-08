import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const blogDir = 'content/blog';
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.mdx') || f.endsWith('.md'));

for (const file of files) {
  const filePath = path.join(blogDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Parse frontmatter
  const parsed = matter(content);
  if (parsed.data && parsed.data.ai_assisted === undefined) {
    parsed.data.ai_assisted = true;
    
    // Stringify back to MDX
    const updatedContent = matter.stringify(parsed.content, parsed.data);
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Tagged: ${file}`);
  }
}

console.log('AI-assisted tagging complete.');
