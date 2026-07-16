import type { Metadata } from 'next'
import JapanesePageShell from '../../_components/JapanesePageShell'
import { SITE_URL } from '@/src/lib/seo'

export const metadata: Metadata = {
  title: '不安とサプリメント | The Hippie Scientist 日本語版',
  description:
    '不安、落ち着き、安全性、証拠の限界を慎重な言葉で整理する日本語の入口ページです。',
  alternates: { canonical: `${SITE_URL}/ja/goals/anxiety/` },
  robots: { index: true, follow: true },
  openGraph: {
    title: '不安とサプリメント | The Hippie Scientist 日本語版',
    description: '不安、落ち着き、安全性、証拠の質を整理する日本語ページです。',
    url: `${SITE_URL}/ja/goals/anxiety/`,
    siteName: 'The Hippie Scientist',
    locale: 'ja_JP',
    type: 'article',
  },
}

export default function JapaneseAnxietyPage() {
  return (
    <JapanesePageShell
      eyebrow='目標：不安'
      title='不安：慎重さ、文脈、明確な言葉から始める。'
      description='このページはサプリメントを答えとして示すものではありません。落ち着きに関わる選択肢、比較時の注意点、人での証拠とマーケティングの違いを整理します。'
      primaryHref='/goals/anxiety/'
      primaryLabel='英語の完全ガイドを見る'
      secondaryHref='/ja/goals/stress/'
      secondaryLabel='ストレスページと比べる'
      cards={[
        {
          title: '同じものとして扱わない',
          body: '心配、緊張、眠りの乱れは同じ文脈ではありません。すべてを一つの約束にまとめないことが大切です。',
        },
        {
          title: '組み合わせに注意する',
          body: '気分、睡眠、清醒感に関わる製品を使っている場合は、より慎重に比較する必要があります。',
        },
        {
          title: '本当の証拠を探す',
          body: '有用な証拠は、研究の規模、対象者、用量、期間、限界を説明します。自然由来という言葉だけでは十分ではありません。',
        },
      ]}
      note='状況が気になる場合は、個人の背景に合った専門的なサポートを検討してください。このページは教育情報の整理のみを目的としています。'
    />
  )
}
