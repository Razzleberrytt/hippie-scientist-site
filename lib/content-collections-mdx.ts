import { compile, type CompileOptions } from '@mdx-js/mdx'
import type { Context } from '@content-collections/core'

type ContentMeta = {
  path?: string
  [key: string]: unknown
}

export type MdxDocument = {
  _meta: ContentMeta
  content: string
}

export type MdxCompileOptions = Pick<CompileOptions, 'remarkPlugins' | 'rehypePlugins'>

function createCacheKey(document: MdxDocument): MdxDocument {
  return {
    content: document.content,
    _meta: document._meta,
  }
}

/**
 * Compile repository-authored MDX without mdx-bundler/frontmatter parsing.
 *
 * Content Collections already parses YAML frontmatter before transforms run, so
 * this compiler receives only the document body. Using @mdx-js/mdx directly
 * preserves the remark/rehype plugin pipeline while removing the unused TOML
 * parser chain pulled in by @content-collections/mdx -> mdx-bundler.
 */
export async function compileMdxSource(
  document: MdxDocument,
  options: MdxCompileOptions = {},
): Promise<string> {
  const compiled = await compile(
    {
      value: document.content,
      data: { _meta: document._meta },
    },
    {
      format: 'mdx',
      outputFormat: 'function-body',
      development: false,
      remarkPlugins: options.remarkPlugins ?? [],
      rehypePlugins: options.rehypePlugins ?? [],
    },
  )

  return String(compiled)
}

export function compileMDX(
  { cache }: Pick<Context, 'cache'>,
  document: MdxDocument,
  options: MdxCompileOptions = {},
) {
  const cacheKey = createCacheKey(document)
  return cache(
    cacheKey,
    (cachedDocument) => compileMdxSource(cachedDocument, options),
    { key: '__mdx' },
  )
}
