import type { Context, Meta } from '@content-collections/core'
import { compile, type CompileOptions } from '@mdx-js/mdx'

type Document = {
  _meta: Meta
  content: string
}

export type MdxCompileOptions = Pick<CompileOptions, 'remarkPlugins' | 'rehypePlugins'>

function addMetaToVFile(_meta: Meta) {
  return () => (_tree: unknown, vFile: { data: Record<string, unknown> }) => {
    Object.assign(vFile.data, { _meta })
  }
}

async function compileDocument(document: Document, options: MdxCompileOptions = {}) {
  const remarkPlugins = [
    addMetaToVFile(document._meta),
    ...(options.remarkPlugins ?? []),
  ] as NonNullable<CompileOptions['remarkPlugins']>

  const result = await compile(document.content, {
    outputFormat: 'function-body',
    development: false,
    remarkPlugins,
    rehypePlugins: options.rehypePlugins ?? [],
  })

  return String(result)
}

function createCacheKey(document: Document): Document {
  const { content, _meta } = document
  return { content, _meta }
}

export function compileMDX(
  { cache }: Pick<Context, 'cache'>,
  document: Document,
  options?: MdxCompileOptions,
) {
  const cacheKey = createCacheKey(document)
  return cache(cacheKey, (doc) => compileDocument(doc, options), {
    key: '__mdx',
  })
}
