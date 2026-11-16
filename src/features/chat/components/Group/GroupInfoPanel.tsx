import { UserMinus, UserPlus, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { addMember, removeMember } from '@/features/chat/slice/chatThunks'
import { setShowGroupPanel } from '@/features/chat/slice/uiSlice'
import type { Conversation } from '@/features/chat/types'
import { Avatar } from '@/shared/components/Avatar'
import { CURRENT_USER_ID } from '@/shared/utils/constants'
import { cn } from '@/shared/utils/cn'

export function GroupInfoPanel({ conversation }: { conversation: Conversation }) {
  const dispatch = useAppDispatch()
  const users = useAppSelector((s) => s.users.byId)
  const open = useAppSelector((s) => s.ui.showGroupPanel)

  const members = conversation.participantIds
    .map((id) => users[id])
    .filter(Boolean)

  const candidates = Object.values(users).filter(
    (u): u is NonNullable<typeof u> =>
      Boolean(u) &&
      u.id !== CURRENT_USER_ID &&
      !conversation.participantIds.includes(u.id),
  )

  return (
    <aside
      className={cn(
        'flex h-full w-full flex-col border-l border-[var(--border)] bg-[var(--surface)] transition md:w-72',
        !open && 'hidden',
      )}
    >
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <h3 className="font-semibold text-[var(--text)]">Group info</h3>
        <button
          type="button"
          aria-label="Close group info"
          onClick={() => dispatch(setShowGroupPanel(false))}
          className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-muted)]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-2 px-4 py-6">
        <Avatar
          name={conversation.name}
          src={conversation.avatarUrl}
          size="lg"
        />
        <p className="text-lg font-semibold text-[var(--text)]">
          {conversation.name}
        </p>
        <p className="text-sm text-[var(--text-muted)]">
          {members.length} members
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          Members
        </p>
        <ul className="flex flex-col gap-1">
          {members.map((user) => (
            <li
              key={user!.id}
              className="flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-[var(--surface-muted)]"
            >
              <Avatar
                name={user!.name}
                src={user!.avatarUrl}
                size="sm"
                status={user!.status}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--text)]">
                  {user!.name}
                  {user!.id === CURRENT_USER_ID ? ' (you)' : ''}
                </p>
                <p className="text-xs capitalize text-[var(--text-muted)]">
                  {user!.status}
                </p>
              </div>
              {user!.id !== CURRENT_USER_ID && (
                <button
                  type="button"
                  aria-label={`Remove ${user!.name}`}
                  onClick={() =>
                    void dispatch(
                      removeMember({
                        conversationId: conversation.id,
                        userId: user!.id,
                      }),
                    )
                  }
                  className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-500"
                >
                  <UserMinus className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>

        {candidates.length > 0 && (
          <>
            <p className="mb-2 mt-5 px-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Add members
            </p>
            <ul className="flex flex-col gap-1">
              {candidates.map((user) => (
                <li
                  key={user.id}
                  className="flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-[var(--surface-muted)]"
                >
                  <Avatar
                    name={user.name}
                    src={user.avatarUrl}
                    size="sm"
                    status={user.status}
                  />
                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--text)]">
                    {user.name}
                  </p>
                  <button
                    type="button"
                    aria-label={`Add ${user.name}`}
                    onClick={() =>
                      void dispatch(
                        addMember({
                          conversationId: conversation.id,
                          userId: user.id,
                        }),
                      )
                    }
                    className="rounded-lg p-1.5 text-[var(--accent)] hover:bg-[var(--accent-soft)]"
                  >
                    <UserPlus className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </aside>
  )
}
