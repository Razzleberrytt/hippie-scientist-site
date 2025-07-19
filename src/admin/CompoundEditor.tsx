import React from 'react'

export default function CompoundEditor() {
  const handleSave = () => {
    console.log('Compound saved')
  }
  return (
    <div className='p-4'>
      <h2 className='text-lg font-bold mb-2'>Compound Editor</h2>
      <form className='space-y-2'>
        <input
          type='text'
          placeholder='Compound Name'
          className='w-full rounded border border-gray-600 bg-black/20 p-2 text-white focus-visible:ring-2 focus-visible:ring-psychedelic-pink'
        />
        <button
          type='button'
          onClick={handleSave}
          className='rounded bg-psychedelic-purple px-3 py-1 text-white'
        >
          Save
        </button>
      </form>
    </div>
  )
}
