import type { Metadata } from 'next'
import ChinesePageShell from './_components/ChinesePageShell'
import { SITE_URL } from '@/src/lib/seo'

export const metadata: Metadata = {
  title: 'The Hippie Scientist 中文版 | 补充剂研究',
  description:
    'The Hippie Scientist 中文首页：用清晰、谨慎的方式介绍睡眠、压力、焦虑和专注相关的补充剂、草本和化合物研究。',
  alternates: { canonical: `${SITE_URL}/zh/` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'The Hippie Scientist 中文版',
    description: '关于补充剂、草本和化合物的清晰研究入口，提供中文主要页面。',
    url: `${SITE_URL}/zh/`,
    siteName: 'The Hippie Scientist',
    locale: 'zh_CN',
    type: 'website',
  },
}

export default function ChineseHomePage() {
  return (
    <ChinesePageShell
      eyebrow='The Hippie Scientist 中文版'
      title='用证据和谨慎的语言理解补充剂研究。'
      description='先从你的目标开始：睡得更好、管理压力、理解焦虑，或提高专注。这里提供中文主要入口，并链接到完整的英文资料库。'
      primaryHref='/zh/goals/sleep/'
      primaryLabel='从睡眠开始'
      secondaryHref='/goals/'
      secondaryLabel='查看英文目标页'
      cards={[
        {
          title: '睡眠',
          body: '从休息、作息、安全性和证据质量开始，整理与睡眠相关的选择。',
          href: '/zh/goals/sleep/',
          label: '查看中文睡眠页',
        },
        {
          title: '压力和焦虑',
          body: '先区分放松、紧张、担忧和安全性，再比较不同选项。',
          href: '/zh/goals/stress/',
          label: '查看中文压力页',
        },
        {
          title: '专注',
          body: '用清晰的方式理解心理能量、注意力、习惯和证据限制。',
          href: '/zh/goals/focus/',
          label: '查看中文专注页',
        },
      ]}
      note='完整的草本和化合物资料库目前仍以英文为主，中文翻译会逐步扩展。'
    />
  )
}
