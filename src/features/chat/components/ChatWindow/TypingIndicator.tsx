import { useAppSelector } from '@/app/hooks'
import type { Conversation } from '@/features/chat/types'

export function TypingIndicator({ conversation }: { conversation: Conversation }) {
  const users = useAppSelector((s) => s.users.byId)
  const names = conversation.typingUserIds
    .map((id) => users[id]?.name)
    .filter(Boolean)

  if (!names.length) return null

  const label =
    names.length === 1
      ? `${names[0]} is typing`
      : names.length === 2
        ? `${names[0]} and ${names[1]} are typing`
        : 'Several people are typing'

  return (
    <div className="flex items-center gap-2 px-4 py-1 text-xs text-[var(--text-muted)]">
      <span className="flex gap-1">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--text-muted)] [animation-delay:-0.2s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--text-muted)] [animation-delay:-0.1s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--text-muted)]" />
      </span>
      {label}
    </div>
  )
}
