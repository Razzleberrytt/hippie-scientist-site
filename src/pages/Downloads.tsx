import React from 'react'
import { Helmet } from 'react-helmet-async'
import { saveAs } from 'file-saver'
import jsPDF from 'jspdf'
import { Herb } from '../types'
import raw from '../data/herbs.cleaned.json?raw'

const cleaned = raw.replace(/NaN/g, 'null')
const allHerbs: Herb[] = JSON.parse(cleaned)

const required: (keyof Herb)[] = [
  'affiliateLink',
  'activeConstituents',
  'mechanismOfAction',
  'legalStatus',
]

function validHerbs(herbs: Herb[]): Herb[] {
  return herbs.filter(h =>
    !required.some(k => {
      const val = (h as any)[k]
      return val == null || (Array.isArray(val) ? val.length === 0 : val === '')
    })
  )
}

const defaultFields: (keyof Herb)[] = [
  'name',
  'category',
  'effects',
  'tags',
  'mechanismOfAction',
  'legalStatus',
]

export default function Downloads() {
  const [fields, setFields] = React.useState<(keyof Herb)[]>(defaultFields)

  const herbs = React.useMemo(() => validHerbs(allHerbs), [])

  const toggleField = (f: keyof Herb) => {
    setFields(prev =>
      prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
    )
  }

  const exportCSV = () => {
    const csvRows = [fields.join(',')]
    herbs.forEach(h => {
      const row = fields.map(f => {
        const val = (h as any)[f]
        return `"${Array.isArray(val) ? val.join(' | ') : (val ?? '')}"`
      })
      csvRows.push(row.join(','))
    })
    const csv = csvRows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    saveAs(blob, `herbs-${Date.now()}.csv`)
  }

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(herbs, null, 2)], {
      type: 'application/json',
    })
    saveAs(blob, `herbs-${Date.now()}.json`)
  }

  const exportPDF = () => {
    const doc = new jsPDF()
    let y = 10
    doc.setFontSize(12)
    herbs.forEach((h, i) => {
      if (i && i % 2 === 0) {
        doc.addPage()
        y = 10
      }
      doc.text(`Name: ${h.name}`, 10, y)
      doc.text(`Category: ${h.category}`, 10, y + 6)
      doc.text(`Effects: ${(h.effects || []).join(', ')}`, 10, y + 12)
      doc.text(`Tags: ${(h.tags || []).join(', ')}`, 10, y + 18)
      y += 40
    })
    doc.save(`herbs-${Date.now()}.pdf`)
  }

  return (
    <div className='min-h-screen px-4 pt-20'>
      <Helmet>
        <title>Downloads - The Hippie Scientist</title>
        <meta
          name='description'
          content='Download the herb database in multiple formats.'
        />
      </Helmet>
      <div className='mx-auto max-w-3xl space-y-6'>
        <h1 className='text-gradient mb-4 text-center text-5xl font-bold'>
          Export Herb Data
        </h1>
        <p className='text-center text-sand'>
          {herbs.length} herbs · Exported {new Date().toLocaleString()}
        </p>
        <div className='flex flex-wrap justify-center gap-4'>
          <button
            onClick={exportCSV}
            className='rounded-md bg-psychedelic-purple px-4 py-2 font-medium text-white hover:bg-psychedelic-pink'
          >
            Download CSV
          </button>
          <button
            onClick={exportJSON}
            className='rounded-md bg-cosmic-forest px-4 py-2 font-medium text-white hover:bg-emerald-700'
          >
            Download JSON
          </button>
          <button
            onClick={exportPDF}
            className='rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700'
          >
            Download PDF
          </button>
        </div>
        <div className='mt-6 space-y-2'>
          <p className='text-sand'>Select fields for CSV:</p>
          <div className='flex flex-wrap gap-2'>
            {defaultFields.map(f => (
              <label key={f} className='flex items-center gap-1 text-sand'>
                <input
                  type='checkbox'
                  checked={fields.includes(f)}
                  onChange={() => toggleField(f)}
                />
                {f}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
