import type { Metadata } from 'next'
import JapanesePageShell from '../../_components/JapanesePageShell'
import { SITE_URL } from '@/src/lib/seo'

export const metadata: Metadata = {
  title: 'ストレスとサプリメント | The Hippie Scientist 日本語版',
  description:
    'ストレス、落ち着き、適応、サプリメントの安全性を整理する日本語の入口ページです。',
  alternates: { canonical: `${SITE_URL}/ja/goals/stress/` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'ストレスとサプリメント | The Hippie Scientist 日本語版',
    description: 'ストレスとサプリメントを証拠と安全性から整理する日本語ページです。',
    url: `${SITE_URL}/ja/goals/stress/`,
    siteName: 'The Hippie Scientist',
    locale: 'ja_JP',
    type: 'article',
  },
}

export default function JapaneseStressPage() {
  return (
    <JapanesePageShell
      eyebrow='目標：ストレス'
      title='ストレス：落ち着き、エネルギー、回復を分けて考える。'
      description='ストレスには、身体の緊張、疲れ、イライラ、心の負荷、回復の遅さなど多くの意味があります。サプリメントやハーブを比べる前に、その違いを整理します。'
      primaryHref='/goals/stress/'
      primaryLabel='英語の完全ガイドを見る'
      secondaryHref='/ja/goals/anxiety/'
      secondaryLabel='不安ページと比べる'
      cards={[
        {
          title: '問題を定義する',
          body: 'ストレス向けの選択肢がすべて同じ目的を持つわけではありません。リラックス、エネルギー、回復感は別々に考えます。',
        },
        {
          title: '相互作用を確認する',
          body: '薬、鎮静系の製品、刺激物、似た作用のある製品を使っている場合、サプリメントやハーブは注意が必要です。',
        },
        {
          title: '証拠の質を見る',
          body: '信頼できる説明には、人気の話だけでなく、人での研究、限界、安全性の説明が必要です。',
        },
      ]}
      note='具体的な成分比較は、翻訳が広がるまでは英語の完全ページを参照してください。'
    />
  )
}
