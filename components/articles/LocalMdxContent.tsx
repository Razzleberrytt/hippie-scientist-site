import { runSync } from '@mdx-js/mdx'
import type { MDXComponents } from 'mdx/types.js'
import * as runtime from 'react/jsx-runtime'

type MdxContentProps = {
  code: string
  components?: MDXComponents
}

export function MDXContent({ code, components }: MdxContentProps) {
  const { default: Content } = runSync(code, runtime)
  return <Content components={components} />
}
