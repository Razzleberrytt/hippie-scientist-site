import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import { describe, expect, it } from 'vitest'
import { P0_RESEARCH_REVIEWS } from '@/lib/mental-health-research-directory'
import { normalizeCitationMetadata } from '@/lib/article-citation-metadata'
const slugs = [
'dbt-components-self-harm-bpd-evidence-review',
'mentalization-mbt-structured-care-evidence-review',
'schema-therapy-formats-evidence-review',
'avoidant-personality-treatment-retention-evidence-review',
'personality-disorder-therapy-comparison-evidence-review',
'antidepressant-withdrawal-versus-relapse-evidence-review',
'sleep-loss-emotion-regulation-evidence-review',
'supplements-mental-health-adjunct-evidence-review',
'psychedelic-assisted-therapy-trial-limits-evidence-review',
'complex-ptsd-treatment-sequencing-evidence-review',
]
const articles = slugs.map(slug => ({slug, ...matter(readFileSync(join(process.cwd(),'content/articles',slug+'.md'),'utf8'))}))
describe('P0 final ten-review cohort', () => {
 it('completes the fifty-review directory with substantive source-graded manuscripts', () => {
  expect(P0_RESEARCH_REVIEWS).toHaveLength(50)
  expect(new Set(P0_RESEARCH_REVIEWS.map(r=>r.href)).size).toBe(50)
  for(const {slug,data,content} of articles){
   expect(content.trim().split(/\s+/).length).toBeGreaterThan(1150)
   expect(content).toContain('not a new statistical meta-analysis')
   expect(P0_RESEARCH_REVIEWS.filter(r=>r.href==='/articles/'+slug+'/')).toHaveLength(1)
   expect(normalizeCitationMetadata(data).faqAnswers).toHaveLength(4)
   expect(new Set(data.references.map((r:{pmid:string})=>r.pmid)).size).toBe(data.references.length)
   for(const r of data.references){ expect(r.authors.length).toBeGreaterThan(5);expect(r.evidenceLevel.length).toBeGreaterThan(20) }
   for(const match of content.matchAll(/\[([\d,]+)\]/g))for(const n of match[1].split(','))expect(+n).toBeLessThanOrEqual(data.references.length)
  }
 })
 it('preserves corrections, null findings and exact treatment-package boundaries', () => {
  const body=(prefix:string)=>articles.find(a=>a.slug.startsWith(prefix))!.content
  expect(body('antidepressant')).toContain('precise pooled percentages from that report are therefore withheld')
  expect(body('antidepressant')).toContain('omitted disclosures')
  expect(body('dbt')).toContain('continuing-medical-education questions')
  expect(body('mentalization')).toContain('suicide-attempt rates were higher in MBT')
  expect(body('schema')).toContain('did not clearly differ from usual care')
  expect(body('avoidant')).toContain('not independent replication')
  expect(body('supplements')).toContain('not a demonstrated replacement')
  expect(body('psychedelic')).toContain('cannot be used as therapeutic evidence for smoke-shop edibles')
  expect(body('complex')).toContain('not a set of 51 trials all recruiting uniformly confirmed ICD-11 CPTSD')
 })
})
