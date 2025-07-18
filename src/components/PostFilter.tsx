import React from 'react'
import Fuse from 'fuse.js'
import { decodeTag } from '../utils/format'
import type { Post } from '../data/posts'

interface Props {
  posts: Post[]
  onFilter: (posts: Post[]) => void
}

const PostFilter: React.FC<Props> = ({ posts, onFilter }) => {
  const [query, setQuery] = React.useState('')
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])

  const fuse = React.useMemo(
    () =>
      new Fuse(posts, {
        keys: ['title', 'excerpt', 'content', 'tags'],
        threshold: 0.3,
      }),
    [posts]
  )

  const allTags = React.useMemo(() => {
    const t = posts.reduce<string[]>((acc, p) => acc.concat(p.tags), [])
    return Array.from(new Set(t))
  }, [posts])

  const handleAddTag = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (value && !selectedTags.includes(value)) {
      setSelectedTags(t => [...t, value])
    }
    e.target.value = ''
  }

  const removeTag = (tag: string) => {
    setSelectedTags(t => t.filter(x => x !== tag))
  }

  const clearFilters = () => {
    setQuery('')
    setSelectedTags([])
    onFilter(posts)
  }

  const filtered = React.useMemo(() => {
    const q = query.trim()
    let res: Post[] = posts
    if (q) {
      res = fuse.search(q).map(r => r.item)
    }
    if (selectedTags.length) {
      res = res.filter(p => selectedTags.every(t => p.tags.includes(t)))
    }
    return res
  }, [posts, query, selectedTags])

  React.useEffect(() => {
    onFilter(filtered)
  }, [filtered, onFilter])

  return (
    <div className='mb-8 space-y-4'>
      <input
        type='text'
        placeholder='Search posts...'
        aria-label='Search posts'
        value={query}
        onChange={e => setQuery(e.target.value)}
        className='w-full rounded-md border border-gray-700 bg-gray-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500'
      />
      <div className='flex flex-wrap items-center gap-2'>
        {selectedTags.map(tag => (
          <button
            type='button'
            key={tag}
            onClick={() => removeTag(tag)}
            className='tag-pill'
          >
            {decodeTag(tag)}
          </button>
        ))}
        <select
          onChange={handleAddTag}
          className='rounded-md border border-gray-700 bg-gray-900 px-2 py-1 text-sm text-white'
          defaultValue=''
        >
          <option value=''>Add Tag Filter...</option>
          {allTags.map(tag => (
            <option key={tag} value={tag}>
              {decodeTag(tag)}
            </option>
          ))}
        </select>
        <button
          type='button'
          onClick={clearFilters}
          className='rounded-md border border-gray-700 bg-gray-900 px-2 py-1 text-sm text-white hover:bg-gray-700'
        >
          Clear Filters
        </button>
      </div>
    </div>
  )
}

export default PostFilter
