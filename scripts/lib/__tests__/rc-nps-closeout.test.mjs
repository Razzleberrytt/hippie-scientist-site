import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import matter from 'gray-matter'

const article = slug => fs.readFileSync(`content/articles/${slug}.mdx`, 'utf8')

test('RC/NPS references cannot restore the unrelated MGM-16 review or omit its correction', () => {
  const raw = article('mgm-16')
  const { data } = matter(raw)
  assert.ok(!data.references.some(ref => String(ref.pmid) === '33717845'))
  assert.ok(data.references.some(ref => String(ref.pmid) === '32930582'))
  assert.ok(data.references.some(ref => String(ref.pmid) === '30886001'))
  assert.match(raw, /funding/i)
})

test('dated legal/WHO corrections retain their explicit boundaries', () => {
  const clob = article('clobromazolam-phenazolam')
  assert.match(clob, /September 3, 2026/)
  assert.match(clob, /newer September WHO\/UNODC agenda omits it/)
  assert.doesNotMatch(matter(clob).data.description, /under WHO.*review/i)
  assert.match(article('4-fa'), /effective February 17, 2026/)
  assert.match(article('4f-mph'), /has not established a complete 4F-MPH-specific jurisdictional determination/)
})

test('every inventoried RC/NPS article retains a real referral path and canonical related articles', () => {
  const names = fs.readdirSync('content/articles').filter(name => /\.mdx?$/.test(name))
  const all = names.map(name => matter(fs.readFileSync(`content/articles/${name}`, 'utf8')))
  const slugs = new Set(all.map(x => x.data.slug))
  const scoped = all.filter(x => ['Substance Use & Harm Reduction', 'Novel Psychoactive Substances'].includes(x.data.category))
  assert.equal(scoped.length, 92)
  for (const {data,content} of scoped) {
    assert.match(content, /1-800-662-HELP \(4357\)/, data.slug)
    assert.match(content, /https:\/\/www.samhsa.gov\/find-help\/helplines\/national-helpline/, data.slug)
    assert.match(content, /do not replace emergency care/, data.slug)
  }
  for (const slug of ['2f-dck','5f-adb','dihydro-7-hydroxy-mitragynine-mgm-15','mdmb-4en-pinaca','mitragynine-pseudoindoxyl','o-pce']) {
    for (const related of matter(article(slug)).data.relatedSlugs) assert.ok(slugs.has(related), `${slug}: ${related}`)
  }
})

test('five recovery guides cite body claims, and every withheld inventory name has a disposition', () => {
  for (const family of ['synthetic-cannabinoid','dissociative','psychedelic','entactogen-benzofuran','novel-sedative-qualone']) {
    const {data,content} = matter(fs.readFileSync(`content/articles/${family}-withdrawal-recovery-guide.md`, 'utf8'))
    assert.ok(['Low','Very Low'].includes(data.evidenceGrade), `Supported evidence badge: ${family}`)
    assert.ok((content.match(/https:\/\/pubmed\.ncbi\.nlm\.nih\.gov\/\d+\//g) || []).length >= 5, family)
  }
  const dispositions = JSON.parse(fs.readFileSync('docs/content/rc-nps-candidate-dispositions-2026-10-05.json', 'utf8'))
  const map = fs.readFileSync('docs/content/rc-nps-coverage-map-2026-10-02.md', 'utf8').split('## Priority individual profiles')[1].split('## Next-wave priority')[0]
  const unchecked = [...map.matchAll(/^- \[ \] ([^\n]+)/gm)].map(x=>x[1].split(' — ')[0])
  assert.equal(unchecked.length, 45)
  assert.equal(dispositions.candidates.length, 45)
  for (const name of unchecked) assert.ok(dispositions.candidates.some(x=>x.name === name && x.disposition), name)
})
