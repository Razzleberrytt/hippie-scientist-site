import { existsSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { focusAdhdArticles, getFocusAdhdArticle } from '../../lib/focus-adhd-articles'

const editorialScaffoldPattern = /\b(?:TODO|FIXME|TBD|PLACEHOLDER|DRAFT NOTE|EDITOR NOTE)\b|##\s+(?:Related Articles|Internal Linking Recommendations)\b/i

describe('focus ADHD article sources', () => {
  it('points every sourced focus article at an existing markdown file', () => {
    const missingSources = focusAdhdArticles
      .filter((article) => article.source)
      .filter((article) => !existsSync(path.join(process.cwd(), article.source as string)))
      .map((article) => `${article.slug}: ${article.source}`)

    expect(missingSources).toEqual([])
  })

  it('does not expose editorial scaffold text in rendered article bodies', () => {
    const leakedScaffold = focusAdhdArticles
      .map((article) => {
        const rendered = getFocusAdhdArticle(article.slug)
        return {
          slug: article.slug,
          match: rendered?.body.match(editorialScaffoldPattern)?.[0] ?? null,
        }
      })
      .filter((result) => result.match)

    expect(leakedScaffold).toEqual([])
  })
})
