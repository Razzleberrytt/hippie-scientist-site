import { describe, expect, it } from 'vitest'
import { sanitizeComparisonFaqs } from '../ComparePageScaffold'

describe('sanitizeComparisonFaqs', () => {
  it('removes generic compatibility, winner, safety, and onset claims before UI and schema use', () => {
    const faqs = sanitizeComparisonFaqs(
      { name: 'Magnesium', onsetTime: undefined },
      { name: 'Melatonin', onsetTime: '30–60 minutes' },
      [
        { question: 'Which is better, Magnesium or Melatonin?', answer: 'Melatonin may be the better default.' },
        { question: 'Can I take Magnesium and Melatonin together?', answer: 'They are commonly used together because they work through different mechanisms.' },
        { question: 'Which works faster, Magnesium or Melatonin?', answer: 'Both may take days to weeks.' },
        { question: 'Which is safer, Magnesium or Melatonin?', answer: 'Both are generally well-tolerated.' },
        { question: 'What is the key difference between Magnesium and Melatonin?', answer: 'Different mechanisms make one better suited.' },
      ],
    )

    const joined = faqs.map((faq) => faq.answer).join(' ')
    expect(joined).not.toMatch(/commonly used together/i)
    expect(joined).not.toMatch(/better default/i)
    expect(joined).not.toMatch(/both may take days to weeks/i)
    expect(joined).not.toMatch(/both are generally well-tolerated/i)
    expect(joined).toMatch(/does not establish that Magnesium and Melatonin are safe or beneficial to combine/i)
    expect(joined).toMatch(/Melatonin: 30–60 minutes/i)
  })
})
