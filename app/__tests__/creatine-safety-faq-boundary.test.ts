import fs from 'node:fs'
import path from 'node:path'
import {describe,expect,it} from 'vitest'
const article=fs.readFileSync(path.join(process.cwd(),'content/articles/creatine-safety-myths-evidence.mdx'),'utf8')
describe('creatine evidence FAQ gate',()=>{
 it('preserves separate slug',()=>expect(article).toContain('slug: "creatine-safety-myths-evidence"'))
 it('has 48 unique H2 QAs and 48 citationQuestions',()=>{const heads=[...article.matchAll(/^## (.+\?)$/gm)].map(m=>m[1]);expect(heads).toHaveLength(48);expect(new Set(heads).size).toBe(48);const questions=article.split('citationQuestions:')[1].split('canonicalConcepts:')[0];expect([...questions.matchAll(/^  - "/gm)]).toHaveLength(48)})
 it('does not conflate cystatin C and measured GFR',()=>{expect(article).toContain('Gualano 2008 did not directly measure GFR');expect(article).toContain('42507286')})
})
