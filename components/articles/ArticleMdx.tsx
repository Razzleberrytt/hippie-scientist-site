import { MDXContent } from '@content-collections/mdx/react'
import { useMDXComponents } from '@/mdx-components'

type ArticleMdxProps = {
  code: string
}

export default function ArticleMdx({ code }: ArticleMdxProps) {
  const components = useMDXComponents({})

  return <MDXContent code={code} components={components} />
}
