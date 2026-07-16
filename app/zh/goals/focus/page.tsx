import type { Metadata } from 'next'
import ChinesePageShell from '../../_components/ChinesePageShell'
import { SITE_URL } from '@/src/lib/seo'

export const metadata: Metadata = {
  title: '专注与补充剂 | The Hippie Scientist 中文版',
  description:
    '中文专注入口页：了解专注、心理能量、注意力和补充剂安全性的证据框架。',
  alternates: { canonical: `${SITE_URL}/zh/goals/focus/` },
  robots: { index: true, follow: true },
  openGraph: {
    title: '专注与补充剂 | The Hippie Scientist 中文版',
    description: '用谨慎和证据导向的方式理解专注、心理能量和补充剂。',
    url: `${SITE_URL}/zh/goals/focus/`,
    siteName: 'The Hippie Scientist',
    locale: 'zh_CN',
    type: 'article',
  },
}

export default function ChineseFocusPage() {
  return (
    <ChinesePageShell
      eyebrow='目标：专注'
      title='专注：区分能量、清晰感和刺激。'
      description='提高专注不一定意味着使用更强的东西。先整理睡眠、咖啡因、压力、习惯、安全性和证据质量，才能更合理地比较选择。'
      primaryHref='/goals/focus/'
      primaryLabel='查看完整英文指南'
      secondaryHref='/zh/'
      secondaryLabel='返回中文首页'
      cards={[
        {
          title: '能量不等于专注',
          body: '某些产品可能让人更清醒，但不一定改善组织能力、记忆或深度工作。需要把目标分开。',
        },
        {
          title: '谨慎看待刺激物',
          body: '咖啡因、刺激物、药物和其他产品可能叠加。安全性取决于个人背景。',
        },
        {
          title: '按证据比较',
          body: '好的页面会说明研究内容、研究对象、持续时间和观察到的效果大小。',
        },
      ]}
      note='完整英文页面包含更多内部链接；中文资料库会逐步补充。'
    />
  )
}
