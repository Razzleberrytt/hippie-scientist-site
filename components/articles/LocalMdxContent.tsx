import { runSync } from '@mdx-js/mdx'
import type { ComponentProps } from 'react'
import * as runtime from 'react/jsx-runtime'

type MdxContentProps = {
  code: string
  components?: ComponentProps<'div'> extends never ? never : Record<string, unknown>
}

export function MDXContent({ code, components }: MdxContentProps) {
  const { default: Content } = runSync(code, {
    ...runtime,
    baseUrl: import.meta.url,
  })

  return <Content components={components} />
}
