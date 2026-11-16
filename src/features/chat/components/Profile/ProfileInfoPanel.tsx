import {
  BellOff,
  ChevronRight,
  Download,
  FileImage,
  Heart,
  MessageCircleOff,
  Phone,
  Plus,
  Search,
  Share2,
  ShieldAlert,
  Star,
  Timer,
  UserMinus,
  UserPlus,
  Users,
  Video,
  X,
} from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { addMember, removeMember } from '@/features/chat/slice/chatThunks'
import {
  setActiveConversation,
  setMessageSearchQuery,
  setShowProfilePanel,
} from '@/features/chat/slice/uiSlice'
import type { Conversation, User } from '@/features/chat/types'
import { Avatar } from '@/shared/components/Avatar'
import { CURRENT_USER_ID } from '@/shared/utils/constants'
import { formatRelative } from '@/shared/utils/format'
import { cn } from '@/shared/utils/cn'

interface ProfileInfoPanelProps {
  conversation: Conversation
}

export function ProfileInfoPanel({ conversation }: ProfileInfoPanelProps) {
  const dispatch = useAppDispatch()
  const users = useAppSelector((s) => s.users.byId)
  const allConversations = useAppSelector((s) => s.conversations.items)
  const messages = useAppSelector(
    (s) => s.messages.byConversation[conversation.id] ?? [],
  )
  const [toast, setToast] = useState<string | null>(null)

  const peerId =
    conversation.type === 'direct'
      ? conversation.participantIds.find((id) => id !== CURRENT_USER_ID)
      : undefined
  const peer = peerId ? users[peerId] : undefined

  const members = conversation.participantIds
    .map((id) => users[id])
    .filter((u): u is User => Boolean(u))

  const candidates = Object.values(users).filter(
    (u): u is User =>
      Boolean(u) &&
      u.id !== CURRENT_USER_ID &&
      !conversation.participantIds.includes(u.id),
  )

  const mediaCount = useMemo(
    () =>
      messages.reduce(
        (count, m) => (m.isDeleted ? count : count + m.attachments.length),
        0,
      ),
    [messages],
  )

  const commonGroups = useMemo(() => {
    if (!peerId) return []
    return allConversations.filter(
      (c) =>
        c.type === 'group' &&
        c.participantIds.includes(CURRENT_USER_ID) &&
        c.participantIds.includes(peerId),
    )
  }, [allConversations, peerId])

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  const close = () => dispatch(setShowProfilePanel(false))

  const openGroup = (groupId: string) => {
    dispatch(setActiveConversation({ id: groupId, keepProfileOpen: true }))
  }

  const statusLabel = peer
    ? peer.status === 'online'
      ? 'online'
      : peer.status === 'away'
        ? 'away'
        : peer.lastSeenAt
          ? `last seen ${formatRelative(peer.lastSeenAt)}`
          : 'offline'
    : null

  return (
    <aside
      className="absolute inset-0 z-30 flex flex-col bg-[var(--canvas)] md:static md:inset-auto md:w-[380px] md:min-w-[380px] md:border-l md:border-[var(--border)]"
      role="dialog"
      aria-label={conversation.type === 'group' ? 'Group info' : 'Contact info'}
    >
      <header className="flex items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-3 py-3">
        <button
          type="button"
          onClick={close}
          className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-muted)]"
          aria-label="Close profile"
        >
          <X className="h-5 w-5" />
        </button>
        <h3 className="text-base font-semibold text-[var(--text)]">
          {conversation.type === 'group' ? 'Group info' : 'Contact info'}
        </h3>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Hero */}
        <section className="flex flex-col items-center bg-[var(--surface)] px-6 pb-6 pt-8">
          <Avatar
            name={conversation.name}
            src={conversation.avatarUrl ?? peer?.avatarUrl}
            size="xl"
            status={conversation.type === 'direct' ? peer?.status : undefined}
          />
          <h2 className="mt-5 text-center text-2xl font-semibold text-[var(--text)]">
            {conversation.name}
          </h2>
          {conversation.type === 'direct' && peer?.phone && (
            <p className="mt-1 text-sm text-[var(--text-muted)]">{peer.phone}</p>
          )}
          {conversation.type === 'group' && (
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Group · {members.length} members
            </p>
          )}
          {conversation.type === 'direct' && statusLabel && (
            <p className="mt-1 text-xs capitalize text-[var(--text-muted)]">
              {statusLabel}
            </p>
          )}

          <div className="mt-5 grid w-full max-w-sm grid-cols-3 gap-2">
            <QuickAction
              icon={<Phone className="h-5 w-5" />}
              label="Audio"
              onClick={() => showToast('Audio call is a mock action')}
            />
            <QuickAction
              icon={<Video className="h-5 w-5" />}
              label="Video"
              onClick={() => showToast('Video call is a mock action')}
            />
            <QuickAction
              icon={<Search className="h-5 w-5" />}
              label="Search"
              onClick={() => {
                dispatch(setShowProfilePanel(false))
                dispatch(setMessageSearchQuery(''))
                showToast('Use the search icon in the chat header')
              }}
            />
          </div>
        </section>

        {conversation.type === 'direct' && peer?.about && (
          <InfoCard className="mt-2">
            <p className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-[var(--accent)]">
              About
            </p>
            <p className="border-t border-[var(--border)] px-4 py-3 text-sm text-[var(--text)]">
              {peer.about}
            </p>
          </InfoCard>
        )}

        <InfoCard className="mt-2">
          <Row
            icon={<FileImage className="h-5 w-5" />}
            title="Media, links and docs"
            value={String(mediaCount)}
            onClick={() => showToast(`${mediaCount} media items in this chat`)}
          />
          <Row
            icon={<Star className="h-5 w-5" />}
            title="Starred messages"
            value="None"
            onClick={() => showToast('No starred messages yet')}
          />
        </InfoCard>

        <InfoCard className="mt-2">
          <Row
            icon={<BellOff className="h-5 w-5" />}
            title="Mute notifications"
            value="No"
            onClick={() => showToast('Mute toggled (mock)')}
          />
          <Row
            icon={<Download className="h-5 w-5" />}
            title="Save to Downloads"
            value="Default"
            onClick={() => showToast('Download preference saved (mock)')}
          />
          <Row
            icon={<Timer className="h-5 w-5" />}
            title="Disappearing messages"
            value="Off"
            onClick={() => showToast('Disappearing messages are off')}
          />
        </InfoCard>

        {/* Group members */}
        {conversation.type === 'group' && (
          <InfoCard className="mt-2">
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-sm font-semibold text-[var(--text)]">
                {members.length} members
              </p>
            </div>
            <ul>
              {members.map((user) => (
                <li
                  key={user.id}
                  className="flex items-center gap-3 border-t border-[var(--border)] px-4 py-3"
                >
                  <Avatar
                    name={user.name}
                    src={user.avatarUrl}
                    size="sm"
                    status={user.status}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--text)]">
                      {user.id === CURRENT_USER_ID ? 'You' : user.name}
                    </p>
                    <p className="truncate text-xs text-[var(--text-muted)]">
                      {user.about ?? user.status}
                    </p>
                  </div>
                  {user.id !== CURRENT_USER_ID && (
                    <button
                      type="button"
                      aria-label={`Remove ${user.name}`}
                      onClick={() =>
                        void dispatch(
                          removeMember({
                            conversationId: conversation.id,
                            userId: user.id,
                          }),
                        ).then(() => showToast(`Removed ${user.name}`))
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
                <p className="border-t border-[var(--border)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  Add members
                </p>
                <ul>
                  {candidates.map((user) => (
                    <li
                      key={user.id}
                      className="flex items-center gap-3 border-t border-[var(--border)] px-4 py-3"
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
                          ).then(() => showToast(`Added ${user.name}`))
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
          </InfoCard>
        )}

        {/* Groups in common — contact only */}
        {conversation.type === 'direct' && peer && (
          <InfoCard className="mt-2">
            <p className="px-4 py-3 text-sm font-semibold text-[var(--text)]">
              {commonGroups.length} group
              {commonGroups.length === 1 ? '' : 's'} in common
            </p>
            <button
              type="button"
              className="flex w-full items-center gap-3 border-t border-[var(--border)] px-4 py-3 text-left hover:bg-[var(--surface-muted)]"
              onClick={() => showToast(`Create group with ${peer.name} (mock)`)}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                <Plus className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium text-[var(--text)]">
                Create group with {peer.name.split(' ')[0]}
              </span>
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-3 border-t border-[var(--border)] px-4 py-3 text-left hover:bg-[var(--surface-muted)]"
              onClick={() => showToast('Add to group (mock)')}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--accent)]">
                <UserPlus className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium text-[var(--text)]">
                Add to group
              </span>
            </button>
            {commonGroups.map((group) => {
              const memberNames = group.participantIds
                .map((id) =>
                  id === CURRENT_USER_ID ? 'You' : users[id]?.name,
                )
                .filter(Boolean)
                .slice(0, 3)
                .join(', ')
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => openGroup(group.id)}
                  className="flex w-full items-center gap-3 border-t border-[var(--border)] px-4 py-3 text-left hover:bg-[var(--surface-muted)]"
                >
                  <Avatar
                    name={group.name}
                    src={group.avatarUrl}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--text)]">
                      {group.name}
                    </p>
                    <p className="truncate text-xs text-[var(--text-muted)]">
                      {memberNames}
                      {group.participantIds.length > 3 ? '…' : ''}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                </button>
              )
            })}
          </InfoCard>
        )}

        <InfoCard className="mt-2">
          <ActionRow
            icon={<Share2 className="h-5 w-5" />}
            label={
              conversation.type === 'group'
                ? 'Invite to group via link'
                : 'Share contact'
            }
            tone="accent"
            onClick={() => showToast('Share link copied (mock)')}
          />
          <ActionRow
            icon={<Heart className="h-5 w-5" />}
            label="Add to Favourites"
            tone="accent"
            onClick={() => showToast('Added to favourites (mock)')}
          />
          <ActionRow
            icon={<Users className="h-5 w-5" />}
            label="Export chat"
            tone="accent"
            onClick={() => showToast('Export started (mock)')}
          />
          <ActionRow
            icon={<MessageCircleOff className="h-5 w-5" />}
            label="Clear chat"
            tone="danger"
            onClick={() => showToast('Clear chat is a mock action')}
          />
        </InfoCard>

        <InfoCard className="mb-6 mt-2">
          <ActionRow
            icon={<ShieldAlert className="h-5 w-5" />}
            label={
              conversation.type === 'group'
                ? `Exit group`
                : `Block ${conversation.name}`
            }
            tone="danger"
            onClick={() =>
              showToast(
                conversation.type === 'group'
                  ? 'Exit group (mock)'
                  : `Blocked ${conversation.name} (mock)`,
              )
            }
          />
          <ActionRow
            icon={<ShieldAlert className="h-5 w-5" />}
            label={
              conversation.type === 'group'
                ? 'Report group'
                : `Report ${conversation.name}`
            }
            tone="danger"
            onClick={() => showToast('Report submitted (mock)')}
          />
        </InfoCard>
      </div>

      {toast && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full bg-[var(--text)] px-4 py-2 text-xs font-medium text-[var(--surface)] shadow-lg">
          {toast}
        </div>
      )}
    </aside>
  )
}

function InfoCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'overflow-hidden bg-[var(--surface)] md:mx-0',
        className,
      )}
    >
      {children}
    </div>
  )
}

function QuickAction({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-3 text-[var(--accent)] transition hover:bg-[var(--accent-soft)]"
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}

function Row({
  icon,
  title,
  value,
  onClick,
}: {
  icon: ReactNode
  title: string
  value?: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 border-t border-[var(--border)] px-4 py-3.5 text-left first:border-t-0 hover:bg-[var(--surface-muted)]"
    >
      <span className="text-[var(--text-muted)]">{icon}</span>
      <span className="min-w-0 flex-1 text-sm text-[var(--text)]">{title}</span>
      {value && (
        <span className="text-sm text-[var(--text-muted)]">{value}</span>
      )}
      <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
    </button>
  )
}

function ActionRow({
  icon,
  label,
  tone,
  onClick,
}: {
  icon: ReactNode
  label: string
  tone: 'accent' | 'danger'
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 border-t border-[var(--border)] px-4 py-3.5 text-left first:border-t-0 hover:bg-[var(--surface-muted)]',
        tone === 'accent' ? 'text-[var(--accent)]' : 'text-red-500',
      )}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}
