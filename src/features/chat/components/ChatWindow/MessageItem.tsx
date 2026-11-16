import {
  Check,
  CheckCheck,
  Clock,
  Copy,
  MoreHorizontal,
  Pencil,
  Reply,
  Smile,
  Trash2,
} from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  deleteMessage,
  toggleReaction,
} from '@/features/chat/slice/chatThunks'
import { setEditingMessage, setReplyTo } from '@/features/chat/slice/uiSlice'
import type { Message } from '@/features/chat/types'
import { Avatar } from '@/shared/components/Avatar'
import { formatMessageTime } from '@/shared/utils/format'
import { cn } from '@/shared/utils/cn'
import { CURRENT_USER_ID, EMOJI_REACTIONS } from '@/shared/utils/constants'

interface MessageItemProps {
  message: Message
  showAvatar: boolean
}

export function MessageItem({ message, showAvatar }: MessageItemProps) {
  const dispatch = useAppDispatch()
  const users = useAppSelector((s) => s.users.byId)
  const allMessages = useAppSelector(
    (s) => s.messages.byConversation[message.conversationId] ?? [],
  )
  const [menuOpen, setMenuOpen] = useState(false)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const sender = users[message.senderId]
  const isMine = message.senderId === CURRENT_USER_ID
  const replyTo = message.replyToId
    ? allMessages.find((m) => m.id === message.replyToId)
    : undefined
  const replySender = replyTo ? users[replyTo.senderId] : undefined

  useEffect(() => {
    if (!menuOpen && !emojiOpen) return
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        setMenuOpen(false)
        setEmojiOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [menuOpen, emojiOpen])

  const copy = async () => {
    if (message.content) await navigator.clipboard.writeText(message.content)
    setMenuOpen(false)
  }

  if (message.isDeleted) {
    return (
      <div className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
        <p className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-2 text-sm italic text-[var(--text-muted)]">
          Message deleted
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'group flex gap-2',
        isMine ? 'flex-row-reverse' : 'flex-row',
      )}
      data-message-id={message.id}
    >
      <div className="w-8 shrink-0">
        {showAvatar && !isMine && sender && (
          <Avatar name={sender.name} src={sender.avatarUrl} size="sm" />
        )}
      </div>

      <div
        className={cn(
          'relative max-w-[min(72%,36rem)]',
          isMine ? 'items-end' : 'items-start',
        )}
      >
        {showAvatar && !isMine && sender && (
          <p className="mb-1 px-1 text-xs font-medium text-[var(--text-muted)]">
            {sender.name}
          </p>
        )}

        <div
          className={cn(
            'rounded-2xl px-3.5 py-2 shadow-sm',
            isMine
              ? 'rounded-br-md bg-[var(--bubble-mine)] text-[var(--bubble-mine-text)]'
              : 'rounded-bl-md bg-[var(--bubble-theirs)] text-[var(--text)]',
          )}
        >
          {replyTo && (
            <div
              className={cn(
                'mb-2 border-l-2 pl-2 text-xs opacity-80',
                isMine ? 'border-white/50' : 'border-[var(--accent)]',
              )}
            >
              <p className="font-semibold">{replySender?.name ?? 'User'}</p>
              <p className="line-clamp-2">{replyTo.content || 'Attachment'}</p>
            </div>
          )}

          {message.attachments.length > 0 && (
            <div className="mb-2 flex flex-col gap-2">
              {message.attachments.map((file) =>
                file.mimeType.startsWith('image/') ? (
                  <img
                    key={file.id}
                    src={file.previewUrl}
                    alt={file.name}
                    className="max-h-56 max-w-full rounded-lg object-cover"
                  />
                ) : (
                  <div
                    key={file.id}
                    className="rounded-lg bg-black/10 px-3 py-2 text-xs dark:bg-white/10"
                  >
                    <p className="font-medium">{file.name}</p>
                    <p className="opacity-70">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ),
              )}
            </div>
          )}

          {message.content && (
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
              {message.content}
            </p>
          )}

          <div
            className={cn(
              'mt-1 flex items-center gap-1.5 text-[10px]',
              isMine ? 'justify-end text-white/70' : 'text-[var(--text-muted)]',
            )}
          >
            {message.updatedAt && <span>edited</span>}
            <span>{formatMessageTime(message.createdAt)}</span>
            {isMine && <StatusIcon status={message.status} />}
          </div>
        </div>

        {message.reactions.length > 0 && (
          <div
            className={cn(
              'mt-1 flex flex-wrap gap-1',
              isMine ? 'justify-end' : 'justify-start',
            )}
          >
            {message.reactions.map((r) => (
              <button
                key={r.emoji}
                type="button"
                onClick={() =>
                  void dispatch(
                    toggleReaction({ messageId: message.id, emoji: r.emoji }),
                  )
                }
                className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-xs shadow-sm"
              >
                {r.emoji} {r.userIds.length}
              </button>
            ))}
          </div>
        )}

        <div
          ref={menuRef}
          className={cn(
            'absolute top-0 flex items-center gap-0.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-0.5 shadow-md opacity-0 transition group-hover:opacity-100',
            isMine ? 'left-0 -translate-x-full pr-1' : 'right-0 translate-x-full pl-1',
          )}
        >
          <IconBtn
            label="Reply"
            onClick={() => dispatch(setReplyTo(message.id))}
          >
            <Reply className="h-3.5 w-3.5" />
          </IconBtn>
          <IconBtn label="React" onClick={() => setEmojiOpen((v) => !v)}>
            <Smile className="h-3.5 w-3.5" />
          </IconBtn>
          <IconBtn label="More" onClick={() => setMenuOpen((v) => !v)}>
            <MoreHorizontal className="h-3.5 w-3.5" />
          </IconBtn>

          {emojiOpen && (
            <div className="absolute bottom-full z-20 mb-1 flex gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-lg">
              {EMOJI_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="rounded-md px-1.5 py-1 text-base hover:bg-[var(--surface-muted)]"
                  onClick={() => {
                    void dispatch(
                      toggleReaction({ messageId: message.id, emoji }),
                    )
                    setEmojiOpen(false)
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {menuOpen && (
            <div className="absolute bottom-full z-20 mb-1 w-40 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1 shadow-lg">
              <MenuItem
                icon={<Copy className="h-3.5 w-3.5" />}
                label="Copy"
                onClick={() => void copy()}
              />
              {isMine && (
                <>
                  <MenuItem
                    icon={<Pencil className="h-3.5 w-3.5" />}
                    label="Edit"
                    onClick={() => {
                      dispatch(setEditingMessage(message.id))
                      setMenuOpen(false)
                    }}
                  />
                  <MenuItem
                    icon={<Trash2 className="h-3.5 w-3.5" />}
                    label="Delete"
                    danger
                    onClick={() => {
                      void dispatch(deleteMessage(message.id))
                      setMenuOpen(false)
                    }}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatusIcon({ status }: { status: Message['status'] }) {
  if (status === 'sending') return <Clock className="h-3 w-3" />
  if (status === 'failed') return <span className="text-red-300">!</span>
  if (status === 'sent') return <Check className="h-3 w-3" />
  if (status === 'delivered') return <CheckCheck className="h-3 w-3" />
  return <CheckCheck className="h-3 w-3 text-sky-300" />
}

function IconBtn({
  children,
  onClick,
  label,
}: {
  children: ReactNode
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
    >
      {children}
    </button>
  )
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: ReactNode
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--surface-muted)]',
        danger && 'text-red-500',
      )}
    >
      {icon}
      {label}
    </button>
  )
}
