import { MessageSquare } from 'lucide-react'
import { useAppSelector } from '@/app/hooks'
import { selectFilteredConversations } from '@/features/chat/selectors'
import { ConversationItem } from '@/features/chat/components/Sidebar/ConversationItem'
import { EmptyState } from '@/shared/components/EmptyState'
import { LoadingSpinner } from '@/shared/components/LoadingSpinner'
import { ErrorState } from '@/shared/components/ErrorState'

interface ConversationListProps {
  onRetry: () => void
}

export function ConversationList({ onRetry }: ConversationListProps) {
  const conversations = useAppSelector(selectFilteredConversations)
  const status = useAppSelector((s) => s.conversations.status)
  const error = useAppSelector((s) => s.conversations.error)

  if (status === 'loading' && conversations.length === 0) {
    return <LoadingSpinner />
  }

  if (status === 'failed' && conversations.length === 0) {
    return <ErrorState message={error ?? undefined} onRetry={onRetry} />
  }

  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare className="h-10 w-10" />}
        title="No conversations"
        description="Try a different filter or search term."
      />
    )
  }

  return (
    <div className="flex flex-col gap-0.5 overflow-y-auto px-2 pb-4">
      {conversations.map((c) => (
        <ConversationItem key={c.id} conversation={c} />
      ))}
    </div>
  )
}
