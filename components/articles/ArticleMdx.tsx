import { MDXContent } from '@content-collections/mdx/react'
import type { ComponentPropsWithoutRef } from 'react'
import ArticleEmailCaptureExperiment from '@/components/monetization/ArticleEmailCaptureExperiment'
import { useMDXComponents } from '@/mdx-components'

type ArticleMdxProps = {
  code: string
}

function BodyHeadingOne({ children, ...props }: ComponentPropsWithoutRef<'h1'>) {
  return <h2 {...props}>{children}</h2>
}

export default function ArticleMdx({ code }: ArticleMdxProps) {
  const components = useMDXComponents({ h1: BodyHeadingOne })

  return (
    <>
      <div data-article-body>
        <MDXContent code={code} components={components} />
      </div>
      <ArticleEmailCaptureExperiment
        location='article-body'
        className='mt-10'
      />
    </>
  )
}
