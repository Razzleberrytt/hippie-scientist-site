import { MDXContent } from '@content-collections/mdx/react'
import type { ComponentPropsWithoutRef } from 'react'
import { useMDXComponents } from '@/mdx-components'

type ArticleMdxProps = {
  code: string
}

function BodyHeadingOne({ children, ...props }: ComponentPropsWithoutRef<'h1'>) {
  return <h2 {...props}>{children}</h2>
}

export default function ArticleMdx({ code }: ArticleMdxProps) {
  const components = useMDXComponents({ h1: BodyHeadingOne })

  return <MDXContent code={code} components={components} />
}
