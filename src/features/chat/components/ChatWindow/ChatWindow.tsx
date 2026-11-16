import { useEffect } from 'react'
import { MessageSquare } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  loadConversationMessages,
  markRead,
} from '@/features/chat/slice/chatThunks'
import { selectActiveConversation } from '@/features/chat/selectors'
import { ChatHeader } from '@/features/chat/components/ChatWindow/ChatHeader'
import { MessageList } from '@/features/chat/components/ChatWindow/MessageList'
import { MessageInput } from '@/features/chat/components/ChatWindow/MessageInput'
import { TypingIndicator } from '@/features/chat/components/ChatWindow/TypingIndicator'
import { ProfileInfoPanel } from '@/features/chat/components/Profile/ProfileInfoPanel'
import { EmptyState } from '@/shared/components/EmptyState'
import { cn } from '@/shared/utils/cn'

export function ChatWindow() {
  const dispatch = useAppDispatch()
  const conversation = useAppSelector(selectActiveConversation)
  const showMobileChat = useAppSelector((s) => s.ui.showMobileChat)
  const showProfilePanel = useAppSelector((s) => s.ui.showProfilePanel)
  const loadedStatus = useAppSelector((s) =>
    conversation
      ? s.messages.statusByConversation[conversation.id]
      : undefined,
  )

  useEffect(() => {
    if (!conversation) return
    if (!loadedStatus || loadedStatus === 'idle' || loadedStatus === 'failed') {
      void dispatch(loadConversationMessages(conversation.id))
    }
    if (conversation.unreadCount > 0) {
      void dispatch(markRead(conversation.id))
    }
  }, [conversation, dispatch, loadedStatus])

  if (!conversation) {
    return (
      <section
        className={cn(
          'hidden h-full flex-1 flex-col bg-[var(--canvas)] md:flex',
          showMobileChat && 'flex',
        )}
      >
        <EmptyState
          icon={<MessageSquare className="h-12 w-12" />}
          title="Select a conversation"
          description="Choose a chat from the sidebar to start messaging."
          className="h-full"
        />
      </section>
    )
  }

  return (
    <section
      className={cn(
        'relative hidden h-full min-w-0 flex-1 md:flex',
        showMobileChat && 'flex',
      )}
    >
      <div
        className={cn(
          'flex h-full min-w-0 flex-1 flex-col bg-[var(--canvas)]',
          showProfilePanel && 'hidden md:flex',
        )}
      >
        <ChatHeader conversation={conversation} />
        <div className="min-h-0 flex-1">
          <MessageList conversationId={conversation.id} />
        </div>
        <TypingIndicator conversation={conversation} />
        <MessageInput conversationId={conversation.id} />
      </div>
      {showProfilePanel && <ProfileInfoPanel conversation={conversation} />}
    </section>
  )
}
