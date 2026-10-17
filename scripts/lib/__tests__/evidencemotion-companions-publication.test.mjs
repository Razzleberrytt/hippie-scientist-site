import { test } from 'vitest'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import matter from 'gray-matter'

// These manuscripts are held for genuine independent science/editorial and
// repository-owner release approvals. These checks never grant that approval.
const articles = [
  'adhd-brain-facts-explained',
  'dmt-types-explained',
  'long-term-cannabis-brain-effects',
  'psychedelics-and-the-brain-science',
  'yopo-bufotenine-science-history',
]
const substanceArticles = [
  'dmt-types-explained',
  'long-term-cannabis-brain-effects',
  'yopo-bufotenine-science-history',
]
const readArticle = (slug) =>
  matter(fs.readFileSync(`content/articles/${slug}.md`, 'utf8'))

test('all five held EvidenceMotion companions use renderer-owned AI disclosure without duplicates', () => {
  for (const slug of articles) {
    const { data, content } = readArticle(slug)
    assert.equal(data.slug, slug)
    assert.equal(data.ai_assisted, true, slug)
    // The shared article renderer displays the notice based on this flag.
    // Avoid duplicating the visible byline disclosure in Markdown itself.
    assert.doesNotMatch(content, /Editorial transparency: AI tools assisted with drafting and organizing this article\./, slug)
    assert.match(content, /## Bottom line/, slug)
    assert.ok(Array.isArray(data.references) && data.references.length >= 2, `${slug}: cited source records`)
  }
})

test('the three new substance-related companions retain the per-article referral safeguards', () => {
  for (const slug of substanceArticles) {
    const { data, content } = readArticle(slug)
    assert.equal(data.category, 'Substance Use & Harm Reduction', slug)
    assert.match(content, /1-800-662-HELP \(4357\)/, slug)
    assert.match(content, /https:\/\/www\.samhsa\.gov\/find-help\/helplines\/national-helpline/, slug)
    assert.match(content, /do not replace emergency care/, slug)
  }
})
