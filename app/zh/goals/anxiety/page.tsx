import type { Metadata } from 'next'
import ChinesePageShell from '../../_components/ChinesePageShell'
import { SITE_URL } from '@/src/lib/seo'

export const metadata: Metadata = {
  title: '焦虑与补充剂 | The Hippie Scientist 中文版',
  description:
    '中文焦虑入口页：以谨慎语言了解平静感、焦虑相关补充剂、安全性和证据限制。',
  alternates: { canonical: `${SITE_URL}/zh/goals/anxiety/` },
  robots: { index: true, follow: true },
  openGraph: {
    title: '焦虑与补充剂 | The Hippie Scientist 中文版',
    description: '中文焦虑研究入口：关注安全性、平静感和证据质量。',
    url: `${SITE_URL}/zh/goals/anxiety/`,
    siteName: 'The Hippie Scientist',
    locale: 'zh_CN',
    type: 'article',
  },
}

export default function ChineseAnxietyPage() {
  return (
    <ChinesePageShell
      eyebrow='目标：焦虑'
      title='焦虑：从谨慎、背景和清晰语言开始。'
      description='本页不把补充剂描述为治疗方案，而是帮助整理信息：哪些选择与平静感相关，哪些可能有相互作用风险，以及如何区分人体证据和营销语言。'
      primaryHref='/goals/anxiety/'
      primaryLabel='查看完整英文指南'
      secondaryHref='/zh/goals/stress/'
      secondaryLabel='与压力页面比较'
      cards={[
        {
          title: '不要混为一谈',
          body: '担忧、紧张、睡眠不安和惊恐发作并不是同一种情境。页面应避免把所有问题包装成一个承诺。',
        },
        {
          title: '注意组合风险',
          body: '如果使用情绪、睡眠、血压相关药物，或饮酒、使用其他镇静产品，放松类选择更需要谨慎。',
        },
        {
          title: '寻找真实证据',
          body: '有用证据会说明研究规模、对象、剂量、时间和限制，而不只是说某样东西很天然。',
        },
      ]}
      note='如果症状强烈、突然出现或有危险，请寻求专业或当地紧急帮助。本页仅整理教育信息。'
    />
  )
}
