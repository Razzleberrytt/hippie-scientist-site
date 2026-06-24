import fs from 'node:fs'
import path from 'node:path'

// Helper to case-insensitively check for leaked tags
function validateQuestion(question, pageRoute) {
  const lowercaseQ = question.toLowerCase();
  
  // Known internal taxonomy labels/patterns
  const badPatterns = [
    'decisions',
    'resilience decisions',
    'optimization decisions',
    'enhancement decisions',
    'management decisions'
  ];

  for (const pattern of badPatterns) {
    if (lowercaseQ.includes(pattern)) {
      // Allow if it ends with "decisions?" or similar as a standalone word, but block if mid-sentence.
      const patternIdx = lowercaseQ.indexOf(pattern);
      const endsWithPattern = lowercaseQ.endsWith(pattern) || lowercaseQ.endsWith(pattern + '?') || lowercaseQ.endsWith(pattern + ' ?');
      if (patternIdx !== -1 && !endsWithPattern) {
        return `Leaked taxonomy pattern "${pattern}" mid-sentence in FAQ question: "${question}" on route: ${pageRoute}`;
      }
    }
  }
  return null;
}

function main() {
  const goalsContent = fs.readFileSync('data/goals.ts', 'utf8');
  
  console.log('[validate-guide-faqs] Running FAQ safety checks...');
  
  // Let's parse data/goals.ts for titles.
  const goalTitleRegex = /title:\s*['"](.*?)['"]/g;
  let match;
  const goalTitles = [];
  while ((match = goalTitleRegex.exec(goalsContent)) !== null) {
    goalTitles.push(match[1]);
  }

  // cleanGoalForFaq function replication
  function cleanGoalForFaq(goalTitle) {
    let g = goalTitle.toLowerCase();
    g = g.replace(/\s+support\s+decisions$/, '')
    g = g.replace(/\s+resilience\s+decisions$/, ' resilience')
    g = g.replace(/\s+enhancement\s+decisions$/, ' enhancement')
    g = g.replace(/\s+decisions$/, '')
    g = g.replace(/\s+and\s+cellular\s+health$/, '')
    return g.trim();
  }

  let failed = false;
  const errors = [];

  // 1. Validate cleaned goal titles in generated FAQs
  for (const title of goalTitles) {
    const plainGoal = cleanGoalForFaq(title);
    const questions = [
      `Do ${plainGoal} supplements actually work?`,
      `How long do ${plainGoal} supplements take to work?`,
      `Can I combine multiple ${plainGoal} supplements?`
    ];

    for (const q of questions) {
      const err = validateQuestion(q, `Generated FAQ for goal: ${title}`);
      if (err) {
        errors.push(err);
        failed = true;
      }
    }
  }

  // 2. Also check if the built HTML files in out/ contain any leaked taxonomy FAQs (post-build verification)
  const outDir = path.join(process.cwd(), 'out');
  const FULL_HTML_AUDIT = process.env.FULL_HTML_AUDIT === '1' || process.env.CI === 'true';
  if (fs.existsSync(outDir)) {
    console.log('[validate-guide-faqs] Built output found. Auditing HTML files...');
    
    function auditHtmlFile(res) {
      console.log('Auditing HTML file:', res);
      const html = fs.readFileSync(res, 'utf8');
      if (!html.includes('"FAQPage"')) return;
      
      // Match FAQPage schema using non-backtracking string splits
      let parts = html.split('<script type="application/ld+json">');
      if (parts.length === 1) {
        parts = html.split("<script type='application/ld+json'>");
      }
      for (let i = 1; i < parts.length; i++) {
        const endIdx = parts[i].indexOf('</script>');
        if (endIdx === -1) continue;
        const content = parts[i].slice(0, endIdx).trim();
        try {
          const parsed = JSON.parse(content);
          const schemas = Array.isArray(parsed) ? parsed : [parsed];
          for (const schema of schemas) {
            if (schema['@type'] === 'FAQPage' && Array.isArray(schema.mainEntity)) {
              for (const qa of schema.mainEntity) {
                if (qa['@type'] === 'Question' && qa.name) {
                  const err = validateQuestion(qa.name, path.relative(outDir, res));
                  if (err) {
                    errors.push(err);
                    failed = true;
                  }
                }
              }
            }
          }
        } catch (e) {
          // Ignore non-FAQ LD+JSON tags
        }
      }
    }

    function checkHtmlFiles(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const res = path.resolve(dir, entry.name);
        if (entry.isDirectory()) {
          if (['_next', 'blogdata'].includes(entry.name)) continue;
          checkHtmlFiles(res);
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
          auditHtmlFile(res);
        }
      }
    }
    
    if (!FULL_HTML_AUDIT) {
      console.log('[validate-guide-faqs] Running in targeted mode. Scanning critical guide/FAQ pages (use FULL_HTML_AUDIT=1 to audit all files).');
      const criticalFiles = [
        'index.html',
        'faq/index.html',
        'articles/best-supplements-for-adhd/index.html',
        'articles/adhd-stack-guide/index.html',
        'guides/index.html'
      ].map(p => path.join(outDir, p)).filter(fs.existsSync);
      for (const f of criticalFiles) {
        auditHtmlFile(f);
      }
    } else {
      checkHtmlFiles(outDir);
    }
  }

  if (failed) {
    console.error('[validate-guide-faqs] FAIL: Detected guide FAQ questions containing leaked internal labels:');
    errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  }

  console.log('[validate-guide-faqs] PASS: All guide FAQ questions are clean of internal taxonomy leaks.');
}

main();
