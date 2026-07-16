import type { Metadata } from 'next'
import JapanesePageShell from '../../_components/JapanesePageShell'
import { SITE_URL } from '@/src/lib/seo'

export const metadata: Metadata = {
  title: '睡眠とサプリメント | The Hippie Scientist 日本語版',
  description:
    '睡眠に関わるサプリメント、ハーブ、生活習慣を、安全性と証拠の質から考える日本語の入口ページです。',
  alternates: { canonical: `${SITE_URL}/ja/goals/sleep/` },
  robots: { index: true, follow: true },
  openGraph: {
    title: '睡眠とサプリメント | The Hippie Scientist 日本語版',
    description: '睡眠を安全性、リズム、証拠から考える日本語ページです。',
    url: `${SITE_URL}/ja/goals/sleep/`,
    siteName: 'The Hippie Scientist',
    locale: 'ja_JP',
    type: 'article',
  },
}

export default function JapaneseSleepPage() {
  return (
    <JapanesePageShell
      eyebrow='目標：睡眠'
      title='睡眠：安全性、リズム、証拠から始める。'
      description='魔法の答えを探すのではなく、休息を助ける可能性があるもの、翌日の眠気につながるもの、薬や健康状態がある場合に注意すべきものを整理します。'
      primaryHref='/goals/sleep/'
      primaryLabel='英語の完全ガイドを見る'
      secondaryHref='/ja/'
      secondaryLabel='日本語ホームに戻る'
      cards={[
        {
          title: 'まず背景を見る',
          body: 'サプリメントを比較する前に、就寝時間、カフェイン、アルコール、画面、夜のストレス、睡眠の一貫性を確認します。',
        },
        {
          title: '次に安全性を見る',
          body: 'リラックス系の選択肢は、鎮静薬、アルコール、気分に関わる薬、妊娠、個人の状態と関係することがあります。',
        },
        {
          title: '最後に証拠を見る',
          body: '良い睡眠ページは、伝統的使用、もっともらしい仕組み、人での研究を分けて説明します。',
        },
      ]}
      note='これは翻訳された入口ページです。成分ごとの詳細は、現時点では主に英語ページにリンクしています。'
    />
  )
}
