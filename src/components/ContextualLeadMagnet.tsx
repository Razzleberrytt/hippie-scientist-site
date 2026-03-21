import EmailCapture from '@/components/EmailCapture'

type ContextualLeadMagnetProps = {
  context: 'herb' | 'compound' | 'blog'
  title: string
  subtitle: string
}

export default function ContextualLeadMagnet({
  context,
  title,
  subtitle,
}: ContextualLeadMagnetProps) {
  return (
    <div className='my-6'>
      <EmailCapture
        context={context}
        forceShow
        title={title}
        subtitle={subtitle}
        buttonLabel='Get guide'
        postSubmitCtaPath='/build'
        postSubmitCtaLabel='Save blend'
      />
    </div>
  )
}
