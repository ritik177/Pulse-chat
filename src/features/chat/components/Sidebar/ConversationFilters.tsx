import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setFilter } from '@/features/chat/slice/uiSlice'
import type { ConversationFilter } from '@/features/chat/types'
import { cn } from '@/shared/utils/cn'

const filters: { id: ConversationFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'groups', label: 'Groups' },
]

export function ConversationFilters() {
  const active = useAppSelector((s) => s.ui.filter)
  const dispatch = useAppDispatch()

  return (
    <div className="flex gap-1 rounded-xl bg-[var(--surface-muted)] p-1" role="tablist">
      {filters.map((f) => (
        <button
          key={f.id}
          type="button"
          role="tab"
          aria-selected={active === f.id}
          onClick={() => dispatch(setFilter(f.id))}
          className={cn(
            'flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition',
            active === f.id
              ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text)]',
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
