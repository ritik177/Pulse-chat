import { useCallback, useMemo, useRef } from 'react'
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { loadOlderMessages } from '@/features/chat/slice/chatThunks'
import { selectActiveMessages } from '@/features/chat/selectors'
import { MessageItem } from '@/features/chat/components/ChatWindow/MessageItem'
import { DateSeparator } from '@/features/chat/components/ChatWindow/DateSeparator'
import { LoadingSpinner } from '@/shared/components/LoadingSpinner'
import { EmptyState } from '@/shared/components/EmptyState'
import { sameDay } from '@/shared/utils/format'
import { MessageSquare } from 'lucide-react'

interface ListItem {
  type: 'date' | 'message'
  id: string
  messageIndex?: number
  iso?: string
}

export function MessageList({ conversationId }: { conversationId: string }) {
  const dispatch = useAppDispatch()
  const messages = useAppSelector(selectActiveMessages)
  const hasMore = useAppSelector((s) => s.messages.hasMore[conversationId] ?? false)
  const loadingOlder = useAppSelector(
    (s) => s.messages.loadingOlder[conversationId] ?? false,
  )
  const status = useAppSelector(
    (s) => s.messages.statusByConversation[conversationId] ?? 'idle',
  )
  const virtuosoRef = useRef<VirtuosoHandle>(null)
  const firstItemIndexRef = useRef(10_000_000)

  const items = useMemo<ListItem[]>(() => {
    const result: ListItem[] = []
    messages.forEach((message, index) => {
      const prev = messages[index - 1]
      if (!prev || !sameDay(prev.createdAt, message.createdAt)) {
        result.push({
          type: 'date',
          id: `date-${message.createdAt}`,
          iso: message.createdAt,
        })
      }
      result.push({ type: 'message', id: message.id, messageIndex: index })
    })
    return result
  }, [messages])

  const startReached = useCallback(() => {
    if (!hasMore || loadingOlder) return
    const prevCount = messages.length
    void dispatch(loadOlderMessages({ conversationId })).then(() => {
      // Keep scroll anchored when prepending — Virtuoso firstItemIndex pattern
      firstItemIndexRef.current -= Math.max(0, 50)
      void prevCount
    })
  }, [conversationId, dispatch, hasMore, loadingOlder, messages.length])

  if (status === 'loading' && messages.length === 0) {
    return <LoadingSpinner className="h-full" />
  }

  if (status === 'succeeded' && messages.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare className="h-10 w-10" />}
        title="No messages yet"
        description="Send the first message to start the conversation."
        className="h-full"
      />
    )
  }

  return (
    <div className="relative h-full min-h-0">
      {loadingOlder && (
        <div className="absolute left-0 right-0 top-2 z-10 flex justify-center">
          <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs text-[var(--text-muted)] shadow">
            Loading earlier messages…
          </span>
        </div>
      )}
      <Virtuoso
        ref={virtuosoRef}
        data={items}
        firstItemIndex={firstItemIndexRef.current}
        initialTopMostItemIndex={items.length - 1}
        followOutput="smooth"
        startReached={startReached}
        increaseViewportBy={{ top: 400, bottom: 200 }}
        className="h-full"
        itemContent={(_index, item) => {
          if (item.type === 'date' && item.iso) {
            return (
              <div className="px-4">
                <DateSeparator iso={item.iso} />
              </div>
            )
          }
          const message = messages[item.messageIndex ?? 0]
          if (!message) return null
          const prev = messages[(item.messageIndex ?? 0) - 1]
          const showAvatar =
            !prev ||
            prev.senderId !== message.senderId ||
            !sameDay(prev.createdAt, message.createdAt)

          return (
            <div className="px-4 py-1">
              <MessageItem message={message} showAvatar={showAvatar} />
            </div>
          )
        }}
      />
    </div>
  )
}
