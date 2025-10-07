import { useState } from 'react'
import type { Herb } from '../types'

type QuickFillModalProps = {
  row: Herb
  missing: string[]
  onSave: (patch: Record<string, string>) => void
  onCancel: () => void
}

export default function QuickFillModal({ row, missing, onSave, onCancel }: QuickFillModalProps) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(missing.map(key => [key, '']))
  )

  return (
    <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50'>
      <div className='bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full'>
        <h2 className='text-lg font-semibold mb-3'>Quick-fill for {row.common || row.slug}</h2>
        <p className='text-sm opacity-70 mb-4'>Only missing fields shown.</p>
        <div className='space-y-3 max-h-[50vh] overflow-y-auto'>
          {missing.map(key => (
            <div key={key}>
              <label className='text-xs font-semibold block mb-1'>{key}</label>
              <textarea
                value={values[key]}
                onChange={event =>
                  setValues(prev => ({
                    ...prev,
                    [key]: event.target.value,
                  }))
                }
                className='w-full text-sm p-2 rounded-md bg-gray-800 border border-gray-700'
                rows={2}
              />
            </div>
          ))}
        </div>
        <div className='flex justify-end gap-3 mt-4'>
          <button
            onClick={onCancel}
            className='px-3 py-1 border rounded-md opacity-70 hover:opacity-100'
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(values)}
            className='px-3 py-1 bg-green-600 hover:bg-green-700 rounded-md'
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
