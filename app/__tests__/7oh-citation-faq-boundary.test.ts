import fs from 'node:fs'
import path from 'node:path'
import {describe,expect,it} from 'vitest'
const faq=fs.readFileSync(path.join(process.cwd(),'content/articles/7-hydroxymitragynine-faq.mdx'),'utf8')
const monograph=fs.readFileSync(path.join(process.cwd(),'content/articles/7-hydroxymitragynine.mdx'),'utf8')
describe('7-OH FAQ companion publication boundary',()=>{
 it('preserves the existing 7-OH monograph as separate slug',()=>{expect(monograph).toContain('slug: "7-hydroxymitragynine"');expect(faq).toContain('slug: "7-hydroxymitragynine-faq"');expect(faq).toContain('](/articles/7-hydroxymitragynine/)')})
 it('provides 45 unique question headings and aligned frontmatter',()=>{const headings=[...faq.matchAll(/^## (.+\\?)$/gm)].map(m=>m[1]);expect(headings).toHaveLength(45);expect(new Set(headings).size).toBe(45);const fm=faq.split('---')[1];const q=fm.split('citationQuestions:')[1].split('canonicalConcepts:')[0];expect([...q.matchAll(/^  - "/gm)]).toHaveLength(45)})
 it('distinguishes existing controls and future proposals',()=>{expect(faq).toContain('existing August 26 Schedule I order');expect(faq).toContain('not yet active legal exemptions');expect(faq).toContain('verify the actual Federal Register notice')})
})
