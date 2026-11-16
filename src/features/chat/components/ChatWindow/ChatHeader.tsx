import { ArrowLeft, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  setMessageSearchQuery,
  setShowMobileChat,
  setShowProfilePanel,
} from '@/features/chat/slice/uiSlice'
import type { Conversation } from '@/features/chat/types'
import { Avatar } from '@/shared/components/Avatar'
import { useDebouncedValue } from '@/features/chat/hooks/useDebouncedValue'
import { SEARCH_DEBOUNCE_MS, CURRENT_USER_ID } from '@/shared/utils/constants'

export function ChatHeader({ conversation }: { conversation: Conversation }) {
  const dispatch = useAppDispatch()
  const users = useAppSelector((s) => s.users.byId)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const debounced = useDebouncedValue(query, SEARCH_DEBOUNCE_MS)

  useEffect(() => {
    dispatch(setMessageSearchQuery(debounced))
  }, [debounced, dispatch])

  const peerId =
    conversation.type === 'direct'
      ? conversation.participantIds.find((id) => id !== CURRENT_USER_ID)
      : undefined
  const peer = peerId ? users[peerId] : undefined

  const subtitle =
    conversation.type === 'group'
      ? `${conversation.participantIds.length} members`
      : peer?.status === 'online'
        ? 'Online'
        : peer?.status === 'away'
          ? 'Away'
          : 'Offline'

  const openProfile = () => dispatch(setShowProfilePanel(true))

  return (
    <header className="flex items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-3 py-3 md:px-4">
      <button
        type="button"
        className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-muted)] md:hidden"
        onClick={() => dispatch(setShowMobileChat(false))}
        aria-label="Back to conversations"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={openProfile}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-1 py-0.5 text-left transition hover:bg-[var(--surface-muted)]"
        aria-label={
          conversation.type === 'group'
            ? `Open group info for ${conversation.name}`
            : `Open contact info for ${conversation.name}`
        }
      >
        <Avatar
          name={conversation.name}
          src={conversation.avatarUrl ?? peer?.avatarUrl}
          status={conversation.type === 'direct' ? peer?.status : undefined}
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-semibold text-[var(--text)]">
            {conversation.name}
          </h2>
          <p className="truncate text-xs text-[var(--text-muted)]">{subtitle}</p>
        </div>
      </button>

      {searchOpen ? (
        <div className="flex items-center gap-1">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages"
            className="w-36 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-1.5 text-sm outline-none focus:border-[var(--accent)] md:w-48"
          />
          <button
            type="button"
            aria-label="Close search"
            onClick={() => {
              setSearchOpen(false)
              setQuery('')
              dispatch(setMessageSearchQuery(''))
            }}
            className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-muted)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          aria-label="Search in conversation"
          onClick={() => setSearchOpen(true)}
          className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-muted)]"
        >
          <Search className="h-4 w-4" />
        </button>
      )}
    </header>
  )
}
