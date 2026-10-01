import { createElement } from 'react'
import type { ComponentType } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import * as jsxRuntime from 'react/jsx-runtime'
import remarkGfm from 'remark-gfm'
import { describe, expect, it } from 'vitest'
import { compileMdxSource } from '../content-collections-mdx'

type RuntimeModule = {
  default: ComponentType
}

function renderCompiled(code: string) {
  const factory = new Function(code) as (runtime: typeof jsxRuntime) => RuntimeModule
  const compiledModule = factory(jsxRuntime)
  return renderToStaticMarkup(createElement(compiledModule.default))
}

describe('content collections MDX adapter', () => {
  it('compiles markdown and GFM directly with the MDX runtime contract', async () => {
    const code = await compileMdxSource(
      {
        _meta: { path: 'fixture' },
        content: '# Hello\n\n~~obsolete~~',
      },
      { remarkPlugins: [remarkGfm] },
    )

    const html = renderCompiled(code)
    expect(html).toContain('<h1>Hello</h1>')
    expect(html).toContain('<del>obsolete</del>')
  })

  it('does not emit program imports for ordinary repository-authored MDX', async () => {
    const code = await compileMdxSource({
      _meta: { path: 'fixture' },
      content: 'A plain **MDX** body.',
    })

    expect(code).toContain('arguments[0]')
    expect(code).not.toMatch(/^import\s/m)
    expect(code).not.toMatch(/^export\s/m)
  })
})
