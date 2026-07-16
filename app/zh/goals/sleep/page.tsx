import type { Metadata } from 'next'
import ChinesePageShell from '../../_components/ChinesePageShell'
import { SITE_URL } from '@/src/lib/seo'

export const metadata: Metadata = {
  title: '睡眠与补充剂 | The Hippie Scientist 中文版',
  description:
    '中文睡眠入口页：用安全性和证据质量的角度，了解与睡眠相关的补充剂、草本和生活习惯。',
  alternates: { canonical: `${SITE_URL}/zh/goals/sleep/` },
  robots: { index: true, follow: true },
  openGraph: {
    title: '睡眠与补充剂 | The Hippie Scientist 中文版',
    description: '中文睡眠研究入口：从安全性、作息和证据开始。',
    url: `${SITE_URL}/zh/goals/sleep/`,
    siteName: 'The Hippie Scientist',
    locale: 'zh_CN',
    type: 'article',
  },
}

export default function ChineseSleepPage() {
  return (
    <ChinesePageShell
      eyebrow='目标：睡眠'
      title='睡眠：先看安全性、节律和证据。'
      description='目标不是寻找神奇答案，而是整理问题：哪些选择可能支持休息，哪些可能导致第二天昏沉，哪些在用药或有健康状况时需要特别谨慎。'
      primaryHref='/goals/sleep/'
      primaryLabel='查看完整英文指南'
      secondaryHref='/zh/'
      secondaryLabel='返回中文首页'
      cards={[
        {
          title: '先看背景',
          body: '在比较补充剂之前，先检查作息、咖啡因、酒精、屏幕、夜间压力和睡眠规律。',
        },
        {
          title: '再看安全性',
          body: '镇静或放松类选择可能与酒精、镇静药、情绪相关药物、怀孕或个人健康因素有关。',
        },
        {
          title: '最后看证据',
          body: '好的睡眠页面应该区分传统用法、可能机制和真实人体研究，而不是夸大结果。',
        },
      ]}
      note='这是翻译入口页。完整成分资料仍链接到英文页面，后续会逐步补充中文版本。'
    />
  )
}
