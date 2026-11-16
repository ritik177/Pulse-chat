import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAppDispatch } from '@/app/hooks'
import { setSearchQuery } from '@/features/chat/slice/uiSlice'
import { useDebouncedValue } from '@/features/chat/hooks/useDebouncedValue'
import { SEARCH_DEBOUNCE_MS } from '@/shared/utils/constants'

export function ConversationSearch() {
  const dispatch = useAppDispatch()
  const [value, setValue] = useState('')
  const debounced = useDebouncedValue(value, SEARCH_DEBOUNCE_MS)

  useEffect(() => {
    dispatch(setSearchQuery(debounced))
  }, [debounced, dispatch])

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search conversations"
        aria-label="Search conversations"
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] py-2.5 pl-9 pr-9 text-sm text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[var(--text-muted)] hover:bg-[var(--surface)]"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
