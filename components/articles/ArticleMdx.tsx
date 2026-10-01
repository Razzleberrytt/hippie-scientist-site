import type { ComponentPropsWithoutRef, ComponentType } from 'react'
import * as jsxRuntime from 'react/jsx-runtime'
import ArticleEmailCaptureExperiment from '@/components/monetization/ArticleEmailCaptureExperiment'
import { useMDXComponents } from '@/mdx-components'

type ArticleMdxProps = {
  code: string
}

type MdxRuntimeProps = {
  components?: ReturnType<typeof useMDXComponents>
}

type MdxRuntimeModule = {
  default: ComponentType<MdxRuntimeProps>
}

function BodyHeadingOne({ children, ...props }: ComponentPropsWithoutRef<'h1'>) {
  return <h2 {...props}>{children}</h2>
}

function evaluateMdx(code: string): ComponentType<MdxRuntimeProps> {
  // The code is generated at build time by @mdx-js/mdx with
  // outputFormat='function-body'. It receives React's production JSX runtime
  // as arguments[0], matching the documented MDX run contract.
  // eslint-disable-next-line no-new-func
  const factory = new Function(code) as (runtime: typeof jsxRuntime) => MdxRuntimeModule
  const module = factory(jsxRuntime)

  if (!module || typeof module.default !== 'function') {
    throw new Error('Compiled MDX did not return a renderable default component')
  }

  return module.default
}

export default function ArticleMdx({ code }: ArticleMdxProps) {
  const components = useMDXComponents({ h1: BodyHeadingOne })
  const Content = evaluateMdx(code)

  return (
    <>
      <div data-article-body>
        <Content components={components} />
      </div>
      <ArticleEmailCaptureExperiment
        location='article-body'
        className='mt-10'
      />
    </>
  )
}
