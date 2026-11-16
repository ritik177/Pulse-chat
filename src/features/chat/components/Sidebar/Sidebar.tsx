import { WifiOff } from 'lucide-react'
import { useAppSelector } from '@/app/hooks'
import { ConversationSearch } from '@/features/chat/components/Sidebar/ConversationSearch'
import { ConversationFilters } from '@/features/chat/components/Sidebar/ConversationFilters'
import { ConversationList } from '@/features/chat/components/Sidebar/ConversationList'
import { ThemeToggle } from '@/features/chat/components/ThemeToggle'
import { Avatar } from '@/shared/components/Avatar'
import { CURRENT_USER_ID } from '@/shared/utils/constants'
import { cn } from '@/shared/utils/cn'

interface SidebarProps {
  onRetry: () => void
  className?: string
}

export function Sidebar({ onRetry, className }: SidebarProps) {
  const me = useAppSelector((s) => s.users.byId[CURRENT_USER_ID])
  const isOnline = useAppSelector((s) => s.ui.isOnline)
  const queueLength = useAppSelector((s) => s.messages.offlineQueue.length)
  const showMobileChat = useAppSelector((s) => s.ui.showMobileChat)

  return (
    <aside
      className={cn(
        'flex h-full w-full flex-col border-r border-[var(--border)] bg-[var(--surface)] md:w-[340px] md:min-w-[340px]',
        showMobileChat && 'hidden md:flex',
        className,
      )}
    >
      <header className="flex items-center justify-between gap-3 px-4 pb-3 pt-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
            Pulse
          </p>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text)]">
            Messages
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {me && <Avatar name={me.name} src={me.avatarUrl} size="sm" status="online" />}
        </div>
      </header>

      {(!isOnline || queueLength > 0) && (
        <div className="mx-4 mb-2 flex items-center gap-2 rounded-lg bg-amber-500/15 px-3 py-2 text-xs font-medium text-amber-700 dark:text-amber-300">
          <WifiOff className="h-3.5 w-3.5 shrink-0" />
          {!isOnline
            ? 'You are offline — messages will queue'
            : `${queueLength} queued message${queueLength === 1 ? '' : 's'} pending`}
        </div>
      )}

      <div className="flex flex-col gap-3 px-4 pb-3">
        <ConversationSearch />
        <ConversationFilters />
      </div>

      <ConversationList onRetry={onRetry} />
    </aside>
  )
}
