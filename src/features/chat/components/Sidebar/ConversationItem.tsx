import { Users } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setActiveConversation } from '@/features/chat/slice/uiSlice'
import { markRead } from '@/features/chat/slice/chatThunks'
import type { Conversation } from '@/features/chat/types'
import { Avatar } from '@/shared/components/Avatar'
import { formatSidebarTime } from '@/shared/utils/format'
import { cn } from '@/shared/utils/cn'
import { CURRENT_USER_ID } from '@/shared/utils/constants'

interface ConversationItemProps {
  conversation: Conversation
}

export function ConversationItem({ conversation }: ConversationItemProps) {
  const dispatch = useAppDispatch()
  const activeId = useAppSelector((s) => s.ui.activeConversationId)
  const users = useAppSelector((s) => s.users.byId)
  const messages = useAppSelector(
    (s) => s.messages.byConversation[conversation.id] ?? [],
  )

  const lastMessage =
    messages.find((m) => m.id === conversation.lastMessageId) ?? messages.at(-1)

  const peerId =
    conversation.type === 'direct'
      ? conversation.participantIds.find((id) => id !== CURRENT_USER_ID)
      : undefined
  const peer = peerId ? users[peerId] : undefined

  const isActive = activeId === conversation.id
  const preview = lastMessage?.isDeleted
    ? 'Message deleted'
    : lastMessage?.content || 'No messages yet'
  const previewPrefix =
    lastMessage && lastMessage.senderId === CURRENT_USER_ID ? 'You: ' : ''

  const onSelect = () => {
    dispatch(setActiveConversation(conversation.id))
    if (conversation.unreadCount > 0) {
      void dispatch(markRead(conversation.id))
    }
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition',
        isActive
          ? 'bg-[var(--accent-soft)]'
          : 'hover:bg-[var(--surface-muted)]',
      )}
    >
      <Avatar
        name={conversation.name}
        src={conversation.avatarUrl ?? peer?.avatarUrl}
        status={conversation.type === 'direct' ? peer?.status : undefined}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            {conversation.type === 'group' && (
              <Users className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
            )}
            <span className="truncate font-semibold text-[var(--text)]">
              {conversation.name}
            </span>
          </div>
          {lastMessage && (
            <span className="shrink-0 text-[11px] text-[var(--text-muted)]">
              {formatSidebarTime(lastMessage.createdAt)}
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p
            className={cn(
              'truncate text-sm',
              conversation.unreadCount > 0
                ? 'font-medium text-[var(--text)]'
                : 'text-[var(--text-muted)]',
            )}
          >
            {previewPrefix}
            {preview}
          </p>
          {conversation.unreadCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1.5 text-[11px] font-semibold text-white">
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
