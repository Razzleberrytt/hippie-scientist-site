import type { Metadata } from 'next'
import ChinesePageShell from '../../_components/ChinesePageShell'
import { SITE_URL } from '@/src/lib/seo'

export const metadata: Metadata = {
  title: '压力与补充剂 | The Hippie Scientist 中文版',
  description:
    '中文压力入口页：了解压力、平静感、适应能力和补充剂安全性的基本研究框架。',
  alternates: { canonical: `${SITE_URL}/zh/goals/stress/` },
  robots: { index: true, follow: true },
  openGraph: {
    title: '压力与补充剂 | The Hippie Scientist 中文版',
    description: '用证据和安全性角度理解压力、平静感和补充剂。',
    url: `${SITE_URL}/zh/goals/stress/`,
    siteName: 'The Hippie Scientist',
    locale: 'zh_CN',
    type: 'article',
  },
}

export default function ChineseStressPage() {
  return (
    <ChinesePageShell
      eyebrow='目标：压力'
      title='压力：区分平静、能量和恢复，不夸大效果。'
      description='压力可能代表身体紧张、疲劳、易怒、心理负担或恢复变慢。先把这些情境分开，再讨论补充剂或草本，会更清楚也更安全。'
      primaryHref='/goals/stress/'
      primaryLabel='查看完整英文指南'
      secondaryHref='/zh/goals/anxiety/'
      secondaryLabel='与焦虑页面比较'
      cards={[
        {
          title: '先定义问题',
          body: '压力相关选择并不都指向同一件事。有些偏向放松，有些偏向能量或主观恢复感。',
        },
        {
          title: '检查相互作用',
          body: '如果已经使用药物、镇静类产品、刺激物或类似效果的产品，草本和补充剂可能并不适合。',
        },
        {
          title: '看证据质量',
          body: '可靠建议不应只靠流行说法，而应说明人体研究、限制和安全性。',
        },
      ]}
      note='具体成分比较仍以英文完整页面为主，中文内容会逐步扩展。'
    />
  )
}
