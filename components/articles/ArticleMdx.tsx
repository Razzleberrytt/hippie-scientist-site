import { createElement } from 'react'
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

const mdxComponentCache = new Map<string, ComponentType<MdxRuntimeProps>>()

function BodyHeadingOne({ children, ...props }: ComponentPropsWithoutRef<'h1'>) {
  return <h2 {...props}>{children}</h2>
}

function getMdxComponent(code: string): ComponentType<MdxRuntimeProps> {
  const cached = mdxComponentCache.get(code)
  if (cached) return cached

  const factory = new Function(code) as (runtime: typeof jsxRuntime) => MdxRuntimeModule
  const compiledModule = factory(jsxRuntime)

  if (!compiledModule || typeof compiledModule.default !== 'function') {
    throw new Error('Compiled MDX did not return a renderable default component')
  }

  mdxComponentCache.set(code, compiledModule.default)
  return compiledModule.default
}

function MdxRuntime({ code, components }: ArticleMdxProps & MdxRuntimeProps) {
  const component = getMdxComponent(code)
  return createElement(component, { components })
}

export default function ArticleMdx({ code }: ArticleMdxProps) {
  const components = useMDXComponents({ h1: BodyHeadingOne })

  return (
    <>
      <div data-article-body>
        <MdxRuntime code={code} components={components} />
      </div>
      <ArticleEmailCaptureExperiment
        location='article-body'
        className='mt-10'
      />
    </>
  )
}
